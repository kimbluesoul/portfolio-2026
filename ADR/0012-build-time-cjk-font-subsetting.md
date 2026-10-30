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
3. **Weights**: only the CJK weights recorded in `docs/DESIGN_SYSTEM.md` (currently **400 and 700**). Produce one static instance per weight (`variationAxes: { wght: N }`). Drop 500 unless DESIGN_SYSTEM records a Chinese use for it.
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
