# Elysium Guild — implementation and validation

Date: 2026-11-11. Status: **Complete for the stated scope**, with the browser/platform limitations below. This is a worker-side record, not independent certification.

## Scope and interpretation

The request was: “scrap the entire site with no words just elysium guild and a background of ringshape space station”.

The implemented visual idea is the guild's name suspended inside the opening of an orbital ring, above Earth. The previous route planner, forms, navigation, FAQ, footer, and astronaut image have been removed from the website. The current page has exactly two visible words. A single icon-only control provides the required primary interaction: move closer to the station, then return.

The request overrides the guide's usual marketing headline/description pair and conventional header. No explanatory line or visible button label was added. Descriptive metadata, alternative text, and an accessible button name remain available without adding visible prose. The site is not a dapp; wallet guidance is not applicable.

| Acceptance item | Result / evidence |
| --- | --- |
| Usable site, primary interactions, responsive layout | Met: overview and closer states; touch, Enter, Space, Escape; six viewport checks |
| Static export with relative assets, source and lockfile | Met in the submission tree: complete `dist/`, source, original manifest and lockfile; no manual Git mutation |
| Production build, typecheck, useful interaction validation | Met: commands and results below |
| Better Interface applied and six domains reviewed | Met: coverage and three corrected findings below |
| Product and main action on first screen at 390 | Met: name, station, and 48px view control in the 390 × 844 capture |
| Title, favicon, description, og:title, og:image | Met: `index.html:6`, `public/favicon.svg`, `public/og.jpg`; taste share check passed |
| Root DESIGN.md and install/preview/rebuild README | Met: documents describe the final source and export |

## Build and test execution

Dependency installation and build execution were isolated in `test/scratch/build/`, using copies of the **unchanged** root `package.json`, `package-lock.json`, `vite.config.ts`, and `tsconfig.json`, plus the final source, tests, and public assets. This avoids changing protected dependencies or installing into root `node_modules/`. The final built directory was copied to root `dist/`.

| Actual command | Result |
| --- | --- |
| `npm ci --prefix test/scratch/build --cache test/scratch/npm-cache --no-audit --no-fund` | Exit 0; locked dependencies installed |
| `npm run typecheck --prefix test/scratch/build` | Exit 0; `tsc --noEmit`, no type errors |
| `npm test --prefix test/scratch/build` | Exit 0; 8 tests in 2 files: 3 scene interaction tests, 5 retained calculation tests |
| `npm run build --prefix test/scratch/build` | Exit 0; TypeScript plus Vite production build; 19 modules transformed |
| `node tests/browser.mjs`, with `IMD_PLAYWRIGHT`, `PLAYWRIGHT_BROWSERS_PATH`, and `IMD_AXE` pointing to test tools | Exit 0; 23/23 Chromium steps passed, including 2 contrast-evidence captures |
| `node tests/contrast.mjs`, with `IMD_SHARP` pointing to the optional image-analysis tool | Exit 0; rendered text, icon, and focus measurements passed |
| `node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste --offline`, with the supplied Playwright module selected | Exit 0; 16/16 checks passed |
| `TEST_BROWSER=webkit node tests/browser.mjs`, with the downloaded WebKit runtime selected | Exit 1 before page navigation: required system libraries unavailable |

The browser tool itself could not initialize and returned **“Socket path too long”**. The installed Playwright Chromium headless runtime worked. It performed the rendered checks through a bounded script that started and closed its own server and browser. No external service, login, or runtime API is required by the website.

The pinned probe is an assignment input and is not redistributed. Its final result is preserved in [taste-results.json](taste-results.json). The project’s reusable browser and contrast checks are delivered in `tests/`; installation instructions are in the README.

## Browser evidence and interaction coverage

The production export was served at **/preview/**. All external requests were blocked. No script/console errors, failed resources, or external runtime requests were observed.

| Viewport | Overview and closer view | Name and control on first screen | Additional coverage |
| --- | --- | --- | --- |
| 320 × 720 | Passed | Passed | Touch; 200% text enlargement |
| 390 × 844 | Passed | Passed | Touch; keyboard; reduced motion; forced colors; RTL; 200% text enlargement; axe |
| 768 × 1024 | Passed | Passed | Portrait artwork at the aspect-ratio boundary |
| 1440 × 900 | Passed | Passed | Keyboard; reduced motion; axe; landscape artwork |
| 1920 × 1080 | Passed | Passed | Wide layout and large responsive image |
| 844 × 390 | Passed | Passed | Short landscape layout |

Every viewport exercised entry into the closer view, a second activation back to overview, and Escape to reset. The closer state scales the actual artwork to 1.22; it is not a simulated navigation or browser-fullscreen control. The heading stays unchanged. Keyboard checks verified Tab order, Enter, Space, focus retention, and the focus indicator. Reduced motion removed transition durations and left no active animations. The only control remained at least 44px; its normal size is 48px.

Axe reported **0 violations and 16 passed rules** at both 390 and 1440. Its image-backed color-contrast rule remained **incomplete** for the heading, so contrast was checked separately; the axe result is not a full accessibility certification.

The final phone overview, desktop overview, focused control, closer view, and enlarged-text screenshots were visually inspected. Saved final evidence:

- [Phone overview](previews/mobile.jpg), 390 × 844.
- [Desktop overview](previews/desktop.jpg), 1440 × 900.
- [Phone keyboard focus](previews/mobile-focus.png), 390 × 844.
- [Browser results](browser-results.json), including measured boxes and loaded image variants.
- [Contrast results](contrast-results.json).

The probe also rendered at 320, 390, and 1440, including reduced motion. Its 16 passing checks cover render, layout, targets, contrast for measurable solid backgrounds, casing, tracking, eyebrows, type sizes, typefaces/weights, glyphs, slogans, repetition, copy budget, chrome, motion, and share metadata. It explicitly skipped image-backed contrast, which the separate pixel checks cover for the sampled states.

## Better Interface: six-domain review

The pinned workflow, the core principles of all six domains, and the design-documentation section were read before or during implementation. Both source review and rendered inspection were used.

| Domain | Coverage | Result and limits |
| --- | --- | --- |
| Accessibility | **Checked:** native main/heading/button; informative image alt; accessible control name/state; Tab, Enter, Space, Escape; visible focus; 48px target; reduced motion; forced colors; automated scan | Fixed the focus contrast finding. No screen-reader session or physical-device test. No modal, form, destructive action, or repeated navigation; their checks are not applicable. |
| Layout | **Checked:** full-bleed media separated from content; safe-area margins; first screen at 390; all six viewports; no horizontal overflow or overlap; RTL mirror; enlarged text | Fixed inflated gutters and asymmetric enlarged lettering. Native browser zoom was not tested. Localization is not a requested feature; no translated-copy audit. |
| Writing | **Checked:** exactly “elysium guild” visible; control name accurately describes image zoom; metadata and alt describe the scene | Deliberate brief override of supporting marketing copy. No forms, errors, empty states, or backend success claims. |
| Typography | **Checked:** one locally loaded variable font, one used weight, one display size token; balanced wrapping; selectable text; font load and 200% text-size behavior | Rendered type is 40px at 390, 90px at 1440. Enlarged name wraps without clipping. No reading paragraphs or numeric-data typography to review. |
| Colors | **Checked:** semantic OKLCH roles; opaque control; both view states; image-backed text and focus measured from rendered pixels | Fixed enlarged text and mobile focus contrast. One intentional dark theme; no light-theme requirement. Measurements cover listed states, not every possible display, browser, or animation frame. |
| UI details | **Checked:** one circle control, 1.5px SVG strokes, plus/minus state cue, hover/press/focus, reversible 900ms scene transition, 150ms control feedback, no autoplay | No `transition: all`, nested cards, or ornamental chrome. No formal 10%-speed Animations-panel session; transitions were exercised to completion, and reduced-motion behavior was measured. |

## Findings and fixes

### 1. High — enlarged lettering lost contrast against the station

- **Source:** `src/styles.css:95`, `.scene__name`; final halo at line 105.
- **Observed:** at 200% text size, parts of the second line crossed sunlit metal. Minimum sampled glyph-background contrast was **1.38:1 at 320** and **1.30:1 at 390**, below the 3:1 large-text threshold.
- **Fix:** a two-layer dark text halo, using the explicit `--color-text-halo` role. It leaves the unscaled name visually quiet while protecting enlarged text.
- **Recheck:** **13.40:1 at 320**, **12.31:1 at 390** in the same enlarged-text states; screenshots inspected and pixel check passed.

### 2. Medium — enlarged margins pushed the long word off center

- **Source:** `src/styles.css:29`, `--space-edge`.
- **Observed:** at 320 wide with root text size doubled, rem-based gutters doubled from 24px to 48px. “elysium” outgrew the narrowed text box and sat asymmetrically, although it did not cause page-level horizontal scroll.
- **Fix:** retain the original normal-size gutter values with `clamp(24px, 3.125vw, 48px)`. Text and the target still enlarge, while the scene margins retain their physical endpoints.
- **Recheck:** the enlarged two-line name is centered and fully visible at 320 and 390; target and name remain on the first screen.

### 3. High — the external focus ring crossed a bright background

- **Source:** `src/styles.css:125`, `.view-control:focus-visible`.
- **Observed:** the initial 2px outer gold ring reached only **2.37:1** against the photograph at 390, below the 3:1 indicator threshold.
- **Fix:** use a 3px outline at -6px offset, keeping the entire indicator inside the button’s opaque surface. Forced-colors mode keeps the system highlight color.
- **Recheck:** minimum sampled focus contrast is **11.88:1** at both 390 and 1440. The final focused screenshot was inspected; keyboard operation and focus retention passed.

No known applicable high or medium finding remains in the tested scope.

## Rendered contrast method and results

`tests/browser.mjs` captures each background with transparent lettering **while retaining its explicit dark halo**, then a white-on-black mask of the same lettering. `tests/contrast.mjs` reads those PNGs and evaluates WCAG relative-luminance ratios at opaque glyph pixels (mask channels at least 250). Anti-aliased edge pixels are excluded. Focus is measured by comparing focused and outline-suppressed captures at the indicator pixels. Icon contrast uses the browser-resolved RGB colors.

| Rendered state | Lowest sampled heading contrast |
| --- | --- |
| 390 × 844 overview | 18.64:1 |
| 1440 × 900 overview | 18.54:1 |
| 390 × 844 closer | 18.64:1 |
| 1440 × 900 closer | 18.62:1 |
| 320 × 720, 200% text size | 13.40:1 |
| 390 × 844, 200% text size | 12.31:1 |

The icon measured **17.27:1** on the normal control and **14.21:1** on the captured desktop hover surface. The inset focus indicator measured **11.88:1** in both captured viewports. These are controlled Chromium screenshot samples, not claims of universal contrast across all future artwork or display conditions.

## Export, packaging, and limitations

The final production export totals **812,863 bytes**. It includes the HTML, JS, CSS, Latin WOFF2, three responsive WebP images, favicon, share image, and font license. The previous NASA assets and unused font subsets are absent from the export. Runtime paths are relative; the subpath/offline browser checks loaded them successfully.

No root package manifest, lockfile, or Vite/TypeScript configuration was changed. The only ignore change admits the exact review deliverables in [PATH_BUDGET.md](PATH_BUDGET.md), with a 1 MiB allocation and per-file limits; existing cache/dependency exclusions remain intact. No submodule, vendored registry, dependency archive, cache, or dependency directory is included in the submission. Scratch tools and temporary image originals stay under the ignored, non-submitted `test/scratch/`. The final path/byte audit is in [submission-audit.json](submission-audit.json).

Remaining limitations:

- WebKit/Safari could not be exercised: the runtime reported missing libraries, including `libgtk-4.so.1` and GStreamer components. Firefox and physical devices were not tested.
- No screen-reader session, browser-native 200% zoom, or formal slow-motion animation inspection was performed. Text enlargement and narrow-view reflow were tested separately.
- The page needs JavaScript for the React scene and control. No separate no-JavaScript rendition was requested or implemented.
- Real social-platform unfurling was not tested. The supplied relative `og:image` is preserved for static subpath hosting; final hosting/domain behavior is outside this task.
- Screenshot contrast checks cover the reported states; they do not constitute a full accessibility certification.

No deployment or on-chain action was performed.
