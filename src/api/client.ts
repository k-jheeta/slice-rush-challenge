// Thin typed wrapper around fetch for the mock API in /server.
import type { Activity, Driver, Order, Pizza, StockLevel } from '../types';
import type { NewOrderRequest } from '../utils/validation';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(status: number, body: unknown) {
    const message =
      typeof body === 'object' && body && 'error' in body ? String((body as { error: unknown }).error) : `HTTP ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
  /** Field errors from a 422 response, e.g. { postcode: 'Enter a valid UK postcode' } */
  get fieldErrors(): Record<string, string> {
    const b = this.body as { errors?: Record<string, string> } | null;
    return b?.errors ?? {};
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(path, {
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

export const api = {
  getMenu: (signal?: AbortSignal) => request<Pizza[]>('/api/menu', { signal }),
  getStock: (signal?: AbortSignal) => request<StockLevel[]>('/api/stock', { signal }),
  getFavourites: (signal?: AbortSignal) => request<{ pizzaIds: string[] }>('/api/favourites', { signal }),
  putFavourites: (pizzaIds: string[]) => request<{ pizzaIds: string[] }>('/api/favourites', { method: 'PUT', json: { pizzaIds } }),
  getOrders: (signal?: AbortSignal) => request<Order[]>('/api/orders', { signal }),
  getDrivers: (signal?: AbortSignal) => request<Driver[]>('/api/drivers', { signal }),
  getActivity: (signal?: AbortSignal) => request<Activity[]>('/api/activity', { signal }),
  postOrder: (order: NewOrderRequest) => request<Order>('/api/orders', { method: 'POST', json: order }),
  cancelOrder: (id: string) => request<Order>(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export const STREAM_URL = '/api/stream';
