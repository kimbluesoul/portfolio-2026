# ADR-0003: No client UI framework; progressive-enhancement custom elements

- Status: Accepted (2026-10-29)
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
Interactive behavior in the Figma designs is limited to:
- hover / focus / press states (CSS),
- anchor navigation (HTML),
- looping videos that play on hover / focus (desktop) or tap (mobile),
- the Interaction & Motion step switcher (tabs that swap a video),
- scroll-triggered reveals.

None of these needs shared state or client-side rendering.

## Decision
- Do not add React, Vue, Svelte, Solid, or Preact. Do not use Astro `client:*` hydration.
- Interactivity is implemented as a few **custom elements** in `src/elements/` (`<loop-video>`, `<motion-steps>`, `<reveal-on-view>`), written in TypeScript and bundled by Astro's `<script>` processing.
- Server-rendered markup is complete and usable without JS. Elements only enhance it.
- First-party JS budget: ≤ 15 KB gzip per page.

## Consequences
- Near-zero JS cost, and no hydration mismatch class of bugs.
- Accessibility semantics (Tabs pattern, pause controls) must be hand-implemented and tested (E2E + axe).
- If a future feature needs complex client state (filtering, lightbox gallery with deep links), revisit with an ADR. Preact via an Astro island is the expected candidate.

## Alternatives considered
- **React islands**: familiar to most implementers, but ~45 KB runtime for three small behaviors.
- **Alpine.js**: small, but adds an attribute-DSL dependency and inline-expression CSP issues for what is about 150 lines of TS.
