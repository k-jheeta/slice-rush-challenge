import { describe, expect, test } from 'vitest';
import { nextSort, sortRows } from './sort';

interface Row {
  id: number;
  name: string;
  qty?: number;
}
const rows: Row[] = [
  { id: 1, name: 'banana', qty: 5 },
  { id: 2, name: 'Apple', qty: 10 },
  { id: 3, name: 'cherry' },
  { id: 4, name: 'apple', qty: 5 },
];
const accessors = { name: (r: Row) => r.name, qty: (r: Row) => r.qty };
const ids = (r: Row[]) => r.map((x) => x.id);

describe('sortRows', () => {
  test('null spec returns the input untouched', () => expect(sortRows(rows, null, accessors)).toBe(rows));

  test('sorts numbers ascending and descending', () => {
    expect(ids(sortRows(rows, { key: 'qty', direction: 'asc' }, accessors))).toEqual([1, 4, 2, 3]);
    expect(ids(sortRows(rows, { key: 'qty', direction: 'desc' }, accessors))).toEqual([2, 1, 4, 3]);
  });

  test('missing values go last in both directions', () => {
    expect(ids(sortRows(rows, { key: 'qty', direction: 'desc' }, accessors)).at(-1)).toBe(3);
  });

  test('strings compare case-insensitively and the sort is stable', () => {
    expect(ids(sortRows(rows, { key: 'name', direction: 'asc' }, accessors))).toEqual([2, 4, 1, 3]);
    expect(ids(sortRows(rows, { key: 'name', direction: 'desc' }, accessors))).toEqual([3, 1, 2, 4]);
  });

  test('does not mutate the input', () => {
    const before = ids(rows);
    sortRows(rows, { key: 'name', direction: 'asc' }, accessors);
    expect(ids(rows)).toEqual(before);
  });
});

describe('nextSort', () => {
  test('cycles asc -> desc -> off', () => {
    const a = nextSort(null, 'qty');
    expect(a).toEqual({ key: 'qty', direction: 'asc' });
    const b = nextSort(a, 'qty');
    expect(b).toEqual({ key: 'qty', direction: 'desc' });
    expect(nextSort(b, 'qty')).toBeNull();
  });
  test('a different column starts at asc', () => {
    expect(nextSort({ key: 'qty', direction: 'desc' }, 'name')).toEqual({ key: 'name', direction: 'asc' });
  });
});
