import { describe, expect, test } from 'vitest';
import { groupMenu, scorePizza, searchMenu } from './menu';
import { FAVOURITE_IDS, MENU, pizza } from '../__test__/fixtures';

const names = (list: { name: string }[]) => list.map((p) => p.name);

describe('scorePizza', () => {
  test('exact name, ignoring case and whitespace', () => expect(scorePizza(pizza('margherita'), '  MARGHERITA ')).toBe(4));
  test('exact name ignores a leading apostrophe', () => expect(scorePizza(pizza('nduja-ninja'), 'nduja ninja')).toBe(4));
  test('name prefix', () => expect(scorePizza(pizza('pepperoni-party'), 'pepp')).toBe(3));
  test('word prefix in the name', () => expect(scorePizza(pizza('hot-honey'), 'honey')).toBe(2));
  test('hyphenated names split into words', () => expect(scorePizza(pizza('fun-ghi'), 'ghi')).toBe(2));
  test('topping word prefix', () => expect(scorePizza(pizza('basil-instinct'), 'burr')).toBe(1));
  test('no match', () => expect(scorePizza(pizza('margherita'), 'anchovy')).toBe(0));
});

describe('searchMenu', () => {
  test('empty query returns the same array', () => {
    expect(searchMenu(MENU, '')).toBe(MENU);
    expect(searchMenu(MENU, '  ')).toBe(MENU);
  });

  test('ranks name matches above topping matches, then menu order', () => {
    // "basil": Basil Instinct (prefix, 3), then Margherita & Basil Instinct have basil topping...
    expect(names(searchMenu(MENU, 'basil'))).toEqual(['Basil Instinct', 'Margherita']);
    expect(names(searchMenu(MENU, 'nduja'))).toEqual(["'Nduja Ninja", 'Hot Honey Heaven']);
  });

  test('returns original objects and respects the limit', () => {
    const [first] = searchMenu(MENU, 'inferno');
    expect(first).toBe(pizza('inferno'));
    expect(searchMenu(MENU, 'to', 2)).toHaveLength(2);
  });

  test('does not mutate the input', () => {
    const before = [...MENU];
    searchMenu(MENU, 'p');
    expect(MENU).toEqual(before);
  });
});

describe('groupMenu', () => {
  test('favourites first in favourite order, then the rest of the menu', () => {
    const [favs, menu] = groupMenu(MENU, ['hot-honey', 'margherita'], null);
    expect(favs).toMatchObject({ id: 'favourites', title: 'Favourites' });
    expect(names(favs.items)).toEqual(['Hot Honey Heaven', 'Margherita']);
    expect(menu.items).toHaveLength(MENU.length - 2);
    expect(menu.items[0]).toBe(pizza('pepperoni-party'));
  });

  test('filters by category in both sections', () => {
    const sections = groupMenu(MENU, FAVOURITE_IDS, 'SPICY');
    expect(sections.map((s) => names(s.items))).toEqual([['Hot Honey Heaven'], ['Inferno', "'Nduja Ninja"]]);
  });

  test('omits empty sections and ignores unknown/duplicate favourites', () => {
    expect(groupMenu(MENU, [], 'SPECIAL').map((s) => s.id)).toEqual(['menu']);
    const [favs] = groupMenu(MENU, ['nope', 'inferno', 'inferno'], null);
    expect(names(favs.items)).toEqual(['Inferno']);
    expect(groupMenu([], FAVOURITE_IDS, null)).toEqual([]);
  });
});
