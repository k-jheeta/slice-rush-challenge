import type { Crust, Fulfilment, OrderDraft, Pizza, Size, StockLevel, TipPercent } from '../types';
import { formatMoney } from '../utils/format';
import type { PriceQuote } from '../utils/pricing';
import { stockState } from '../utils/stock';
import type { DraftErrors } from '../utils/validation';
import { ConfirmDialog } from './ConfirmDialog';
import { PizzaIcon } from './icons';
import { PizzaTags } from './PizzaTags';
import { SegmentedControl } from './SegmentedControl';
import { Stepper } from './Stepper';
import { TextField } from './TextField';
import '../styles/buttons.css';
import './Panel.css';
import './OrderForm.css';

const SIZE_LABEL: Record<Size, string> = { S: 'Small', M: 'Medium', L: 'Large' };
const CRUST_LABEL: Record<Crust, string> = { CLASSIC: 'Classic', THIN: 'Thin', STUFFED: 'Stuffed' };
const TIPS: Array<{ value: TipPercent; label: string }> = [
  { value: 0, label: 'No tip' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
];
const FULFILMENT: Array<{ value: Fulfilment; label: string }> = [
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'COLLECTION', label: 'Collection' },
];

export type FormFields = Omit<OrderDraft, 'pizzaId'>;

export interface OrderFormProps {
  pizza: Pizza;
  level: StockLevel | undefined;
  /**
   * Part 1: everything is passed in so you can style each state.
   * Part 3: the form owns its state (useReducer fits well), validates with validateDraft and
   * prices with priceOrder / unitPrice - see docs/PART-3-REACT.md.
   */
  fields: FormFields;
  quote: PriceQuote;
  /** Price of one pizza at each size for the current crust (pence) */
  sizePrices: Record<Size, number>;
  errors?: DraftErrors;
  submitting?: boolean;
  confirming?: boolean;
}

export function OrderForm({
  pizza,
  level,
  fields,
  quote,
  sizePrices,
  errors = {},
  submitting = false,
  confirming = false,
}: OrderFormProps) {
  const delivery = fields.fulfilment === 'DELIVERY';
  const soldOut = stockState(level) === 'out';
  const qty = Number(fields.quantity) || 0;

  return (
    <section className={`panel order-form cat-${pizza.category.toLowerCase()}`} aria-label="New order">
      <header className="panel-header">
        <h2 className="panel-title">New order</h2>
      </header>

      <div className="order-pizza">
        <PizzaIcon size={56} />
        <div className="order-pizza-info">
          <p className="order-pizza-name">
            {pizza.name} <PizzaTags pizza={pizza} />
          </p>
          <p className="order-pizza-toppings">{pizza.toppings.join(', ')}</p>
        </div>
        <span className={`order-stock${soldOut ? ' is-out' : ''}`}>
          {soldOut ? 'Sold out' : `${level?.portions} left`}
        </span>
      </div>

      <form className="order-fields" noValidate>
        <TextField
          label="Customer"
          kind="text"
          placeholder="Who's it for?"
          autoComplete="off"
          defaultValue={fields.customer}
          error={errors.customer}
        />

        <SegmentedControl<Size>
          label="Size"
          options={(['S', 'M', 'L'] as const).map((s) => ({
            value: s,
            label: SIZE_LABEL[s],
            hint: formatMoney(sizePrices[s]),
          }))}
          value={fields.size}
        />

        <SegmentedControl<Crust>
          label="Crust"
          size="sm"
          options={(['CLASSIC', 'THIN', 'STUFFED'] as const).map((c) => ({
            value: c,
            label: c === 'STUFFED' ? 'Stuffed +£2' : CRUST_LABEL[c],
          }))}
          value={fields.crust}
        />

        <SegmentedControl<Fulfilment> label="Fulfilment" size="sm" options={FULFILMENT} value={fields.fulfilment} />

        <div className="order-row">
          <Stepper label="Quantity" defaultValue={fields.quantity} min={1} max={20} error={errors.quantity} />
          <TextField
            label="Postcode"
            kind="text"
            autoComplete="postal-code"
            placeholder={delivery ? 'E1 6AN' : 'Collecting'}
            disabled={!delivery}
            defaultValue={delivery ? fields.postcode : ''}
            error={delivery ? errors.postcode : undefined}
          />
        </div>

        <SegmentedControl<TipPercent> label="Tip for the team" size="sm" options={TIPS} value={fields.tipPercent} />

        <div className="receipt" aria-label="Order summary" role="group">
          <div className="receipt-row">
            <span>
              {qty}× {pizza.name}
              <span className="receipt-detail">
                {' '}
                · {SIZE_LABEL[fields.size]}
                {fields.crust !== 'CLASSIC' && `, ${CRUST_LABEL[fields.crust].toLowerCase()}`}
              </span>
            </span>
            <span className="num">{formatMoney(quote.subtotal)}</span>
          </div>
          {quote.discount > 0 && (
            <div className="receipt-row is-discount">
              <span>3 for 2</span>
              <span className="num">-{formatMoney(quote.discount)}</span>
            </div>
          )}
          <div className="receipt-row">
            <span>{delivery ? 'Delivery' : 'Collection'}</span>
            <span className="num">{quote.deliveryFee ? formatMoney(quote.deliveryFee) : 'Free'}</span>
          </div>
          <div className="receipt-row">
            <span>Tip ({fields.tipPercent}%)</span>
            <span className="num">{formatMoney(quote.tip)}</span>
          </div>
          <div className="receipt-total">
            <span>Total</span>
            <span className="num">{formatMoney(quote.total)}</span>
          </div>
          {quote.deliveryFee > 0 && qty > 0 && (
            <p className="receipt-hint">Add {formatMoney(2500 - quote.food)} more for free delivery</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Sending to kitchen…
            </>
          ) : (
            <>
              Send to kitchen <span className="btn-total num">{formatMoney(quote.total)}</span>
            </>
          )}
        </button>
      </form>

      {confirming && (
        <ConfirmDialog title="That's a big order!" confirmLabel="Fire up the ovens">
          <p>Orders over £150 or 10+ pizzas need a quick double-check.</p>
          <dl className="summary-list">
            <div>
              <dt>Customer</dt>
              <dd>{fields.customer}</dd>
            </div>
            <div>
              <dt>Pizza</dt>
              <dd>
                {qty}× {pizza.name} ({SIZE_LABEL[fields.size]})
              </dd>
            </div>
            <div>
              <dt>{delivery ? 'Delivering to' : 'Collection'}</dt>
              <dd className="num">{delivery ? fields.postcode : 'In store'}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd className="num emphasis">{formatMoney(quote.total)}</dd>
            </div>
          </dl>
        </ConfirmDialog>
      )}
    </section>
  );
}
