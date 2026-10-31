import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '../api/client';

export type QueryState<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: T | undefined; error: Error };

export type QueryResult<T> = QueryState<T> & {
  /** True while a reload is in flight and we already have data (stale-while-revalidate) */
  refreshing: boolean;
  reload: () => void;
};

/**
 * Minimal data-fetching hook.
 * - Calls `fetcher(signal)` on mount and whenever `key` changes.
 * - Aborts the in-flight request when the key changes or the component unmounts.
 * - Ignores results of requests that are no longer current (no race conditions).
 * - `reload()` refetches without clearing existing data; `refreshing` is true meanwhile.
 * - Abort errors are never reported as errors.
 */
export function useQuery<T>(key: string, fetcher: (signal: AbortSignal) => Promise<T>): QueryResult<T> {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}
