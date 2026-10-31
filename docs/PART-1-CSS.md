# Part 1: CSS from spec images

Style the whole kitchen to match [`/specs`](../specs). This is the biggest part.

## What you're building

| Spec | Component(s) | Where to see it |
| --- | --- | --- |
| `00-app-overview.png` | Everything at 1440×900 | `/` |
| `01-app-layout.png` | `App.css`: the grid shell | `/` |
| `02`–`04` top bar | `TopBar.css` | `/`, `/?gallery` |
| `05`–`08b` menu | `MenuPanel.css`, `SearchField.css`, `Panel.css` | `/`, `/?gallery` |
| `09`–`12` order form | `OrderForm.css`, `SegmentedControl.css`, `TextField.css`, `Stepper.css`, `buttons.css` | `/`, `/?gallery` |
| `13`–`18` kitchen board | `KitchenBoard.css`, `Panel.css` | `/`, `/?gallery` |
| `19` status badges | `StatusBadge.css` | `/?gallery` |
| `20` confirm dialog | `ConfirmDialog.css` | `/?gallery` |
| `21` toasts | `Toasts.css` | `/?gallery` |

### Reading the specs

- **Dimension images**: pink dashed lines with pixel values. Tinted rectangles show **padding and gaps**, and the colour key at the top right tells you each size.
- **Typography & colour images**: callouts with the exact CSS values, measured from a working build. Match them and you've matched the design.
- `1fr` / `flex: 1` labels mean "takes the remaining space".
- Callouts also describe what a static picture can't show: hover, focus, animations and other states. Read them all.
- The images are @2x, so zoom in.

## Requirements

1. **Tokens first** (`styles/tokens.css`). Collect the warm palette (surfaces, the three text colours, borders, tomato / basil / cheese / ocean / plum / chilli), radii, shadows and spacing as custom properties. Component files should contain `var(--…)`, not hex values.
2. **Base** (`styles/base.css`): reset, full-height root, body typography, form controls inheriting `font`, `button` reset, `.num` (DM Mono + `tabular-nums`), `:focus-visible`, `prefers-reduced-motion`.
3. **Shell** (`App.css`): grid with a 60px top bar and `300px | minmax(0, 1fr) | 336px` columns. Panels scroll *inside*. The page never scrolls at 1440×900.
4. **Tables are flexbox, not `<table>`.** The ticket board uses `div`s with ARIA table roles. Each `.tr` is `display: flex` with fixed column widths (`13-board-dimensions.png`). With an automatic-layout `<table>`, the browser measures every cell before laying anything out, so one countdown changing re-lays out the whole board. Fixed flex columns keep each row independent.
5. **Things you probably haven't hand-written before** (all in the specs):
   - `position: sticky` section headings in the menu list
   - horizontally scrolling chips with a hidden scrollbar and a **`mask-image` fade** on the right edge
   - the receipt's **zig-zag bottom edge** (a CSS `mask` with a `conic-gradient`)
   - the dialog's **checked tablecloth strip** (`repeating-conic-gradient`)
   - the **activity timeline** line drawn with `::before`
   - the **driver cards** grid: `repeat(auto-fill, minmax(220px, 1fr))`
   - category theming through custom properties: `.cat-veggie` sets `--pizza-sauce` etc., and the provided `<PizzaIcon>` reads them (see the comment in `Panel.css`)
   - `color-mix()` for the chip counts instead of `opacity`
6. **States**: hover, `:focus-within`, `[aria-selected]` / `[aria-pressed]` / `[aria-checked]` / `[aria-expanded]` (style from ARIA attributes, not extra classes), `.has-error`, `.is-disabled`, `:disabled`, selected and sold-out rows, pending tickets, late ETAs.
7. **Animations**: all must stay smooth with hundreds of rows, so use `transform` and `opacity` only:
   - stock flash (`.stock.flash-down` / `.flash-up`): a `::after` overlay fading 0.4 → 0
   - oven stripes on the current stage segment: a wide `::after` moved with `translateX`, **not** an animated `background-position`
   - the oven badge glow, the "Oven hot" heat ring, the wobbling pizza, the bouncy dialog and toast entrances, the toast countdown (`scaleX`)
8. **Text overflow**: names and toppings truncate with an ellipsis. Remember `min-width: 0` on flex/grid children.

## Done when

- `/` matches `00-app-overview.png` at 1440×900. Overlay a screenshot at 50% opacity to check.
- Every `/?gallery` item matches its spec.
- No hard-coded colours outside `tokens.css` (search for `#` and `rgba(` in `components/`).
- You've worked through the CSS section of [REVIEW-CHECKLIST.md](REVIEW-CHECKLIST.md).

## Stretch goals

- **Late-night theme**: add `:root[data-theme='dark']` overrides in `tokens.css` only. If a component needs editing, your tokens aren't doing their job.
- **Narrow layout**: below 1200px, move the order form under the menu with grid areas. No markup changes.
- Design a "Menu" tab screen of your own and write its spec.
