import { describe, expect, test } from 'vitest';
import { computeTakings, sumTakings } from './takings';
import { MENU_BY_ID, ORDERS, makeOrder } from '../__test__/fixtures';

describe('computeTakings', () => {
  test('empty input', () => expect(computeTakings([], MENU_BY_ID)).toEqual([]));

  test('counts DONE orders: food revenue (after 3-for-2) and tips, recomputed from the order', () => {
    const rows = computeTakings([makeOrder({ status: 'DONE', quantity: 3, tipPercent: 20, total: 999999 })], MENU_BY_ID);
    // 3 x 950 = 2850 - 950 = 1900 food; tip 380
    expect(rows).toEqual([{ pizzaId: 'margherita', sold: 3, revenue: 1900, tips: 380, waste: 0, net: 2280 }]);
  });

  test('cancelled after the oven is waste at 35% of food; before the oven is free', () => {
    const rows = computeTakings(
      [
        makeOrder({ id: 'a', status: 'CANCELLED', quantity: 2, ovenAt: 1 }), // food 1900 -> 665
        makeOrder({ id: 'b', status: 'CANCELLED', quantity: 2 }),
      ],
      MENU_BY_ID,
    );
    expect(rows).toEqual([{ pizzaId: 'margherita', sold: 0, revenue: 0, tips: 0, waste: 665, net: -665 }]);
  });

  test('ignores active, pending, rejected and unknown pizzas', () => {
    const statuses = ['PENDING', 'QUEUED', 'IN_OVEN', 'ON_THE_WAY', 'REJECTED'] as const;
    const orders = [...statuses.map((status, i) => makeOrder({ id: String(i), status })), makeOrder({ id: 'x', pizzaId: 'nope', status: 'DONE' })];
    expect(computeTakings(orders, MENU_BY_ID)).toEqual([]);
  });

  test('sorts by net desc then name', () => {
    const rows = computeTakings(
      [
        makeOrder({ id: '1', pizzaId: 'margherita', status: 'DONE' }), // 950
        makeOrder({ id: '2', pizzaId: 'meat-feast', status: 'DONE' }), // 1550
        makeOrder({ id: '3', pizzaId: 'fun-ghi', status: 'DONE', size: 'S' }), // 960
        makeOrder({ id: '4', pizzaId: 'green-machine', status: 'DONE', size: 'S', crust: 'THIN', quantity: 1, tipPercent: 0, total: 0, customer: 'x' }), // 1040
      ],
      MENU_BY_ID,
    );
    expect(rows.map((r) => r.pizzaId)).toEqual(['meat-feast', 'green-machine', 'fun-ghi', 'margherita']);
  });

  test('works on the fixtures', () => {
    const rows = computeTakings(ORDERS, MENU_BY_ID);
    expect(rows.map((r) => r.pizzaId)).toEqual(['meat-feast', 'margherita']);
    expect(sumTakings(rows)).toMatchObject({ pizzaId: 'total', sold: 4 });
  });
});

describe('sumTakings', () => {
  test('adds every column', () => {
    const r = { pizzaId: 'a', sold: 1, revenue: 100, tips: 10, waste: 5, net: 105 };
    expect(sumTakings([r, { ...r, pizzaId: 'b' }])).toEqual({ pizzaId: 'total', sold: 2, revenue: 200, tips: 20, waste: 10, net: 210 });
  });
});
