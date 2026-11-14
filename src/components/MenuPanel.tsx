import type { Category, Pizza, StockLevel, StockMap } from '../types';
import { formatMoney } from '../utils/format';
import type { MenuSection } from '../utils/menu';
import { stockState } from '../utils/stock';
import { HeartIcon, PizzaIcon } from './icons';
import { PizzaTags } from './PizzaTags';
import { SearchField } from './SearchField';
import '../styles/buttons.css';
import './Panel.css';
import './MenuPanel.css';

const CATEGORIES: Array<{ value: Category | null; label: string }> = [
  { value: null, label: 'All' },
  { value: 'CLASSIC', label: 'Classic' },
  { value: 'VEGGIE', label: 'Veggie' },
  { value: 'SPICY', label: 'Spicy' },
  { value: 'SPECIAL', label: 'Special' },
];

export interface MenuPanelProps {
  /** Total number of pizzas on the menu (header badge) */
  menuCount: number;
  /**
   * Part 1: the sections are passed in ready-made.
   * Part 3: the panel owns its search query + category and builds these with groupMenu / searchMenu.
   */
  sections: MenuSection[];
  stock: StockMap;
  favouriteIds: string[];
  selectedId: string;
  query?: string;
  category?: Category | null;
  /** Part 1 only: force a stock flash on some rows so you can style it */
  flashes?: Record<string, 'up' | 'down'>;
}

export function MenuPanel({
  menuCount,
  sections,
  stock,
  favouriteIds,
  selectedId,
  query = '',
  category = null,
  flashes = {},
}: MenuPanelProps) {
  return (
    <section className="panel menu" aria-label="Pizza menu">
      <header className="panel-header">
        <h2 className="panel-title">Menu</h2>
        <span className="count-badge">{menuCount}</span>
      </header>

      <div className="menu-controls">
        <SearchField label="Search pizzas" placeholder="Search pizzas or toppings" defaultValue={query} />
        <div className="chips menu-categories" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button key={c.label} type="button" className="chip" aria-pressed={category === c.value}>
              {c.value && <span className={`chip-dot cat-${c.value.toLowerCase()}`} aria-hidden="true" />}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-title">No pizzas found</span>
          <span>{query.trim() ? `Nothing matches “${query.trim()}”` : 'Nothing in this category'}</span>
        </div>
      ) : (
        <div className="menu-list">
          {sections.map((section) => (
            <section key={section.id} className="menu-section" aria-label={section.title}>
              <h3 className="menu-section-title">
                {section.title}
                <span className="menu-section-count num">{section.items.length}</span>
              </h3>
              <ul className="menu-items">
                {section.items.map((pizza) => (
                  <MenuRow
                    key={pizza.id}
                    pizza={pizza}
                    level={stock[pizza.id]}
                    selected={pizza.id === selectedId}
                    favourite={favouriteIds.includes(pizza.id)}
                    flash={flashes[pizza.id]}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

interface MenuRowProps {
  pizza: Pizza;
  level: StockLevel | undefined;
  selected: boolean;
  favourite: boolean;
  flash?: 'up' | 'down';
}

export function MenuRow({ pizza, level, selected, favourite, flash }: MenuRowProps) {
  const state = stockState(level);
  const fill = level ? Math.min(1, level.portions / level.capacity) : 0;
  return (
    <li
      className={`menu-row cat-${pizza.category.toLowerCase()}${selected ? ' selected' : ''}${state === 'out' ? ' sold-out' : ''}`}
    >
      <button type="button" className="menu-main" aria-label={pizza.name} aria-current={selected || undefined}>
        <PizzaIcon size={40} />
        <span className="menu-info">
          <span className="menu-name">
            <span className="menu-name-text">{pizza.name}</span>
            <PizzaTags pizza={pizza} />
          </span>
          <span className="menu-toppings">{pizza.toppings.join(' · ')}</span>
        </span>
        <span className="menu-side">
          <span className="menu-price num">{formatMoney(pizza.basePrice)}</span>
          <span className={`stock stock-${state}${flash ? ` flash-${flash}` : ''}`}>
            <span className="stock-meter" aria-hidden="true">
              <span className="stock-fill" style={{ transform: `scaleX(${fill})` }} />
            </span>
            <span className="stock-text">{state === 'out' ? 'Sold out' : `${level?.portions} left`}</span>
          </span>
        </span>
      </button>
      <button
        type="button"
        className={`icon-btn menu-fav${favourite ? ' is-favourite' : ''}`}
        aria-pressed={favourite}
        aria-label={`${favourite ? 'Remove' : 'Add'} ${pizza.name} ${favourite ? 'from' : 'to'} favourites`}
      >
        <HeartIcon filled={favourite} size={15} />
      </button>
    </li>
  );
}
