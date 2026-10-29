# ADR-0004: Plain CSS with design tokens mirrored from Figma variables

- Status: Proposed
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
The visual system is a precise editorial ("Swiss cobalt") layout with bespoke grids, large display typography, and a strict color policy: blue only for links, buttons, eyebrows, and emphasized title words; tags with thin gray borders and no fill. Colors are already Figma variables whose names are CSS-style (`color-bg-canvas`, `color-text-brand`, …). Fidelity to Figma and preventing ad-hoc values are the main goals.

## Decision
- **Plain CSS**: global layers in `src/styles/` (`@layer reset, tokens, base, typography, utilities`) plus Astro **scoped `<style>`** per component. No Tailwind, CSS Modules, or CSS-in-JS.
- **Tokens** in `src/styles/tokens.css` as CSS custom properties in two tiers:
  - *primitive* (`--blue-600: #1F3BD6`), mirroring `Portfolio 2026 / Primitives`;
  - *semantic* (`--color-text-brand: var(--blue-600)`), mirroring `Portfolio 2026 / Color`. Names follow the Figma variable names, normalized to `--color-*` (mapping in ARCHITECTURE Appendix A).
- Components use **semantic tokens only**. Primitives are referenced only inside `tokens.css`.
- Typography, spacing, radius, z-index, motion, and layout widths are tokens too. Their values come from Figma text styles / measurements and are recorded in `docs/DESIGN_SYSTEM.md` by the Product Owner.
- Enforcement: Stylelint `color-no-hex` + `declaration-property-value-disallowed-list` for raw colors everywhere except `tokens.css`.
- Token sync is manual for v1: when Figma variables change, the PR that changes `tokens.css` lists the changed variables. Automated export (Figma REST / Tokens Studio) needs an ADR.

## Consequences
- The implementer reads token names straight from Figma Dev Mode. The names match, which lowers translation errors.
- No framework-specific styling knowledge is required, and the CSS stays small.
- More hand-written layout CSS than a utility framework. This is acceptable for about 15 bespoke section layouts.

## Alternatives considered
- **Tailwind v4**: fast to write, but utility classes in markup scatter design decisions across templates. Fidelity reviews against Figma are harder, and the token layer would be duplicated in Tailwind's theme.
- **Vanilla Extract / CSS-in-JS**: type safety, but adds build complexity with little benefit at this scale.
