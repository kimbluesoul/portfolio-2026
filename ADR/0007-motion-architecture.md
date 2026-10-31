# ADR-0007: CSS-first motion, no animation library

- Status: Accepted (2026-10-29)
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
The product emphasizes interaction and motion ("Show more, explain less"). The template also says only two "signature" visuals per case page (Hero showcase, Visual Extension) and that other sections "stay quiet". Most of the product's motion is **inside the work videos**, not in page chrome. Figma has no motion spec. Token values and behavior rules were defined on Product Owner delegation in `docs/DESIGN_SYSTEM.md` → Motion (Q4).

## Decision
- Hover / focus / press transitions and entrance reveals use **CSS** with motion tokens (`--motion-duration-*`, `--motion-ease-*`).
- Reveals are triggered by `<reveal-on-view>` (IntersectionObserver → `data-inview`). Content stays visible if JS fails.
- Animate `transform` / `opacity` only.
- Page-to-page transitions use native cross-document View Transitions as progressive enhancement.
- `prefers-reduced-motion: reduce` disables reveals, smooth scrolling, and view transitions. Videos do not play on view in this mode (ADR-0013). They play only on hover / focus / tap.
- **No GSAP / Motion One / Lottie / Three.js** in v1.

## Consequences
- Motion costs nearly nothing in JS and stays consistent through tokens.
- Choreographed, scrubbed, or physics-based sequences are not possible without a new ADR.

## Revisit when
The Product Owner provides a motion spec that needs scroll-scrubbed timelines across multiple elements, or sequencing CSS cannot express reliably. The expected candidate is GSAP + ScrollTrigger, loaded only on pages that need it, inside the JS budget exception granted by that ADR.
