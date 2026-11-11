# Elysium Spacing Guild: design system

Taken from the final source: `src/styles.css` (all tokens and component styles), `src/App.tsx`, `src/components/*.tsx`, `index.html`. If this file and the source ever disagree, the source wins. Update this file when you change it.

## Overview

A one-page site for the Elysium Spacing Guild, a guild that trains spacers and plots burns between settled worlds. As the brief asks, the top of the page uses an inspiring space photograph as its background: NASA's 1984 photo of Bruce McCandless flying untethered above Earth (`src/assets/hero-*.webp`, public domain). The headline, "Untethered, we go further", comes from that image.

The visual character is quiet and dark: a deep navy page, one amber accent kept for actions and highlights, and a geometric display face for headings. The page's main tool sits on the first screen at every width: the **Plot a jump** route planner. Under the hero the sections are Routes (map and station list), Disciplines, Sign the charter (a form that produces a downloadable charter) and Before you sign (FAQ). Nothing is sent to a server. Station positions are a fixed, documented snapshot, and transit times are computed from them.

These rules apply to the whole system: one filled (amber) action per view, surfaces separated by tone instead of borders, section headings that pair a short title with one plain sentence, and no kicker labels or all-caps text.

## Colors

Defined in `src/styles.css:6-31` in `oklch()`. Components use **only the semantic tokens**. The primitives (`--ink-*`, `--amber-*`, `--red-300`) exist only to feed them.

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `--ink-950` `oklch(0.15 0.025 262)` | Page background, input fields, segmented-control track, photo fade target |
| `--color-surface` | `--ink-900` `oklch(0.19 0.03 262)` | Planner panel, discipline tiles, map background, charter card |
| `--color-surface-raised` | `--ink-850` `oklch(0.23 0.032 262)` | Selected segment/choice, hover fill of secondary buttons |
| `--color-border` | `--ink-700` `oklch(0.38 0.035 262)` | Field and secondary-button outlines, list dividers, map orbits |
| `--color-text` | `--ink-100` `oklch(0.96 0.008 262)` | Headings and body text |
| `--color-text-secondary` | `--ink-300` `oklch(0.83 0.02 262)` | Lede, labels, metadata, notes, footer |
| `--color-accent` | `--amber-400` `oklch(0.8 0.14 62)` | Primary button fill, selected outline, map route and Sun, logo ring |
| `--color-accent-hover` | `--amber-300` `oklch(0.86 0.11 62)` | Primary button hover |
| `--color-on-accent` | `--amber-950` `oklch(0.22 0.04 62)` | Text on amber |
| `--color-focus` | `--amber-300` | 2px `:focus-visible` outline |
| `--color-error` | `--red-300` `oklch(0.8 0.12 25)` | Inline field errors and invalid field borders |

The page is dark only (`color-scheme: dark`). There is no light theme. The hero photo is faded into `--color-bg` with gradients in `.hero__media::after`. `index.html` sets `theme-color` to `#0b0f1a`, and the favicon (`public/favicon.svg`) and charter SVG (`src/lib/charter.ts`) use hex equivalents, because a standalone file cannot read CSS tokens.

## Typography

- **Families (2):** `--font-display` is Space Grotesk Variable, bundled locally through `@fontsource-variable/space-grotesk` (`src/main.tsx` imports `wght.css`, woff2 files in `dist/assets/`). It is used for headings, buttons, stat values and FAQ summaries. `--font-body` is the system UI sans stack, used for everything else.
- **Weights (2):** `--weight-regular` 400 for body text, `--weight-strong` 600 for headings, labels, buttons and selected states.
- **Sizes (5):**

| Token | Value | Roles |
| --- | --- | --- |
| `--text-sm` | 0.875rem / 14px | Labels, legends, metadata, notes, field errors, footer, map labels |
| `--text-base` | 1rem / 16px | Body text, inputs and selects (16px stops iOS zoom), hero lede below 40rem |
| `--text-lg` | 1.25rem / 20px | h3, planner title, stat values, FAQ summaries, section intros, hero lede from 40rem |
| `--text-xl` | clamp(1.75rem → 2.25rem) | h2 section headings |
| `--text-display` | clamp(2.5rem → 4.5rem) | The single h1 |

- **Line height:** h1 1.02, h2 1.1, h3 1.2, body 1.55, lede and section intros 1.45.
- **Letter spacing:** h1 -0.035em, h2 -0.02em, otherwise natural. Nothing uses uppercase.
- **Wrapping:** headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`. FAQ answers are capped at 65ch and section intros at 40rem. Stat values use `white-space: nowrap` and `tabular-nums`, so a value like "8 days 15 h" never splits. "0.3 g" values use `.segmented__value { white-space: nowrap }`. Names in the charter card wrap with `overflow-wrap: anywhere`. Nothing is truncated.

## Layout

- **Spacing scale:** `--space-1`…`--space-8` = 4, 8, 12, 16, 24, 32, 48, 80px. Gaps inside a group are 8–16px and gaps between groups are 24px or more.
- **Gutter:** `--gutter: clamp(1rem, 0.6rem + 2vw, 2.5rem)`. Content width: `--content-max: 75rem`, centered.
- **Sections:** `.section` has 80px top padding. `.section__head` is the title and intro pair (max 40rem, 32px below).
- **Breakpoints** (in rem, chosen where the content stops fitting):
  - `< 40rem`: in the planner, From and To stack, with the swap button beside both (`grid-template-areas: 'from swap' 'to swap'`), so long station names never clip. The hero lede is 16px. The photo is a band at the top of the hero (`.hero__media`, `inset-block-start: 3rem`, height `min(100vw, 24rem)`) that fades to the page color. The headline starts at `min(44vw, 16rem) + 3rem`.
  - `≥ 40rem`: From, swap and To sit in one row, the swap arrows turn sideways, and the lede is 20px.
  - `≥ 48rem`: section links (Routes, Disciplines, Questions) appear in the header.
  - `≥ 60rem`: the hero is `min(100svh, 62rem)` tall and centered vertically. The photo fills the right 60% (`inset: 0 0 0 40%`) with a fade on its left edge, the copy and planner sit in a 28rem left column over the dark field, Routes becomes map plus list in two columns (the map is sticky), and Join becomes form plus charter in two columns.
- **Measured first screen** (Chromium, see `artifacts/validation.md`): the **Plot route** button's bottom edge is at 769px on 320×844, 804px on 390×844, 819px on 768×844 and 717px on 1440×900. There was no horizontal overflow at any of these widths.
- Uses logical properties (`inset-inline`, `padding-inline`, `margin-inline-end`, `border-block-*`).

## Elevation & Depth

The interface is mostly flat and uses tone for depth: `--color-bg`, then `--color-surface`, then `--color-surface-raised`. Two exceptions:
- `.planner` has the only drop shadow (`0 0 0 1px oklch(1 0 0 / 0.08), 0 24px 48px oklch(0 0 0 / 0.35)`), which lifts the main tool off the photo.
- `.charter` (the signed charter) uses an inset 1px amber ring (`box-shadow: inset 0 0 0 1px var(--color-accent)`) to mark the result. The empty state drops it.

No surface has both a border and a shadow, and no card sits inside another card. The header is `position: absolute` over the hero, not sticky.

## Shapes

`--radius-sm` 8px (segment options, skip link), `--radius-md` 12px (buttons, fields, track, choice options), `--radius-lg` 20px (planner, tiles, map, charter card). Lists (stations, FAQ) use 1px `--color-border` dividers between rows instead of boxes.

## Components

| Component | Source | Use and states |
| --- | --- | --- |
| Button | `.button`, `.button--secondary`, `.button--small` in `src/styles.css` | Primary is amber-filled, with one per view (Plot route, Sign the charter, Join). Secondary is outlined (Plot a jump rows, Download charter). Min height is 48px (44px small). States: hover (only under `hover: hover`), `:active` scale 0.96 (turned off under reduced motion), and the 2px focus ring. Transitions name their properties and run 150ms on `--ease-out`. |
| Icon button | `.icon-button` | 44×44 outlined square. Needs `aria-label` (the swap button uses "Swap origin and destination"), and its SVG is `aria-hidden`. |
| Field | `.field` + `label` + `input[type=text]` / `select` | Visible label above the control. Error state: `aria-invalid="true"` gives a red border, and `.field-error` text is linked through `aria-describedby`. Validation runs on submit and focus moves to the first invalid field. |
| Segmented radio | `fieldset.segmented` | Native radios layered invisibly over the labels, so arrow keys work. The checked option gets a raised fill and an amber ring. The focus ring is drawn on the option with `:has(input:focus-visible)`. |
| Choice list | `fieldset.choice` | Visible native radios in bordered rows, two columns. The checked row gets an amber border. |
| Route planner | `src/components/Planner.tsx` | The main action. It has an empty state, a result (route line, three stats, a burn note) and a same-station error. The result sits in a `role="status"` region that is always present. |
| Route map | `src/components/RouteMap.tsx` | SVG `role="img"` whose title names the plotted route. Orbits are drawn on a square-root scale, and the active stations and the dashed route turn amber. |
| Station row | `.station` in `src/App.tsx` | Name, meta and summary, plus a secondary "Plot a jump" button that fills the planner's destination and moves focus to it. |
| Charter form and card | `src/components/JoinForm.tsx`, `src/lib/charter.ts` | Has an empty state ("Your charter appears here"). On success, focus moves to the card heading and **Download charter** saves an SVG file built in the browser. |
| FAQ | `.faq details` | Native `<details>`. A `+` or `−` marker shows its state. |
| Skip link | `.skip-link` | The first element you can Tab to. It is hidden off-screen until focused. |

## Do's and Don'ts

- **Do** use semantic color tokens. Add a role token if one is missing, and never borrow `--color-border` for text.
- **Do** keep to the five size tokens and two weights. A new heading level reuses `--text-lg` or `--text-xl`.
- **Do** give each view exactly one amber-filled button. Peers use `.button--secondary`.
- **Do** put directions and privacy notes next to the control they explain, the way `.join__privacy` sits under its submit button.
- **Don't** add kicker labels above headings, uppercase text, em dashes or emoji to interface text.
- **Don't** put a border and a shadow on the same surface, or nest tiles inside the planner.
- **Don't** imply shared or live data. This is a static site, and any number it shows must be computed or stated as fixed.
- **Adding a page section:** add a `<section className="section" id="…" aria-labelledby="…">` with a `.section__head` (an h2 plus one plain sentence). Build the content from `.button`, `.field` and surface tiles (`--color-surface`, `--radius-lg`, `--space-5` padding). Add a header link if it is a primary destination. Then run the probe and `npm test`.
