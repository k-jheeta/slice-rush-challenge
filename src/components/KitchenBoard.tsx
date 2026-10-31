import type { Activity, Driver, Order, OrderStatus, Pizza, SortSpec, TakingsRow, Vehicle } from '../types';
import { formatEta, formatMoney, formatTicket, formatTime } from '../utils/format';
import { ArrowDownIcon, ArrowUpIcon, BikeIcon, CarIcon, CloseIcon, InboxIcon, PizzaIcon, ScooterIcon } from './icons';
import { StatusBadge } from './StatusBadge';
import '../styles/buttons.css';
import './Panel.css';
import './KitchenBoard.css';

export type BoardTab = 'tickets' | 'drivers' | 'takings' | 'activity';
export type TicketFilter = 'ALL' | 'ACTIVE' | 'DONE' | 'CANCELLED' | 'REJECTED';
export type TicketSortKey = 'ticket' | 'customer' | 'pizza' | 'quantity' | 'eta' | 'total' | 'status';

const ACTIVE: ReadonlySet<OrderStatus> = new Set(['PENDING', 'QUEUED', 'IN_OVEN', 'ON_THE_WAY']);
const CANCELLABLE: ReadonlySet<OrderStatus> = new Set(['QUEUED', 'IN_OVEN']);

const FILTERS: Array<{ value: TicketFilter; label: string; match: (o: Order) => boolean }> = [
  { value: 'ALL', label: 'All', match: () => true },
  { value: 'ACTIVE', label: 'Active', match: (o) => ACTIVE.has(o.status) },
  { value: 'DONE', label: 'Done', match: (o) => o.status === 'DONE' },
  { value: 'CANCELLED', label: 'Cancelled', match: (o) => o.status === 'CANCELLED' },
  { value: 'REJECTED', label: 'Rejected', match: (o) => o.status === 'REJECTED' },
];

const SIZE_LABEL = { S: 'Small', M: 'Medium', L: 'Large' } as const;
const CRUST_LABEL = { CLASSIC: '', THIN: 'thin', STUFFED: 'stuffed' } as const;

export interface KitchenBoardProps {
  /**
   * Part 1: tab, filter, sort and `now` are props so you can style every state.
   * Part 3: tab -> useLocalStorage, filter/sort -> local state (and actually filter + sort the rows),
   * takings -> computeTakings(orders), now -> a live clock (see docs).
   */
  tab: BoardTab;
  orders: Order[];
  cancelling?: Record<string, true>;
  drivers: Driver[];
  activity: Activity[];
  menuById: Map<string, Pizza>;
  takings: TakingsRow[];
  now: number;
  filter?: TicketFilter;
  sort?: SortSpec<TicketSortKey> | null;
}

export function KitchenBoard({ tab, orders, cancelling = {}, drivers, activity, menuById, takings, now, filter = 'ALL', sort = null }: KitchenBoardProps) {
  const active = orders.filter((o) => ACTIVE.has(o.status)).length;
  const out = drivers.filter((d) => d.status === 'DELIVERING').length;

  const tabs: Array<{ id: BoardTab; label: string; count?: string }> = [
    { id: 'tickets', label: 'Tickets', count: String(active) },
    { id: 'drivers', label: 'Drivers', count: `${out}/${drivers.length}` },
    { id: 'takings', label: 'Takings' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <section className="panel board" aria-label="Kitchen board">
      <div className="panel-header board-tabs" role="tablist" aria-label="Kitchen views">
        {tabs.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`tabpanel-${t.id}`} className="board-tab">
            {t.label}
            {t.count !== undefined && <span className="count-badge">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="board-body" role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'tickets' && <TicketsView orders={orders} cancelling={cancelling} drivers={drivers} menuById={menuById} now={now} filter={filter} sort={sort} />}
        {tab === 'drivers' && <DriversView drivers={drivers} orders={orders} now={now} />}
        {tab === 'takings' && <TakingsView takings={takings} menuById={menuById} />}
        {tab === 'activity' && <ActivityView activity={activity} />}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

interface TicketsViewProps {
  orders: Order[];
  cancelling: Record<string, true>;
  drivers: Driver[];
  menuById: Map<string, Pizza>;
  now: number;
  filter: TicketFilter;
  sort: SortSpec<TicketSortKey> | null;
}

function TicketsView({ orders, cancelling, drivers, menuById, now, filter, sort }: TicketsViewProps) {
  const visible = orders; // Part 3: filter and sort these
  const driverNames = new Map(drivers.map((d) => [d.id, d.name]));
  const queuedIds = orders.filter((o) => o.status === 'QUEUED' && !cancelling[o.id]);

  return (
    <>
      <div className="board-toolbar">
        <div className="chips" role="group" aria-label="Filter tickets">
          {FILTERS.map((f) => (
            <button key={f.value} type="button" className="chip" aria-pressed={filter === f.value}>
              {f.label}
              <span className="chip-count">{f.value === 'ALL' ? orders.length : orders.filter(f.match).length}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" disabled={queuedIds.length === 0}>
          Cancel all queued
        </button>
      </div>

      <div className="table tickets-table" role="table" aria-label="Tickets" aria-rowcount={visible.length + 1}>
        <div className="table-head" role="rowgroup">
          <div className="tr" role="row">
            <SortHeader k="ticket" label="Ticket" sort={sort} className="col-ticket" />
            <SortHeader k="customer" label="Customer" sort={sort} className="col-customer" />
            <SortHeader k="pizza" label="Pizza" sort={sort} className="col-pizza" />
            <SortHeader k="quantity" label="Qty" sort={sort} className="col-qty right" />
            <div className="th col-stage" role="columnheader">
              Progress
            </div>
            <SortHeader k="eta" label="ETA" sort={sort} className="col-eta right" />
            <SortHeader k="total" label="Total" sort={sort} className="col-total right" />
            <SortHeader k="status" label="Status" sort={sort} className="col-status" />
            <div className="th col-actions" role="columnheader">
              <span className="visually-hidden">Actions</span>
            </div>
          </div>
        </div>
        <div className="table-body" role="rowgroup">
          {visible.length === 0 ? (
            <EmptyState title={filter === 'ALL' ? 'No tickets yet' : `No ${FILTERS.find((f) => f.value === filter)!.label.toLowerCase()} tickets`} message="Orders you send to the kitchen appear here." />
          ) : (
            visible.map((order) => (
              <TicketRow
                key={order.id}
                order={order}
                pizza={menuById.get(order.pizzaId)}
                driverName={order.driverId ? driverNames.get(order.driverId) : undefined}
                cancelling={!!cancelling[order.id]}
                now={now}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

interface SortHeaderProps<K extends string> {
  k: K;
  label: string;
  sort: SortSpec<K> | null;
  className: string;
}

function SortHeader<K extends string>({ k, label, sort, className }: SortHeaderProps<K>) {
  const active = sort?.key === k ? sort.direction : null;
  return (
    <div className={`th ${className}`} role="columnheader" aria-sort={active === 'asc' ? 'ascending' : active === 'desc' ? 'descending' : 'none'}>
      <button type="button" className={`sort-button${active ? ' active' : ''}`} data-key={k}>
        {label}
        {active === 'asc' && <ArrowUpIcon size={12} />}
        {active === 'desc' && <ArrowDownIcon size={12} />}
      </button>
    </div>
  );
}

interface TicketRowProps {
  order: Order;
  pizza: Pizza | undefined;
  driverName: string | undefined;
  cancelling: boolean;
  now: number;
}

function TicketRow({ order, pizza, driverName, cancelling, now }: TicketRowProps) {
  const crust = CRUST_LABEL[order.crust];
  return (
    <div className={`tr${order.status === 'PENDING' ? ' is-pending' : ''}`} role="row">
      <div className="td col-ticket num strong" role="cell">
        {order.ticket ? formatTicket(order.ticket) : '····'}
      </div>
      <div className="td col-customer stack" role="cell">
        <span className="strong ellipsis">{order.customer}</span>
        <span className="sub ellipsis">
          {order.fulfilment === 'DELIVERY' ? (driverName ? `${order.postcode} · ${driverName}` : order.postcode) : 'Collection'}
        </span>
      </div>
      <div className="td col-pizza stack" role="cell">
        <span className="ellipsis">{pizza?.name ?? order.pizzaId}</span>
        <span className="sub ellipsis">
          {SIZE_LABEL[order.size]}
          {crust && ` · ${crust}`}
        </span>
      </div>
      <div className="td col-qty num right" role="cell">
        {order.quantity}
      </div>
      <div className="td col-stage" role="cell">
        <StageTrack order={order} />
      </div>
      <div className="td col-eta right" role="cell">
        {order.etaAt !== undefined && ACTIVE.has(order.status) ? <Eta etaAt={order.etaAt} now={now} /> : <span className="muted">–</span>}
      </div>
      <div className="td col-total num right" role="cell">
        {formatMoney(order.total)}
      </div>
      <div className="td col-status" role="cell">
        <StatusBadge status={order.status} title={order.rejectReason} />
      </div>
      <div className="td col-actions" role="cell">
        {CANCELLABLE.has(order.status) &&
          (cancelling ? (
            <span className="spinner row-spinner" aria-label="Cancelling" />
          ) : (
            <button type="button" className="icon-btn row-cancel" aria-label={`Cancel ticket ${formatTicket(order.ticket)}`}>
              <CloseIcon size={14} />
            </button>
          ))}
      </div>
    </div>
  );
}

/** Progress through the kitchen as a row of segments. Collection orders skip the "road" step. */
export function StageTrack({ order }: { order: Order }) {
  const steps = order.fulfilment === 'DELIVERY' ? ['Queued', 'Oven', 'On the road', 'Done'] : ['Queued', 'Oven', 'Done'];
  const position: Partial<Record<OrderStatus, number>> = {
    PENDING: 0,
    QUEUED: 0,
    IN_OVEN: 1,
    ON_THE_WAY: 2,
    DONE: steps.length - 1,
  };
  const current = position[order.status];
  const stopped = current === undefined;
  return (
    <span
      className={`stage-track${stopped ? ' is-stopped' : ''}`}
      role="img"
      aria-label={stopped ? 'Stopped' : `${steps[current]}, step ${current + 1} of ${steps.length}`}
    >
      {steps.map((step, i) => (
        <span
          key={step}
          className={`stage-seg${!stopped && i < current ? ' is-done' : ''}${!stopped && i === current ? (order.status === 'DONE' ? ' is-done' : ' is-current') : ''}`}
        />
      ))}
    </span>
  );
}

/** Countdown to etaAt. Part 3/4: make it tick live without re-rendering the whole board every second. */
export function Eta({ etaAt, now }: { etaAt: number; now: number }) {
  const text = formatEta(etaAt, now);
  return <span className={`eta num${text.startsWith('+') ? ' is-late' : text === 'Due' ? ' is-due' : ''}`}>{text}</span>;
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <InboxIcon size={28} />
      <span className="empty-state-title">{title}</span>
      <span>{message}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

const DRIVER_ORDER = { DELIVERING: 0, RETURNING: 1, IDLE: 2 } as const;
const DRIVER_STATUS_LABEL = { DELIVERING: 'On a delivery', RETURNING: 'Heading back', IDLE: 'Ready' } as const;
const VEHICLE: Record<Vehicle, { icon: typeof BikeIcon; label: string }> = {
  BIKE: { icon: BikeIcon, label: 'Bike' },
  SCOOTER: { icon: ScooterIcon, label: 'Scooter' },
  CAR: { icon: CarIcon, label: 'Car' },
};

function DriversView({ drivers, orders, now }: { drivers: Driver[]; orders: Order[]; now: number }) {
  const sorted = [...drivers].sort((a, b) => DRIVER_ORDER[a.status] - DRIVER_ORDER[b.status] || a.name.localeCompare(b.name));
  const byId = new Map(orders.map((o) => [o.id, o]));
  if (sorted.length === 0) return <EmptyState title="No drivers on shift" message="Drivers appear here when they clock in." />;
  return (
    <ul className="driver-grid" aria-label="Drivers">
      {sorted.map((d) => (
        <DriverCard key={d.id} driver={d} order={d.orderId ? byId.get(d.orderId) : undefined} now={now} />
      ))}
    </ul>
  );
}

function DriverCard({ driver, order, now }: { driver: Driver; order: Order | undefined; now: number }) {
  const { icon: Icon, label } = VEHICLE[driver.vehicle];
  return (
    <li className={`driver-card driver-${driver.status.toLowerCase()}`}>
      <div className="driver-head">
        <span className="driver-avatar" aria-hidden="true">
          {driver.name[0]}
        </span>
        <div className="driver-who">
          <span className="driver-name">{driver.name}</span>
          <span className="driver-vehicle">
            <Icon size={14} />
            {label}
          </span>
        </div>
        <span className="driver-status">{DRIVER_STATUS_LABEL[driver.status]}</span>
      </div>
      <div className="driver-job">
        {driver.status === 'DELIVERING' && order ? (
          <>
            <span className="driver-job-text">
              <span className="num strong">{formatTicket(order.ticket)}</span> → <span className="num">{order.postcode}</span>
            </span>
            {driver.etaAt !== undefined && <Eta etaAt={driver.etaAt} now={now} />}
          </>
        ) : driver.status === 'RETURNING' ? (
          <>
            <span className="driver-job-text">Back at the shop in</span>
            {driver.etaAt !== undefined && <Eta etaAt={driver.etaAt} now={now} />}
          </>
        ) : (
          <span className="driver-job-text muted">Waiting for the next pizza</span>
        )}
      </div>
      <div className="driver-foot">
        <span>Deliveries today</span>
        <span className="num strong">{driver.deliveriesToday}</span>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Takings
// ---------------------------------------------------------------------------

function TakingsView({ takings: rows, menuById }: { takings: TakingsRow[]; menuById: Map<string, Pizza> }) {
  const total = rows.reduce(
    (t, r) => ({ sold: t.sold + r.sold, revenue: t.revenue + r.revenue, tips: t.tips + r.tips, waste: t.waste + r.waste, net: t.net + r.net }),
    { sold: 0, revenue: 0, tips: 0, waste: 0, net: 0 },
  );
  if (rows.length === 0) return <EmptyState title="Nothing sold yet" message="Takings appear once orders are delivered or collected." />;
  return (
    <div className="table takings-table" role="table" aria-label="Takings">
      <div className="table-head" role="rowgroup">
        <div className="tr" role="row">
          <div className="th col-name" role="columnheader">Pizza</div>
          <div className="th col-num right" role="columnheader">Sold</div>
          <div className="th col-money right" role="columnheader">Revenue</div>
          <div className="th col-money right" role="columnheader">Tips</div>
          <div className="th col-money right" role="columnheader">Waste</div>
          <div className="th col-money right" role="columnheader">Net</div>
        </div>
      </div>
      <div className="table-body" role="rowgroup">
        {rows.map((r) => {
          const pizza = menuById.get(r.pizzaId)!;
          return (
            <div className="tr" role="row" key={r.pizzaId}>
              <div className={`td col-name cat-${pizza.category.toLowerCase()}`} role="cell">
                <PizzaIcon size={24} />
                <span className="strong ellipsis">{pizza.name}</span>
              </div>
              <div className="td col-num num right" role="cell">{r.sold}</div>
              <div className="td col-money num right" role="cell">{formatMoney(r.revenue)}</div>
              <div className="td col-money num right" role="cell">{formatMoney(r.tips)}</div>
              <div className={`td col-money num right${r.waste ? ' waste' : ' muted'}`} role="cell">{r.waste ? `-${formatMoney(r.waste)}` : '–'}</div>
              <div className={`td col-money num right strong${r.net < 0 ? ' waste' : ''}`} role="cell">{formatMoney(r.net)}</div>
            </div>
          );
        })}
      </div>
      <div className="table-foot" role="rowgroup">
        <div className="tr" role="row">
          <div className="td col-name strong" role="cell">Total today</div>
          <div className="td col-num num right strong" role="cell">{total.sold}</div>
          <div className="td col-money num right" role="cell">{formatMoney(total.revenue)}</div>
          <div className="td col-money num right" role="cell">{formatMoney(total.tips)}</div>
          <div className="td col-money num right waste" role="cell">{total.waste ? `-${formatMoney(total.waste)}` : '–'}</div>
          <div className="td col-money num right net-total" role="cell">{formatMoney(total.net)}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

function ActivityView({ activity }: { activity: Activity[] }) {
  const sorted = [...activity].sort((a, b) => b.ts - a.ts).slice(0, 100);
  if (sorted.length === 0) return <EmptyState title="All quiet" message="Kitchen events appear here as they happen." />;
  return (
    <ol className="timeline" aria-label="Kitchen activity">
      {sorted.map((a) => (
        <li key={a.id} className={`timeline-item kind-${a.kind.toLowerCase().replace(/_/g, '-')}`}>
          <span className="timeline-dot" aria-hidden="true" />
          <p className="timeline-message">
            <span className="timeline-ticket num">{formatTicket(a.ticket)}</span> {a.message}
          </p>
          <time className="timeline-time num" dateTime={new Date(a.ts).toISOString()}>
            {formatTime(a.ts)}
          </time>
        </li>
      ))}
    </ol>
  );
}
