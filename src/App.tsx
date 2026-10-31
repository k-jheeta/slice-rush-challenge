// Part 1: a static layout rendered from fixtures. No server needed.
//   http://localhost:5173/          the kitchen
//   http://localhost:5173/?gallery  every other state from the specs, so you can style them
//
// Part 3 replaces this with live data from the API (see docs/PART-3-REACT.md).
import type { ReactNode } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { KitchenBoard } from './components/KitchenBoard';
import { MenuPanel } from './components/MenuPanel';
import { OrderForm } from './components/OrderForm';
import { StatusBadge } from './components/StatusBadge';
import { Toasts, type Toast } from './components/Toasts';
import { TopBar } from './components/TopBar';
import { ACTIVITY, DRIVERS, FAVOURITE_IDS, MENU, MENU_BY_ID, NOW, ORDERS, STOCK, TAKINGS, pizza } from './__test__/fixtures';
import type { MenuSection } from './utils/menu';
import './styles/buttons.css';
import './App.css';

const MARG = pizza('margherita');
const CLASSIC_PRICES = { S: 760, M: 950, L: 1240 };
const SECTIONS: MenuSection[] = [
  { id: 'favourites', title: 'Favourites', items: FAVOURITE_IDS.map(pizza) },
  { id: 'menu', title: 'Menu', items: MENU.filter((p) => !FAVOURITE_IDS.includes(p.id)) },
];

export function App() {
  if (new URLSearchParams(location.search).has('gallery')) return <Gallery />;
  return (
    <div className="app">
      <TopBar connection="live" takings={18245} branch="Soho" />
      <main className="workspace">
        <MenuPanel menuCount={MENU.length} sections={SECTIONS} stock={STOCK} favouriteIds={FAVOURITE_IDS} selectedId="margherita" flashes={{ 'basil-instinct': 'down', inferno: 'up' }} />
        <KitchenBoard tab="tickets" orders={ORDERS} drivers={DRIVERS} activity={ACTIVITY} menuById={MENU_BY_ID} takings={TAKINGS} now={NOW} />
        <OrderForm
          pizza={MARG}
          level={STOCK.margherita}
          fields={{ customer: 'Kam', size: 'M', crust: 'CLASSIC', quantity: '3', fulfilment: 'DELIVERY', postcode: 'E1 6AN', tipPercent: 10 }}
          quote={{ unit: 950, subtotal: 2850, discount: 950, food: 1900, deliveryFee: 299, tip: 190, total: 2389 }}
          sizePrices={CLASSIC_PRICES}
        />
      </main>
    </div>
  );
}

const TOASTS: Toast[] = [
  { id: 1, variant: 'success', title: '#0109 sent to the kitchen', message: '3× Pepperoni Party for Kam', duration: 5000 },
  { id: 2, variant: 'info', title: '#0108 is on the way', message: 'Heading to E1 6AN', duration: 5000 },
  { id: 3, variant: 'error', title: 'Could not cancel', message: 'Too late - it is already on the way!', duration: 0 },
];

function Item({ title, spec, width, height, children }: { title: string; spec: string; width?: number; height?: number; children: ReactNode }) {
  return (
    <figure className="gallery-item">
      <figcaption>
        {title} <span>· specs/{spec}</span>
      </figcaption>
      <div className="gallery-frame" style={{ width, height }}>
        {children}
      </div>
    </figure>
  );
}

const byIds = (ids: string[]) => ORDERS.filter((o) => ids.includes(o.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

function Gallery() {
  return (
    <div className="gallery">
      <style>{`
        .gallery { padding: 32px; display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start; }
        .gallery-item { margin: 0; }
        .gallery-item figcaption { font: 700 14px system-ui; margin-bottom: 12px; }
        .gallery-item figcaption span { opacity: 0.5; font-weight: 400; }
        .gallery-frame { display: flex; flex-direction: column; position: relative; }
        .gallery-frame > .panel { flex: 1; }
        .gallery-frame .dialog-backdrop, .gallery-frame .toasts { position: absolute; }
      `}</style>

      <Item title="Top bar: reconnecting + branch menu open" spec="04-topbar-states.png" width={960} height={200}>
        <TopBar connection="reconnecting" takings={0} branch="Shoreditch" menuOpen />
      </Item>
      <Item title="Menu: search results (hover a row, focus the input)" spec="07-menu-states.png" width={300} height={380}>
        <MenuPanel
          menuCount={MENU.length}
          sections={[{ id: 'menu', title: 'Results', items: [pizza('nduja-ninja'), pizza('hot-honey')] }]}
          stock={STOCK}
          favouriteIds={FAVOURITE_IDS}
          selectedId="hot-honey"
          query="nduja"
        />
      </Item>
      <Item title="Menu: Veggie filter, sold out" spec="08a-menu-filtered.png" width={300} height={480}>
        <MenuPanel
          menuCount={MENU.length}
          sections={[{ id: 'menu', title: 'Menu', items: MENU.filter((p) => p.category === 'VEGGIE') }]}
          stock={STOCK}
          favouriteIds={FAVOURITE_IDS}
          selectedId="fun-ghi"
          category="VEGGIE"
        />
      </Item>
      <Item title="Menu: empty search" spec="08b-menu-empty.png" width={300} height={340}>
        <MenuPanel menuCount={MENU.length} sections={[]} stock={STOCK} favouriteIds={FAVOURITE_IDS} selectedId="margherita" query="anchovy" />
      </Item>
      <Item title="Order form: errors" spec="11-form-errors.png" width={336} height={828}>
        <OrderForm
          pizza={MARG}
          level={STOCK.margherita}
          fields={{ customer: 'R2-D2', size: 'L', crust: 'STUFFED', quantity: '0', fulfilment: 'DELIVERY', postcode: 'e10 5np', tipPercent: 10 }}
          quote={{ unit: 1440, subtotal: 0, discount: 0, food: 0, deliveryFee: 299, tip: 0, total: 299 }}
          sizePrices={{ S: 960, M: 1150, L: 1440 }}
          errors={{ customer: "Use letters, spaces and ' - . only", quantity: 'Add at least 1 pizza', postcode: "Sorry, we don't deliver to E10 yet" }}
        />
      </Item>
      <Item title="Order form: collection, sending" spec="12-form-collection-submitting.png" width={336} height={828}>
        <OrderForm
          pizza={MARG}
          level={STOCK.margherita}
          fields={{ customer: 'Kam', size: 'M', crust: 'THIN', quantity: '2', fulfilment: 'COLLECTION', postcode: '', tipPercent: 0 }}
          quote={{ unit: 950, subtotal: 1900, discount: 0, food: 1900, deliveryFee: 0, tip: 0, total: 1900 }}
          sizePrices={CLASSIC_PRICES}
          submitting
        />
      </Item>
      <Item title="Board: Active filter, sorted by ETA, one cancelling" spec="15-board-filtered-sorted.png" width={784} height={320}>
        <KitchenBoard
          tab="tickets"
          orders={byIds(['ord-5', 'ord-8', 'ord-7', 'ord-6'])}
          drivers={DRIVERS}
          activity={ACTIVITY}
          menuById={MENU_BY_ID}
          takings={TAKINGS}
          now={NOW}
          filter="ACTIVE"
          sort={{ key: 'eta', direction: 'asc' }}
          cancelling={{ 'ord-8': true }}
        />
      </Item>
      <Item title="Board: drivers" spec="16-board-drivers.png" width={784} height={420}>
        <KitchenBoard tab="drivers" orders={ORDERS} drivers={DRIVERS} activity={ACTIVITY} menuById={MENU_BY_ID} takings={TAKINGS} now={NOW} />
      </Item>
      <Item title="Board: takings" spec="17-board-takings.png" width={784} height={280}>
        <KitchenBoard tab="takings" orders={ORDERS} drivers={DRIVERS} activity={ACTIVITY} menuById={MENU_BY_ID} takings={TAKINGS} now={NOW} />
      </Item>
      <Item title="Board: activity" spec="18-board-activity.png" width={784} height={360}>
        <KitchenBoard tab="activity" orders={ORDERS} drivers={DRIVERS} activity={ACTIVITY} menuById={MENU_BY_ID} takings={TAKINGS} now={NOW} />
      </Item>
      <Item title="Board: no tickets" spec="13-board-dimensions.png" width={784} height={300}>
        <KitchenBoard tab="tickets" orders={[]} drivers={DRIVERS} activity={ACTIVITY} menuById={MENU_BY_ID} takings={TAKINGS} now={NOW} />
      </Item>
      <Item title="Status badges" spec="19-status-badges.png">
        <div style={{ display: 'flex', gap: 14 }}>
          {(['PENDING', 'QUEUED', 'IN_OVEN', 'ON_THE_WAY', 'DONE', 'CANCELLED', 'REJECTED'] as const).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Item>
      <Item title="Confirm dialog" spec="20-confirm-dialog.png" width={520} height={420}>
        <ConfirmDialog title="That's a big order!" confirmLabel="Fire up the ovens">
          <p>Orders over £150 or 10+ pizzas need a quick double-check.</p>
          <dl className="summary-list">
            <div><dt>Customer</dt><dd>Office Party</dd></div>
            <div><dt>Pizza</dt><dd>12× Pepperoni Party (Large)</dd></div>
            <div><dt>Delivering to</dt><dd className="num">EC1A 1BB</dd></div>
            <div><dt>Total</dt><dd className="num emphasis">£179.30</dd></div>
          </dl>
        </ConfirmDialog>
      </Item>
      <Item title="Toasts" spec="21-toasts.png" width={352} height={260}>
        <Toasts toasts={TOASTS} />
      </Item>
    </div>
  );
}
