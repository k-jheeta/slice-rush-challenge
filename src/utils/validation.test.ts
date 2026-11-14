import { describe, expect, test } from 'vitest';
import type { OrderDraft } from '../types';
import { inDeliveryArea, normalisePostcode, validateDraft } from './validation';
import { pizza } from '../__test__/fixtures';

const MARG = pizza('margherita');

function draft(overrides: Partial<OrderDraft> = {}): OrderDraft {
  return {
    pizzaId: 'margherita',
    customer: 'Alex',
    size: 'M',
    crust: 'CLASSIC',
    quantity: '2',
    fulfilment: 'DELIVERY',
    postcode: 'E1 6AN',
    tipPercent: 10,
    ...overrides,
  };
}

function errorsOf(d: OrderDraft, portions = 24) {
  const r = validateDraft(d, MARG, portions);
  return r.ok ? {} : r.errors;
}

describe('normalisePostcode', () => {
  test.each([
    ['e16an', 'E1 6AN'],
    [' sw1a 1aa ', 'SW1A 1AA'],
    ['W1D3QF', 'W1D 3QF'],
    ['ec1a  1bb', 'EC1A 1BB'],
    ['n 1 9 g u', 'N1 9GU'],
  ])('%j -> %s', (raw, expected) => expect(normalisePostcode(raw)).toBe(expected));

  test.each(['', 'hello', '123 456', 'E1', 'E1 6A', 'EEE1 6AN', 'E1 66N'])('%j is invalid', (raw) => {
    expect(normalisePostcode(raw)).toBeNull();
  });
});

describe('inDeliveryArea', () => {
  test.each([
    ['E1 6AN', true],
    ['E10 5NP', false],
    ['E14 5AB', false],
    ['W1D 3QF', true],
    ['WC2N 5DU', true],
    ['SE1 7PB', true],
    ['SE10 9NN', false],
    ['SW1A 1AA', false],
    ['EC1A 1BB', true],
  ])('%s -> %s', (pc, expected) => expect(inDeliveryArea(pc)).toBe(expected));
});

describe('customer', () => {
  test.each([
    ['', 'Name is required'],
    ['   ', 'Name is required'],
    ['A', 'Name must be 2–40 characters'],
    ['x'.repeat(41), 'Name must be 2–40 characters'],
    ['R2-D2', "Use letters, spaces and ' - . only"],
    ['-Bob', "Use letters, spaces and ' - . only"],
  ])('%j -> %s', (customer, message) => expect(errorsOf(draft({ customer })).customer).toBe(message));

  test('accepts accents, apostrophes and hyphens', () => {
    expect(errorsOf(draft({ customer: "Zoë O'Neil-Lucía" })).customer).toBeUndefined();
  });
});

describe('quantity', () => {
  test.each([
    ['', 'Quantity is required'],
    ['two', 'Enter a whole number'],
    ['1.5', 'Enter a whole number'],
    ['-1', 'Enter a whole number'],
    ['0', 'Add at least 1 pizza'],
    ['21', 'Max 20 pizzas per order'],
  ])('%j -> %s', (quantity, message) => expect(errorsOf(draft({ quantity })).quantity).toBe(message));

  test('checks live stock', () => {
    expect(errorsOf(draft({ quantity: '3' }), 2).quantity).toBe('Only 2 left');
    expect(errorsOf(draft({ quantity: '1' }), 0).quantity).toBe('Sold out');
    expect(errorsOf(draft({ quantity: '2' }), 2).quantity).toBeUndefined();
  });

  test('the per-order limit is checked before stock', () => {
    expect(errorsOf(draft({ quantity: '25' }), 3).quantity).toBe('Max 20 pizzas per order');
  });
});

describe('postcode', () => {
  test.each([
    ['', 'Postcode is required'],
    ['not a postcode', 'Enter a valid UK postcode'],
    ['e10 5np', "Sorry, we don't deliver to E10 yet"],
  ])('%j -> %s', (postcode, message) => expect(errorsOf(draft({ postcode })).postcode).toBe(message));

  test('is ignored for collection', () => {
    expect(errorsOf(draft({ fulfilment: 'COLLECTION', postcode: 'garbage' }))).toEqual({});
  });
});

describe('successful validation', () => {
  test('returns a normalised request and the price', () => {
    const r = validateDraft(draft({ customer: '  Alex ', quantity: ' 3 ', postcode: 'w1d3qf' }), MARG, 24);
    expect(r).toEqual({
      ok: true,
      request: {
        pizzaId: 'margherita',
        customer: 'Alex',
        size: 'M',
        crust: 'CLASSIC',
        quantity: 3,
        fulfilment: 'DELIVERY',
        postcode: 'W1D 3QF',
        tipPercent: 10,
      },
      quote: { unit: 950, subtotal: 2850, discount: 950, food: 1900, deliveryFee: 299, tip: 190, total: 2389 },
    });
  });

  test('collection requests have no postcode key', () => {
    const r = validateDraft(draft({ fulfilment: 'COLLECTION' }), MARG, 24);
    expect(r.ok && 'postcode' in r.request).toBe(false);
  });

  test('reports every field at once', () => {
    expect(Object.keys(errorsOf(draft({ customer: '', quantity: '', postcode: '' })))).toEqual([
      'customer',
      'quantity',
      'postcode',
    ]);
  });
});
