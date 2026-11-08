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
- **Core baseline (clarifies §5, from the M1 review).** Every weight's `core` subset always contains printable ASCII (U+0020–U+007E) and the common Traditional Chinese punctuation `　，。、；：？！「」『』（）《》〈〉【】…—～・` (`CORE_BASELINE` in `scripts/font-text.mjs`, unit-tested). The full Halfwidth and Fullwidth Forms block is **not** included: its full-width Latin letters and digits are not used in this site's copy, and including them would add roughly 20 KB per weight. Any other punctuation that appears is still captured from rendered text. The baseline also holds the arrows `←` `→` `↗` (amended 2026-11-01): Instrument Sans has no glyph for them, so Noto Sans TC draws them even inside Latin-only rules such as `.resume-link` (600, matched to the 700 face).

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
  - a rule sets a weight other than 400 on a selector that is in neither `WEIGHT_SELECTORS[weight]` nor `LATIN_ONLY_WEIGHT_SELECTORS` (Latin-only labels such as `OVERVIEW`, `SELECTED WORK`). A weight above 500 (for example 600) is checked against the 700 list, because CSS font matching draws it with the 700 face (amended 2026-11-01). Or
  - a rule uses a `font:` shorthand (other than `inherit` / `initial` / `unset` / `revert`) or a non-literal `font-weight` such as `var()`, which the check cannot read.

  Both checks were confirmed to fail on the pre-fix state. The gate only sees weights that a CSS rule sets, so the UA-default bold elements (`h4`–`h6`, `strong`, `b`, `th`) are listed in `WEIGHT_SELECTORS[700]` directly.
- **E2E.** `every text node renders with a self-hosted font` (Chromium only) walks every text-bearing element on `/`, all seven case pages, `/resume/` and `/404/` at 1440 and 390 px and fails on any `isCustomFont: false` platform font. It catches what a static rule cannot (a wrong Latin-only claim, a cascade the selector list misses). Before measuring it forces `content-visibility: visible` and opens the hidden motion tab panels, because CDP reports no fonts for content that is not laid out. It also fails on any visible text node with no font data, so it cannot pass without checking that node.
- **Measured** (Lighthouse mobile, local, median of 3, `main` → this change): home fonts 109 KB, home LCP 2192 → **2198 ms** (no new home request; 500-core +1 KB for `（另開新視窗）`). Case pages 173 KB of fonts (`ext` subsets +13 KB in total). Both stay inside the budgets above.

## Amendment (2026-11-01, case-page LCP)
- **Problem.** The Lighthouse LCP gate on `/work/88win/` (≤ 2500 ms, median of 3) failed intermittently on CI at 2502–2506 ms. The LCP element is the hero `h1` (Instrument Sans), and its whole LCP time is render delay. Lantern (Lighthouse's simulated throttling) counts every request that finished before the observed first paint. Locally the fonts finish a few milliseconds before that paint, so all seven font files (≈ 190 KB) sit on the simulated LCP path. On the six simulated HTTP/1.1 connections with TCP slow start, the 400 `core` file (49.5 KB) was always the last to finish. Whether two other files finished just before or just after the observed paint decided one simulated round trip (±75–150 ms), so results were bimodal (≈ 2346 or ≈ 2495 ms on `main`).
- **`ext` is split per page.** `partitionExt` in `scripts/font-text.mjs` (unit-tested) gives each page its own `ext-<page>` subset for the glyphs only that page renders, and an `ext-shared` subset for glyphs used by several pages (and for pages with fewer than `MIN_PAGE_EXT_GLYPHS` = 16 unique glyphs, so they cost no extra request). All faces stay in the one generated stylesheet; browsers fetch only the faces whose `unicode-range` meets the page's text, so a case page never downloads another case page's glyphs. This supersedes §5's single `ext` per weight. 88Win's `ext` download drops from 77 KB to 60 KB, and it no longer grows when the other case studies get their copy.
- **Case pages preload the 400 `core` subset** (exception to the M1 amendment's "no font preloads"). On case pages the LCP is text, and body text at 400 is the largest file the first paint needs. The preload starts it with the HTML instead of after `BaseLayout.css`. `BaseLayout` emits it only with `preloadBodyFont` (set by `work/[slug].astro`) and reads the hashed name from the generated CSS (`src/lib/font-preload.ts`, unit-tested). The home page still preloads nothing, because its LCP is the featured image. Preloading all seven case-page fonts was measured and rejected: they then compete with the CSS (LCP 2338 ms).
- **Measured** (Lighthouse 12.6.1 mobile, local Edge, the LHCI static server, `/work/88win/`; together with the case-section `content-visibility`, case-video poster and lazy footer-icon changes of ARCHITECTURE v1.10): median **2490 → 2261 ms** over 10 runs, maximum 2267 ms, and no bimodal ±150 ms mode. Home (2117 ms) and `/resume/` (1589 ms) are unchanged. Case-page fonts 175 KB, inside the 400 KB budget.

## Amendment (2026-11-03, page-local extension faces)
- **No shared extension subset.** Every non-home page and weight gets one `ext-<page>` file containing every glyph that page uses outside `core`. Glyphs used by multiple pages are duplicated intentionally. `ext-shared` is removed.
- **Page-local CSS.** The generated global CSS contains only the `core` faces. The subset pass also records a page-key → `@font-face` CSS mapping; `BaseLayout` emits only the current page's rules as an inline `<style>` and registers its CSP hash with Astro.
- **Coverage is page-local.** The coverage gate verifies each HTML document against global `core` ranges plus only the extension faces in that document. This prevents a page from passing because another page owns a missing glyph.
- **Measured** (Lighthouse 12 mobile, local Edge, the LHCI static server, `/work/88win/`, 5 runs; PR #52 review): LCP median **2494 → 2336 ms** (spread 2335–2338 ms; the 2420 / 2495 ms bimodal mode is gone), FCP 1967 → 1666 ms. 88Win now loads `core` + `ext-work-88win` only (two Noto extension files instead of four), and its font bytes no longer grow when other pages get copy. The same PR fixed the art-directed hero `<img>`, which rendered `loading="lazy"` before `loading="eager"` (the first attribute won). The 2500 ms gate is unchanged.

## Amendment (2026-11-08, critical and deferred extension faces, PR #101)
- **Why.** 88Win's phone LCP (the hero image) had crept to 2488 ms as copy grew; #100 added 3 KB of new glyphs and pushed it to 2561 ms. Lighthouse counts every font request that starts before LCP, and a face declared in `<head>` starts at ~90 ms whatever its `unicode-range` covers, so a page's copy size drove its LCP.
- **Critical faces.** Elements marked `data-font-critical` (the case hero, via `SectionShell`) define the critical text. Per weight, the page's non-core glyphs split into `ext-<page>-hero` (glyphs used in marked text) and `ext-<page>` (the rest). The sets are disjoint and their union is the old `ext-<page>`.
- **Deferred faces.** Only the `-hero` faces are inline in `<head>`. The remainder is not declared in the initial CSS: `<deferred-fonts>` (`src/elements/deferred-fonts.ts`) registers it with the CSS Font Loading API after the window `load` event, the timing rule ADR-0013 uses for videos. A `<noscript><style>` carries the same faces for no-JS visitors; its hash is in the CSP. Pages without a marked element keep one inline `ext-<page>` face.
- **Data.** `noto-sans-tc.pages.generated.json` maps each page key to `{ criticalCss, deferredFaces }`. The coverage gate still reads every face in the document, including the `<noscript>` ones.
- **Trade-off (PO accepted 2026-11-08).** Text outside the hero that is on screen before `load` may draw in the system fallback first and then swap. Below-the-fold text is not counted by CLS.
- **Measured** (Lighthouse mobile, local Edge, LHCI static server, `/work/88win/`, 3 runs): main 2488 → **2337 ms**, and 2337 ms with #100's copy, so new copy no longer moves the LCP. The 2500 ms gate is unchanged. A first attempt that split the faces but declared both in `<head>` was slower (more requests, same timing) and was rejected.
