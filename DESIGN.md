# Elysium Guild

## Overview

The page is a single, full-viewport view of an orbital ring habitat above Earth. The only visible words are **elysium guild**. The station is the visual identity; there are no navigation sections, slogans, forms, cards, or footer. A circular plus/minus button lets visitors move closer to the station.

The existing React, TypeScript, and Vite stack is retained. The implementation lives in `src/App.tsx` and `src/styles.css`. This document describes that source, not a proposed system.

## Colors

The source uses OKLCH throughout the interface. Primitives are defined at `src/styles.css:11`; components consume the semantic roles below. There is one dark theme.

| Semantic token | Primitive / exact value | Role |
| --- | --- | --- |
| `--color-bg` | `--ink-950`: `oklch(0.12 0.012 220)` | Page and loading background |
| `--color-control` | `--ink-900`: `oklch(0.18 0.015 220)` | Opaque button surface |
| `--color-control-hover` | `--ink-800`: `oklch(0.26 0.015 220)` | Hover and active button surface |
| `--color-control-border` | `--ink-600`: `oklch(0.51 0.015 220)` | 1px button boundary |
| `--color-text` | `--ivory-100`: `oklch(0.97 0.012 85)` | Name and button icon |
| `--color-text-halo` | `--ink-950` | Dark halo behind enlarged lettering |
| `--color-focus` | `--gold-300`: `oklch(0.85 0.09 85)` | Keyboard focus indicator |

The artwork supplies its own gold, green, and blue colors. The favicon is a separate SVG with a dark `#030708` tile, `#e6cd90` ring, and `#faf4e9` front edge. The browser theme color is `#030708`.

Text-over-image and focus contrast were measured from rendered pixels, including the text halo. Measurements and their limitations are in [the validation record](artifacts/validation.md). In forced-colors mode, the title uses `Canvas`/`CanvasText`, the button border uses `ButtonText`, and the focus outline uses `Highlight`.

## Typography

One family, one weight, one display size token:

- **Family:** `--font-display: 'Space Grotesk Variable', 'Arial', sans-serif`.
- **Local font:** the Latin WOFF2 from the existing `@fontsource-variable/space-grotesk` dependency. `src/styles.css:1` declares the 300–700 weight range with `font-display: swap`; the page uses weight **400** only.
- **Size:** `--text-display: clamp(2.5rem, 6.25vw, 6rem)`: 40px at 390 wide, 90px at 1440, and a 96px cap with normal browser text settings.
- **Line height:** 1.1; **tracking:** -0.055em; lowercase content is stored as lowercase rather than transformed.
- **Wrapping:** centered, balanced, and allowed to wrap between the two words. No clipping, truncation, or forced single line.
- **Halo:** `0 0 2px var(--color-text-halo), 0 2px 12px var(--color-text-halo)`. It protects lettering when enlarged text overlaps the bright station rim.
- Text remains selectable. Selection uses the ivory background and dark foreground tokens.

The font loaded successfully in the Chromium checks. Its SIL Open Font License is in `public/licenses/space-grotesk.txt` and is included in the export.

## Layout

`.scene` is a centered CSS grid with `min-block-size: 100svh` and a `100vh` fallback. Its 7rem block padding reserves room for the name and control without fixing the text container's height. The full-bleed image is in an independently clipped, non-interactive background layer. Only the media is clipped.

`--space-edge: clamp(24px, 3.125vw, 48px)` sets the horizontal margins and control inset. Physical pixel endpoints keep the margins from consuming the viewport when the reader enlarges text. Safe-area inset values are included. The button uses logical inline positioning, so it mirrors in RTL.

The single composition breakpoint is an **aspect ratio of 3/4**, shared by `<picture>` and CSS:

- At or below 3/4, use the dedicated 1024 × 1536 portrait artwork and center the name vertically.
- Above 3/4, select the 960 × 640 or 1536 × 1024 landscape artwork through `srcset`. The name has 0.8em bottom padding to position its lettering inside the ring's opening.
- Images fill the viewport with `object-fit: cover` and centered cropping. Cropping at narrow/tall and very wide sizes is intentional; the ring remains recognizable.
- The 48 × 48px control sits at the bottom trailing corner, within the first screen at 390 wide. It scales with text settings through its 3rem size.

The source uses `fetchPriority="high"` for the artwork, native responsive image selection, and no external image or font requests. Checked widths: 320, 390, 768, 844 in landscape, 1440, and 1920. Two-hundred-percent text enlargement was checked at 320 and 390; this is separate from browser-native zoom.

## Elevation & Depth

The scene uses `isolation: isolate`; the background frame is at z-index -1 and the title and button sit above it. The image overlay is an sRGB vertical gradient: black at 8% opacity at the top, transparent from 26% to 72%, and black at 42% at the bottom. It keeps the lower control area calm without flattening the ring.

There are no cards, elevated panels, box shadows, or image frames. The title halo is a legibility treatment, not a surface.

## Shapes

The only interface shape is the circular button: 50% radius, a 1px border, and an opaque fill. The plus/minus artwork is a 24px SVG with a consistent 1.5px round stroke, using `currentColor`. The circular form echoes the orbital ring.

Keyboard focus uses a **3px outline with -6px offset**, inside the opaque button. Keeping the ring on that known surface preserves contrast over bright parts of Earth.

## Components

### Station scene — `src/App.tsx`

`App` renders one named `<main>`, one informative `<picture>`/`<img>`, one `<h1>`, and one native button. The artwork has descriptive alternative text. Labels and metadata add accessibility and share information without adding visible words.

`.scene__frame`, `.scene__art`, and `.scene__name` are local composition patterns rather than a general component library. A future scene can reuse these classes with a matching portrait/landscape asset pair.

### View control — `src/App.tsx:38`, `src/styles.css:108`

- Accessible name: **View station closer**.
- `aria-pressed` exposes the current state; `aria-controls` points to the artwork.
- Overview: plus icon, artwork at scale 1.
- Closer: minus icon, artwork at scale 1.22, transform origin 50% 48%.
- A second activation returns to the overview. Escape also resets it; the Escape shortcut is announced only while closer mode is active.
- Native Tab, Enter, and Space work. Focus stays on the control through state changes.
- Hover is limited to devices that support hover. Hover and active states lighten the button.
- Without reduced motion, artwork changes over 900ms with `cubic-bezier(0.2, 0, 0, 1)`; button background, press feedback, and icon opacity use 150ms. Press scale is 0.96.
- With reduced motion, all changes are immediate. There is no autoplay, looping animation, or page-load entrance.
- This is an in-page zoom, not browser full screen. There is no network operation, loading spinner, modal, saved state, or account flow.

## Do's and Don'ts

- Preserve the requested two visible words. Additional body copy, navigation, or sections would change this brief.
- Reuse the semantic colors, the single type scale, and the view-control pattern.
- Keep labels in accessible attributes for icon controls, and retain the native button.
- Keep the name and control outside the clipped media layer.
- Preserve portrait art direction and reduced-motion behavior when changing the artwork.
- For another view in a future authorized extension, start with the existing scene classes, supply both image orientations, and repeat contrast checks after substituting the art.
- Do not add wallets, counters, sound, or simulated live data to this static scene.

## Guidance attribution

Design review followed the supplied adaptation of Jakub Krehel's **Better Interface**, MIT, commit `267330e1adfc66a718fb65fa6918c1f06d0a689e`. Documentation organization follows the supplied adaptation of Paul Bakaus's **Impeccable**, Apache-2.0, commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`. Copyright and license notices are retained in [artifacts/licenses/design-guidance.txt](artifacts/licenses/design-guidance.txt).
