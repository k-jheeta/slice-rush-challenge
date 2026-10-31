import { useCallback, useEffect, useState } from 'react';

/**
 * useState that persists to localStorage as JSON.
 * - Reads once on mount (lazy initialiser), falling back to `initial` if the key is missing, unparsable,
 *   or localStorage throws (private mode, quota, disabled storage).
 * - The setter is stable across renders and supports the functional form like useState.
 * - Writes are wrapped in try/catch: storage failures must never crash the UI.
 * - Changes made in another tab (the `storage` event) are picked up.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

