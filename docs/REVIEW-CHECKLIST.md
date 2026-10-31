# Self-review checklist

Go through this before you call a part finished. It's what a reviewer at a trading firm will look at.

## CSS

- [ ] All colours, radii and spacing come from tokens. No stray hex values in component files.
- [ ] Translucent colours are `rgba()` / `color-mix()` colours, not the `opacity` property.
- [ ] No `opacity` on elements that hold text, except deliberate 0↔1 show/hide toggles.
- [ ] Data grids use fixed-width flex (or grid) columns, not automatic `<table>` layout.
- [ ] Row dividers are borders, not `box-shadow`.
- [ ] Animations only touch `transform` / `opacity`.
- [ ] `min-width: 0` wherever flex/grid children need to truncate. Long names show an ellipsis.
- [ ] Panels scroll internally and the page itself never scrolls at 1440×900.
- [ ] States are styled from ARIA attributes (`[aria-selected='true']`, `[aria-pressed]`…), so behaviour and visuals can't get out of sync.
- [ ] Focus is always visible (`:focus-visible`), and `:focus-within` is used for compound inputs.
- [ ] `::placeholder` is styled separately from the input text.
- [ ] Assets are **imported** (or inline SVG), never referenced by a source path string such as `src="src/icons/x.svg"`, which breaks in the production build. Check with `npm run build && npx vite preview`.
- [ ] No typos that make the browser silently drop a rule (`--var(...)`, missing `;`). Check computed styles in DevTools.
- [ ] Animations respect `prefers-reduced-motion`.

## React

- [ ] Money is integer pence everywhere, and only formatted for display.
- [ ] Array callbacks don't leak extra arguments (`ids.forEach(onCancel)` passes the index and the array too: use `ids.forEach((id) => onCancel(id))`).
- [ ] One shared clock drives every countdown. No interval per row, and no board-wide re-render every second.
- [ ] Every comment about optimisation is *accurate*: `useMemo` caches a value, it doesn't stop a component re-rendering. Only `React.memo` (with stable props) skips a child render.
- [ ] Stable callbacks passed to memoised children (`useCallback` / `dispatch` / a memoised actions object).
- [ ] Object identity is kept where nothing changed: reducers and helpers return `prev` for no-ops and don't copy unchanged items.
- [ ] Derived values (validation errors, filtered lists, totals) are computed during render, not stored in state and synced with effects.
- [ ] Every effect cleans up: EventSource closed, timers cleared, listeners removed, fetches aborted.
- [ ] Works under `StrictMode` with no double subscriptions.
- [ ] Resetting state when an identity changes is done with `key`, not an effect.
- [ ] No state stored at a higher level than the components that use it.
- [ ] Optimistic updates roll back correctly, and late responses can't overwrite newer data.
- [ ] Errors are visible to the user (toast, inline, retry). Nothing fails silently.

## Tests

- [ ] Tests describe behaviour ("shows an error after blur"), not implementation ("calls setState").
- [ ] Queries by role and accessible name, and `await user.…` for interactions.
- [ ] Mocks are created per test or reset (`restoreMocks` is on in `vite.config.ts`), so call counts don't leak between tests.
- [ ] No mocking of modules that aren't used, and no render-count assertions.

## Accessibility

- [ ] Every input has a label, and errors are linked with `aria-describedby` + `aria-invalid`.
- [ ] Tabs, radio groups, menus and the dialog use the correct roles and keyboard behaviour.
- [ ] Toasts are in a polite live region, and errors use `role="alert"`.
- [ ] Icon-only buttons have an `aria-label`.

## Write-up

- [ ] `NOTES.md` explains your choices. An empty notes file is a missed chance to show your reasoning.
