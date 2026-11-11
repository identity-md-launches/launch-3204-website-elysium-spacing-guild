# Elysium Spacing Guild website

A one-page static website for the Elysium Spacing Guild. The top of the page uses NASA's 1984 photograph of Bruce McCandless flying untethered above Earth as its background. On the first screen, at any width, is the **Plot a jump** route planner. You pick two guild stations and a thrust, and it computes a flip-and-burn transit: time, distance and speed at the flip. Further down the page are a station map and list (each row can set the planner's destination), the four disciplines, a **Sign the charter** form that produces a charter number and a downloadable SVG charter in the browser (nothing is sent anywhere), and an FAQ.

Built with Vite 8, React 19 and TypeScript. The finished static export is committed in `dist/` and uses relative asset URLs (`base: './'`), so it works from any subpath, an IPFS gateway or an ENS name. No server or backend is needed.

## Install

Requires Node 20 or newer (built with Node 24.21 and npm 11.19).

```sh
npm ci
```

## Preview

```sh
npm run dev        # development server with hot reload
npm run build      # typecheck, then write the static export to dist/
npm run preview    # serve the built dist/ locally
```

Any static file server works for `dist/`, because every asset path is relative. Opening `dist/index.html` directly from disk is not supported, because browsers block ES module scripts on `file://`.

## Rebuild

```sh
npm run typecheck  # tsc --noEmit
npm test           # vitest: interaction and unit tests in tests/
npm run build      # tsc --noEmit && vite build → dist/
```

Commit `dist/` after every source change. The publisher serves the committed export and does not rebuild it.

## Project layout

```
index.html                 title, description, favicon, og:title, og:image
public/                    favicon.svg, og.jpg (copied into dist/ as is)
src/main.tsx               entry; loads the bundled Space Grotesk font and styles
src/App.tsx                page structure and sections
src/components/            Planner, RouteMap, JoinForm
src/data/stations.ts       guild stations and their fixed positions
src/lib/transit.ts         distance and flip-and-burn transit maths, formatting
src/lib/charter.ts         disciplines, charter number, charter SVG, file download
src/styles.css             design tokens and all styles (see DESIGN.md)
src/assets/                hero photo (960 and 1920 wide WebP)
tests/                     vitest + Testing Library tests
dist/                      committed production export
DESIGN.md                  implemented design system
artifacts/validation.md    review and check record
```

## Checks run for this delivery (worker-side)

All were run on the final source. Full details are in `artifacts/validation.md`.

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Unit and interaction tests | `npx vitest run` | 2 files, 15 tests passed |
| Production build | `npx vite build` | built; `dist/` totals about 500 kB |
| Browser flows (Chromium, Playwright) | scratch script serving `dist/` under `/preview/` | 320, 390, 768 and 1440 wide: main action on the first screen, no horizontal overflow, no console errors or failed requests. Planner, swap, same-station error, station-row shortcut, keyboard path, charter validation, charter creation and SVG download, and the FAQ all worked. |
| Design probe | `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste` | 16 / 16 checks passed |

**Limitations:**
- Only Chromium was used. WebKit/Safari and Firefox were not tested, and no physical device was tested.
- There was no screen-reader session and no native 200% zoom test.
- Contrast of text over the hero photo's gradient was not measured.

## Content notes

- **Hero photo:** NASA image S84-27017, public domain, from images.nasa.gov. It is credited in the page footer.
- **Station positions:** a fixed, simplified snapshot at the "charter epoch", not live ephemerides. The FAQ says so.
- **Transit time:** t = 2·√(d / a), where a = thrust in g × 9.80665 m/s².
