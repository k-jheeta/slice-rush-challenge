import { describe, expect, test } from 'vitest';
import { formatEta, formatMoney, formatTicket, formatTime } from './format';
import { NOW } from '../__test__/fixtures';

describe('formatMoney', () => {
  test.each([
    [0, '£0.00'],
    [5, '£0.05'],
    [1250, '£12.50'],
    [123456, '£1,234.56'],
    [-120, '-£1.20'],
  ])('%s -> %s', (pence, text) => expect(formatMoney(pence)).toBe(text));
});

describe('formatTicket', () => {
  test('pads to four digits', () => {
    expect(formatTicket(7)).toBe('#0007');
    expect(formatTicket(104)).toBe('#0104');
    expect(formatTicket(12345)).toBe('#12345');
  });
});

describe('formatEta', () => {
  test.each([
    [245_000, '4:05'],
    [720_000, '12:00'],
    [500, '0:01'],
    [0, 'Due'],
    [-14_000, 'Due'],
    [-80_000, '+1:20'],
  ])('eta in %sms -> %s', (offset, text) => expect(formatEta(NOW + offset, NOW)).toBe(text));
});

describe('formatTime', () => {
  test('24h clock', () => expect(formatTime(NOW)).toBe('18:30'));
});
