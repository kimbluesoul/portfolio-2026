# ADR-0012: Build-time CJK font subsetting

- Status: Accepted (2026-10-30)
- Date: 2026-10-30
- Decider: Claude (Architect)
- Supersedes: [ADR-0008](0008-self-hosted-fonts.md) (the Noto Sans TC part; Instrument Sans is unchanged)
- Origin: Architecture Issue #9

## Context
M1 measured **802 KB** of font transfer on the home page (24 WOFF2 requests across 3 weights), a mobile Lighthouse performance score of 0.63, and a median LCP of 6.2 s. Fontsource's unicode-range slices group glyphs by general frequency, not by this site's text. A short Chinese page still touches about 8 slices per weight, each carrying hundreds of unused glyphs. The content is static and fully known at build time, so the site can ship exactly the glyphs it renders.

## Decision
**Noto Sans TC is subset at build time to the glyphs the built site actually renders.**

1. **Source font**: Noto Sans TC from `google/fonts` (OFL-1.1), variable `NotoSansTC[wght].ttf`, pinned to a specific upstream commit. Commit the source under `fonts-src/noto-sans-tc/` with `OFL.txt` and a recorded SHA-256. It is a build input only and is never deployed. If variable instancing proves unreliable, use the static per-weight TTFs from the same commit instead.
2. **Tool**: `subset-font` (harfbuzz WASM, no native build) as an approved **dev dependency**.
3. **Weights**: only the CJK weights recorded in `docs/DESIGN_SYSTEM.md` (currently **400, 500, 700**: body, tag chips, headings). Produce one static instance per weight (`variationAxes: { wght: N }`). Add or drop a weight only when DESIGN_SYSTEM records it.
4. **Glyph source = built output**: extract the rendered text of `dist/**/*.html` (including visually-hidden text) and CSS `content:` strings. `alt` / `aria-label` values are excluded because they are not drawn with the font. Source files are not scanned, so the subset matches exactly what is rendered.
5. **Two subsets per weight**, both in the same `font-family`, with exact `unicode-range` lists:
   - `core`: glyphs on `/` plus shared chrome (header, footer). Fetched on every page and cached.
   - `ext`: all remaining glyphs used anywhere else on the site. Browsers fetch it only on pages that contain one of its code points, so the home page never downloads it.
   - Always include ASCII and full-width CJK punctuation in `core`.
6. **Pipeline**: two-pass build is accepted: `astro build` → subset → emit font files + generated `@font-face` CSS → `astro build` again, so the CSS is bundled and hashed by Astro and stays inside the CSP model of ADR-0011. A post-build CSS rewrite is also acceptable if it produces hashed external assets and passes the CSP E2E test.
7. **Outputs**: content-hashed filenames (`noto-sans-tc-700-core.<hash>.woff2`), immutable cache headers, deterministic bytes for identical input. Generated files are build artifacts and are **not committed**. The committed `noto-sans-tc.generated.css` from ADR-0008 is removed.
8. **Coverage gate**: the build **fails** if any CJK / full-width code point in `dist/**/*.html` is missing from the generated subsets. This prevents silent fallback to system fonts.
9. **Fallback stack**: `'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif`, with `font-display: swap`.
10. **Preload**: preloading the home `core` file for the weight of the LCP text (the hero heading, 700) is allowed. Do not preload `ext`.

## Budgets (supersede ARCHITECTURE §13 "Fonts")
| Route | Font transfer, cold cache |
|---|---|
| `/` | ≤ 250 KB (all families) |
| Case pages, `/resume/` | ≤ 400 KB (includes the one-time `ext` download) |

LCP ≤ 2.5 s and Performance ≥ 0.90 are unchanged.

## Consequences
- Font cost scales with the site's unique characters (estimated 1,500–2,000), not with Unicode slices.
- Adding copy can change the subsets automatically. The coverage gate makes a missed glyph a build error, never a visual bug.
- Build time grows by one subsetting pass plus, if chosen, a second Astro pass (estimated tens of seconds).
- About 10 MB of OFL source font is added to the repository as a build input.

## Alternatives considered
- **Raise the budget and keep Fontsource slices** (Issue #9 option 2): ships about 4× more bytes than needed. Rejected.
- **System CJK fonts for body copy** (option 3): fastest, but Windows renders Microsoft JhengHei, which visibly departs from the design. Rejected because typography is core to the portfolio.
- **One subset for the whole site**: simpler, but the home page would download every case study's glyphs. The core/ext split costs one extra rule per weight.

## Amendment (2026-10-30, M1 implementation)
- **Per-weight glyph sets.** Each weight is subset to the text it renders, not to all text. The element→weight rule is a design-system constraint recorded in `docs/DESIGN_SYSTEM.md` and implemented once in `scripts/font-text.mjs`: 700 = `h1`–`h3`, 500 = `li` (tag chips), 400 = all rendered text. The coverage gate (`scripts/check-font-coverage.mjs`) applies the same rule per weight to `dist/`.
- **No font preloads.** The home LCP element is the featured project image, so preloading fonts only competed with it for bandwidth. Neither Noto Sans TC nor Instrument Sans is preloaded. This supersedes §10.
- Measured on M1 (Lighthouse mobile, local): home fonts 802 KB → **115 KB**; home LCP 6.2 s → **~1.7 s**; performance 0.63 → **0.99**.
- **Core baseline (clarifies §5, from the M1 review).** Every weight's `core` subset always contains printable ASCII (U+0020–U+007E) and the common Traditional Chinese punctuation `　，。、；：？！「」『』（）《》〈〉【】…—～・` (`CORE_BASELINE` in `scripts/font-text.mjs`, unit-tested). The full Halfwidth and Fullwidth Forms block is **not** included: its full-width Latin letters and digits are not used in this site's copy, and including them would add roughly 20 KB per weight. Any other punctuation that appears is still captured from rendered text.

## Amendment (2026-11-01, home LCP margin, PR #26 review P2-1)
- **Only the default horizontal OpenType features are kept** (`LAYOUT_FEATURES` in `scripts/font-text.mjs`, unit-tested): `ccmp locl liga kern mark` plus the GPOS-only `palt halt`. `subset-font` keeps every feature unless told otherwise, and the glyph closure of `vert vrt2 fwid hwid pwid aalt dlig hist ruby` nearly doubled each `core` file (400-core: 369 code points but 716 glyphs). The site never enables those features: there is no `font-feature-settings`, `font-variant-*` or vertical `writing-mode`. Adding one of those later requires adding its feature to the list.
- Measured on `main` → this change (Lighthouse mobile, local, median of 3): home Noto Sans TC 131 KB → **79 KB**; home LCP 2495 → **2192 ms**. Full-page screenshots of `/`, `/work/88win/`, `/work/hwa-fong/`, `/resume/` and `/404/` at 390 and 1440 px are byte-identical before and after.
- Font preloads stay off (amendment above). A local experiment preloading the four home fonts saved only about 80 ms of LCP. Inlining the two stylesheets saved nothing.

## Amendment (2026-11-01, CJK system-font fallback)
- **Problem.** Chromium `CSS.getPlatformFontsForNode` on `main` (`e9eebf8`) showed case-page Chinese drawn with system fonts (Microsoft JhengHei, PingFang TC), for two reasons:
  1. `--font-family-display` was `Instrument Sans, sans-serif`, so Chinese in display-family elements (case `h2`, hero eyebrow, back link, stats values, next arrow, footer LinkedIn link) skipped Noto Sans TC entirely.
  2. The element→weight rule (700 = `h1`–`h3`, 500 = `li`) missed real 700 uses (`strong` captions and step titles, `.story-title`, `.hero-headline`, `.pending-label`), so those glyphs were not in the 700 subsets. The coverage gate used the same rule, so it could not see the gap.
- **Display stack.** `--font-family-display` is now `Instrument Sans Variable, Instrument Sans, Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif`. Instrument Sans still draws Latin; Noto Sans TC draws everything Instrument Sans lacks.
- **Weight rule = selectors, not tags.** `WEIGHT_SELECTORS` in `scripts/font-text.mjs` lists per weight the descendant selectors (`tag`, `.class`, `tag.class` chains) whose CSS or UA default sets that weight. Text inherits the weight of its nearest listed ancestor, so a nested `.accent` inside `.hero-headline` counts at 700. The list follows Figma: the hero eyebrow, back link and next arrow are Medium (500) in `360:251` / `475:953`, so their CSS moved from 700 to 500 as part of this change. `DESIGN_SYSTEM.md` holds the table.
- **Gate.** `scripts/check-font-coverage.mjs` now also reads the built CSS and fails when
  - a `font-family` or `--font-family-*` stack does not name Noto Sans TC, or
  - a rule sets a weight other than 400 on a selector that is in neither `WEIGHT_SELECTORS[weight]` nor `LATIN_ONLY_WEIGHT_SELECTORS` (Latin-only labels such as `OVERVIEW`, `SELECTED WORK`).

  Both checks were confirmed to fail on the pre-fix state.
- **E2E.** `every text node renders with a self-hosted font` (Chromium only) walks every text-bearing element on `/`, all seven case pages, `/resume/` and `/404/` at 1440 and 390 px and fails on any `isCustomFont: false` platform font. It catches what a static rule cannot (a wrong Latin-only claim, a cascade the selector list misses).
- **Measured** (Lighthouse mobile, local, median of 3, `main` → this change): home fonts 109 KB, home LCP 2192 → **2198 ms** (no new home request; 500-core +1 KB for `（另開新視窗）`). Case pages 173 KB of fonts (`ext` subsets +13 KB in total). Both stay inside the budgets above.
