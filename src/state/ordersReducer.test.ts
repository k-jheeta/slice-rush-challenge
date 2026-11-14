import { describe, expect, test } from 'vitest';
import { countByStatus, initialOrdersState, ordersReducer, selectOrders, type OrdersState } from './ordersReducer';
import { ORDERS, makeOrder } from '../__test__/fixtures';

function loaded(orders = ORDERS): OrdersState {
  return ordersReducer(initialOrdersState, { type: 'loaded', orders });
}

describe('loaded', () => {
  test('indexes orders and sorts newest first', () => {
    const state = loaded([makeOrder({ id: 'old', createdAt: 1 }), makeOrder({ id: 'new', createdAt: 2 })]);
    expect(state.ids).toEqual(['new', 'old']);
    expect(state.byId.old.createdAt).toBe(1);
  });

  test('ties on createdAt are broken by id descending', () => {
    const state = loaded([makeOrder({ id: 'a', createdAt: 1 }), makeOrder({ id: 'b', createdAt: 1 })]);
    expect(state.ids).toEqual(['b', 'a']);
  });

  test('keeps optimistic pending orders the server does not know about', () => {
    const pending = makeOrder({ id: 'tmp', status: 'PENDING', createdAt: makeOrder().createdAt + 1 });
    let state = ordersReducer(initialOrdersState, { type: 'submitted', order: pending });
    state = ordersReducer(state, { type: 'loaded', orders: [makeOrder({ id: 'x' })] });
    expect(state.ids).toEqual(['tmp', 'x']);
  });
});

describe('optimistic submit', () => {
  const pending = makeOrder({ id: 'c1', status: 'PENDING', createdAt: makeOrder().createdAt + 1 });

  test('submitted adds the order at the top', () => {
    const state = ordersReducer(loaded(), { type: 'submitted', order: pending });
    expect(state.ids[0]).toBe('c1');
  });

  test('submitFailed removes the pending order', () => {
    const base = loaded();
    const s1 = ordersReducer(base, { type: 'submitted', order: pending });
    const s2 = ordersReducer(s1, { type: 'submitFailed', id: 'c1' });
    expect(s2.byId.c1).toBeUndefined();
    expect(s2.ids).toEqual(base.ids);
  });

  test('submitFailed does not remove an order the server already confirmed', () => {
    const s1 = ordersReducer(loaded(), { type: 'submitted', order: pending });
    const s2 = ordersReducer(s1, {
      type: 'upserted',
      order: { ...pending, status: 'QUEUED', updatedAt: pending.updatedAt },
    });
    expect(ordersReducer(s2, { type: 'submitFailed', id: 'c1' })).toBe(s2);
  });

  test('upserted replaces a pending order even with the same updatedAt', () => {
    const s1 = ordersReducer(loaded(), { type: 'submitted', order: pending });
    const s2 = ordersReducer(s1, { type: 'upserted', order: { ...pending, status: 'QUEUED' } });
    expect(s2.byId.c1.status).toBe('QUEUED');
  });
});

describe('upserted', () => {
  test('applies newer versions', () => {
    const state = ordersReducer(loaded(), {
      type: 'upserted',
      order: { ...ORDERS[0], quantity: 9, updatedAt: ORDERS[0].updatedAt + 1 },
    });
    expect(state.byId[ORDERS[0].id].quantity).toBe(9);
  });

  test('ignores stale versions and returns the same state', () => {
    const base = loaded();
    const stale = { ...ORDERS[0], status: 'CANCELLED' as const, updatedAt: ORDERS[0].updatedAt - 1 };
    expect(ordersReducer(base, { type: 'upserted', order: stale })).toBe(base);
  });

  test('keeps references of untouched orders', () => {
    const base = loaded();
    const next = ordersReducer(base, { type: 'upserted', order: { ...ORDERS[0], updatedAt: ORDERS[0].updatedAt + 1 } });
    expect(next.byId[ORDERS[1].id]).toBe(base.byId[ORDERS[1].id]);
  });

  test('inserts unknown orders in sorted position', () => {
    const next = ordersReducer(loaded(), { type: 'upserted', order: makeOrder({ id: 'zz', createdAt: 0 }) });
    expect(next.ids.at(-1)).toBe('zz');
  });

  test('does not mutate the previous state', () => {
    const base = loaded();
    const snapshot = structuredClone(base);
    ordersReducer(base, { type: 'upserted', order: makeOrder({ id: 'new', createdAt: 1 }) });
    expect(base).toEqual(snapshot);
  });
});

describe('cancel flags', () => {
  test('cancelRequested / cancelSettled toggle the flag', () => {
    const s1 = ordersReducer(loaded(), { type: 'cancelRequested', id: ORDERS[0].id });
    expect(s1.cancelling[ORDERS[0].id]).toBe(true);
    const s2 = ordersReducer(s1, { type: 'cancelSettled', id: ORDERS[0].id });
    expect(s2.cancelling).toEqual({});
  });

  test('no-ops return the same state', () => {
    const base = loaded();
    expect(ordersReducer(base, { type: 'cancelRequested', id: 'missing' })).toBe(base);
    expect(ordersReducer(base, { type: 'cancelSettled', id: ORDERS[0].id })).toBe(base);
    const s1 = ordersReducer(base, { type: 'cancelRequested', id: ORDERS[0].id });
    expect(ordersReducer(s1, { type: 'cancelRequested', id: ORDERS[0].id })).toBe(s1);
  });
});

describe('selectors', () => {
  test('selectOrders returns orders in id order', () => {
    expect(selectOrders(loaded()).map((o) => o.id)).toEqual([
      'ord-8',
      'ord-7',
      'ord-6',
      'ord-5',
      'ord-4',
      'ord-3',
      'ord-2',
      'ord-1',
    ]);
  });
  test('countByStatus', () => {
    expect(countByStatus(ORDERS)).toEqual({
      PENDING: 0,
      QUEUED: 1,
      IN_OVEN: 1,
      ON_THE_WAY: 2,
      DONE: 2,
      CANCELLED: 1,
      REJECTED: 1,
    });
  });
});
