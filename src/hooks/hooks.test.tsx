import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';
import { useLocalStorage } from './useLocalStorage';
import { useQuery } from './useQuery';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 200));
    expect(result.current).toBe('a');
  });

  test('only updates after the value has been stable for the delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), { initialProps: { v: 'a' } });
    rerender({ v: 'ab' });
    act(() => vi.advanceTimersByTime(150));
    rerender({ v: 'abc' });
    act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBe('a'); // timer restarted when 'abc' arrived
    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe('abc');
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear());

  test('falls back to the initial value', () => {
    const { result } = renderHook(() => useLocalStorage('k', 5));
    expect(result.current[0]).toBe(5);
  });

  test('reads an existing JSON value', () => {
    localStorage.setItem('k', JSON.stringify({ a: 1 }));
    const { result } = renderHook(() => useLocalStorage('k', {}));
    expect(result.current[0]).toEqual({ a: 1 });
  });

  test('persists updates, including functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('k', 1));
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem('k')).toBe('2');
  });

  test('ignores corrupt values', () => {
    localStorage.setItem('k', '{not json');
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  test('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const { result } = renderHook(() => useLocalStorage('k', 1));
    expect(() => act(() => result.current[1](2))).not.toThrow();
    expect(result.current[0]).toBe(2);
  });

  test('the setter is stable between renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('k', 1));
    const first = result.current[1];
    act(() => result.current[1](3));
    rerender();
    expect(result.current[1]).toBe(first);
  });

  test('picks up changes from other tabs', () => {
    const { result } = renderHook(() => useLocalStorage('k', 1));
    act(() => {
      localStorage.setItem('k', '42');
      window.dispatchEvent(new StorageEvent('storage', { key: 'k' }));
    });
    expect(result.current[0]).toBe(42);
  });
});

describe('useQuery', () => {
  function deferred<T>() {
    let resolve!: (v: T) => void;
    let reject!: (e: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  test('loading -> success', async () => {
    const d = deferred<number>();
    const { result } = renderHook(() => useQuery('a', () => d.promise));
    expect(result.current.status).toBe('loading');
    await act(async () => d.resolve(7));
    expect(result.current).toMatchObject({ status: 'success', data: 7 });
  });

  test('loading -> error', async () => {
    const { result } = renderHook(() => useQuery('a', () => Promise.reject(new Error('boom'))));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.message).toBe('boom');
  });

  test('aborts the previous request when the key changes and ignores its result', async () => {
    const calls: Array<{ signal: AbortSignal; d: ReturnType<typeof deferred<string>> }> = [];
    const fetcher = (signal: AbortSignal) => {
      const d = deferred<string>();
      calls.push({ signal, d });
      return d.promise;
    };
    const { result, rerender } = renderHook(({ k }) => useQuery(k, fetcher), { initialProps: { k: 'first' } });
    rerender({ k: 'second' });
    expect(calls[0].signal.aborted).toBe(true);
    await act(async () => calls[1].d.resolve('second'));
    await act(async () => calls[0].d.resolve('first')); // late response for the old key
    expect(result.current.data).toBe('second');
  });

  test('aborts on unmount', () => {
    let signal: AbortSignal | undefined;
    const { unmount } = renderHook(() =>
      useQuery('a', (s) => {
        signal = s;
        return new Promise(() => {});
      }),
    );
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  test('reload keeps existing data while refreshing', async () => {
    let n = 0;
    const { result } = renderHook(() => useQuery('a', () => Promise.resolve(++n)));
    await waitFor(() => expect(result.current.data).toBe(1));
    act(() => result.current.reload());
    expect(result.current.data).toBe(1);
    expect(result.current.refreshing).toBe(true);
    await waitFor(() => expect(result.current.data).toBe(2));
    expect(result.current.refreshing).toBe(false);
  });

  test('an inline fetcher does not cause a refetch loop', async () => {
    const fetcher = vi.fn(() => Promise.resolve(1));
    const { rerender } = renderHook(() => useQuery('a', () => fetcher()));
    rerender();
    rerender();
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  });
});
