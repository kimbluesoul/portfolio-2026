# ADR-0008: Self-hosted fonts with unicode-range subsets

- Status: Accepted (2026-10-29)
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
The typefaces are Noto Sans TC (Chinese body and headings) and Instrument Sans (English eyebrows and display). A full Noto Sans TC weight is several MB. Loading it naively would blow the performance budget. A third-party font CDN adds a connection and a privacy dependency.

## Decision
- Self-host via **Fontsource**: `@fontsource-variable/instrument-sans` and `@fontsource/noto-sans-tc`. Fontsource ships unicode-range slices, so the browser downloads only the slices containing glyphs on the page.
- Import **only the weights used in Figma** (to be listed in DESIGN_SYSTEM, typically 2–3 per family). Do not import a whole family.
- `font-display: swap`. Preload only the Instrument Sans Latin file used above the fold. Never preload CJK slices.
- Use metric-compatible fallbacks (`size-adjust` / `ascent-override`) for Instrument Sans to limit layout shift.
- Budget: ≤ 200 KB of font transfer before first scroll (ARCHITECTURE §13).

## Consequences
- No requests to Google Fonts. Fonts are cached with the site's immutable headers.
- If CJK transfer exceeds the budget, the follow-up is a **build-time subset** of Noto Sans TC to the glyphs actually used in content (e.g. `subset-font`), recorded as a superseding ADR.

## Alternatives considered
- **Google Fonts CDN**: also sliced, but it is a third-party dependency and an extra origin, and it gives less control over caching.
- **System CJK fonts only** (PingFang / Microsoft JhengHei): fastest, but loses design fidelity. Rejected because typography is core to the design.
