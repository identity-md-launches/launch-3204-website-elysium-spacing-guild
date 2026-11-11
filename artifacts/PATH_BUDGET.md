# Review artifact path budget

The root `.gitignore` is changed only to include the exact review deliverables below despite the repository's default artifact exclusion. No broad artifact directory, dependency, cache, or archive exception is permitted.

| Allowed path | Maximum bytes |
| --- | ---: |
| `.gitignore` | 4,096 |
| `artifacts/PATH_BUDGET.md` | 4,096 |
| `artifacts/validation.md` | 32,768 |
| `artifacts/browser-results.json` | 32,768 |
| `artifacts/contrast-results.json` | 8,192 |
| `artifacts/taste-results.json` | 8,192 |
| `artifacts/submission-audit.json` | 8,192 |
| `artifacts/licenses/design-guidance.txt` | 16,384 |
| `artifacts/previews/desktop.jpg` | 262,144 |
| `artifacts/previews/mobile.jpg` | 131,072 |
| `artifacts/previews/mobile-focus.png` | 524,288 |

These path limits total **1,032,192 bytes**, within a **1 MiB review-artifact allocation**. The entire submission remains subject to the separate 8 MiB cap. The final audit checks every path against its limit and counts these artifacts in the submission total. All pre-existing dependency/cache ignore rules remain in effect.
