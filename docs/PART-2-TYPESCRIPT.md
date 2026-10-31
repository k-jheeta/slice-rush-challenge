# Part 2: TypeScript and TDD

Pure functions, no React. Each stub has a doc comment describing the exact behaviour, and the tests next to it check it.

```bash
npm test -- src/utils src/state
```

`utils/format.ts` is already done as a worked example. `stockState` in `utils/stock.ts` is provided too, because the Part 1 layout uses it.

| File | Functions | Watch out for |
| --- | --- | --- |
| `utils/pricing.ts` | `unitPrice`, `priceOrder` | **Integer pence everywhere.** Round size prices to the *nearest* 10p. "3 for 2" discounts. Free delivery depends on food *after* the discount. The tip is on food only. |
| `utils/validation.ts` | `normalisePostcode`, `inDeliveryArea`, `validateDraft` | UK postcode formats with any spacing. `E1` covers `E1 6AN` but **not** `E10`, while `W1` covers `W1D`. Accented names. Only the first failing rule per field. Stock-aware quantity checks. |
| `utils/menu.ts` | `scorePizza`, `searchMenu`, `groupMenu` | Word splitting on punctuation (`'Nduja`, `Fun-ghi`, `Amazon.com`-style names). Stable ranking. **Return the original objects.** Favourites keep *their* order. |
| `utils/takings.ts` | `computeTakings`, `sumTakings` | Recompute prices rather than trusting `order.total`. Waste only counts if the order reached the oven. Sort by net, then name. |
| `utils/stock.ts` | `applyStock`, `stockDirection` | Immutable updates that **keep unchanged references**, and return `prev` itself when nothing changed. Part 4 depends on this. |
| `utils/sort.ts` | `sortRows`, `nextSort` | Stable in both directions. Nulls always last. Case-insensitive. |
| `state/ordersReducer.ts` | `ordersReducer`, `selectOrders`, `countByStatus` | Optimistic PENDING orders, stream updates arriving out of order, "no-op returns the same state". |

## Requirements

1. All provided tests pass, without editing them.
2. **At least 3 extra tests per file.** Some ideas:
   - pricing: a large stuffed pizza at every tip level; exactly £25.00 of food after the discount
   - validation: `"  ec1a1bb  "`, `"GIR 0AA"` (a real but unusual postcode: decide, document and test it), a 40-character name, `"007"` as a quantity
   - menu: a query matching a name *and* a topping; `limit = 0`; a category with no favourites
   - takings: the same pizza done several times at different sizes; a cancelled-after-oven order with a tip
   - reducer: `loaded` arriving *after* a newer stream event for the same order (decide what should win, then write it down in NOTES.md)
3. No `any`. Never mutate inputs (watch out for `.sort()` on an array you were given).

## Why this matters later

Part 4's performance work depends on **referential stability**: returning the same object when nothing changed. The tests asserting `toBe` (same reference) rather than `toEqual` are the important ones.
