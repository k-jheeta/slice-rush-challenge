import type { Crust, Fulfilment, Pizza, Size, TipPercent } from '../types';

export const SIZE_MULTIPLIER: Record<Size, number> = { S: 0.8, M: 1, L: 1.3 };
export const STUFFED_CRUST = 200;
export const DELIVERY_FEE = 299;
export const FREE_DELIVERY_FROM = 2500;
/** Ingredients cost this fraction of the food price (used for waste in takings) */
export const INGREDIENT_COST = 0.35;

export interface PriceInput {
  size: Size;
  crust: Crust;
  quantity: number;
  fulfilment: Fulfilment;
  tipPercent: TipPercent;
}

export interface PriceQuote {
  /** Price of one pizza */
  unit: number;
  /** unit x quantity */
  subtotal: number;
  /** "3 for 2": every third pizza is free */
  discount: number;
  /** subtotal - discount */
  food: number;
  deliveryFee: number;
  tip: number;
  total: number;
}

/**
 * Price of one pizza, in pence.
 * basePrice is for a Medium. Multiply by SIZE_MULTIPLIER and round to the NEAREST 10p
 * (e.g. 950 x 0.8 = 760; 1350 x 1.3 = 1755 -> 1760; 1250 x 0.8 = 1000).
 * Then add STUFFED_CRUST for stuffed crust. Thin and classic cost the same.
 */
export function unitPrice(pizza: Pizza, size: Size, crust: Crust): number {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

/**
 * Full price breakdown for an order. All values are integer pence.
 * - discount: floor(quantity / 3) x unit  ("3 for 2", "6 for 4", ...)
 * - deliveryFee: DELIVERY_FEE for delivery orders whose FOOD total is below FREE_DELIVERY_FROM, otherwise 0
 * - tip: tipPercent of the FOOD total (not of the delivery fee), rounded to the nearest penny
 * - total: food + deliveryFee + tip
 * quantity 0 is valid and prices everything at 0 (apart from the delivery fee).
 */
export function priceOrder(pizza: Pizza, input: PriceInput): PriceQuote {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}
