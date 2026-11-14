import type { Category, Pizza } from '../types';

const words = (text: string) =>
  text
    .toLocaleLowerCase()
    .split(/[\s'\-.&,]+/)
    .filter(Boolean);

/**
 * How well a pizza matches a search query (case-insensitive, trimmed):
 *   4 - name equals the query (ignoring a leading apostrophe: "nduja ninja" equals "'Nduja Ninja")
 *   3 - name starts with the query
 *   2 - any word of the name starts with the query ("honey" matches "Hot Honey Heaven")
 *   1 - any word of any topping starts with the query ("pest" matches the "pesto" topping)
 *   0 - no match
 * Words split on spaces, apostrophes, hyphens, dots, commas and "&".
 */
export function scorePizza(pizza: Pizza, query: string): number {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

/**
 * Filter + rank the menu for a query.
 * - Empty/whitespace query returns the input array itself (same reference).
 * - Higher score first; equal scores keep MENU ORDER (stable).
 * - Returns the original Pizza objects (no copies). Never mutates the input.
 */
export function searchMenu(menu: Pizza[], query: string, limit = Infinity): Pizza[] {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}

export interface MenuSection {
  id: 'favourites' | 'menu';
  title: string;
  items: Pizza[];
}

/**
 * Split pizzas into display sections.
 * - Keep only pizzas in `category` (null = all categories).
 * - "Favourites" holds favourites IN FAVOURITE ORDER; "Menu" holds everything else in the input order.
 * - Favourite ids that aren't in `pizzas` (filtered out, or unknown) are skipped.
 * - Empty sections are omitted entirely. No pizza appears twice.
 */
export function groupMenu(pizzas: Pizza[], favouriteIds: string[], category: Category | null): MenuSection[] {
  // TODO: implement (see the doc comment above and the tests)
  throw new Error('Not implemented');
}
