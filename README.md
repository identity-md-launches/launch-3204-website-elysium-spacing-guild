# Elysium Guild

A minimal space scene: **elysium guild** over a ring-shaped orbital station above Earth. The old planner, forms, navigation, and text sections have been removed. A single plus/minus button brings the station closer; activate it again or press Escape to return.

The production website is in **dist/**, with every runtime image, font, script, and style included locally. It uses relative URLs and works under a static-hosting subpath. No backend, wallet, account, or external API is involved.

## Install

Use Node.js 20.19+ (20.x), or 22.12+ as supported by the locked Vite version.

```sh
npm ci
```

The existing package manifest, lockfile, and build configuration are preserved. No new application dependencies were added.

## Preview and rebuild

```sh
npm run dev         # source preview
npm run typecheck   # TypeScript, no output
npm test            # component interactions and retained utility tests
npm run build       # typecheck, then regenerate dist/
npm run preview     # preview the finished export
```

To preview without installing build dependencies:

```sh
python3 -m http.server 4173 --directory dist
```

Open the printed HTTP address. Serve the complete `dist/` directory; opening ES modules directly with `file://` is unsupported. The hosting pipeline serves this export without rebuilding it, so include the regenerated `dist/` with every source change. No publishing or deployment command is required by this repository.

## Files

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Scene, accessible image, heading, and view control |
| `src/styles.css` | Font, tokens, layout, motion, and component states |
| `src/assets/station*.webp` | Landscape, small landscape, and portrait art |
| `index.html` | Title, description, favicon, Open Graph, and social metadata |
| `public/` | Favicon, 1200 × 630 share image, font license |
| `dist/` | Complete production export |
| `tests/app.test.tsx` | Visible-content, click, and keyboard regressions |
| `tests/browser.mjs` | Optional checks against the actual export |
| `tests/contrast.mjs` | Pixel contrast measurement using the browser captures |
| `DESIGN.md` | Implemented design system |
| `artifacts/validation.md` | Commands, six-domain review, fixes, and limitations |
| `artifacts/previews/` | Final desktop and phone screenshots |

The old calculation helpers in `src/lib/`, their data, and their tests remain intact but are not imported by the website.

## Production browser validation

The optional browser tools can be installed in the ignored scratch directory without changing the project's dependencies:

```sh
npm install --prefix test/scratch/browser-tools playwright axe-core sharp
PLAYWRIGHT_BROWSERS_PATH=test/scratch/browsers node test/scratch/browser-tools/node_modules/playwright/cli.js install chromium
IMD_PLAYWRIGHT=test/scratch/browser-tools/node_modules/playwright/index.mjs \
PLAYWRIGHT_BROWSERS_PATH=test/scratch/browsers \
IMD_AXE=test/scratch/browser-tools/node_modules/axe-core/axe.min.js \
node tests/browser.mjs
IMD_SHARP=test/scratch/browser-tools/node_modules/sharp node tests/contrast.mjs
```

This script starts and closes its own local server, serves `dist/` under `/preview/`, blocks external requests, and writes screenshots and results only in `test/scratch/`. It tests overview/closer modes, touch, keyboard, Escape, first-screen placement, responsive assets, text enlargement, reduced motion, forced colors, RTL layout, and console/resource failures. Set `TEST_BROWSER=webkit` to use WebKit after installing that browser and its required system libraries.

## Recorded validation

The worker ran the production build and typecheck successfully, plus **8 tests in 2 files** (3 current-scene tests and 5 retained utility tests). The final production export passed **23 Chromium validation steps** and **all 16 taste@1 checks**. The browser steps include two contrast-evidence captures; pixel contrast was measured separately. Axe reported no violations in its selected WCAG checks at 390 and 1440 wide.

Checks used an exact copy of source and the unchanged manifest/lockfile under `test/scratch/build/` to keep dependency installation isolated; its built export was copied to root `dist/`. The original build configuration was used unchanged.

**Limitations:** WebKit could not launch because required system libraries were unavailable. The supplied browser tool reported “Socket path too long”; direct Playwright Chromium completed the browser checks. No physical-device, screen-reader, Firefox, browser-native 200% zoom, or real social-platform unfurl test was performed. Text enlargement is not a native zoom test. Full evidence, contrast measurements, and the Better Interface coverage are in [artifacts/validation.md](artifacts/validation.md).

## Artwork and licenses

The landscape and portrait station compositions were generated for this redesign, then compressed to local WebP assets. They depict an imagined habitat, not a photograph of a real station. The prior astronaut photograph is no longer included. The locally bundled Space Grotesk font is covered by [its SIL Open Font License](public/licenses/space-grotesk.txt). Design-guidance attribution is in [DESIGN.md](DESIGN.md).
