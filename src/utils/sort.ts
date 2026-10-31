import type { SortSpec } from '../types';

export type SortValue = string | number | null | undefined;
export type Accessors<T, K extends string> = Record<K, (row: T) => SortValue>;

/**
 * Return a new array sorted by `spec`.
 * - Numbers compare numerically, strings with localeCompare (case-insensitive: 'a' == 'A').
 * - null/undefined values ALWAYS go last, whatever the direction.
 * - The sort is stable: rows with equal values keep their original relative order (in both directions).
 * - Never mutates the input. When spec is null, returns the input array as-is.
 */
export function sortRows<T, K extends string>(rows: readonly T[], spec: SortSpec<K> | null, accessors: Accessors<T, K>): T[] {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

/** Header click behaviour: new column -> asc, same column asc -> desc, desc -> off (null) */
export function nextSort<K extends string>(current: SortSpec<K> | null, key: K): SortSpec<K> | null {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}
