import { describe, expect, test } from 'vitest';
import { applyStock, stockDirection, stockState } from './stock';
import { STOCK } from '../__test__/fixtures';

const lvl = (pizzaId: string, portions: number, ts: number, capacity = 20) => ({ pizzaId, portions, capacity, ts });

describe('applyStock', () => {
  test('no levels -> same reference', () => expect(applyStock(STOCK, [])).toBe(STOCK));

  test('stale levels -> same reference', () => {
    expect(applyStock(STOCK, [{ ...STOCK.margherita, portions: 1, ts: STOCK.margherita.ts - 1 }])).toBe(STOCK);
  });

  test('applies newer levels immutably and keeps other references', () => {
    const next = applyStock(STOCK, [{ ...STOCK.margherita, portions: 23, ts: STOCK.margherita.ts + 1 }]);
    expect(next).not.toBe(STOCK);
    expect(next.margherita.portions).toBe(23);
    expect(STOCK.margherita.portions).toBe(24);
    expect(next.inferno).toBe(STOCK.inferno);
  });

  test('newest in a batch wins whatever the order', () => {
    expect(applyStock({}, [lvl('x', 5, 20), lvl('x', 9, 10)]).x.portions).toBe(5);
  });
});

describe('stockDirection', () => {
  test('detects use and restock', () => {
    expect(stockDirection(lvl('x', 5, 1), lvl('x', 4, 2))).toBe(-1);
    expect(stockDirection(lvl('x', 4, 1), lvl('x', 14, 2))).toBe(1);
    expect(stockDirection(lvl('x', 4, 1), lvl('x', 4, 2))).toBe(0);
    expect(stockDirection(undefined, lvl('x', 4, 2))).toBe(0);
  });
});

describe('stockState', () => {
  test.each([
    [0, 20, 'out'],
    [5, 40, 'low'],
    [6, 25, 'ok'],
    [8, 40, 'low'], // 20% of 40
    [9, 40, 'ok'],
    [6, 20, 'ok'],
  ] as const)('%i of %i -> %s', (portions, capacity, expected) => {
    expect(stockState(lvl('x', portions, 1, capacity))).toBe(expected);
  });
  test('missing level counts as out', () => expect(stockState(undefined)).toBe('out'));
});
