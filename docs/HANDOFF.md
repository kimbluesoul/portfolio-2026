# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-11-05)
- **Phase**: **M1 Home, M2 case template and M3 (all seven case studies with media) are done** (last merge PR #71). Scroll reveals (#68), the tone-aware header (#69, #70), the mosaic seam fix (#62) and CI build-once (ADR-0014, #61 / #63) are merged. **No pending media and no `TODO(CONTENT)` remain.** ARCHITECTURE v1.14 records the M3 state.
- **Next**: M4 (`/resume/`) and M5 (launch hardening) have not started. The production switch (below) can happen any time the Product Owner decides.
- **Process**: Claude writes a page spec sheet before implementation, and every UI PR includes a Figma vs page table ([`docs/specs/README.md`](specs/README.md)). The Product Owner's media list is [`docs/ASSETS.md`](ASSETS.md). Claude makes media PRs; Codex implements code.
- **Where to see the latest site**: **`https://staging-portfolio-2026.kimbluesoul.workers.dev/`**. `staging` mirrors `main` automatically on every merge (ADR-0011 amendment).
- **Production** (`https://portfolio-2026.kimbluesoul.workers.dev/`) intentionally still shows the M0 build (Product Owner decision A, 2026-10-30). Its gate (no pending media, no `TODO(CONTENT)`) is now open; production updates once the Product Owner turns production deploys back on. Until then, **a red "Workers Builds" check on `main` is expected and is not a bug.**
- **Repository is public** since 2026-11-05 (ADR-0014 amendment).

## Roles (restored after M1)
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

During M1 the roles were temporarily swapped: Claude implemented the review fixes and ChatGPT reviewed (`a8025a3` recovered ChatGPT's uncommitted work; `3deda7c`–`b333100` are Claude's). This ended with the merge of PR #10.

**ChatGPT, before starting M2:** your local checkout (`Documents/Codex/2026-10-29/.../work/portfolio-2026`) may still hold the old uncommitted M1 files. Run `git fetch origin`, `git checkout main`, and `git reset --hard origin/main` (or use a fresh clone). A backup of those files exists in `%LOCALAPPDATA%\Temp\pf-backup`.

## Next owner
1. **Product Owner**: decide when to switch production on, and Q11 (WCAG 2.2.2 for auto-started clips, ARCHITECTURE §17) before M5.
2. **Claude**: re-encode HUIFA `detail-live.mp4` at 1920 w (media PR); write the M4 resume spec when the Product Owner starts M4.
3. **Codex (low-priority backlog)**: `-webkit-backdrop-filter` on the scrolled header (#70 P3); an image-only schema for `mobileMedia` (#65 P3-2); one source for the media slot rules (#67 P3); case-page scroll restore (#36 P2-1); `--font-size-body` is 17.91 px at 1920 (#31); a stylelint guard for `font-feature-settings` (#30); the #26 and #52 P3s.

## M1 summary
- **Content**: home copy, tags, links, and SEO are verbatim from `docs/content/home-copy.md`. The 7 remaining `TODO(CONTENT)` markers are case-study fields (M2 / M3).
- **Visual fidelity**: values are cited per Figma node in `docs/DESIGN_SYSTEM.md` → Typography.
- **Fonts**: ADR-0012 + amendments. Per-weight subsets (selector rule in `scripts/font-text.mjs`, widened 2026-11-01 beyond h1–h3 / tag chips; see DESIGN_SYSTEM) with a fixed `CORE_BASELINE` and a per-weight coverage gate. No preloads. Home fonts ~110 KB (Instrument Sans Latin 30 KB + Noto core subsets 81 KB), home LCP ~2.3 s.
- **Accessibility**: header tap targets ≥ 44 px via an invisible hit layer (E2E-tested at 390 px). axe runs with reduced motion so contrast is judged after reveals settle.
- **Known limits**: card images are 1× Figma exports. Same-name 2× files can replace them.

## Decisions recorded on 2026-10-29
- **Q1 / A2**: 7 projects in a fixed order (PRODUCT.md updated).
- **Q2**: mobile 390 frames exist for every page (ARCHITECTURE Appendix A). The tablet range is handled per ARCHITECTURE §10.
- **Q3**: the resume page follows the layout of `public/files/Syuan-Ci-Resume.pdf`.
- **Q4**: motion tokens and rules are in DESIGN_SYSTEM → Motion. ~~Steps do not auto-advance.~~ Revised 2026-11-02: steps auto-advance once.
- **Q5**: AMD 維護 video resolved by the Product Owner.
- **Q6**: ~~videos never autoplay.~~ Revised 2026-10-31 (ADR-0013): videos play once on entering view; hover / re-entry replays.
- **A1**: ChatGPT reads Figma directly. In practice, Figma image export was not available to ChatGPT, so Claude exported the M1 images (#12).

## Decisions recorded on 2026-10-31
- **Process options 2 and 3 adopted**: page spec sheets written by Claude before implementation, and a Figma vs page side-by-side table in every UI PR ([`docs/specs/README.md`](specs/README.md), PR template).
- **ARCHITECTURE v1.5 (§9)**: export shapes (composite / crop / art-directed Details), poster naming, motion slot ratio 960 / 532, and the Product Owner's export list [`docs/ASSETS.md`](ASSETS.md).

## Decisions recorded on 2026-10-30
- **ADR-0011**: Cloudflare Workers static assets via Workers Builds supersedes Cloudflare Pages. Production uses `portfolio-2026.kimbluesoul.workers.dev`; previews are branch deployments.
- **ADR-0012** (+ amendments): build-time Noto Sans TC subsetting per weight, a fixed core baseline, and no font preloads.
- **ADR-0011 amendment**: production deploys only content-complete builds (option A); `staging` mirrors `main` for review.
- **ARCHITECTURE §5.1 content fidelity rule**: copy is verbatim from Figma or the Product Owner. Missing values use `TODO(CONTENT)`.
- **Q8**: no analytics or tracking scripts.
- **Q9**: Traditional Chinese only. There is no English site or English PDF.
- **Q10**: hidden Figma layers are never implemented. AMD uses `360:2355`; hidden frame `437:652` is unused. Hwa Fong includes the live link `https://www.duro.com.tw/`. The PRODUCT.md project order wins, and 「深藍」 maps to `--color-bg-inverse`.

## Blockers
| Blocks | Item | Owner |
|---|---|---|
| Launch | ~~All pending media~~ Delivered 2026-11-04 (#54–#60, #66) | — |
| Production switch | Turn production deploys on (Cloudflare / GitHub steps from Claude on request) | Product Owner |
| M5 | Q11 (WCAG 2.2.2) and Q7 domain (optional) | Product Owner |

## M0 implementation notes
- Astro 7 static output, Node 24, pnpm, TypeScript strictest, approved dependencies, and all §16.1 scripts are configured.
- Content schemas enforce the §5.1 media and project cardinality rules.
- `BaseLayout`, header / footer, and the `/`, `/work/[slug]/`, `/resume/`, `/404` routes are present.
- `postcss-html` is a dev-only parser that Stylelint needs to enforce token rules inside Astro scoped styles. It has no runtime output.
- CI runs verify → E2E / axe → Lighthouse. Media size, pending media, `TODO(CONTENT)`, gzip CSS, and gzip first-party JS budgets are build gates.
- P2-1: Astro's hashed meta CSP owns the resource directives. `_headers` contains only `frame-ancestors`, `base-uri`, `object-src`, and `form-action`. Playwright applies that header to every route and checks for console / CSP violations.
- P2-2: captioned media requires `title`, allows an optional `caption`, and requires `media`.
- P2-3: project URLs come only from the content entry ID. The loader rejects filenames outside the seven approved slugs.
- P1-A / Issue #4: `wrangler.jsonc` configures `dist/` as Workers static assets, with a 404 fallback, forced trailing slashes, and an empty `previews` block for branch previews.
- P1-B: the production pending-media guard checks `WORKERS_CI_BRANCH === 'main'`.
- Workers Builds: build command `pnpm build`, deploy command `npx wrangler deploy`, root `/`, Node 24, pnpm 11.25.0. Retrying an older failed build reuses its old settings snapshot, so a new commit is required to validate current settings.

## M1 implementation notes
- P2-4: `getOrderedProjects()` is used by the home page and `[slug].astro`, so duplicate or gapped order values fail every build.
- P2-5: Noto Sans TC weights 400 / 500 / 700 are all generated (per-weight subsets, ADR-0012 amendment).
- Card videos are not enabled because no card MP4s have been delivered. `<loop-video>` remains out of scope for M1 under ARCHITECTURE §19 ("if cards use video").
- Visual QA screenshots: `docs/screenshots/m1-home-desktop.png` (1920 px) and `docs/screenshots/m1-home-mobile.png` (390 px), produced by `scripts/capture-home.mjs` against `pnpm preview`.
- Local tooling note: if a stale `astro preview` is already listening on port 4321, Playwright reuses it outside CI. Run `CI=true pnpm test:e2e` (or stop the stale server) so tests hit the current build.

## M2 implementation notes
- Claude re-review: focus / hover playback now runs only on hover-capable, non-reduced-motion devices; explicit mobile tap remains available and is covered by a WebKit touch fixture. Hero heading, stats, and Next Project heading stay on one line at 1920 px. Authored `\n` values render as `<br>`. Mobile close-ups and device panels use keyboard-focusable CSS scroll-snap rows. Next Project derives `/ 07` from the content collection.
- Architecture v1.5 media: Hero uses one `hero-showcase.jpg` composite (`1920 / 820`, top-aligned); Visual Extension uses one `visual-mosaic.jpg`; motion slots use `960 / 532`; every Details card has desktop and mobile PNG media rendered through `<picture>` at the documented breakpoint.
- The pending-asset report lists all 30 88Win deliverables from [`docs/ASSETS.md`](ASSETS.md), including `key-main-poster.jpg` and the three motion posters. `check-media.mjs` fails if an 88Win pending filename is not documented.
- Visual QA: the 18 section screenshots are in [`docs/screenshots/88win/`](screenshots/88win/) and correspond one-to-one with [`docs/specs/88win/`](specs/88win/). The capture script hides the persistent site chrome so each image compares only the matching Figma section.
- Fidelity follow-up: Next Project uses Figma's `-0.04em` display tracking and `1440 / 741` preview; motion is `960 × 532` with its timeline at desktop x=1280. At 390 px, Hero is 784 px with a full-bleed `390 × 312` showcase clipped by the child frame at its lower edge, stats are a 110 px 2 × 2 grid, Next Project is 530 px with a 64 px arrow, Details media keeps 20 px side margins, and both swipe rows bleed to the viewport with their first item at x=20.
- Case-template fidelity follow-up (PR #26): `hero.titleSizeMobile` is restricted to the sizes in `src/lib/case-title.ts` (56, 76), each mapped to one `.title-mobile-<size>` class (no inline style, no `attr()`), and case titles use `-0.04em` tracking. The 390 back link stays centred, and mobile Motion uses a vertical step rail. 390 section heights come from Figma spacing and typography (intro 12 / 12 / 28, captions 16 + 14 / 1.5, body 15 / 1.7, steps 28 apart), never from a fixed `min-height`. E2E gates each project against its own frame at ±8 px: 88Win `475:953` and Hwa Fong `483:1298`. The 88Win 遊戲圖面 Details caption and the Motion step titles (full-width space) now match Figma.
- `check-media.mjs` now validates pending filenames for every project that has its own project section in [`docs/ASSETS.md`](ASSETS.md), rather than special-casing 88Win.
- 88Win COLOR now uses `media.kind: swatches` with `#RRGGBB` validation. The five colors render as semantic `<ul>` / `<li>` text plus decorative SVG rectangles, retain the 140 px desktop / 280 px mobile media-slot height, and remove two pending asset files from [`docs/ASSETS.md`](ASSETS.md). Final `pnpm verify` passes: 85 unit tests, 56 E2E tests passed with 14 intentional project/device skips, and all 9 Lighthouse runs passed.
- Validation: `CI=true pnpm verify` passes (51 unit tests; 30 E2E tests passed with 4 intentional project-specific skips; all 9 Lighthouse runs passed).

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1.1 / v1.2 | Done (PR #3, #11) |
| M0 Bootstrap | Done (PR #2) |
| M1 Home | **Done (PR #10)** |
| M2 Case template + 88Win | **Done (PR #14, follow-ups through #46)** |
| M3 Remaining case studies | **Done**: pages #21, #49–#53; media #54–#60, #66, #71; reveals #68; header #69 / #70 |
| Architecture v1.13 / v1.14 | Done (#64; v1.14 this docs PR) |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
Claude writes the page spec sheet → ChatGPT implements on a feature branch → local gates green (ARCHITECTURE §16.1) → PR → 4 CI checks green → using the template (with the Figma vs page table) → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges. 
