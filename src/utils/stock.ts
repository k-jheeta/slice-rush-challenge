import type { StockLevel, StockMap } from '../types';

/**
 * Merge streamed stock levels into the current map IMMUTABLY.
 * - Apply a level only if it is newer (ts greater) than the one we have, or we have none.
 * - Untouched entries keep the same object reference.
 * - If nothing changed at all, return `prev` itself (same reference).
 * - If a batch contains several levels for one pizza, the newest wins.
 */
export function applyStock(prev: StockMap, levels: readonly StockLevel[]): StockMap {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

/** Which way stock moved: -1 used up, 1 restocked, 0 unchanged/unknown */
export function stockDirection(prev: StockLevel | undefined, next: StockLevel | undefined): -1 | 0 | 1 {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

export type StockState = 'out' | 'low' | 'ok';

/** Provided (used by the Part 1 layout). 'out' at 0, 'low' at 5 or fewer portions OR at or below 20% of capacity, otherwise 'ok' */
export function stockState(level: StockLevel | undefined): StockState {
  if (!level || level.portions <= 0) return 'out';
  if (level.portions <= 5 || level.portions <= level.capacity * 0.2) return 'low';
  return 'ok';
}
