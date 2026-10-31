# Part 3: React, hooks and state

Make the kitchen work against the real backend. Run `npm run dev`: the API is on `:4000` and Vite proxies `/api` to it.

The components already contain their markup. You'll add props, state, effects and handlers, and replace the fixture-driven `App.tsx` with live data. **You decide the architecture.** The hints say where these things usually go.

## The API

Typed in [`src/api/client.ts`](../src/api/client.ts) (complete), implemented in [`server/index.mjs`](../server/index.mjs).

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/menu` | Pizzas |
| GET | `/api/stock` | Snapshot of stock levels |
| GET / PUT | `/api/favourites` | `{ pizzaIds: string[] }` |
| GET | `/api/orders` | Newest first |
| GET | `/api/drivers` | Everyone on shift |
| GET | `/api/activity` | Last 200 kitchen events |
| POST | `/api/orders` | Body = `NewOrderRequest` (send a `clientOrderId`, which the server uses as the order id). `201` order (may be `REJECTED`: "Sold out" / "Only n left"), `422 { errors: { field: message } }` |
| DELETE | `/api/orders/:id` | `200` cancelled order. `409` once it's on the way ("Too late!"). Cancelling a QUEUED order puts the stock back. |
| GET | `/api/stream` | **Server-Sent Events**: `stock`, `order`, `driver`, `activity` (see `StreamEvent` in `types.ts`) |

Orders move through the kitchen on their own: QUEUED → IN_OVEN (4 ovens) → ON_THE_WAY (needs a free driver) → DONE. Collection orders skip the road. `SPEED=3 npm run dev` speeds the kitchen up.

The server is deliberately flaky: **150–600ms latency and 5% random HTTP 500s** ("The oven caught fire"). `FAIL_RATE=0` turns that off, and `?fail=1` forces an error on any request.

## Requirements

### A. Custom hooks (tests provided in `hooks/hooks.test.tsx`)

1. `useDebouncedValue(value, ms)`
2. `useLocalStorage(key, initial)`: lazy init, survives corrupt JSON and a throwing `localStorage`, stable setter, syncs across tabs
3. `useQuery(key, fetcher)`: loading / success / error, **AbortController** on key change and unmount, no stale results, `reload()` keeps data (`refreshing`), and an inline fetcher must not cause a refetch loop
4. `useDismiss(ref, active, onDismiss)`: Escape or pressing outside closes something (write your own tests)

### B. App state

5. **Bootstrap**: load menu, stock, favourites, orders, drivers and activity in parallel. Show a loading screen, then on failure an error screen with **Try again**.
6. **Stream**: one `EventSource('/api/stream')` for the app's lifetime, closed on unmount. Stock goes to the menu and form, `order` events go through `ordersReducer`, driver and activity events update their lists (de-duplicated, activity capped at 200).
7. **Connection status** in the top bar: `connecting` → `live` → `reconnecting`. **Re-sync everything after a reconnect.**
8. **Contexts split by how often things change.** The menu never changes, stock changes constantly, orders change when the kitchen moves. One giant context = everything re-renders on every stock tick. Keep action callbacks in their own context with stable identity.
9. **Toasts**: `ToastProvider` with `push` / `dismiss`, auto-dismiss after 5s (errors are sticky), max 4. Components that only push toasts must not re-render when the list changes. **Only orders placed from this browser** get status toasts ("in the oven", "on the way", "delivered"), not every order in the shop.

### C. Component behaviour

10. **Top bar**: branch menu (click, Escape, click outside; persisted with `useLocalStorage`). The takings pill shows live `sumTakings(computeTakings(orders)).net`.
11. **Menu**
    - Search (controlled, **debounced 150ms**) via `searchMenu`, with category chips via `groupMenu` / filtering. Escape and the × clear the search.
    - Clicking a pizza selects it for the order form (persist the selection).
    - The heart toggles a favourite **optimistically**: update immediately, `PUT /api/favourites`, and on failure roll back and show an error toast.
    - **Stock flash**: `flash-down` / `flash-up` when a pizza's stock changes, restarting on every change (hint: a changing `key`). Work out the direction without an extra render: see "adjusting state when a prop changes" in the React docs.
12. **Order form**
    - Owns its state with `useReducer`: fields, touched, submitAttempted, submitting, serverErrors, confirming.
    - **Picking another pizza resets the form**: use `key={pizza.id}` on the parent, not an effect.
    - Size hints come from `unitPrice` for the current crust. The receipt updates live with `priceOrder`, even while the form is invalid (count the quantity as 0).
    - Errors come from `validateDraft` against **live stock** and are **derived during render**, never stored. Show a field's error once it is blurred or after a submit attempt.
    - The Stepper's − / + clamp to 1–20. If the text isn't a number, + starts from 1.
    - Over £150 or 10+ pizzas opens the **ConfirmDialog**. While sending, the button is disabled with a spinner. On success, keep the choices but clear customer, quantity (back to 1) and postcode. On a 422, show the server's field errors until that field is edited.
    - **SegmentedControl**: proper radio-group keyboard support (roving `tabIndex`, arrow keys).
13. **Optimistic orders**: on submit, dispatch `submitted` with a PENDING order (id = `clientOrderId`, ticket 0, shown as `····`), then `upserted` with the response, or `submitFailed` on error.
14. **Kitchen board**
    - Tabs persisted with `useLocalStorage`, using `role="tab"` semantics.
    - Ticket filter chips (Active = queued + in oven + on the way) and sortable headers (`sortRows` + `nextSort`, `aria-sort`).
    - Cancel (only QUEUED / IN_OVEN), with a spinner while in flight and a toast on failure. Try cancelling just as it leaves: 409. **Cancel all queued** cancels every queued ticket.
    - **Live ETAs**: countdowns tick every second. Don't put a `setInterval` in every row, and don't re-render the whole board each second (see Part 4: get it working first).
    - Drivers, Takings and Activity tabs show live data.
15. **ConfirmDialog**: portal to `document.body`. Focus Cancel on open and restore focus on close. Escape and backdrop click cancel. Trap Tab inside the dialog.

### D. Tests

16. React Testing Library tests for what you added. Query by role and name, and use awaited `userEvent`. At minimum cover:
    - Order form: errors on blur (not before); an invalid submit doesn't call `onSubmit`; the receipt updates (3 for 2, collection, tip); collection sends no postcode; postcode normalised and area-checked; stock limit; the busy state and reset; the confirm flow including Escape; 422 errors; arrow keys on a segmented control
    - Menu: favourites first, category filter, search ranking, empty state, Escape clears, select and favourite callbacks, a stock change flashes
    - Board: ETAs and late styling, progress labels, filter, sort cycle with `aria-sort`, cancel rules, cancel-all-queued, tab persisted, takings totals
    - No render-count assertions, and no testing of state shape.

Put a short write-up in `NOTES.md`: how you split state and why, and how you handle out-of-order events.

**Stretch:** pause a toast's timer while it's hovered (both the CSS animation and the JS timeout); ↑/↓ keyboard navigation in the menu; a "Remake" action that re-orders a DONE ticket.
