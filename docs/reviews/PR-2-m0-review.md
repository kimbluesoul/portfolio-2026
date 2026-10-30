# PR #2 — Architect review: M0 Bootstrap

- Reviewer: Claude (Architect)
- Date: 2026-10-30
- Commit reviewed: `87a6561` (`feat/m0-bootstrap`)
- Evidence: full diff read; CI green on GitHub Actions (Verify, E2E and axe, Lighthouse). Not run locally: Node is not installed on the reviewer machine.

## Architect review: APPROVED

M0 matches ARCHITECTURE v1 closely. Highlights:
- static Astro 7 setup with TS strictest;
- schemas that encode the V9 cardinality rules;
- pure `src/lib` with focused tests;
- a token layer guarded by Stylelint (`postcss-html` as a dev-only parser is accepted);
- budget scripts and a 3-stage CI that mirror `pnpm verify`.

The generated Noto Sans TC `@font-face` subset (only slices whose ranges intersect repository text) is a good refinement of ADR-0008.

There are no P0/P1 findings. **Before merge**, please fix P2-1 to P2-3 on this branch. They are small, and P2-2/P2-3 change the content contract, which is cheaper to fix before M1 content exists. No re-review is needed for those unless the fix changes architecture. P2-4/P2-5 and the P3s can go into M1.

## Findings

### P2-1 — Two competing CSP sources, untested in the real serving path
- **Where**: `public/_headers` (`Content-Security-Policy … script-src 'self'; style-src 'self'`) and `astro.config.mjs` (`security: { csp: true }`).
- **Problem**: When both a header CSP and Astro's `<meta>` CSP are present, the browser enforces **both**, so the effective policy is their intersection. The header has no hashes, so any inline `<style>` / `<script>` / `style=""` that Astro emits is blocked in production. Astro inlines small stylesheets by default (`build.inlineStylesheets: 'auto'`). Responsive images and component scripts in M1/M2 can also produce inline output. `astro preview` and the Lighthouse static server do **not** apply `_headers`, so no current test can see this.
- **Why it matters**: The site can pass CI and still render unstyled or broken on Cloudflare.
- **Recommended direction**: Keep one owner for `script-src` / `style-src`:
  - **Preferred**: let Astro's hashed `<meta>` CSP own `script-src` / `style-src` / `default-src`. Reduce the header CSP to what a meta tag cannot express: `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'`.
  - Add an E2E test that serves the built HTML with the `_headers` policy applied (e.g. a Playwright `route` that adds the header) and asserts **no console errors / CSP violations** on every route. ARCHITECTURE §16.2 already lists "no console errors".

### P2-2 — `Captioned` is missing the caption title
- **Where**: `src/content.config.ts` `captioned = { caption, media }`.
- **Problem**: Every Figma close-up, mobile panel, and detail item has two text lines: **Caption title** + **Caption sub** (e.g. `360:319` / `360:320`). The schema has one string. The ARCHITECTURE §5.1 sketch left `Captioned` undefined, so this is an architecture gap. ARCHITECTURE has been clarified.
- **Recommended direction**: `captioned = { title: string.min(1), caption: string.optional(), media }`.

### P2-3 — Project slug has two sources of truth
- **Where**: `projects` collection (`glob` loader gives `id` from the filename) + `slug` field in the YAML. `[slug].astro` routes on `data.slug`.
- **Problem**: `hwa-fong.yaml` with `slug: hwafong` builds silently at an unintended URL. Slugs are a public URL contract (ARCHITECTURE §3).
- **Recommended direction**: Drop the `slug` field and use `entry.id`, **or** keep it and fail the build when `data.slug !== entry.id`. Also restrict slugs to the 7 approved values in ARCHITECTURE §3 via `z.enum`.

### P2-4 — Collection-level invariants are not enforced at build
- **Where**: `src/lib/projects.ts#orderProjects` exists and is tested, but no page calls it.
- **Problem**: Unique, contiguous `order` across the collection is only checked if some page happens to call the function.
- **Recommended direction (M1)**: Add a single `getOrderedProjects()` in `src/lib`, used by the home grid and `[slug].astro`, so every build validates the whole collection.

### P2-5 — Typography weights
- **Where**: `scripts/generate-font-css.mjs` reads only `@fontsource/noto-sans-tc/400.css`.
- **Problem**: Figma headings use bold Chinese (e.g. 「設計畫面，」). With only 400 loaded, browsers synthesize faux bold.
- **Recommended direction (M1)**: When transcribing the type scale, generate slices for each weight Figma actually uses (likely 400 / 500 / 700). Re-check the 200 KB font budget.

### P3 — Optional / fold into M1
- `BaseLayout`: viewport meta should be `width=device-width, initial-scale=1`.
- Skip link and the new-tab hint are English on a `zh-Hant-TW` page. Use 「跳到主要內容」 and 「（另開新視窗）」 per ARCHITECTURE §5.3.
- `SiteFooter` uses `--color-text-on-brand` on an inverse background. Add `--color-text-on-inverse` and use that.
- `SiteHeader` border width reuses `--focus-ring-width`. Give it its own token (e.g. `--border-width-hairline`).
- Media size limits and pending detection exist twice (`src/lib/media.ts` and `scripts/check-media.mjs`). Have the script import the lib, or delete the unused one.
- The Lighthouse `resource-summary:total:size` 1.2 MB applies to case pages too. ARCHITECTURE §13 allows 1.5 MB for case pages. Use a per-URL assertion matrix.
- CI builds three times (verify, e2e, lighthouse). Uploading `dist/` as an artifact from `verify` would save about 1–2 minutes per run.
- `--bp-*` custom properties cannot be used in media queries. Keep them as documentation, and mirror them in `src/lib/breakpoints.ts` per ARCHITECTURE §10.

## Notes for M1
- Q10 resolved: hidden Figma layers are not implemented (AMD uses `360:2355`, not hidden `437:652`). Hwa Fong has a live site link.
- A Cloudflare Pages preview is needed for M1 visual review. This depends on the Product Owner creating the Cloudflare project (Q7).
