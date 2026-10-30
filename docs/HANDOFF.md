# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-30)
- **Phase**: **M1 — Home implementation is deployed in Draft PR #10; review-ready status is blocked only by the CJK font architecture decision in Issue #9.**
- **Branch / PR**: `feat/m1-home` / [PR #10](https://github.com/kimbluesoul/portfolio-2026/pull/10) (Draft).
- **Quality gate**: the final `pnpm verify` run on 2026-10-30 passed format, lint, Astro check, unit tests (42), E2E/axe/CSP tests (16), build, media checks, and bundle checks. Lighthouse is the sole failing gate: font transfer is 802,008 bytes against the 204,800-byte budget, median LCP is 6,214.076 ms, and the median performance score is 0.63.
- **Implemented scope**: Figma token transcription, 7-project home content, Hero, project cards/grid, About, Footer, navigation, hover/focus states, reduced-motion behavior, and `<reveal-on-view>`.
- **Preview**: Cloudflare Workers build succeeded; live branch URL: `https://feat-m1-home-portfolio-2026.kimbluesoul.workers.dev/`.

## Roles
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

## Next owner
1. **Claude / Architect**: review Draft PR #10 and decide Architecture Issue #9. The recommended path is build-time Noto Sans TC glyph subsetting in a superseding ADR; the alternatives are a larger font budget or a system-font fallback.
2. **ChatGPT**: after that decision, apply the approved font strategy, make `pnpm verify` green, update this handoff, and move the M1 PR out of draft.
3. **Product Owner**: confirm the transcribed Figma values in `docs/DESIGN_SYSTEM.md`, the lightweight project-card poster direction, and the Workers preview.

## Decisions recorded on 2026-10-29
- **Q1 / A2**: 7 projects in a fixed order (PRODUCT.md updated).
- **Q2**: mobile 390 frames exist for every page (ARCHITECTURE Appendix A). The tablet range is handled per ARCHITECTURE §10.
- **Q3**: the resume page follows the layout of `public/files/Syuan-Ci-Resume.pdf`.
- **Q4**: motion tokens and rules are in DESIGN_SYSTEM → Motion. Steps do not auto-advance.
- **Q5**: AMD 維護 video resolved by the Product Owner.
- **Q6**: videos never autoplay. Desktop plays on hover / focus, mobile on tap with a play indicator.
- **A1**: ChatGPT reads Figma directly and exports image assets itself. Videos come from the Product Owner.

## Decisions recorded on 2026-10-30
- **ADR-0011**: Cloudflare Workers static assets via Workers Builds supersedes Cloudflare Pages. Production uses `portfolio-2026.kimbluesoul.workers.dev`; previews are branch deployments.
- **Q8**: no analytics or tracking scripts.
- **Q9**: Traditional Chinese only. There is no English site or English PDF.
- **Q10**: hidden Figma layers are never implemented. AMD uses `360:2355`; hidden frame `437:652` is unused. Hwa Fong includes the live link `https://www.duro.com.tw/`. PRODUCT.md project order wins, and 「深藍」 maps to `--color-bg-inverse`.

## Blockers
| Blocks | Item | Owner |
|---|---|---|
| M1 review-ready | [Issue #9](https://github.com/kimbluesoul/portfolio-2026/issues/9): the approved full Noto Sans TC unicode slices exceed the M0 200 KB font budget. A superseding architecture decision is required. | Claude / Architect |
| M2–M3 | Delivery of video files per project (MP4 masters) | Product Owner |
| M5 | Q7: choose a custom production domain if one will be used; `*.workers.dev` remains the fallback | Product Owner |

## M0 implementation notes
- Astro 7 static output, Node 24, pnpm, TypeScript strictest, approved dependencies, and all §16.1 scripts are configured.
- Content schemas enforce the §5.1 media and project cardinality rules. `site.yaml` and one schema-valid 88Win placeholder entry are included.
- `BaseLayout`, header/footer skeletons, and `/`, `/work/[slug]/`, `/resume/`, `/404` placeholders are present.
- CSS includes approved color and motion tokens. Typography and spacing remain marked `TODO(DESIGN_SYSTEM)` for M1 transcription and Product Owner confirmation.
- Noto Sans TC uses generated Fontsource unicode slices based on repository content so CSS/font budgets remain enforced without a third-party font service.
- `postcss-html` is a dev-only parser required for Stylelint to enforce token rules inside Astro scoped styles; it has no runtime output.
- CI runs verify → E2E/axe → Lighthouse. Media size, pending media, gzip CSS, and gzip first-party JS budgets are build gates.
- P2-1: Astro's hashed meta CSP owns resource directives. `_headers` now contains only `frame-ancestors`, `base-uri`, `object-src`, and `form-action`; Playwright applies that header to every route and checks console/CSP violations.
- P2-2: captioned media now requires `title`, allows optional `caption`, and keeps `media` required.
- P2-3: project URLs now come only from the content entry ID. The loader rejects filenames outside the seven approved slugs.
- P1-A: `wrangler.jsonc` configures `dist/` as Workers static assets with 404 fallback and forced trailing slashes; Wrangler is an exact-version dev dependency. pnpm permits install scripts only for Wrangler's required `esbuild` and `workerd` packages.
- Cloudflare's current Workers Builds preview flow replaces the production deploy command with `npx wrangler preview` on non-`main` branches. Wrangler 4.155.0 therefore requires an empty top-level `previews` block. Issue #4 records this minimal addition because the accepted P1-A snippet predates that platform requirement; production settings remain unchanged.
- P1-B: the production pending-media guard now checks `WORKERS_CI_BRANCH === 'main'`.
- URL configuration uses `https://portfolio-2026.kimbluesoul.workers.dev` for Astro canonical/sitemap generation and `robots.txt`.
- Workers Builds is configured with build command `pnpm build`, deploy command `npx wrangler deploy`, root `/`, Node 24, and pnpm 11.25.0. Retrying an older failed build reuses its old settings snapshot; a new commit is required to validate current settings.
- Cloudflare Worker URL and Preview URLs are enabled. The live branch preview is `https://feat-m0-bootstrap-portfolio-2026.kimbluesoul.workers.dev/`.
- P2-4 (collection-level order validation) and P2-5 (all Figma font weights) are explicitly deferred to M1 per the Architect review.

## M1 implementation notes
- Figma desktop `360:3`, mobile `474:1057`, and interactive component section `465:662` were read in Dev Mode. Exact typography, spacing, layout widths, and child-node citations are recorded in `docs/DESIGN_SYSTEM.md`.
- P2-4 is implemented through `getOrderedProjects()`. Both the home page and `[slug].astro` call it, so duplicate/gapped order values fail every production build.
- P2-5 is implemented by generating Noto Sans TC unicode-range CSS for weights 400, 500, and 700.
- The 7 home project entries now exist in the approved PRODUCT order. Case-study bodies remain M2/M3 scope; their schema-valid fields are intentionally minimal.
- Home videos are not enabled because the Product Owner has not delivered the M1 card MP4 files. Cards use lightweight in-code poster compositions and the approved CSS hover behavior; `<loop-video>` therefore remains out of scope under ARCHITECTURE §19 (“if cards use video”).
- Visual QA screenshots are committed at `docs/screenshots/m1-home-desktop.png` (1920 px) and `docs/screenshots/m1-home-mobile.png` (390 px).
- All local checks are green except Lighthouse. The browser loads 24 Noto Sans TC WOFF2 slices (802,008 bytes); the final `pnpm verify` measured median LCP at 6,214.076 ms and performance score at 0.63. This cannot be changed inside M1 without superseding ADR-0008, so Architecture Issue #9 was raised instead of silently changing the decision.
- Exact resume point if this session stops: Draft PR #10 and its Workers preview are live. Wait for Claude's decision on Issue #9; then apply the approved font strategy, rerun `pnpm verify`, update this file and the PR, and mark the PR ready only when the required gates are green.

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1.1 | Done (PR #3) |
| M0 Bootstrap | Done (PR #2) |
| M1 Home | **Draft PR #10; architecture-blocked** (`feat/m1-home`, Issue #9) |
| M2 Case template + 88Win | Not started |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges.
