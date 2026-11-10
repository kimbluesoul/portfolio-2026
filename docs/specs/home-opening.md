# Home opening: 「瞬間」 loop and featured reveal

Product Owner request 2026-11-09 / 11-10. The PO approved the behaviour in a prototype (version 2). The prototype source is [`home-opening/prototype.html`](home-opening/prototype.html). Its media paths (`m/…`) are not committed, so it does not run from the repo. Read it for the maths only; this sheet is the contract.

There is no Figma frame. The values below come from the prototype and are the source of truth.

## Goal
The home headline promises motion ("也設計畫面之間的**瞬間**"), but the first screen is static. Two moments make the promise visible:

- **B, the 「瞬間」 loop**: a stroke and a glint pass through the accent word every 4.5 s.
- **A1, the featured reveal**: while scrolling, the 01 88Win card opens to full bleed, holds briefly, and folds back to its card size before the 02–07 grid.

Nothing else on the page changes: copy, layout, card order, and video behaviour stay as they are.

## B: 「瞬間」 loop

| Item | Value |
|---|---|
| Target | The accent span in the home `h1` (from `**瞬間**` in the site content) |
| Text colour | Unchanged and solid: `--color-text-brand` (#1f3bd6) at every frame. The word is fully visible from the first paint and is never transparent or faded, because the `h1` can be the LCP element and axe checks its contrast |
| Stroke | Bar under the word: full word width, height 0.07em, bottom edge 0.02em above the span's bottom edge, colour `--color-text-brand` |
| Stroke motion | Keyframes on `transform`: 0 % `scaleX(0)` origin left → 11 % `scaleX(1)` origin left → 13.5 % `scaleX(1)` origin right → 25 % `scaleX(0)` origin right → 100 % `scaleX(0)` origin right. Easing `cubic-bezier(0.65, 0, 0.35, 1)` |
| Glint | A light band crosses the glyphs left → right. Band colour `--blue-300` (#9aa8ff), band width 16 % of a gradient 260 % as wide as the word (stops: brand 0–42 %, glint 50 %, brand 58–100 %). It moves 0–8 % hold at the start, 8 → 30 % cross, then rests. Easing `cubic-bezier(0.2, 0.7, 0.2, 1)`. The prototype used #9fb0ff; use the existing token instead (no visible difference) |
| Loop | Duration 4.5 s, delay 0.3 s, `infinite`, both layers on the same clock |
| Off screen | Paused (`animation-play-state: paused`) while the `h1` is out of the viewport; resumes when it returns |
| Reduced motion | No stroke and no glint, at any time |
| Implementation note | The text itself keeps its solid `color`. Draw the glint on a separate layer (for example an `aria-hidden` duplicate of the word with `background-clip: text`, transparent outside the band), not by making the real text transparent. The result must pass the existing axe run |

## A1: featured reveal

### Terms
- **Card**: the featured card's media box as it renders today (`.featured .media`), at rest. W0 × H0 = its width × height (desktop ratio 1728 / 500, phone 7 / 4).
- **Window**: the visible area during the reveal. At rest it equals the card exactly (same rect, same `--radius-card` corners).
- **Stage**: the PC and phone layers (`composite-pc`, `composite-phone`) at their current percentage positions, scaled around the card centre.
- **Background**: `composite-background`; it covers the whole window at every frame (`object-fit: cover`, current `object-position`).
- **Runway**: extra scroll length reserved after the card so the window can stay in place while it opens and closes.

### Geometry
| Item | Value |
|---|---|
| Sticky top of the card | `max(var(--header-height) + 24px, (viewport height − H0) / 2)` |
| Runway | Card height + `50svh`. Reserved in CSS, not added by script, so the page does not shift after load (CLS) |
| Runway condition | Only inside `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`. The script runs only when that runway exists. Outside it the page is exactly today's page |
| R (runway length) | Runway height − H0, read from layout (not from `innerHeight`, which changes with the mobile address bar) |
| Peak window width | Viewport width without the scrollbar (`document.documentElement.clientWidth`) |
| Peak window height | `min(H0 × sPeak × 1.45, viewport height × 0.9)`, never below H0 |
| Peak stage scale sPeak | `(peak window width / W0) × 1.2`. The devices grow 20 % past full bleed; the window clips the sides |
| Corner radius | `--radius-card` at rest → 0 at the peak |
| Window centre | Always the card centre, both axes |
| Layering | The window paints over the hero above and the card copy below while open, and under the site header (header `z-index` 10) |

Values at the reference viewports (the measurement table below checks these):

| Viewport | W0 × H0 | Sticky top | R | Peak window | sPeak |
|---|---|---|---|---|---|
| 1920 × 1080 | 1728 × 500 | 290 | 540 | 1920 × 966.7 | 1.333 |
| 1440 × 900 | 1296 × 375 | 262.5 | 450 | 1440 × 725 | 1.333 |
| 390 × 844 | 350 × 200 | 322 | 422 | 390 × 387.8 | 1.337 |

### Progress
Let `u = sticky top − runway top` (px, from `getBoundingClientRect`), and `G = min(runway top at scrollY 0, 0.9 × viewport height) − sticky top`.
Easing `e(t) = t³ (t (6t − 15) + 10)` (smootherstep).

| Phase | Range of u | p (0 = card, 1 = peak) |
|---|---|---|
| Before | u ≤ −G | 0 |
| Grow (card scrolls up to its sticky top) | −G < u < 0 | e((u + G) / G) |
| Hold | 0 ≤ u ≤ 0.05 R | 1 |
| Fold back | 0.05 R < u ≤ R | 1 − e((u − 0.05 R) / (0.95 R)) |
| After | u > R | 0 |

At progress p:
- window width = W0 + (peak width − W0) × p; window height = H0 + (peak height − H0) × p; radius = `--radius-card` × (1 − p);
- stage scale = 1 + (sPeak − 1) × p;
- while u < 0, the hero section fades and rises with the same p: opacity 1 − 0.55 p, translateY −28 p px. Once u ≥ 0 it stays at opacity 0.45 / −28 px (it is off screen), and it returns to 1 / 0 when the user scrolls back up.

Animate only `transform`, `opacity`, and `clip-path`. Update on scroll with one `requestAnimationFrame` per frame. Recompute the measurements on resize.

### Behaviour that stays
- Videos keep ADR-0013 behaviour (load after `load`, play in view). The reveal does not start or stop them.
- The card's hover lift and the 1.02 media hover scale keep working at rest. Apply the reveal transforms to a different element from the hover transform, so the two never overwrite each other.
- The whole card stays one link with the same focus ring; keyboard users can tab to it at any progress.
- 02–07 grid, reveals, and spacing are unchanged except that they start R px lower (the runway).

### Architecture
- A new custom element `src/elements/featured-reveal.ts` (pattern of the existing elements) wraps the featured card media. Progressive enhancement: no runway, no script work, no change when the runway condition is false.
- The element writes its progress to `data-progress` (0–1, three decimals) so tests can read it.
- The 「瞬間」 loop is CSS in `HomeHero.astro` plus one IntersectionObserver for the off-screen pause (inline in the component or a small element; no new dependency).
- Claude records the element in ARCHITECTURE §7 and the motion in DESIGN_SYSTEM after the implementation merges.

## Acceptance

**Measurement table** (implementer fills it from the built page and pastes it into the PR; review re-measures):

| Check | 1920 × 1080 | 1440 × 900 | 390 × 844 |
|---|---|---|---|
| Card rect at scrollY 0, reduced motion, vs `main` | identical | identical | identical |
| Runway height − card height (R) | 540 | 450 | 422 |
| Sticky top | 290 | 262.5 | 322 |
| `data-progress` at u = −G / 0 / 0.05 R / 0.5 R / R | 0 / 1 / 1 / 0.549 / 0 | same | same |
| Visible window at u = 0 (left, top, width, height) | 0, 290 − 233.35, 1920, 966.7 | 0, 262.5 − 175, 1440, 725 | 0, 322 − 93.9, 390, 387.8 |
| Stage scale at u = 0 | 1.333 | 1.333 | 1.337 |
| Hero opacity at u = 0 | 0.45 | 0.45 | 0.45 |
| Horizontal page scroll (`scrollWidth − clientWidth`) at any u | 0 | 0 | 0 |
| 「瞬間」 computed `color` | rgb(31, 59, 214) | same | same |

(Visible-window top = sticky top − (peak height − H0) / 2. Tolerance ±1 px, ±0.01 for scale and opacity, ±0.02 for `data-progress`.)

**Behaviour**
- 1920, 1440, 390: scrolling down opens the card to full width, holds briefly, folds back to the card before the grid; scrolling up reverses it.
- Reduced motion: no runway, no reveal, no 「瞬間」 animation; the page equals `main`.
- JavaScript off: the page equals `main` (no runway).
- Home Lighthouse gates unchanged (LCP, CLS, TBT as today). Report the numbers in the PR.
- axe passes on the home page at every check point.

**Tests**
- Add E2E (chromium-desktop at 1440 × 900 and one 390 × 844 run): `data-progress` at the five u values above, no horizontal scroll, and the reduced-motion page has no runway.
- Existing home tests that scroll to, hover, or measure the featured card (`tests/e2e/smoke.spec.ts`, the `#work article` tests) may need the runway taken into account. Change them only for that reason, and say which in the PR.

**Out of scope**
- Any other page, the 02–07 cards, copy, video timing, the header.
- A reveal for other projects.
