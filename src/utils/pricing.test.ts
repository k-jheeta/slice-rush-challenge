import { describe, expect, test } from 'vitest';
import { priceOrder, unitPrice } from './pricing';
import { pizza } from '../__test__/fixtures';

const MARG = pizza('margherita'); // 950
const HONEY = pizza('hot-honey'); // 1350

describe('unitPrice', () => {
  test.each([
    ['S', 'CLASSIC', 760],
    ['M', 'CLASSIC', 950],
    ['L', 'CLASSIC', 1240], // 1235 -> nearest 10p
    ['M', 'THIN', 950],
    ['M', 'STUFFED', 1150],
    ['L', 'STUFFED', 1440],
  ] as const)('margherita %s %s = %i', (size, crust, expected) => {
    expect(unitPrice(MARG, size, crust)).toBe(expected);
  });

  test('rounds to the nearest 10p, not down', () => {
    expect(unitPrice(HONEY, 'L', 'CLASSIC')).toBe(1760); // 1755
    expect(unitPrice(HONEY, 'S', 'CLASSIC')).toBe(1080);
  });
});

describe('priceOrder', () => {
  const base = { size: 'M', crust: 'CLASSIC', quantity: 1, fulfilment: 'DELIVERY', tipPercent: 0 } as const;

  test('a single delivered margherita pays the delivery fee', () => {
    expect(priceOrder(MARG, base)).toEqual({
      unit: 950,
      subtotal: 950,
      discount: 0,
      food: 950,
      deliveryFee: 299,
      tip: 0,
      total: 1249,
    });
  });

  test('collection never has a delivery fee', () => {
    expect(priceOrder(MARG, { ...base, fulfilment: 'COLLECTION' }).deliveryFee).toBe(0);
  });

  test('3 for 2: every third pizza is free', () => {
    expect(priceOrder(MARG, { ...base, quantity: 3 }).discount).toBe(950);
    expect(priceOrder(MARG, { ...base, quantity: 5 }).discount).toBe(950);
    expect(priceOrder(MARG, { ...base, quantity: 6 }).discount).toBe(1900);
  });

  test('free delivery is based on food after the discount', () => {
    // 3 x 950 = 2850, minus 950 = 1900 < 2500 -> still pays delivery
    expect(priceOrder(MARG, { ...base, quantity: 3 }).deliveryFee).toBe(299);
    // 2 x 1350 = 2700 -> free
    expect(priceOrder(HONEY, { ...base, quantity: 2 }).deliveryFee).toBe(0);
    // exactly 2500 -> free
    expect(priceOrder({ ...MARG, basePrice: 1250 }, { ...base, quantity: 2 }).deliveryFee).toBe(0);
  });

  test('tip is a percentage of food only, rounded to the penny', () => {
    const q = priceOrder(HONEY, { ...base, size: 'L', quantity: 1, tipPercent: 15 }); // food 1760
    expect(q.tip).toBe(264);
    expect(q.total).toBe(1760 + 299 + 264);
  });

  test('quantity 0 prices to just the delivery fee', () => {
    expect(priceOrder(MARG, { ...base, quantity: 0 })).toMatchObject({ food: 0, tip: 0, total: 299 });
  });
});
