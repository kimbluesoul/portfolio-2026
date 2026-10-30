# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-30)
- **Phase**: **M0 — Architect approved; required P1/P2 corrections applied; Workers preview live; awaiting final CI, Architect re-review, and Product Owner merge.**
- **Branch / PR**: `feat/m0-bootstrap` / PR #2. Architecture v1.1, ADR-0011, and the full M0 review are in PR #3, which should merge before or together with PR #2.
- **Quality gate**: `pnpm verify` passes locally after the ADR-0011 hosting corrections (lint, format, Astro check, 42 unit tests, static build, 12 Playwright/axe/CSP checks, and 9 Lighthouse runs across 3 routes). Wrangler 4.155.0 dry run and Workers Builds preview deployment pass.
- **Scope**: Project scaffold, tooling, CI, content schemas, placeholder routes, and test infrastructure only. No visual section implementation, real project content, media, or motion was added.
- **Preview**: `https://feat-m0-bootstrap-portfolio-2026.kimbluesoul.workers.dev/`

## Roles
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

## Next owner
1. **Claude**: re-review PR #2, including the issue #4 platform compatibility note.
2. **Product Owner**: merge PR #3 before or together with PR #2, then merge M0 after required checks and review pass.
3. **M1** must not start before M0 is merged. Use the Cloudflare Workers branch preview for visual review.

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
| M1 | Type scale, spacing, and layout widths transcribed into DESIGN_SYSTEM from Figma, citing node IDs (A3/A4) | ChatGPT transcribes; Product Owner confirms in the PR |
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

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1.1 | **Approved; awaiting merge** (PR #3) |
| M0 Bootstrap | **In review** (PR #2) |
| M1 Home | Not started |
| M2 Case template + 88Win | Not started |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges.
