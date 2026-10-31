# ADR-0013: Videos play once when scrolled into view

- Status: Accepted (2026-10-31)
- Date: 2026-10-31
- Decider: Product Owner (behaviour), Claude (Architect, safeguards)
- Supersedes: the "never autoplays" rule in ADR-0006 and ADR-0007, and the Q6 resolution (2026-10-29)

## Context
The Product Owner delivered the home cards as videos and asked for this behaviour (2026-10-31):
- A video plays **once** when it scrolls into view, then stops on its last frame.
- On desktop, hovering replays it.
- On phones, scrolling it out of view and back in replays it.
- The same rules apply to case-page videos (Key Screens main, Interaction & Motion steps, Next Project preview).

The 88Win featured card on Home is a composition of three assets (`465:999` / `474:1087`): a background image, a PC screen video, and a phone video.

## Decision
**Playback** (`<loop-video>`, which keeps its name):
- The `<video>` is `muted playsinline preload="none"` **without `loop`**, and always has a poster.
- **Enter view** (≥ 50 % visible): load if not loaded yet, seek to 0, play once. On `ended`, stay paused on the last frame. Every later entry into view replays it from 0, on all devices.
- **Leave view**: pause.
- **Hover-capable devices** (`(hover: hover) and (pointer: fine)`): `pointerenter` or keyboard `focus-within` on the video or its whole-card link replays it from 0. Leaving does not stop a replay that is running.
- **Touch devices**: no play indicator. A video that is **not** inside a link replays on tap. Inside a link, a tap only navigates.
- **Grouped videos** (the featured composition) are one `<loop-video>` that controls all its `<video>` children together. They start together, and the group counts as ended when the longest one ends.

**Safeguards (non-negotiable):**
- `prefers-reduced-motion: reduce` **or** `navigator.connection.saveData === true`: no playback on view. The poster stays, and playback happens only on hover, focus, or tap, as before.
- **Lazy loading**: the `src` / `<source>` is attached only when the element comes within one viewport height of the screen (IntersectionObserver `rootMargin`). A page never downloads off-screen videos at load.
- A video that is still downloading when it enters view plays as soon as it can (`canplay`). It must not block or delay the page.
- With JavaScript off, posters show with native `controls`, as before.

**Featured composition** (`card.media.kind: 'composite'`): a background image plus a `desktop` video and a `phone` video, positioned in the card by percentages measured from Figma (ARCHITECTURE §5.1). The background image is the LCP candidate (eager, high priority). The phone video has the device bezel baked in, and the card clips its corners with a radius token.

**Budgets** are unchanged: card / Next preview ≤ 3 MB per file (target ≤ 2 MB), key-screen ≤ 8 MB, motion step ≤ 4 MB, ≤ 20 s. Home card clips are trimmed to the **first 10 s** (Product Owner, 2026-10-31).

## Consequences
- Home and case pages feel alive without the user doing anything, which is what the Product Owner wants.
- Data use goes up. It stays bounded because loading is lazy, clips are short, there are per-file caps, and Save-Data / reduced motion are respected.
- `<loop-video>`, `<motion-steps>`, and their E2E tests change. The old test that asserted "no `playing` state after load and scroll" is replaced by the tests in ARCHITECTURE §16.2.
- The touch play indicator (§9.4) is removed.

## Revisit when
Field data shows the home page data use or LCP regressing, or the Product Owner wants looping or scroll-scrubbed playback.
