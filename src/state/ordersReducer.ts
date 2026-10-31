import type { Order } from '../types';

export interface OrdersState {
  byId: Record<string, Order>;
  /** Order ids sorted newest first (createdAt desc; ties broken by id desc) */
  ids: string[];
  /** Ids of orders with a cancel request in flight */
  cancelling: Record<string, true>;
}

export type OrdersAction =
  /** Initial REST load. Replaces everything, but keeps any optimistic PENDING orders the server doesn't know yet. */
  | { type: 'loaded'; orders: Order[] }
  /** Optimistic insert when the user submits. `order.status` is 'PENDING'. */
  | { type: 'submitted'; order: Order }
  /** POST failed (network/500/422): remove the optimistic order. */
  | { type: 'submitFailed'; id: string }
  /**
   * Server version of an order (POST response or stream event). Insert or replace, BUT ignore it if we
   * already hold a version with a newer `updatedAt` (stream events and responses can arrive out of order).
   * A PENDING optimistic order is always replaced.
   */
  | { type: 'upserted'; order: Order }
  | { type: 'cancelRequested'; id: string }
  /** Cancel request finished, successfully or not. The status change itself arrives via 'upserted'. */
  | { type: 'cancelSettled'; id: string };

export const initialOrdersState: OrdersState = { byId: {}, ids: [], cancelling: {} };

/**
 * Pure reducer. Rules that the tests check:
 * - Never mutate `state` or its nested objects.
 * - If an action changes nothing (unknown id, stale update, duplicate flag) return the SAME state reference.
 * - Unchanged orders keep their object reference.
 */
export function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

// ---- Selectors -------------------------------------------------------------

export function selectOrders(state: OrdersState): Order[] {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

export function countByStatus(orders: Order[]): Record<Order['status'], number> {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}
