// Shared domain types. These mirror the JSON returned by the mock API in /server.
// All money is in integer PENCE (1250 = £12.50) to avoid floating point errors.

export type PizzaId = string;
export type Category = 'CLASSIC' | 'VEGGIE' | 'SPICY' | 'SPECIAL';

export interface Pizza {
  id: PizzaId;
  name: string;
  toppings: string[];
  category: Category;
  /** Price of a MEDIUM pizza with classic crust, in pence */
  basePrice: number;
  /** 0 = not spicy, 3 = very spicy */
  heat: 0 | 1 | 2 | 3;
  vegetarian: boolean;
}

/** Live stock: how many more of this pizza the kitchen can make right now */
export interface StockLevel {
  pizzaId: PizzaId;
  portions: number;
  /** Portions when fully stocked - use it to draw the stock meter */
  capacity: number;
  /** Epoch millis of the last update */
  ts: number;
}

/** pizzaId -> latest stock level */
export type StockMap = Record<PizzaId, StockLevel>;

export type Size = 'S' | 'M' | 'L';
export type Crust = 'CLASSIC' | 'THIN' | 'STUFFED';
export type Fulfilment = 'DELIVERY' | 'COLLECTION';
export type TipPercent = 0 | 10 | 15 | 20;

/**
 * PENDING    - optimistic, only exists in the browser until the server replies
 * QUEUED     - accepted, waiting for an oven
 * IN_OVEN    - cooking
 * ON_THE_WAY - with a driver (delivery orders only)
 * DONE       - delivered or collected
 * CANCELLED  - cancelled before it left the kitchen
 * REJECTED   - refused by the server (e.g. sold out)
 */
export type OrderStatus = 'PENDING' | 'QUEUED' | 'IN_OVEN' | 'ON_THE_WAY' | 'DONE' | 'CANCELLED' | 'REJECTED';

export interface Order {
  id: string;
  /** Human-friendly ticket number shown in the kitchen, e.g. 104 -> "#0104". 0 while PENDING. */
  ticket: number;
  customer: string;
  pizzaId: PizzaId;
  size: Size;
  crust: Crust;
  quantity: number;
  fulfilment: Fulfilment;
  /** Normalised UK postcode, delivery orders only */
  postcode?: string;
  tipPercent: TipPercent;
  /** What the customer pays, in pence (see priceOrder) */
  total: number;
  status: OrderStatus;
  driverId?: string;
  /** When the order went into the oven (undefined if it never did) */
  ovenAt?: number;
  /** Estimated completion time (epoch millis) while the order is active */
  etaAt?: number;
  createdAt: number;
  updatedAt: number;
  rejectReason?: string;
}

/** What the user is editing in the order form. Text inputs stay as strings. */
export interface OrderDraft {
  pizzaId: PizzaId;
  customer: string;
  size: Size;
  crust: Crust;
  quantity: string;
  fulfilment: Fulfilment;
  postcode: string;
  tipPercent: TipPercent;
}

export type Vehicle = 'BIKE' | 'SCOOTER' | 'CAR';
export type DriverStatus = 'IDLE' | 'DELIVERING' | 'RETURNING';

export interface Driver {
  id: string;
  name: string;
  vehicle: Vehicle;
  status: DriverStatus;
  orderId?: string;
  /** When the driver will arrive (DELIVERING) or be back (RETURNING) */
  etaAt?: number;
  deliveriesToday: number;
  updatedAt: number;
}

export type ActivityKind = 'QUEUED' | 'IN_OVEN' | 'ON_THE_WAY' | 'DONE' | 'CANCELLED' | 'REJECTED';

/** One line in the kitchen activity log */
export interface Activity {
  id: string;
  orderId: string;
  ticket: number;
  kind: ActivityKind;
  message: string;
  ts: number;
}

/** Per-pizza summary of the day's takings (see computeTakings) */
export interface TakingsRow {
  pizzaId: PizzaId;
  /** Pizzas delivered/collected */
  sold: number;
  /** Food revenue after discounts, in pence (excludes delivery fees and tips) */
  revenue: number;
  tips: number;
  /** Ingredient cost of pizzas cancelled after they went into the oven */
  waste: number;
  /** revenue + tips - waste */
  net: number;
}

/** Events pushed over the /api/stream Server-Sent Events connection */
export type StreamEvent =
  | { type: 'stock'; levels: StockLevel[] }
  | { type: 'order'; order: Order }
  | { type: 'driver'; driver: Driver }
  | { type: 'activity'; activity: Activity };

export type SortDirection = 'asc' | 'desc';
export interface SortSpec<K extends string = string> {
  key: K;
  direction: SortDirection;
}
