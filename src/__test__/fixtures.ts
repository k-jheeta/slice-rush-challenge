// Static data used by the Part 1 layout, the spec images and the unit tests.
import type { Activity, Driver, Order, Pizza, StockLevel, StockMap, TakingsRow } from '../types';

/** A fixed "now" so countdowns and times are stable: 28 Oct 2026, 18:30 UTC (dinner rush) */
export const NOW = Date.UTC(2026, 9, 28, 18, 30);

const RAW: Array<[string, string, string[], Pizza['category'], number, Pizza['heat'], boolean, number, number]> = [
  // id, name, toppings, category, basePrice, heat, veg, portions, capacity
  ['margherita', 'Margherita', ['tomato', 'mozzarella', 'basil'], 'CLASSIC', 950, 0, true, 24, 40],
  [
    'pepperoni-party',
    'Pepperoni Party',
    ['tomato', 'mozzarella', 'double pepperoni'],
    'CLASSIC',
    1250,
    1,
    false,
    18,
    30,
  ],
  ['hot-honey', 'Hot Honey Heaven', ['tomato', 'nduja', 'hot honey', 'chilli flakes'], 'SPICY', 1350, 2, false, 4, 25],
  ['fun-ghi', 'Fun-ghi', ['white base', 'wild mushrooms', 'thyme', 'garlic oil'], 'VEGGIE', 1200, 0, true, 15, 30],
  [
    'basil-instinct',
    'Basil Instinct',
    ['pesto', 'burrata', 'cherry tomatoes', 'basil'],
    'VEGGIE',
    1400,
    0,
    true,
    9,
    20,
  ],
  [
    'truffle-shuffle',
    'Truffle Shuffle',
    ['white base', 'truffle', 'potato', 'rosemary'],
    'SPECIAL',
    1650,
    0,
    true,
    2,
    12,
  ],
  ['inferno', 'Inferno', ['tomato', 'scotch bonnet', 'jalapeños', 'spicy salami'], 'SPICY', 1400, 3, false, 11, 20],
  [
    'pineapple-peace',
    'Pineapple Peace Treaty',
    ['tomato', 'ham', 'pineapple', 'chilli jam'],
    'CLASSIC',
    1250,
    1,
    false,
    13,
    25,
  ],
  [
    'meat-feast',
    'Meat Feast',
    ['tomato', 'sausage', 'pepperoni', 'smoked ham', 'beef'],
    'CLASSIC',
    1550,
    0,
    false,
    20,
    30,
  ],
  [
    'green-machine',
    'Green Machine',
    ['pesto', 'broccoli', 'courgette', 'spinach', 'feta'],
    'VEGGIE',
    1300,
    0,
    true,
    7,
    20,
  ],
  [
    'bbq-smokehouse',
    'BBQ Smokehouse',
    ['bbq sauce', 'pulled pork', 'red onion', 'smoked cheddar'],
    'SPECIAL',
    1500,
    0,
    false,
    10,
    20,
  ],
  ['nduja-ninja', "'Nduja Ninja", ['tomato', 'nduja', 'ricotta', 'honey'], 'SPICY', 1450, 2, false, 6, 20],
  [
    'four-cheese',
    'Four Cheese Please',
    ['mozzarella', 'gorgonzola', 'parmesan', 'fontina'],
    'VEGGIE',
    1350,
    0,
    true,
    0,
    25,
  ],
  ['the-big-dipper', 'The Big Dipper', ['tomato', 'meatballs', 'garlic dip crust'], 'SPECIAL', 1600, 0, false, 14, 20],
];

export const MENU: Pizza[] = RAW.map(([id, name, toppings, category, basePrice, heat, vegetarian]) => ({
  id,
  name,
  toppings,
  category,
  basePrice,
  heat,
  vegetarian,
}));

export const MENU_BY_ID = new Map(MENU.map((p) => [p.id, p]));

/** Look up a fixture pizza by id, e.g. pizza('margherita') */
export function pizza(id: string): Pizza {
  const found = MENU_BY_ID.get(id);
  if (!found) throw new Error(`No fixture pizza ${id}`);
  return found;
}

export const STOCK_LEVELS: StockLevel[] = RAW.map(([id, , , , , , , portions, capacity]) => ({
  pizzaId: id,
  portions,
  capacity,
  ts: NOW,
}));

export const STOCK: StockMap = Object.fromEntries(STOCK_LEVELS.map((s) => [s.pizzaId, s]));

export const FAVOURITE_IDS = ['margherita', 'pepperoni-party', 'hot-honey'];

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'ord-1',
    ticket: 101,
    customer: 'Alex',
    pizzaId: 'margherita',
    size: 'M',
    crust: 'CLASSIC',
    quantity: 1,
    fulfilment: 'DELIVERY',
    postcode: 'E1 6AN',
    tipPercent: 0,
    total: 1249,
    status: 'QUEUED',
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

const MIN = 60_000;

export const ORDERS: Order[] = [
  makeOrder({
    id: 'ord-8',
    ticket: 108,
    customer: 'Sasha',
    pizzaId: 'hot-honey',
    size: 'L',
    quantity: 2,
    tipPercent: 15,
    total: 4038,
    status: 'QUEUED',
    etaAt: NOW + 2 * MIN + 5000,
    createdAt: NOW - 1 * MIN,
  }),
  makeOrder({
    id: 'ord-7',
    ticket: 107,
    customer: 'Robin',
    pizzaId: 'fun-ghi',
    size: 'M',
    crust: 'THIN',
    quantity: 1,
    fulfilment: 'COLLECTION',
    postcode: undefined,
    total: 1200,
    status: 'IN_OVEN',
    ovenAt: NOW - 1 * MIN,
    etaAt: NOW + 4 * MIN + 30_000,
    createdAt: NOW - 3 * MIN,
  }),
  makeOrder({
    id: 'ord-6',
    ticket: 106,
    customer: 'Jordan',
    pizzaId: 'pepperoni-party',
    size: 'L',
    crust: 'STUFFED',
    quantity: 3,
    postcode: 'N1 9GU',
    tipPercent: 10,
    total: 4180,
    status: 'ON_THE_WAY',
    ovenAt: NOW - 9 * MIN,
    etaAt: NOW + 7 * MIN,
    driverId: 'drv-1',
    createdAt: NOW - 14 * MIN,
  }),
  makeOrder({
    id: 'ord-5',
    ticket: 105,
    customer: 'Charlie',
    pizzaId: 'inferno',
    quantity: 1,
    total: 1699,
    status: 'ON_THE_WAY',
    ovenAt: NOW - 12 * MIN,
    etaAt: NOW - 1 * MIN - 20_000,
    driverId: 'drv-2',
    createdAt: NOW - 20 * MIN,
  }),
  makeOrder({
    id: 'ord-4',
    ticket: 104,
    customer: 'Morgan',
    pizzaId: 'four-cheese',
    size: 'S',
    quantity: 4,
    fulfilment: 'COLLECTION',
    postcode: undefined,
    total: 3240,
    status: 'REJECTED',
    rejectReason: 'Sold out',
    createdAt: NOW - 26 * MIN,
  }),
  makeOrder({
    id: 'ord-3',
    ticket: 103,
    customer: 'Jamie',
    pizzaId: 'margherita',
    size: 'L',
    quantity: 2,
    postcode: 'SE1 7PB',
    total: 2759,
    status: 'CANCELLED',
    ovenAt: NOW - 30 * MIN,
    createdAt: NOW - 34 * MIN,
  }),
  makeOrder({
    id: 'ord-2',
    ticket: 102,
    customer: 'Taylor',
    pizzaId: 'margherita',
    quantity: 3,
    postcode: 'W1D 3QF',
    tipPercent: 20,
    total: 2280,
    status: 'DONE',
    ovenAt: NOW - 52 * MIN,
    createdAt: NOW - 60 * MIN,
  }),
  makeOrder({
    id: 'ord-1',
    ticket: 101,
    customer: 'Riley',
    pizzaId: 'meat-feast',
    size: 'L',
    quantity: 1,
    fulfilment: 'COLLECTION',
    postcode: undefined,
    tipPercent: 10,
    total: 2222,
    status: 'DONE',
    ovenAt: NOW - 80 * MIN,
    createdAt: NOW - 90 * MIN,
  }),
];

export const DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Priya',
    vehicle: 'SCOOTER',
    status: 'DELIVERING',
    orderId: 'ord-6',
    etaAt: NOW + 7 * MIN,
    deliveriesToday: 6,
    updatedAt: NOW,
  },
  {
    id: 'drv-2',
    name: 'Tomasz',
    vehicle: 'BIKE',
    status: 'DELIVERING',
    orderId: 'ord-5',
    etaAt: NOW - 1 * MIN - 20_000,
    deliveriesToday: 4,
    updatedAt: NOW,
  },
  {
    id: 'drv-3',
    name: 'Ada',
    vehicle: 'CAR',
    status: 'RETURNING',
    etaAt: NOW + 2 * MIN,
    deliveriesToday: 9,
    updatedAt: NOW,
  },
  { id: 'drv-4', name: 'Kwame', vehicle: 'BIKE', status: 'IDLE', deliveriesToday: 3, updatedAt: NOW },
  { id: 'drv-5', name: 'Lucía', vehicle: 'SCOOTER', status: 'IDLE', deliveriesToday: 0, updatedAt: NOW },
];

export const ACTIVITY: Activity[] = [
  {
    id: 'a-1',
    orderId: 'ord-8',
    ticket: 108,
    kind: 'QUEUED',
    message: '2× Hot Honey Heaven for Sasha is in the queue',
    ts: NOW - 1 * MIN,
  },
  {
    id: 'a-2',
    orderId: 'ord-7',
    ticket: 107,
    kind: 'IN_OVEN',
    message: '1× Fun-ghi went into the oven',
    ts: NOW - 1 * MIN - 30_000,
  },
  {
    id: 'a-3',
    orderId: 'ord-6',
    ticket: 106,
    kind: 'ON_THE_WAY',
    message: 'Priya is taking 3× Pepperoni Party to N1 9GU',
    ts: NOW - 4 * MIN,
  },
  {
    id: 'a-4',
    orderId: 'ord-4',
    ticket: 104,
    kind: 'REJECTED',
    message: '4× Four Cheese Please for Morgan was rejected: Sold out',
    ts: NOW - 26 * MIN,
  },
  {
    id: 'a-5',
    orderId: 'ord-3',
    ticket: 103,
    kind: 'CANCELLED',
    message: '2× Margherita for Jamie was cancelled',
    ts: NOW - 29 * MIN,
  },
  {
    id: 'a-6',
    orderId: 'ord-2',
    ticket: 102,
    kind: 'DONE',
    message: '3× Margherita delivered to Taylor',
    ts: NOW - 40 * MIN,
  },
];

/** Pre-computed takings for ORDERS (what computeTakings returns). Used by the Part 1 layout. */
export const TAKINGS: TakingsRow[] = [
  { pizzaId: 'meat-feast', sold: 1, revenue: 2020, tips: 202, waste: 0, net: 2222 },
  { pizzaId: 'margherita', sold: 3, revenue: 1900, tips: 380, waste: 868, net: 1412 },
];
