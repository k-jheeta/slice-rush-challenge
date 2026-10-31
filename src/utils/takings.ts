import type { Order, Pizza, TakingsRow } from '../types';
import { INGREDIENT_COST, priceOrder } from './pricing';

/**
 * Summarise the day's orders per pizza. Recompute prices with priceOrder (don't trust order.total).
 * - DONE orders: sold += quantity, revenue += quote.food, tips += quote.tip
 * - CANCELLED orders that had gone into the oven (ovenAt set): waste += round(quote.food x INGREDIENT_COST)
 * - Everything else (PENDING, active, REJECTED, cancelled before the oven) is ignored
 * - net = revenue + tips - waste
 * - Orders for pizzas not in `menu` are ignored. Pizzas with no counted orders don't get a row.
 * - Sort by net descending, then by pizza name A-Z.
 */
export function computeTakings(orders: readonly Order[], menu: Map<string, Pizza>): TakingsRow[] {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

/** Column totals for the takings footer (pizzaId is 'total') */
export function sumTakings(rows: readonly TakingsRow[]): TakingsRow {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}
