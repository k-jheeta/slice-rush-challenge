# Slice Rush 🍕 a frontend practice challenge

You're building the kitchen dashboard for **Slice Rush**, a busy pizza shop. Orders come in, stock runs down, ovens fill up and drivers race around London, all live. The format follows a typical frontend take-home (CSS from a picture, then TypeScript, then React), but bigger, with no time limit.

| Part | Focus | What you do |
| --- | --- | --- |
| [1. CSS](docs/PART-1-CSS.md) | Hand-written CSS from spec images | Style every component to match `specs/*.png` **pixel for pixel**. No CSS libraries. |
| [2. TypeScript / TDD](docs/PART-2-TYPESCRIPT.md) | Pure functions | Pricing (in pence!), UK postcode validation, menu search, takings, sorting, stock merging and the orders reducer, until the 120 provided tests pass. Then add your own. |
| [3. React + hooks](docs/PART-3-REACT.md) | State, effects, context, custom hooks | Wire the UI to the kitchen API and live event stream: optimistic orders, a form with useReducer, a shared clock for countdowns, toasts, a11y. Write component tests. |
| [4. Performance](docs/PART-4-PERFORMANCE.md) | Profiling and render performance | Stress mode: 200 pizzas, 3,000 tickets, 30 drivers, updates every 100ms. Find and fix the wasted work. Explain what you did. |

**Do the parts in order** and commit after each one.

> Used to tweaking a component library like Fluent UI? Part 1 is the opposite: no components, no theme, just pictures with measurements. You'll write the layout (flex/grid), spacing, typography, colour, states (`:hover`, `:focus-within`, `[aria-*]`), sticky headers, CSS masks and animations yourself.

---

## Getting started

Requires Node 22.12+.

```bash
npm install
npm start            # Parts 1 & 2: UI with static fixture data (http://localhost:5173)
npm run dev          # Part 3+: kitchen API on :4000 + UI (Vite proxies /api)
npm run dev:stress   # Part 4: the dinner rush from hell
npm test             # Vitest in watch mode
npm run test:run     # run once
npm run typecheck
```

In Part 1, keep both of these open:

- `http://localhost:5173/`: the main kitchen screen (compare with `specs/00-app-overview.png`)
- `http://localhost:5173/?gallery`: every other state (errors, menu open, sold out, drivers, takings, dialog, toasts…), each labelled with its spec image

## Repository map

```
specs/                 Annotated design specs (PNG): your source of truth for Part 1
server/index.mjs       Mock kitchen backend (REST + Server-Sent Events). Complete: read it, don't change it.
src/
  types.ts             Domain types (all money is integer pence)
  api/client.ts        Typed fetch wrapper for every endpoint (complete)
  components/*.tsx     Components with their markup in place. Part 1: don't change the markup. Part 3: add behaviour.
  components/icons.tsx Icons, including <PizzaIcon> which is coloured with CSS custom properties (complete)
  components/*.css     Empty: Part 1
  styles/tokens.css    Empty: Part 1 (design tokens)
  styles/base.css      Mostly empty: Part 1 (reset + body)
  styles/buttons.css   Empty: Part 1
  utils/*.ts           Part 2 stubs + tests (format.ts is done as a worked example)
  state/ordersReducer  Part 2 stub + tests
  hooks/*.ts           Part 3 stubs + tests
  __test__/fixtures.ts Static data for Part 1 and the tests
docs/                  Instructions for each part + a self-review checklist
NOTES.md               Write up your decisions here
```

## House rules

1. **Vanilla CSS only**: no Tailwind, CSS-in-JS, Sass or component libraries. Custom properties encouraged.
2. **Part 1: don't change the JSX structure.** Everything in the specs can be done with the markup as given.
3. **Don't edit the provided tests** to make them pass. Add new ones next to them.
4. Keep `npm run typecheck` and `npm run test:run` green at the end of each part, apart from the stubs of parts you haven't reached yet.
5. Before calling a part done, work through [docs/REVIEW-CHECKLIST.md](docs/REVIEW-CHECKLIST.md).

## Suggested git workflow

```bash
git init && git add . && git commit -m "Starting point" && git tag start
# ...part 1...
git commit -am "Part 1: CSS" && git tag part-1
```
