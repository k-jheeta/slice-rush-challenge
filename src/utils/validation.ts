import type { Crust, Fulfilment, OrderDraft, Pizza, Size, TipPercent } from '../types';
import { priceOrder, type PriceQuote } from './pricing';

export type DraftField = 'customer' | 'quantity' | 'postcode';
export type DraftErrors = Partial<Record<DraftField, string>>;

/** The JSON body POSTed to /api/orders */
export interface NewOrderRequest {
  clientOrderId: string;
  pizzaId: string;
  customer: string;
  size: Size;
  crust: Crust;
  quantity: number;
  fulfilment: Fulfilment;
  postcode?: string;
  tipPercent: TipPercent;
}

export type ValidationResult =
  | { ok: true; request: Omit<NewOrderRequest, 'clientOrderId'>; quote: PriceQuote }
  | { ok: false; errors: DraftErrors };

export const MAX_PER_ORDER = 20;

/** Outward codes we deliver to. "W1" also covers W1D, W1F...; "E1" does NOT cover E10 or E14. */
export const DELIVERY_AREAS = ['E1', 'E2', 'E8', 'EC1', 'EC2', 'N1', 'SE1', 'W1', 'WC1', 'WC2'];

/**
 * Normalise a UK postcode: uppercase, single space before the last 3 characters.
 * Returns null if it isn't a valid format:
 *   outward = 1-2 letters, 1 digit, optional letter-or-digit; inward = 1 digit + 2 letters
 *   e.g. "e16an" -> "E1 6AN", " sw1a 1aa " -> "SW1A 1AA", "W1D3QF" -> "W1D 3QF"
 * Any amount of whitespace is allowed anywhere in the input.
 */
export function normalisePostcode(raw: string): string | null {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

/** True if a NORMALISED postcode's outward code is in DELIVERY_AREAS (see the comment there). */
export function inDeliveryArea(postcode: string): boolean {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

const NAME_RE = /^\p{L}[\p{L} '.-]*$/u;

/**
 * Validate the order form. Report only the FIRST failing rule per field.
 *
 * customer (trimmed)
 *   "Name is required" | "Name must be 2–40 characters" (en dash) | "Use letters, spaces and ' - . only"
 *   (must start with a letter; accented letters are fine: "Lucía", "Zoë O'Neil")
 *
 * quantity (trimmed)
 *   "Quantity is required" | "Enter a whole number" (digits only) | "Add at least 1 pizza" |
 *   "Max 20 pizzas per order" | "Sold out" (portions is 0) | "Only {portions} left" (more than in stock)
 *
 * postcode (DELIVERY only, ignored for COLLECTION)
 *   "Postcode is required" | "Enter a valid UK postcode" | "Sorry, we don't deliver to {OUTWARD} yet"
 *
 * On success: request has the trimmed name, a number quantity, the NORMALISED postcode
 * (no postcode key at all for COLLECTION), plus the price quote from priceOrder.
 */
export function validateDraft(draft: OrderDraft, pizza: Pizza, portions: number): ValidationResult {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}
