# ADR-0006: Media pipeline — astro:assets images, self-hosted MP4 video

- Status: Accepted (2026-10-29)
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
Each case page carries about 15–25 raster images and 2–5 videos (16:9 key screen 1440×810, motion steps 960×532, card / next-project previews). The audience is mostly Taiwan, often on mobile. Media is the dominant performance risk. Video slots exist across all case pages, and some videos are still being produced (e.g. AMD 維護).

## Decision
**Images**
- Sources go in `src/assets/projects/<slug>/` and render only via `ResponsivePicture` (`astro:assets` `<Picture>`) in AVIF + WebP with explicit `widths` / `sizes`. Intrinsic dimensions are always set.
- Export from Figma at 2× rendered size (cap 2880 px wide; 3840 px for full-bleed), with a 6 MB per-source cap.
- One eager, high-priority image per page (the LCP candidate). Everything else is lazy.
- Pure-vector Details artwork is exported as SVG.

**Video**
- MP4 / H.264 / yuv420p / no audio / `+faststart`, with a required poster image. Files go in `public/media/<slug>/` with versioned filenames.
- Rendered only via `<loop-video>`: `muted playsinline loop preload="none"`. ~~**Never autoplays** (Product Owner decision, 2026-10-29).~~ **Superseded by ADR-0013 (2026-10-31): plays once when scrolled into view.** On hover-capable devices it plays on hover / keyboard focus and pauses on leave. On touch devices, a play indicator toggles playback on tap. It pauses when scrolled out of view.
- Size caps (enforced in CI): key-screen 8 MB, motion step 4 MB, card / preview 3 MB.
- `status: 'pending'` marks undelivered media. The build prints a pending-asset report, and the production build fails if anything is still pending.

**Not used**: YouTube/Vimeo/Figma iframes, GIFs for motion (much larger than MP4), image CDNs.

## Consequences
- Zero video bytes load until the user asks for a video. Posters carry all first impressions, so poster quality matters as much as the video.
- No pause control is needed for WCAG 2.2.2, because playback is always user-initiated.
- Delivery video lives in git. If it exceeds 300 MB, a new ADR moves video to Git LFS or Cloudflare R2.
- Astro image processing increases build time with many 2× sources. This is acceptable, and the Cloudflare build cache mitigates it.

## Alternatives considered
- **Cloudflare Stream / Mux**: adaptive streaming is overkill for short muted loops, and adds cost and a third-party player.
- **Cloudinary / imgix**: removes build-time processing, but adds a vendor and per-request cost. Astro's build-time output is sufficient.
