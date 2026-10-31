// Part 3: example test showing the setup. Replace/extend it with tests for the behaviour you build.
// See docs/PART-3-REACT.md for the behaviours we expect you to cover.
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { STOCK, pizza } from '../__test__/fixtures';
import { OrderForm } from './OrderForm';

test('shows the pizza and its stock', () => {
  render(
    <OrderForm
      pizza={pizza('margherita')}
      level={STOCK.margherita}
      fields={{ customer: '', size: 'M', crust: 'CLASSIC', quantity: '1', fulfilment: 'DELIVERY', postcode: '', tipPercent: 10 }}
      quote={{ unit: 950, subtotal: 950, discount: 0, food: 950, deliveryFee: 299, tip: 95, total: 1344 }}
      sizePrices={{ S: 760, M: 950, L: 1240 }}
    />,
  );
  expect(screen.getByRole('region', { name: 'New order' })).toHaveTextContent('Margherita');
  expect(screen.getByText('24 left')).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: /Medium/ })).toBeChecked();
});
