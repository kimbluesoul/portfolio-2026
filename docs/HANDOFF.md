# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-30)
- **Phase**: **M1 Home is done and merged** (PR #10, approved by ChatGPT as independent reviewer). **Next: M2, the case-study template + 88Win.**
- **Where to see the latest site**: **`https://staging-portfolio-2026.kimbluesoul.workers.dev/`**. `staging` mirrors `main` automatically on every merge (ADR-0011 amendment).
- **Production** (`https://portfolio-2026.kimbluesoul.workers.dev/`) intentionally still shows the M0 build. Production deploys are blocked until no `TODO(CONTENT)` remains (Product Owner decision A, 2026-10-30). Until launch, **a red "Workers Builds" check on `main` is expected and is not a bug.**

## Roles (restored after M1)
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

During M1 the roles were temporarily swapped: Claude implemented the review fixes and ChatGPT reviewed (`a8025a3` recovered ChatGPT's uncommitted work; `3deda7c`–`b333100` are Claude's). This ended with the merge of PR #10.

**ChatGPT, before starting M2:** your local checkout (`Documents/Codex/2026-10-29/.../work/portfolio-2026`) may still hold the old uncommitted M1 files. Run `git fetch origin`, `git checkout main`, and `git reset --hard origin/main` (or use a fresh clone). A backup of those files exists in `%LOCALAPPDATA%\Temp\pf-backup`.

## Next owner
1. **Product Owner**: merge this handoff PR. Images (2× exports from Figma) and videos are delivered **after** M2 (Product Owner decision, 2026-10-30). The pending-asset report lists exactly which files are needed.
2. **ChatGPT**: implement **M2 — case-study template + 88Win structure** on `feat/m2-case-template` from `main` (ARCHITECTURE §19):
   - first, the **pending-media support** in ARCHITECTURE §9.3 (v1.3): image and video `status: 'pending'` with `expectedFile`, a shared placeholder, a "素材待補" label on previews, and an `expectedFile` list in the pending report;
   - all 9 case section components;
   - the `CaseSections` renderer (order, omission, tone);
   - `<motion-steps>` and `<loop-video>` (hover / focus on desktop, tap on mobile, ARCHITECTURE §7);
   - 88Win content. **Every 88Win media slot is `pending`** with its `expectedFile` (§9.1 naming). Copy is verbatim from Figma `360:251` (desktop) / `475:953` (mobile) per §5.1. Anything not in Figma is `TODO(CONTENT)`.

   Run `pnpm verify` (use `CI=true` for E2E if a stale preview server holds port 4321), then open the PR with the template and the branch preview URL.
3. **Claude**: review the M2 PR, including copy fidelity against Figma.

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

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1.1 / v1.2 | Done (PR #3, #11) |
| M0 Bootstrap | Done (PR #2) |
| M1 Home | **Done (PR #10)** |
| M2 Case template + 88Win | Not started |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges. 
