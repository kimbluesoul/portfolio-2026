# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-11-01)
- **Phase**: M1 Home is done (PR #10). **M2 (case template + 88Win) is done (PR #14)**. The first fidelity follow-up merged (PR #17). **M3 Hwa Fong Tire is done (PR #21)**, and play-once video behavior is done (PR #23). The 390 case-template fidelity follow-up is in review on `fix/case-template-fidelity`.
- **Process change (2026-10-31)**: Claude writes a page spec sheet before implementation, and every UI PR includes a Figma vs page table ([`docs/specs/README.md`](specs/README.md)). The Product Owner's media export list is [`docs/ASSETS.md`](ASSETS.md).
- **Where to see the latest site**: **`https://staging-portfolio-2026.kimbluesoul.workers.dev/`**. `staging` mirrors `main` automatically on every merge (ADR-0011 amendment).
- **Production** (`https://portfolio-2026.kimbluesoul.workers.dev/`) intentionally still shows the M0 build. Production deploys are blocked until no `TODO(CONTENT)` remains (Product Owner decision A, 2026-10-30). Until launch, **a red "Workers Builds" check on `main` is expected and is not a bug.**

## Roles (restored after M1)
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

During M1 the roles were temporarily swapped: Claude implemented the review fixes and ChatGPT reviewed (`a8025a3` recovered ChatGPT's uncommitted work; `3deda7c`–`b333100` are Claude's). This ended with the merge of PR #10.

**ChatGPT, before starting M2:** your local checkout (`Documents/Codex/2026-10-29/.../work/portfolio-2026`) may still hold the old uncommitted M1 files. Run `git fetch origin`, `git checkout main`, and `git reset --hard origin/main` (or use a fresh clone). A backup of those files exists in `%LOCALAPPDATA%\Temp\pf-backup`.

## Next owner
1. **Reviewer (new Claude chat, Codex is out until 2026-11-06)**: review the fix round on `fix/case-template-fidelity` (PR #26).
2. **Product Owner**: export the 88Win media listed in [`docs/ASSETS.md`](ASSETS.md) whenever convenient, put them in one folder, and tell Claude, who checks them and opens an assets PR. The build's pending-asset report shows what is still missing.

## M1 summary
- **Content**: home copy, tags, links, and SEO are verbatim from `docs/content/home-copy.md`. The 7 remaining `TODO(CONTENT)` markers are case-study fields (M2 / M3).
- **Visual fidelity**: values are cited per Figma node in `docs/DESIGN_SYSTEM.md` → Typography.
- **Fonts**: ADR-0012 + amendments. Per-weight subsets (700 = h1–h3, 500 = tag chips, 400 = all) with a fixed `CORE_BASELINE` and a per-weight coverage gate. No preloads. Home fonts 158 KB, home LCP ~2.3 s.
- **Accessibility**: header tap targets ≥ 44 px via an invisible hit layer (E2E-tested at 390 px). axe runs with reduced motion so contrast is judged after reveals settle.
- **Known limits**: card images are 1× Figma exports. Same-name 2× files can replace them.

## Decisions recorded on 2026-10-29
- **Q1 / A2**: 7 projects in a fixed order (PRODUCT.md updated).
- **Q2**: mobile 390 frames exist for every page (ARCHITECTURE Appendix A). The tablet range is handled per ARCHITECTURE §10.
- **Q3**: the resume page follows the layout of `public/files/Syuan-Ci-Resume.pdf`.
- **Q4**: motion tokens and rules are in DESIGN_SYSTEM → Motion. Steps do not auto-advance.
- **Q5**: AMD 維護 video resolved by the Product Owner.
- **Q6**: videos never autoplay. Desktop plays on hover / focus; mobile plays on tap with a play indicator.
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
| Launch | All pending images (2× Figma exports) and videos, listed by the pending-asset report | Product Owner |

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
- Case-template fidelity follow-up (PR #26): `hero.titleSizeMobile` is restricted to the sizes in `src/lib/case-title.ts` (56, 76), each mapped to one `.title-mobile-<size>` class (no inline style, no `attr()`), and case titles use `-0.04em` tracking. The 390 back link stays centred, and mobile Motion uses a vertical step rail. 390 section heights come from Figma spacing and typography (intro 12 / 12 / 28, captions 16 + 14 / 1.5, body 15 / 1.7, steps 28 apart), never from a fixed `min-height`. E2E gates each project against its own frame at ±8 px: 88Win `475:953` and Hwa Fong `483:1298`. 88Win Details renders 48 px shorter because the 390 frame uses a longer 遊戲圖面 description than the desktop copy.
- `check-media.mjs` now validates pending filenames for every project that has its own project section in [`docs/ASSETS.md`](ASSETS.md), rather than special-casing 88Win.
- Validation: `CI=true pnpm verify` passes (51 unit tests; 30 E2E tests passed with 4 intentional project-specific skips; all 9 Lighthouse runs passed).

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1.1 / v1.2 | Done (PR #3, #11) |
| M0 Bootstrap | Done (PR #2) |
| M1 Home | **Done (PR #10)** |
| M2 Case template + 88Win | **Done (PR #14); 390 template fidelity follow-up in review** |
| M3 Remaining case studies | **In progress**: Hwa Fong done (PR #21) |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
Claude writes the page spec sheet → ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template (with the Figma vs page table) → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges. 
