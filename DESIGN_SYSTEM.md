# Duka design system

The visual system for the Duka Letu storefront and staff app. It was created for this project and does not borrow any other brand's identity.

**Source of truth:**
- `src/app/globals.css` holds the tokens (Tailwind v4 `@theme`).
- `src/components/shared/` holds the components.

If a value here and a value in code disagree, the code wins and this file is wrong. Fix it.

The redesign rationale is in `DESIGN_AUDIT.md`.

---

## 1. Direction: "the counter, not the billboard"

A duka is defined by its counter, its shelves and its hours. The interface should feel like a well-kept counter: a quiet, light frame that lets the shop's real stock carry the page.

- **Products first.** On a 1440 × 900 desktop the first products appear above the fold. On a 390 px phone they appear inside the first screen, as a swipeable row in the hero.
- **One dark surface per view, at most.** On the storefront that is the footer. The staff app has none.
- **Colour has jobs, not moods.**
  - Ink acts: text and the primary action.
  - Teal points: links, selection, focus.
  - Amber signals: the cart count, "running low", the demo marker and the till's *Complete sale*.
  - Status colours report state, always with a word beside them.
- **Signature:** the **open sign**, a live "Open now · until 19:00 today" read from the shop's own hours in Settings (`OpenSign`, `lib/hours.ts`). It appears:
  - in the storefront announcement line,
  - in the pickup card on the homepage,
  - in the mobile menu.

  The pulse respects `prefers-reduced-motion`.
- **Honest.** Prices, stock and delivery fees are shown upfront. Anything simulated says so.

### Sources actually used

- **`apple-design` skill** (installed in `.claude/skills/apple-design`). Its HIG pages directly shaped:
  - `branding.md` › *Ensure branding always defers to content* and *Apply your app's accent colour judiciously*: the light shell and the single amber signal.
  - `layout.md` › *Visual hierarchy*.
  - `typography.md` › *Minimize the number of typefaces*.
  - `searching.md` › *If search is important, give it a primary position*: the wide header search and the mobile search row.
  - `feedback.md`: inline status rather than alerts.
  - `charting-data.md`: chart descriptions, plus a table alternative.
- **Vercel Web Interface Guidelines** (vercel.com/design/guidelines, fetched 2 Nov 2026). Applied guidelines:
  - 16 px inputs on mobile;
  - `touch-action: manipulation`;
  - a matching `theme-color`;
  - `overscroll-behavior: contain` on drawers and dialogs;
  - tabular numbers;
  - the ellipsis character in placeholders;
  - redundant status cues;
  - links styled as buttons are still `<Link>`;
  - layered shadows;
  - "interactions increase contrast" (hover rings get darker, never lighter);
  - `name` and `autocomplete` on checkout fields.
- **`dataviz` skill** (bundled). The chart palette was checked with its `validate_palette.js`. The mark specs (≤ 24 px bars, a 2 px gap between stacked segments, solid hairline grid, selective direct labels) come from its `marks-and-anatomy.md`.
- **v0 exploration** (private chat `qgTN6R34AqI`, used as a reference, not as code). Two ideas were adopted: product photos *mounted* on a neutral matte, and a hairline rule under each section heading. Its hard-coded hex values, −0.065em headline tracking and dark delivery band were rejected.

---

## 2. Colour tokens

Contrast figures are WCAG 2.x, computed from the hex values.

| Role | Token | Hex | Notes |
|---|---|---|---|
| **Primary** (action, text) | `ink-900` | `#14201e` | 16.7:1 on white. Primary buttons, body text (`text`) |
| Primary hover / pressed | `ink-700` / `ink-950` | `#2c3e3a` / `#0b1513` | |
| Dark surface | `ink-900` | `#14201e` | Footer, toasts, tooltips, the unsaved-changes bar |
| **Secondary** (links, selection, focus) | `brand-600` | `#0d6b63` | 6.4:1 on white, 5.8:1 on canvas |
| Link hover | `brand-700` | `#0a5650` | |
| Focus ring | `brand-500` | `#12807a` | 2 px outline, 2 px offset |
| Tints | `brand-50` / `brand-100` | `#ebf4f1` / `#d3e8e3` | |
| **Accent** (signal) | `marigold-500` | `#f2b33d` | Ink text on it (8.9:1). Never white text |
| Accent hover | `marigold-600` | `#d99a1e` | |
| Accent text on tint | `marigold-700` on `marigold-100` | `#7a5308` / `#fcf2da` | 6.1:1. Demo notices, "To confirm" |
| **Background** (app) | `canvas` | `#f5f5f1` | Staff app, storefront bands, summaries |
| **Surface** | `surface` | `#ffffff` | Storefront page, cards, panels, inputs |
| **Elevated surface** | `surface` + `shadow-pop` / `shadow-dialog` | | Overlays only: menus, dialogs, drawers, toasts |
| Image matte | `matte` | `#eceee9` | Every product photo well (`.matte`) |
| Sunken | `sunken` | `#f0f1ed` | Tracks, hovers, skeletons, avatars |
| **Main text** | `text` | `#14201e` | |
| Secondary text | `text-2` | `#4a5552` | 7.7:1 on white |
| **Muted text** | `text-3` | `#5f6966` | 5.7:1 white, 5.2:1 canvas, 4.9:1 matte. **Was 3.8:1; fixed** |
| **Borders**: hairline | `line` | `#e3e5e0` | Decorative separators only |
| Borders: divider | `line-strong` | `#c9cdc7` | Outline buttons, visible dividers |
| Borders: form control | `field` | `#878e88` | 3.4:1 on white, the non-text minimum for inputs. **Was 1.6:1; fixed** |
| **Success** | `success-600` / `-700` / `-100` | `#1b7446` / `#155c37` / `#dcefe3` | In stock, paid, completed |
| **Warning** | `warning-600` / `-100` | `#8a5a0e` / `#fbecc9` | Few left, awaiting payment |
| **Error** | `danger-600` / `-700` / `-100` | `#b42f25` / `#96261e` / `#f8dfdc` | Out of stock, errors, destructive |
| **Information** | `info-600` / `-100` | `#255a96` / `#dde8f5` | Placed orders, notices |
| Chart: shop till | `chart-shop` | `#00897b` | Validated pair, see §8 |
| Chart: online | `chart-online` | `#c47f00` | |

**Rules**

- One colour, one meaning. Teal is never a button fill. Amber is never a link.
- Amber appears in at most two places per view.
- Status colours always come with a dot plus a word (`Badge dot`, `StockLine`), never colour alone.
- Retired tokens: `clay` and the `shelf-edge` gradient rule were removed. They added a third accent with no job.
- Light theme only (`color-scheme: light`). Dark mode is out of scope for the prototype and listed as a limitation.

---

## 3. Typography

Two families, one job each.

| Family | Use | Weights |
|---|---|---|
| **Bricolage Grotesque** (variable, self-hosted) | Display only: the hero, page titles (h1), section titles (h2), the wordmark. Its slight irregularity reads as hand-painted shop signage, which suits a duka. | 600 |
| **Hanken Grotesk** (variable, self-hosted) | Everything else: UI, body, prices, data, panel and dialog titles | 400 / 500 / 600 (700 only on the receipt) |

**Scale** (tokens in `@theme`, used as `text-display`, `text-title` and so on):

| Token | Size / line-height | Tracking | Use |
|---|---|---|---|
| `display` | 44 / 1.04 | −0.025em | Storefront hero only. 28 px on phones, 36 px at 1024 |
| `title` | 30 / 1.12 | −0.02em | Storefront page h1. 26 px on phones. Staff h1 is 28 / 24 |
| `heading` | 22 / 1.2 | −0.015em | Storefront section h2 |
| `subhead` | 17 / 1.3 | 0 | Panel, dialog, drawer and summary titles (Hanken 600) |
| `body` | 15 / 1.55 | 0 | Body copy, inputs (16 px under 640 px to stop iOS zoom) |
| `sm` (Tailwind) | 14 / 1.43 | 0 | UI text, table cells, product names in cards |
| `small` | 13 / 1.4 | 0 | Labels, metadata, filters, nav |
| `caption` | 12 / 1.35 | +0.01em | Captions, badges, table heads, eyebrows (minimum size) |

**Prices:** Hanken 600 with tabular figures (`Price`, `.num`):
- 15 px in cards;
- 20 px in summaries;
- 28 px on the product page.

Prices are data, so they use the data face, not the display face.

**Rules**
- No uppercase micro-labels. Eyebrows and table heads are sentence case in `caption`/600/`text-3`.
- All money goes through `money()` (`Intl.NumberFormat`, `KES 1,250`). All counts, prices and times use `.num`.
- Headings use `text-wrap: balance`; paragraphs use `pretty`.
- Receipts use the system monospace so they read like till slips.

---

## 4. Layout

| | |
|---|---|
| Max width | Storefront `1280px` (`.container-page`). Staff content `1360px` beside a 240 px sidebar |
| Container padding | 16 px (under 640), 24 px (640+), 32 px (1024+) |
| Breakpoints | `xs` 420, `sm` 640, `md` 768, `lg` 1024, `xl` 1280 (Tailwind defaults plus `xs`) |
| Spacing scale | Tailwind 4 px base. In use: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80 |
| Section spacing | Storefront sections 48–56 px apart (`pt-12`/`pt-14`); bands 40–48 px internal padding. Staff panels 24 px apart |
| Product grid | 2 columns (phones), 3 (`md`), 4 (`xl`). Gaps 12/20 px horizontal, 32 px vertical |
| Listing | 208 px sticky filter column from `lg`; drawer below |
| Product detail | Gallery + info at `md` (1.05 : 1); gallery sticky at `top-32` |
| Checkout / cart | Form + 380–400 px summary from `lg`; summary first (collapsible) on phones |
| POS | Product area + 360–380 px sale column from `lg`; bottom sale bar and drawer below |

**Radii** (concentric: a child is never rounder than its parent):

| Token | Size | Use |
|---|---|---|
| `xs` | 4 | Tiny tags |
| `sm` | 6 | Controls: buttons, inputs, image thumbnails |
| `md` | 10 | Cards, panels, product image wells |
| `lg` | 14 | Hero panel, summaries, dialogs, gallery |
| `full` | | Badges, chips, switches |

**Elevation:** none on content. `shadow-pop` is for menus, toasts, hovered hero tiles, the switch thumb and the selected segment. `shadow-dialog` is for dialogs and drawers. `shadow-bar` is for fixed bottom bars. All shadows are two layers, tinted toward ink.

---

## 5. Components

All live in `src/components/shared/`, except the storefront and staff page components.

| Component | File | Spec |
|---|---|---|
| **Button** / `buttonClass()` | `ui.tsx` | Variants: `primary` (ink), `secondary` (white, divider border), `ghost`, `accent` (amber, rare), `danger`, `success`, `inverse`, `link`. Sizes: `sm` 32, `md` 40, `lg` 48, `icon` 40, `icon-sm` 32. Use `buttonClass()` for `<Link>`s that look like buttons. Never hand-roll button styles. Loading keeps the label and adds a spinner. |
| **Input / Textarea / Select** | `ui.tsx` | 40 px high, `field` border (3.4:1), hover `text-3`, focus `brand-600` plus a 3 px teal ring at 20%. Invalid: `danger-600` border plus a message under the field via `Field`. |
| **Field** | `ui.tsx` | Label (`small`/600), control, then hint or error. Errors carry an icon and `role="alert"`. |
| **Search** | `SiteHeader.tsx` | 44 px, `sunken` fill with a hairline ring, leading icon, embedded ink "Search" button. White on focus with a 2 px teal ring. |
| **Checkbox / radio** | `ui.tsx`, checkout | Native inputs with `accent-ink-900`. The whole label row is the hit target. |
| **Switch** | `ui.tsx` | For immediate on/off settings (product live/hidden). `role="switch"`, success-green when on, word label beside it. |
| **Segmented** | `ui.tsx` | Tabs for views and filters. `sunken` track; the selected segment is white with `shadow-pop`; counts as ink pills. |
| **Product card** | `ProductCard.tsx` | No border or shadow. 4:5 matte well, at most one badge (Sold out, then Few left, then New), brand eyebrow, 2-line name, price as the strongest text. A labelled **Add** button (ink, 36 px; shows "Added ✓" on success) or an **Options** outline when there are variants. The whole card is the link. |
| **Hero tile** | `HomePage.tsx` | White tile with a hairline ring on canvas, photo plus name/price row. Real product link. |
| **Category card** | `HomePage.tsx` | Horizontal: 56–64 px photo, name, blurb, count. White with a hairline ring; `shadow-pop` on hover. |
| **Badge** | `ui.tsx` | 20 px pill, `caption`/600. Tones: neutral, brand, accent, success, warning, danger, info, ink. Optional dot. |
| **StockLine** | `bits.tsx` | Storefront stock as dot plus words ("In stock · 20 on the shelf", "Only 3 left"). Quieter than a badge. |
| **Panel** | `ui.tsx` | Staff and order panels: white, hairline border, `md` radius, subhead title with optional description and action. |
| **Notice** | `ui.tsx` | Inline message strip: info, warning, danger, success or demo. Replaces ad-hoc coloured boxes. |
| **Table** | staff pages | `caption` sentence-case heads on `canvas/70`, 1 px row dividers, `sm` cells, numbers right-aligned with `.num`. Row hover on `canvas`. Clickable rows show a chevron. Below `md`, tables become stacked lists. |
| **Navigation**: storefront | `SiteHeader.tsx` | Light announcement line (open sign plus one message), sticky white bar (logo, search, Track, Cart with amber count), text category links with an ink underline when active. Phones: menu, logo and cart sticky; search row; chip row of categories on browse pages. Checkout uses a reduced focus header. |
| **Navigation**: staff | `StaffShell.tsx` | Light 240 px sidebar grouped *Sell* / *Manage*; the active item is an ink pill; counts as quiet pills (amber for new orders). The demo chip and user sit in the footer. Phones: top bar plus drawer. |
| **Dialog** | `ui.tsx` | Bottom sheet on phones, centred from `sm`. Subhead title, body, footer with actions on the right. Focus trap, Esc to close, focus returns to the trigger, `overscroll-behavior: contain`. |
| **Drawer** | `ui.tsx` | Left or right sheet with the same focus and overscroll rules. `bare` mode lets content supply its own header. |
| **Toast** | `toast.tsx` | Ink card, bottom-centre (phones) or bottom-right; success, error or info icon; optional action; `aria-live="polite"`. Errors stay 6 s, others 3.8 s. |
| **Forms** | checkout, staff | Steps separated by headings and hairlines, not boxes in boxes. Option cards have one selection indicator (radio plus a 2 px ink ring). Submit stays enabled; validation runs on submit and focuses the first error. |
| **Empty state** | `ui.tsx` | 48 px icon disc, subhead title, one sentence, then the next action. No dead ends. |
| **Loading** | `ui.tsx` | Skeletons shaped like the final content (`ProductGridSkeleton` matches the card), `Spinner` only for session checks, button `loading`. |
| **OpenSign** | `bits.tsx` | Green pulsing dot "Open now · until 19:00 today", or amber "Closed · opens 8:00 tomorrow". Falls back to the raw hours text if it can't parse them. |

---

## 6. Interaction states

| State | Treatment |
|---|---|
| Hover | Buttons darken one step. Outline and ring controls move their border to `text-3`. List rows and links get a `sunken`/`canvas` wash or an underline. Hover always **increases** contrast. |
| Focus | `:focus-visible` gives a 2 px `brand-500` outline, 2 px offset, on everything. Inputs add a 3 px teal ring at 20%. |
| Active / pressed | Primary goes to `ink-950`; POS tiles go to `sunken`. |
| Disabled | `line-strong` fill or `text-3` text, `not-allowed` cursor. A disabled primary action explains why beside it (POS: "Enter the cash received."; cart: "Remove unavailable items to continue"). |
| Selected | Ink: a 2 px `ink-900` ring (option cards, variant chips, thumbnails), or an ink fill for chips, segments and nav items. |
| Loading | Spinner plus the original label in buttons. Shaped skeletons for content. |
| Success | `success` tone with a word ("Added", "Paid", "Live"). Toast for actions completed off-screen. |
| Error | `danger` text and icon beside the field. Toast for rule violations (`DomainError`). Never colour alone. |

**Motion:** 150–220 ms ease-out for fades, sheet slides and dialog rise. A 1.025× image zoom on product-card hover. The open-sign pulse. Nothing animates in checkout. `prefers-reduced-motion` disables all of it.

---

## 7. Photography

The catalogue photos are the shop's WhatsApp status shots: real products with mixed backgrounds, packaging, overlay captions and an occasional watermark. They can't all be re-shot, so the system frames them consistently:

- **One well:** `ProductImage` on the `matte` colour with an inner hairline. Cards use a **4:5** cover crop, which suits the mostly 3:4 portrait sources better than the old 1:1. The product page uses a contained photo **inset** in the matte, so it is never cropped.
- **Hero art direction:** three products chosen because they were shot on light backgrounds (JC-7125 torches, phone-stand speakers, mini fans). The hero's own crops live in `public/products/hero/`, so watermarks and edge clutter are removed without touching the catalogue originals.
- **Fixed file:** `cooker-coil-1.webp` had black letterbox bars baked in. It was re-cropped to its content.
- **Missing or failed photo:** a neutral "No photo yet" or "Photo unavailable" placeholder in the same well. Never a broken image icon.

---

## 8. Data visualisation

- **Palette:** `chart-shop` `#00897b` and `chart-online` `#c47f00`. They pass every check in the dataviz validator against white: lightness band, chroma floor, CVD ΔE 11.9 (protan), normal-vision ΔE 21.8, and contrast ≥ 3:1. The previous teal (`#0e7d73`) failed the chroma floor.
- **Sales chart** (`SalesChart.tsx`): stacked columns, ≤ 24 px wide, with a 4 px rounded data-end, square at the baseline. The two segments are separated by a 2 px surface gap. Solid hairline gridlines.
- **Labels:** a legend with the 7-day totals. Direct labels on today and the best day only. A per-day hover/focus tooltip. A *Table* view for exact figures and screen readers.
- **Dashboard "Today"** is a stat block, not a chart: a headline figure, a fair comparison (vs the same time yesterday), and a two-part share bar that uses the same series colours with labelled values.

---

## 9. Accessibility checklist (applied)

- Text contrast ≥ 4.5:1 for all text tokens on every surface they're used on. Control borders ≥ 3:1.
- Touch targets:
  - ≥ 40 px for primary controls;
  - ≥ 32 px for secondary ones;
  - 44 px drawer rows;
  - 40 px POS cash keys.
- Skip link, one `h1` per page, landmark labels (`Categories`, `Staff`, `Account and cart`).
- Icon-only buttons have `aria-label`s. Decorative icons are `aria-hidden`.
- Status is never colour alone. Counts carry labels for screen readers.
- Live regions: toasts, the listing's result count, add-to-cart confirmation, and the POS change and owed amounts.
- `prefers-reduced-motion` is honoured globally.
