// Slice Rush mock kitchen backend.
// Zero dependencies: plain Node `http`. Run with `npm run server` (port 4000).
//
// Env vars:
//   PORT=4000        port to listen on
//   LATENCY=150-600  random response delay range in ms
//   FAIL_RATE=0.05   probability that a REST request fails with HTTP 500
//   TICK_MS=500      how often stock changes / the kitchen moves orders along
//   SPEED=1          kitchen speed multiplier (2 = everything twice as fast)
//   STRESS=1         huge menu, thousands of historical orders, lots of drivers, fast ticks
//
// You should not need to change this file, but reading it tells you exactly what the API does.

import http from 'node:http';
import { randomUUID } from 'node:crypto';

const STRESS = process.env.STRESS === '1';
const PORT = Number(process.env.PORT ?? 4000);
const [LAT_MIN, LAT_MAX] = (process.env.LATENCY ?? '150-600').split('-').map(Number);
const FAIL_RATE = Number(process.env.FAIL_RATE ?? 0.05);
const TICK_MS = Number(process.env.TICK_MS ?? (STRESS ? 100 : 500));
const SPEED = Number(process.env.SPEED ?? 1);

// ---------------------------------------------------------------------------
// Pricing - the same rules as src/utils/pricing.ts (the client shows the price, the server charges it)
// ---------------------------------------------------------------------------

const SIZE_MULTIPLIER = { S: 0.8, M: 1, L: 1.3 };
const STUFFED_CRUST = 200;
const DELIVERY_FEE = 299;
const FREE_DELIVERY_FROM = 2500;
const INGREDIENT_COST = 0.35;
const MAX_PER_ORDER = 20;
const DELIVERY_AREAS = ['E1', 'E2', 'E8', 'EC1', 'EC2', 'N1', 'SE1', 'W1', 'WC1', 'WC2'];

function unitPrice(pizza, size, crust) {
  return Math.round((pizza.basePrice * SIZE_MULTIPLIER[size]) / 10) * 10 + (crust === 'STUFFED' ? STUFFED_CRUST : 0);
}

function priceOrder(pizza, { size, crust, quantity, fulfilment, tipPercent }) {
  const unit = unitPrice(pizza, size, crust);
  const subtotal = unit * quantity;
  const discount = Math.floor(quantity / 3) * unit;
  const food = subtotal - discount;
  const deliveryFee = fulfilment === 'DELIVERY' && food < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  const tip = Math.round((food * tipPercent) / 100);
  return { unit, subtotal, discount, food, deliveryFee, tip, total: food + deliveryFee + tip };
}

function normalisePostcode(raw) {
  const compact = String(raw ?? '')
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(compact)) return null;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

function inDeliveryArea(postcode) {
  const outward = postcode.split(' ')[0];
  return DELIVERY_AREAS.some(
    (area) => outward === area || (outward.startsWith(area) && /[A-Z]/.test(outward[area.length])),
  );
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

const MENU = [
  ['margherita', 'Margherita', ['tomato', 'mozzarella', 'basil'], 'CLASSIC', 950, 0, true],
  ['pepperoni-party', 'Pepperoni Party', ['tomato', 'mozzarella', 'double pepperoni'], 'CLASSIC', 1250, 1, false],
  ['hot-honey', 'Hot Honey Heaven', ['tomato', 'nduja', 'hot honey', 'chilli flakes'], 'SPICY', 1350, 2, false],
  ['fun-ghi', 'Fun-ghi', ['white base', 'wild mushrooms', 'thyme', 'garlic oil'], 'VEGGIE', 1200, 0, true],
  ['basil-instinct', 'Basil Instinct', ['pesto', 'burrata', 'cherry tomatoes', 'basil'], 'VEGGIE', 1400, 0, true],
  ['truffle-shuffle', 'Truffle Shuffle', ['white base', 'truffle', 'potato', 'rosemary'], 'SPECIAL', 1650, 0, true],
  ['inferno', 'Inferno', ['tomato', 'scotch bonnet', 'jalapeños', 'spicy salami'], 'SPICY', 1400, 3, false],
  [
    'pineapple-peace',
    'Pineapple Peace Treaty',
    ['tomato', 'ham', 'pineapple', 'chilli jam'],
    'CLASSIC',
    1250,
    1,
    false,
  ],
  ['meat-feast', 'Meat Feast', ['tomato', 'sausage', 'pepperoni', 'smoked ham', 'beef'], 'CLASSIC', 1550, 0, false],
  ['green-machine', 'Green Machine', ['pesto', 'broccoli', 'courgette', 'spinach', 'feta'], 'VEGGIE', 1300, 0, true],
  [
    'bbq-smokehouse',
    'BBQ Smokehouse',
    ['bbq sauce', 'pulled pork', 'red onion', 'smoked cheddar'],
    'SPECIAL',
    1500,
    0,
    false,
  ],
  ['nduja-ninja', "'Nduja Ninja", ['tomato', 'nduja', 'ricotta', 'honey'], 'SPICY', 1450, 2, false],
  ['four-cheese', 'Four Cheese Please', ['mozzarella', 'gorgonzola', 'parmesan', 'fontina'], 'VEGGIE', 1350, 0, true],
  ['the-big-dipper', 'The Big Dipper', ['tomato', 'meatballs', 'garlic dip crust'], 'SPECIAL', 1600, 0, false],
];

const menu = MENU.map(([id, name, toppings, category, basePrice, heat, vegetarian]) => ({
  id,
  name,
  toppings,
  category,
  basePrice,
  heat,
  vegetarian,
}));
if (STRESS) {
  const cats = ['CLASSIC', 'VEGGIE', 'SPICY', 'SPECIAL'];
  for (let i = 0; i < 186; i++) {
    menu.push({
      id: `lab-${i}`,
      name: `Test Kitchen #${i + 1}`,
      toppings: ['tomato', 'mozzarella', `mystery topping ${i}`],
      category: cats[i % 4],
      basePrice: 900 + ((i * 37) % 900),
      heat: i % 4,
      vegetarian: i % 3 === 0,
    });
  }
}
const menuById = new Map(menu.map((p) => [p.id, p]));

/** @type {Map<string, {pizzaId:string, portions:number, capacity:number, ts:number}>} */
const stock = new Map(
  menu.map((p, i) => {
    const capacity = 20 + ((i * 7) % 21);
    return [
      p.id,
      {
        pizzaId: p.id,
        portions: i === 5 ? 2 : i === 12 ? 0 : Math.round(capacity * (0.4 + ((i * 13) % 60) / 100)),
        capacity,
        ts: Date.now(),
      },
    ];
  }),
);

let favourites = ['margherita', 'pepperoni-party', 'hot-honey'];

const DRIVER_NAMES = ['Priya', 'Tomasz', 'Ada', 'Kwame', 'Lucía', 'Sam', 'Mei', 'Olu', 'Fatima', 'Jonah'];
const VEHICLES = ['BIKE', 'SCOOTER', 'CAR'];
const drivers = new Map();
for (let i = 0; i < (STRESS ? 30 : 5); i++) {
  const d = {
    id: `drv-${i + 1}`,
    name: `${DRIVER_NAMES[i % DRIVER_NAMES.length]}${i >= DRIVER_NAMES.length ? ` ${Math.floor(i / DRIVER_NAMES.length) + 1}` : ''}`,
    vehicle: VEHICLES[i % 3],
    status: 'IDLE',
    deliveriesToday: (i * 3) % 7,
    updatedAt: Date.now(),
  };
  drivers.set(d.id, d);
}

/** @type {Map<string, object>} */
const orders = new Map();
/** @type {object[]} */
const activity = [];
let nextTicket = 101;

seedHistory(STRESS ? 3000 : 8);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seedHistory(count) {
  const now = Date.now();
  const customers = ['Alex', 'Jordan', 'Sasha', 'Robin', 'Charlie', 'Morgan', 'Jamie', 'Taylor', 'Riley', 'Quinn'];
  const statuses = ['DONE', 'DONE', 'CANCELLED', 'DONE', 'REJECTED', 'DONE', 'DONE', 'CANCELLED'];
  for (let i = 0; i < count; i++) {
    const pizza = menu[(i * 5) % Math.min(menu.length, STRESS ? menu.length : 10)];
    const status = statuses[i % statuses.length];
    const fulfilment = i % 3 === 0 ? 'COLLECTION' : 'DELIVERY';
    const spec = {
      size: ['S', 'M', 'L'][i % 3],
      crust: ['CLASSIC', 'THIN', 'STUFFED'][(i * 2) % 3],
      quantity: 1 + (i % 4),
      fulfilment,
      tipPercent: [0, 10, 15, 20][i % 4],
    };
    const createdAt = now - (count - i) * 4 * 60_000;
    const order = {
      id: randomUUID(),
      ticket: nextTicket++,
      customer: customers[i % customers.length],
      pizzaId: pizza.id,
      ...spec,
      ...(fulfilment === 'DELIVERY' ? { postcode: ['E1 6AN', 'N1 9GU', 'SE1 7PB', 'W1D 3QF'][i % 4] } : {}),
      total: priceOrder(pizza, spec).total,
      status,
      ...(status === 'DONE' || (status === 'CANCELLED' && i % 2 === 0) ? { ovenAt: createdAt + 60_000 } : {}),
      createdAt,
      updatedAt: createdAt + 3 * 60_000,
      ...(status === 'REJECTED' ? { rejectReason: 'Sold out' } : {}),
    };
    orders.set(order.id, order);
    activity.push({
      id: randomUUID(),
      orderId: order.id,
      ticket: order.ticket,
      kind: status,
      message: messageFor(order, status),
      ts: order.updatedAt,
    });
  }
}

function messageFor(order, kind, driver) {
  const pizza = menuById.get(order.pizzaId)?.name ?? order.pizzaId;
  const what = `${order.quantity}× ${pizza}`;
  switch (kind) {
    case 'QUEUED':
      return `${what} for ${order.customer} is in the queue`;
    case 'IN_OVEN':
      return `${what} went into the oven`;
    case 'ON_THE_WAY':
      return `${driver?.name ?? 'A driver'} is taking ${what} to ${order.postcode}`;
    case 'DONE':
      return order.fulfilment === 'DELIVERY'
        ? `${what} delivered to ${order.customer}`
        : `${order.customer} collected ${what}`;
    case 'CANCELLED':
      return `${what} for ${order.customer} was cancelled`;
    case 'REJECTED':
      return `${what} for ${order.customer} was rejected: ${order.rejectReason}`;
  }
}

function validateOrder(body) {
  const errors = {};
  const pizza = menuById.get(body?.pizzaId);
  if (!pizza) errors.pizzaId = 'Unknown pizza';
  const customer = typeof body?.customer === 'string' ? body.customer.trim() : '';
  if (customer.length < 2 || customer.length > 40) errors.customer = 'Name must be 2–40 characters';
  if (!['S', 'M', 'L'].includes(body?.size)) errors.size = 'Size must be S, M or L';
  if (!['CLASSIC', 'THIN', 'STUFFED'].includes(body?.crust)) errors.crust = 'Unknown crust';
  if (![0, 10, 15, 20].includes(body?.tipPercent)) errors.tipPercent = 'Tip must be 0, 10, 15 or 20';
  if (!Number.isInteger(body?.quantity) || body.quantity < 1)
    errors.quantity = 'Quantity must be a whole number of at least 1';
  else if (body.quantity > MAX_PER_ORDER) errors.quantity = `Max ${MAX_PER_ORDER} pizzas per order`;
  if (body?.fulfilment === 'DELIVERY') {
    const pc = normalisePostcode(body.postcode);
    if (!pc) errors.postcode = 'Enter a valid UK postcode';
    else if (!inDeliveryArea(pc)) errors.postcode = `Sorry, we don't deliver to ${pc.split(' ')[0]} yet`;
  } else if (body?.fulfilment !== 'COLLECTION') errors.fulfilment = 'Fulfilment must be DELIVERY or COLLECTION';
  return errors;
}

// ---------------------------------------------------------------------------
// Streaming (Server-Sent Events)
// ---------------------------------------------------------------------------

/** @type {Set<http.ServerResponse>} */
const clients = new Set();

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) res.write(payload);
}

function log(order, kind, driver) {
  const entry = {
    id: randomUUID(),
    orderId: order.id,
    ticket: order.ticket,
    kind,
    message: messageFor(order, kind, driver),
    ts: Date.now(),
  };
  activity.push(entry);
  broadcast({ type: 'activity', activity: entry });
}

function updateOrder(order, patch, driver) {
  const before = order.status;
  Object.assign(order, patch, { updatedAt: Date.now() });
  broadcast({ type: 'order', order });
  if (order.status !== before) log(order, order.status, driver);
}

function updateDriver(driver, patch) {
  Object.assign(driver, patch, { updatedAt: Date.now() });
  broadcast({ type: 'driver', driver });
}

const secs = (n) => (n * 1000) / SPEED;
const OVENS = STRESS ? 40 : 4;

function tick() {
  const now = Date.now();

  // Walk-in customers use up stock; the prep team restocks now and then
  const changed = [];
  for (const level of stock.values()) {
    const r = Math.random();
    if (r < (STRESS ? 0.3 : 0.04) && level.portions > 0) level.portions -= 1;
    else if (r > (STRESS ? 0.97 : 0.99)) level.portions = Math.min(level.capacity, level.portions + 10);
    else continue;
    level.ts = now;
    changed.push({ ...level });
  }
  if (changed.length) broadcast({ type: 'stock', levels: changed });

  // Move orders through the kitchen
  let inOven = [...orders.values()].filter((o) => o.status === 'IN_OVEN').length;
  for (const order of orders.values()) {
    if (order.status === 'QUEUED' && now >= order.etaAt && inOven < OVENS) {
      inOven++;
      updateOrder(order, { status: 'IN_OVEN', ovenAt: now, etaAt: now + secs(8 + Math.random() * 6) });
    } else if (order.status === 'IN_OVEN' && now >= order.etaAt) {
      if (order.fulfilment === 'COLLECTION') {
        updateOrder(order, { status: 'DONE', etaAt: undefined });
        continue;
      }
      const driver = [...drivers.values()].find((d) => d.status === 'IDLE');
      if (!driver) continue; // waits in the oven area until a driver is free
      const etaAt = now + secs(10 + Math.random() * 12);
      updateDriver(driver, { status: 'DELIVERING', orderId: order.id, etaAt });
      updateOrder(order, { status: 'ON_THE_WAY', driverId: driver.id, etaAt }, driver);
    } else if (order.status === 'ON_THE_WAY' && now >= order.etaAt) {
      updateOrder(order, { status: 'DONE', etaAt: undefined });
      const driver = drivers.get(order.driverId);
      if (driver)
        updateDriver(driver, {
          status: 'RETURNING',
          orderId: undefined,
          etaAt: now + secs(6),
          deliveriesToday: driver.deliveriesToday + 1,
        });
    }
  }
  for (const driver of drivers.values()) {
    if (driver.status === 'RETURNING' && now >= driver.etaAt)
      updateDriver(driver, { status: 'IDLE', etaAt: undefined });
  }
}

setInterval(tick, TICK_MS);

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  if (path === '/api/stream' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 2000\n\n');
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 15000);
    req.on('close', () => {
      clearInterval(ping);
      clients.delete(res);
    });
    return;
  }

  await sleep(LAT_MIN + Math.random() * (LAT_MAX - LAT_MIN));

  // `?fail=1` forces an error so you can test your error states deterministically
  if (url.searchParams.get('fail') === '1' || (path.startsWith('/api/') && Math.random() < FAIL_RATE)) {
    return send(res, 500, { error: 'The oven caught fire (simulated server error)' });
  }

  if (path === '/api/menu' && method === 'GET') return send(res, 200, menu);
  if (path === '/api/stock' && method === 'GET') return send(res, 200, [...stock.values()]);
  if (path === '/api/drivers' && method === 'GET') return send(res, 200, [...drivers.values()]);
  if (path === '/api/activity' && method === 'GET') return send(res, 200, activity.slice(-200));

  if (path === '/api/favourites' && method === 'GET') return send(res, 200, { pizzaIds: favourites });
  if (path === '/api/favourites' && method === 'PUT') {
    const body = await readJson(req);
    const ids = body?.pizzaIds;
    if (!Array.isArray(ids) || ids.some((id) => !menuById.has(id)))
      return send(res, 422, { error: 'pizzaIds must be an array of known pizza ids' });
    favourites = [...new Set(ids)];
    return send(res, 200, { pizzaIds: favourites });
  }

  if (path === '/api/orders' && method === 'GET')
    return send(
      res,
      200,
      [...orders.values()].sort((a, b) => b.createdAt - a.createdAt),
    );

  if (path === '/api/orders' && method === 'POST') {
    const body = await readJson(req);
    if (!body) return send(res, 400, { error: 'Invalid JSON' });
    const errors = validateOrder(body);
    if (Object.keys(errors).length) return send(res, 422, { error: 'Validation failed', errors });

    const pizza = menuById.get(body.pizzaId);
    const level = stock.get(pizza.id);
    const now = Date.now();
    const order = {
      id: typeof body.clientOrderId === 'string' ? body.clientOrderId : randomUUID(),
      ticket: nextTicket++,
      customer: body.customer.trim(),
      pizzaId: pizza.id,
      size: body.size,
      crust: body.crust,
      quantity: body.quantity,
      fulfilment: body.fulfilment,
      ...(body.fulfilment === 'DELIVERY' ? { postcode: normalisePostcode(body.postcode) } : {}),
      tipPercent: body.tipPercent,
      total: priceOrder(pizza, body).total,
      status: 'QUEUED',
      etaAt: now + secs(3 + Math.random() * 4),
      createdAt: now,
      updatedAt: now,
    };
    if (level.portions < order.quantity) {
      order.status = 'REJECTED';
      order.rejectReason = level.portions === 0 ? 'Sold out' : `Only ${level.portions} left`;
      delete order.etaAt;
    } else {
      level.portions -= order.quantity;
      level.ts = now;
      broadcast({ type: 'stock', levels: [{ ...level }] });
    }
    orders.set(order.id, order);
    broadcast({ type: 'order', order });
    log(order, order.status);
    return send(res, 201, order);
  }

  const cancel = path.match(/^\/api\/orders\/([^/]+)$/);
  if (cancel && method === 'DELETE') {
    const order = orders.get(cancel[1]);
    if (!order) return send(res, 404, { error: 'Order not found' });
    if (order.status !== 'QUEUED' && order.status !== 'IN_OVEN') {
      return send(res, 409, {
        error:
          order.status === 'ON_THE_WAY'
            ? 'Too late - it is already on the way!'
            : `Cannot cancel an order that is ${order.status}`,
      });
    }
    // Pizzas that never reached the oven go back into stock
    if (order.status === 'QUEUED') {
      const level = stock.get(order.pizzaId);
      level.portions = Math.min(level.capacity, level.portions + order.quantity);
      level.ts = Date.now();
      broadcast({ type: 'stock', levels: [{ ...level }] });
    }
    updateOrder(order, { status: 'CANCELLED', etaAt: undefined });
    return send(res, 200, order);
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(
    `Slice Rush kitchen API on http://localhost:${PORT}  (stress=${STRESS}, tick=${TICK_MS}ms, speed=${SPEED}, failRate=${FAIL_RATE})`,
  );
});
