# Part 4: Performance

> "Assume your solution will be used as part of a complex UI. Consider which work and re-renders are necessary."

```bash
npm run dev:stress     # 200 pizzas, 3,000 historical tickets, 30 drivers, updates every 100ms
```

## Method: measure first

1. **React Developer Tools → Profiler**: turn on *"Highlight updates when components render"* and record 5 seconds.
2. **Chrome DevTools → Performance** with 4× CPU throttling: record 5 seconds, and note the Scripting / Rendering / Painting totals and long tasks.
3. Write the baseline in `NOTES.md` **before** changing anything.

## Things to find and fix

Work out which of these apply to *your* code.

### React

1. **Stock in context or top-level state** → every tick re-renders everything. Move it into an **external store** (`subscribe` / `getSnapshot`) read with **`useSyncExternalStore`**, selecting one pizza per row (`useStock(id)`). Only rows whose stock changed should re-render. This depends on `applyStock` keeping references.
2. **The ticking clock.** A `setInterval` in each ETA, or `now` state at the top of the board, re-renders hundreds of rows every second. Build **one shared clock store** and subscribe each `<Eta>` with a *selector that returns the formatted string* (`useSyncExternalStore(clock.subscribe, () => formatEta(etaAt, clock.now()))`). Each countdown then re-renders only when its own text changes, and rows without an ETA never re-render.
3. **Unmemoised rows**: `React.memo` on `MenuRow`, `TicketRow` and `DriverCard`. Memo only helps when props are stable: stable callbacks, no inline `new Set()` or `{…}`, and search results returning original objects.
4. **One render per SSE message** → batch stock updates and flush once per `requestAnimationFrame`.
5. **Derived data**: filtering, sorting, `computeTakings`. Use `useMemo` where it measurably helps.
6. **Context fan-out**: does the order form re-render when a driver moves? Does the menu re-render when a toast appears?
7. **Typing in search** with 200 pizzas: debounce, or `useDeferredValue`.

### Browser

8. Fixed-width flex rows (Part 1) instead of automatic table layout, and `contain: layout paint` on rows that update a lot.
9. **3,000 off-screen tickets**: `content-visibility: auto` + `contain-intrinsic-size` skips layout and paint for rows you can't see. (Stretch: real windowing, and compare the numbers.)
10. **Compositor-only animations.** Check with DevTools *Rendering → Paint flashing*. The oven stripes are the trap: animating `background-position` repaints every frame, while moving a pseudo-element with `transform` doesn't.
11. **`opacity` on text**: a design spec may say "brown at 68% opacity". Apply that as an `rgba()` colour (or `color-mix()`), not the `opacity` property, which makes the browser paint the element as a separate layer and also fades its borders and children.
12. **Expensive paints**: large shadows or `filter` on things that update often.

## Deliverable

`NOTES.md` with a before/after table:

| Scenario | Before | After | Change |
| --- | --- | --- | --- |
| Components rendered per stock tick (Profiler) | | | |
| Components rendered per clock tick | | | |
| Scripting ms / 5s (4× throttle) | | | |
| Rendering + painting ms / 5s | | | |
| Typing "test kitchen" in search (input delay) | | | |

…and 2–3 sentences per optimisation on **why** it helped. Being able to explain this in an interview is the real goal.
