# Duka Letu: design audit

**Scope:** every customer and staff route of the prototype at commit `1f5799d`, reviewed in the browser and in code before any redesign work.
**Method:** production build (`next build && next start`). Playwright captured full-page screenshots of all 15 routes at 1440 px and 390 px with sample cart and staff session state. Every component in `src/components/**` and the token file `src/app/globals.css` was read. Contrast was computed from the hex values in the code, not estimated from screenshots.
**References actually used:**
- The installed `apple-design` skill (`.claude/skills/apple-design`), including its HIG pages `layout.md`, `typography.md`, `color.md`, `branding.md`, `searching.md`, `feedback.md`, `charting-data.md` and `accessibility.md`.
- The Vercel Web Interface Guidelines, fetched from vercel.com/design/guidelines on 2 Nov 2026.
- A private v0 exploration of the homepage brief, used as a reference only (see `DESIGN_SYSTEM.md › Sources`).

Severity scale, as used in the `apple-design` skill:
- **Critical:** an accessibility failure, or something unusable on a device size.
- **High:** real friction, a readability problem, or a template look with no point of view.
- **Medium:** a suboptimal pattern or inconsistency.
- **Low:** polish.

---

## 0. Summary verdict

**Overall: Needs work.** The prototype is functionally solid: state, permissions, stock sync, POS, simulated M-Pesa and the order lifecycle all work. The code is clean. The shortfalls are composition, hierarchy and restraint, not engineering.

The design's thesis is "a neighbourhood shop, now online". On screen it reads as a dark-teal marketing landing page sitting on top of a catalogue. The three biggest problems:

1. **The brand chrome competes with the products.** The page has three dark bands (utility strip, category bar, hero), a marigold rule, a dark footer and marigold CTAs. Dark teal fills about 45% of the first desktop screen and 100% of the first mobile screen. The HIG warns against exactly this (`branding.md › Best practices`): *"Ensure branding always defers to content … Apply your app's accent color judiciously."*
2. **Product photography is not art-directed.** The source photos are WhatsApp-status phone shots: busy backgrounds, packaging, overlaid captions ("Full ctn 120pcs", "Fk-0301-G"), a "Xender" watermark. One file (`cooker-coil-1.webp`) has black letterbox bars baked in. The UI presents these photos in square crops with borders on white. That amplifies the inconsistency instead of calming it. The hero collage picks four photos of different visual weight, including the noisiest kettle shot.
3. **Muted text fails WCAG AA throughout.** `text-3` (#767d7a) measures **3.83:1 on the canvas** and **4.21:1 on white**. It is used for most 11–13 px metadata: brand lines, "from", option counts, SKU, timestamps and table captions. Input borders (`line-strong` #cbc5b8) measure about 1.6:1 against white, below the 3:1 non-text minimum, so empty fields barely read as fields.

---

## 1. Cross-cutting problems (apply to every page)

| # | Sev | Problem | Evidence | Direction |
|---|-----|---------|----------|-----------|
| X1 | Critical | Muted text below 4.5:1 | `text-3` #767d7a: 3.83:1 on canvas, 4.21:1 on white; used at 11–13 px | New `text-3` ≥ 4.5:1 on every surface where it appears |
| X2 | Critical | Form control boundaries below 3:1 | `line-strong` #cbc5b8 ≈ 1.6:1 on white | Separate `border` (hairline, decorative) from `border-input` (≥ 3:1) |
| X3 | High | Too many dark bands; brand colour used as wallpaper | Utility strip, ink category bar, ink hero and ink footer all at once; the staff app adds a dark sidebar and a full-width marigold banner | Light-led system. Ink is for text and the primary action. A dark surface appears once per view at most (the footer) |
| X4 | High | No art direction for photography | Square crops of portrait (3:4) photos cut tops off; image wells sit on a canvas that differs from card white; the hero mixes photos with clashing backgrounds | One 4:5 product well on a neutral matte with an inner hairline; curated hero photos chosen for light backgrounds; fix the letterboxed file |
| X5 | High | Three accent roles competing | Marigold is used for the search button, CTAs, cart badge, hero highlight, category underline, shelf edge, demo banner and the staff active indicator. Teal is used for primary buttons, links and icons. Clay is used for "New" | Ink is the primary action. Teal means "interactive and selected". Amber is used rarely: cart count, the "open now" signal and one highlight. Clay is retired |
| X6 | High | Type scale is too large and too loud for a shop | Hero 58 px / 800; page h1 34 px; section h2 28 px. Bricolage at 700–800 everywhere, including 26 px KPI numbers | Compact scale (hero 44 / h1 30 / h2 22) at weight 600. Bricolage only for display, Hanken for everything else. Prices in Hanken tabular figures |
| X7 | Medium | Radii and borders inconsistent | `rounded-xs/sm/md/lg` mixed on adjacent elements; every card has a border **and** sits on a tinted canvas | 3 radii (6 controls, 10 cards, 14 media/panels). Cards on the storefront lose their borders |
| X8 | Medium | Raw values bypass tokens | `hover:bg-[#a42a21]`, `text-[#7a5208]`, `text-[#6b4a07]`, `#1da851`, `shadow-[0_1px_2px_rgb(...)]`, `h-4.5` | Every value comes from a token |
| X9 | Medium | Links styled as buttons by hand | About eight hand-rolled `inline-flex h-10 … bg-brand-600` links duplicate `Button` | `buttonStyles()` helper shared by `<Button>` and `<Link>` |
| X10 | Medium | No `touch-action: manipulation`, no tap-highlight colour, no `theme-color` that matches the new chrome | Vercel guidelines › Interactions / Design | Add to base layer |
| X11 | Low | Placeholders without an ellipsis and three-dot "…" mixed with "..." | Vercel guidelines › Content | Use the typographic ellipsis consistently |

---

## 2. Customer storefront

### 2.1 Header and navigation (all storefront pages)

| Sev | Problem |
|-----|---------|
| High | **Four stacked bars** on desktop: a utility strip (ink), the main bar (white), the category bar (ink-800) and the shelf-edge rule. That adds up to about 160 px of chrome, and three of the four bars carry high contrast. Every category link is equally prominent white-on-ink, so nothing is easy to scan. |
| High | The search field's submit button is solid marigold. It is the loudest element in the header and competes with the cart badge. Search matters, but its prominence should come from its width and position, not from colour. |
| Medium | The utility strip repeats three value props that the hero repeats again, followed by a "Track an order" link that also sits in the main bar. That is three entry points to Track on one screen. |
| Medium | Mobile: the category drawer is the only route to categories, and there is no visible category row. The shelf-edge rule sits under the search field and looks like a loading bar. |
| Low | The tagline under the logo is 12 px `text-3`, which fails AA (X1). |

**Direction:**
- One slim announcement line with a single message.
- A white main bar: logo, a wide neutral search field, then Track and Cart as quiet items. Cart gets the only amber (its count).
- Categories as plain text links on white, with an underline for the active one.
- Mobile: menu, logo and cart on row 1; search on row 2; a horizontally scrolling category row.
- On `/checkout`, a reduced "focus" header (logo, a secure-checkout note and Back to cart) and no catalogue navigation.

### 2.2 Homepage

| Sev | Problem |
|-----|---------|
| **Critical (mobile)** | The hero fills the **entire first 390×844 screen**: eyebrow, a 4-line 38 px headline, a paragraph, two stacked CTAs and three value props. The first product appears at about 1,250 px. For a shop, that is a landing page hiding the catalogue. |
| High | Desktop hero: the 58 px / 800 headline wraps to 3 lines ("Everything you / need, all in one / shop."). The left column ends around 460 px while the collage runs to 720 px, which leaves dead ink space. The copy is generic ("Everything you need, all in one shop") and could belong to any store. |
| High | The collage mixes four photos with clashing backgrounds: a black speaker on yellow, kettle boxes with a "Fk-0301-G" overlay, a green torch case on a peach wall and a solar lamp on cardboard. A floating white "48 products across 9 departments" card overlaps one tile. The images aren't links, so the most prominent visuals on the page do nothing ("No dead zones", Vercel). |
| High | **The same products repeat** in Featured, Popular and New arrivals. On the first screenful of Popular, 3 of 4 products already appeared above, and New arrivals repeats them again. It feels like a small catalogue padded out. |
| Medium | Category tiles (9 across at 1440) are about 120 px wide. They use square crops of busy photos, a 13 px label and an 11 px count that fails AA. The icon and the photo both say "category", which is redundant. |
| Medium | Six sections at the same visual weight with 64 px gaps. The delivery band and the "trust strip" make overlapping claims (pickup, live stock, no account), so the page has two "why us" sections. |
| Low | "See all" for Featured links to `/products` unsorted rather than to featured items. |

**Direction:**
- A compact, asymmetric hero inside the container (about 400 px desktop, about 260 px mobile).
  - Left: a live "Open now / Closed" signal parsed from Settings hours, a 2-line headline specific to the shop, one sentence, "Shop all products" and three facts in one row.
  - Right: three **real, clickable featured products** with curated, light-background photos (one tall, two stacked), each labelled with name and price. This is product-led storytelling, not decoration.
- On mobile the product trio becomes a swipeable row, so products are visible on the first screen.
- Categories as a quiet rail.
- Featured, Popular and New are de-duplicated against each other.
- Delivery, payment and trust merge into one compact band.

### 2.3 Product listing and category

| Sev | Problem |
|-----|---------|
| High | Product cards each have a border, a square crop and an absolutely positioned badge stack. The "+" button is an unlabelled icon. Its accessible name is fine, but sighted users can't tell "+" (adds instantly) from "Choose" (navigates). The grid reads as a wall of boxes. |
| Medium | The filter sidebar uses eight 13 px uppercase legends at the same weight. Budget chips plus min/max inputs offer two ways to do the same thing in 220 px. The brand list is plain checkboxes. |
| Medium | The mobile listing has no category row. Filters open a drawer, which is fine, but the sort select's text "Sort: Featured" truncates at 390 px. |
| Low | The result count sits under a 34 px title. The breadcrumb is 13 px `text-3`, which fails AA (X1). |

**Direction:**
- Borderless cards on a 4:5 matte well with a labelled "Add" / "Options" control.
- A denser 4-column grid at ≥ 1280 px and 3 columns at 1024 px.
- Filter groups with sentence-case headings and counts.
- A category chip row at every width.
- A result count with active-filter chips in one toolbar line.

### 2.4 Product detail

| Sev | Problem |
|-----|---------|
| High | The mobile sticky bar offers only **Buy now** (which jumps to checkout). On mobile, "Add to cart" sits in the page while "Buy now" is hidden from the page but fixed at the bottom. Two different primary actions compete across breakpoints. |
| Medium | The price (28 px Bricolage) and the stock badge share a line, while the SKU sits below in `text-3`. The variant buttons repeat the same price on every option even when all prices are equal (JC-7125: four × "KES 300"). |
| Medium | The gallery is `object-contain` on a white bordered box, so portrait photos float with large side gutters. Thumbnails are 80 px with a 2 px teal border. |
| Low | The delivery/pickup info list uses three bordered rows with teal icons. It works, but it's visually heavier than the description above it. |

**Direction:**
- A 4:5 gallery well with thumbnails underneath.
- Info column order: brand, name, price (the largest text), stock line, variant chips (price shown only when it differs), quantity, then one primary **Add to cart** (ink) with Buy now as secondary.
- The mobile sticky bar mirrors the same two actions in the same order.

### 2.5 Cart

| Sev | Problem |
|-----|---------|
| Medium | The summary says "Delivery: Free pickup, or from KES 100", which is useful. But "Total so far" is ambiguous, and the checkout CTA is marigold while the rest of the system uses teal for primary actions. |
| Medium | Line items show the price twice on desktop (hidden on mobile, shown on desktop). The "Remove" ghost button with a trash icon is low-contrast `text-2`. |
| Low | The page is very short on desktop, and the footer starts at y ≈ 310. Large dark mass under a light page. |

**Direction:** keep the structure. Use the same summary component as checkout ("Subtotal / Delivery / Estimated total"), make the CTA ink, use a quieter footer, and add a link to keep shopping.

### 2.6 Checkout

| Sev | Problem |
|-----|---------|
| High | The full catalogue header and footer are shown, and every category link is an exit from the funnel. |
| High (mobile) | The order summary and **total** sit at the very bottom, after three long sections (~2,100 px). The customer fills out everything without seeing what they pay. |
| Medium | Each radio "OptionCard" has a radio, an icon circle that turns solid teal when selected, a title, an aside and a description. That is two selection indicators per option. Step numbers sit in dark ink circles. Payment options use the same phone icon for Till and Paybill. |
| Low | The CTA reads "Place order & pay KES 2,050", which is good. Keep it. |

**Direction:**
- Focus header, no footer navigation.
- Mobile: a collapsible summary bar ("Order total KES 2,050 · 3 items ▾") at the top of the form, plus the sticky CTA area at the end.
- Option cards with one selection indicator (the radio plus a teal border), and a quieter icon.
- Sections divided by headings, not boxes within boxes.

### 2.7 Order confirmation, Track order, M-Pesa dialog

| Sev | Problem |
|-----|---------|
| Medium | The confirmation hero is an ink block with a marigold order number, another dark band. The status tracker's step labels at 12 px are fine, but its timestamps are hidden on mobile. |
| Medium | Track page: an icon circle, a 34 px title, a paragraph, and a form in a bordered card beside it. The page has a lot of empty space before the result appears below. |
| Low | The M-Pesa dialog's phone mock is charming and clearly labelled as a simulation. Keep it. Use tokens for the hard-coded #f3f4f2 and #6b4a07. |

**Direction:** light confirmation header (success tick, "Order DL-10015 received", copy-number button), the tracker in a panel, the same detail panels used for Track. Track becomes a narrow single-column form that expands into the result.

---

## 3. Staff application

### 3.1 Shell

| Sev | Problem |
|-----|---------|
| High | A full-width **marigold demo banner** sits above everything on every page, in uppercase. It is the loudest element in the app and permanently steals 24 px. |
| High | The dark-ink sidebar with marigold active rails is the generic "admin template" look. Its 11 px uppercase "SHOP MANAGER" fails contrast at white/50. |
| Medium | The mobile top bar repeats logo, shop name and role chip, and the menu opens a drawer whose own title bar says "Menu" above another logo header. |

**Direction:**
- A light sidebar on the canvas, grouped into *Sell* (Dashboard, Orders, Point of sale) and *Manage* (Products, Inventory, Staff, Settings).
- An ink pill for the active item, with counts as quiet badges.
- The demo notice becomes a small persistent chip in the sidebar footer and mobile top bar.

### 3.2 Dashboard

| Sev | Problem |
|-----|---------|
| High | Five KPI tiles plus a dark hero tile: six boxes with 26 px numbers of equal weight. "Low / out of stock 20 / 2" is a fraction-looking number that needs explaining. "Sales today" is red "▼ 56%" by mid-morning, comparing a partial day with a full day, which is misleading. |
| Medium | The chart is good: stacked, direct-labelled, with a table toggle. Its legend totals (48.3K / 51.3K) compete with the bar labels, and bar labels sit inside the 12.5K dashed gridline. |
| Medium | The "Stock alerts" list and the "Low / out" tile duplicate each other. "Recent activity" is a long undifferentiated list. |

**Direction:**
- A "Today" summary row: one headline figure (sales today) with the shop/online split as inline figures and a proportion bar, plus a fair comparison ("vs same time yesterday").
- Two **action counters** (orders to pack, variants to restock) that read as tasks, not trophies.
- Then a chart and top sellers row, then recent orders, stock alerts and activity.
- Chart reviewed against the `dataviz` skill.

### 3.3 Orders

| Sev | Problem |
|-----|---------|
| Medium | The table is solid. Status and payment badges look alike (both tinted pills) and sit in separate columns, so a scan for "needs action" takes work. Rows are clickable, but nothing on the row signals it. |
| Medium | The drawer's footer is right, with the primary next-step action. The body has four uppercase 12 px section headings and three bordered boxes. |

**Direction:** a row chevron and hover state; status as a dot plus label; payment as text with a warning colour only when unpaid. A drawer with sectioned lists and no nested borders.

### 3.4 Products

| Sev | Problem |
|-----|---------|
| Medium | The list rows wrap awkwardly on narrow widths. There are four icon-only actions per row (hide, edit, view, delete) with equal weight, and the destructive one is red in every row. |
| Medium | The marigold info banner is permanent. The product editor dialog is good, but the variant editor rows wrap into a 2-column grid on mobile and lose their labels' alignment. |

**Direction:**
- A proper table at ≥ 768 px, with a thumbnail, name with badges, category, price, stock, a status toggle and a row menu (Edit primary; View, Hide and Delete in an overflow).
- Card list on mobile.
- The demo notice collapses into one dismissible line.

### 3.5 Inventory

| Sev | Problem |
|-----|---------|
| Medium | Four equal KPI tiles, two of which are not actionable ("Tracked variants", "Units in stock"). Quantity is set in Bricolage 16 px bold in a table, a display face doing data work. |
| Low | The movement log is good. Its badge icons are inconsistent sizes. |

**Direction:** a compact summary line with two actionable counters (low, out) as filter toggles. Quantity in tabular Hanken with a small inline level meter relative to the threshold.

### 3.6 Point of sale

| Sev | Problem |
|-----|---------|
| High | The product grid uses 4:3 photos at about 170 px wide. Long scroll, 16+ tiles per screen, and the photos dominate where a cashier needs the name, price and stock. The cart panel's top sits 60 px lower than the search field, so the two columns don't align. |
| Medium | Cash quick-amount chips are tiny (24 px tall). "Complete sale" is disabled grey until conditions are met, and it doesn't say what's missing. There's no keyboard shortcut to return to search. |

**Direction:**
- A dense product grid with small square thumbnails, name, price and stock.
- The cart column aligned with the search field top.
- Larger cash keys (≥ 40 px).
- A helper line under the disabled "Complete sale" button that says what's missing.
- `/` focuses search.

### 3.7 Staff (team), Settings, Login

| Sev | Problem |
|-----|---------|
| Medium | The team page uses cards with three outline buttons each. Fine for 4 people, but noisy. |
| Medium | Settings uses section headings on the left and bordered panels on the right. Good structure, with heavy borders. The "Saved" button disabled in the header plus a floating unsaved bar is two save controls. |
| Medium | Login: a split screen with a dark-ink half and a marigold demo box. Readable, but it's the fourth large dark surface in the product. |

**Direction:**
- Team as a list/table with a row overflow menu.
- Settings keeps the two-column grouping on lighter panels, with one save bar.
- Login on the light canvas: a single centred panel, the shop identity, and demo accounts as a compact list.

---

## 4. Responsive findings (390 / 768 / 1024 / 1440)

- **No horizontal overflow** on any route at 1440 or 390. `scripts/responsive-sweep.js` reports `overflowX=0` everywhere. Keep that.
- **390:**
  - Hero-only first screen (Critical, 2.2).
  - Checkout total hidden (High, 2.6).
  - The PDP sticky bar action differs from the in-page one (High, 2.4).
  - POS cart opens in a drawer, which is fine.
- **768:**
  - The header's search shares the row with logo, Track and Cart. It holds up, but the category bar is hidden below 1024, so tablet has no category navigation except the drawer.
- **1024:**
  - The 9-column category grid collapses to 5 columns, leaving a 4-tile orphan row.
  - The staff sidebar appears at 1024 and the content gets ~780 px. The dashboard's six tiles wrap 3 + 3, fine.

## 5. Functional observations (not redesign targets)

All workflows the brief lists were exercised by `scripts/e2e-workflows.js` and by hand, and they work. One data issue found:

- `public/products/cooker-coil-1.webp` contains baked-in black letterbox bars (top and bottom, ≈ 30% of the frame). In any cover crop the product appears as a thin strip between black bands. **Fix:** re-crop the file to its content box.

## 6. Proposed design direction (summary, detail in `DESIGN_SYSTEM.md`)

**"The counter, not the billboard."** A light, quiet frame that lets the shop's real stock carry the page.

- **Colour:**
  - Neutral paper and white surfaces.
  - Near-black green **ink** for text and the primary action.
  - Deep **teal** only for links, selection and focus.
  - One **amber** signal used for the cart count, the live "Open now" status and the demo marker.
  - Status colours keep their meaning and always come with a label.
- **Type:** Bricolage Grotesque at 600 for display only (hero, page titles, section titles). Hanken Grotesk for all UI, prices and data, with tabular figures. The scale is cut by about 25% from the current one.
- **Photography:** a single 4:5 product well on a neutral matte with an inner hairline. Curated light-background shots for the hero. Fix the broken file.
- **Signature:** the hero's **"Open now" counter sign**, a live status computed from the shop's hours with pickup timing. It belongs to this business: a duka is defined by its counter and its hours. Everything around it stays quiet.
- **Staff app:** the same tokens, a light shell, information density over decoration, and action counters instead of trophy tiles.
