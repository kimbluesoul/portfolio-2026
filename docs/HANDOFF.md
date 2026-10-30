# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-30)
- **Phase**: **M1 — Home is implemented and green. It is awaiting independent review by ChatGPT** (temporary role swap, see below).
- **Branch / PR**: `feat/m1-home` / [PR #10](https://github.com/kimbluesoul/portfolio-2026/pull/10).
- **Quality gate**: the full `pnpm verify` passes locally:
  - lint, format, Astro check;
  - 42 unit tests;
  - two-pass build with font coverage and media / content / bundle checks;
  - 18 E2E / axe / CSP tests;
  - 9 Lighthouse runs.

  Home: LCP ~1.7 s, performance 0.99, fonts 115 KB.
- **Preview**: `https://feat-m1-home-portfolio-2026.kimbluesoul.workers.dev/`.

## ⚠️ Temporary role swap (2026-10-30)
ChatGPT ran out of usage partway through the M1 review fixes. At the Product Owner's request:
- **Claude** acted as **Implementation Engineer** for the rest of M1. Commit `a8025a3` recovers ChatGPT's uncommitted local work verbatim. Commit `3deda7c` and later commits are Claude's.
- **ChatGPT** acts as **independent Reviewer** for PR #10, focusing on Claude's commits. Claude did not review its own code.
- After PR #10 is merged, roles return to normal: ChatGPT implements, Claude reviews.
- **ChatGPT's local checkout** (`Documents/Codex/2026-10-29/.../work/portfolio-2026`) still contains the old uncommitted changes, now superseded by the pushed branch. Before any new work there, run `git fetch origin` and then `git reset --hard origin/feat/m1-home`, or start from a fresh clone. A backup of those files is in `%LOCALAPPDATA%\Temp\pf-backup`.

## Roles
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude (temporarily also the M1 implementer)
- **Implementation Engineer:** ChatGPT (temporarily the M1 reviewer)

## Next owner
1. **ChatGPT (Reviewer)**: review PR #10, especially Claude's commits from `3deda7c` on, using the P0–P3 format in `CLAUDE.md`. Post the verdict as a PR comment starting with `Reviewer: APPROVED` or `Reviewer: CHANGES REQUESTED`.
2. **Claude**: address the findings, if any.
3. **Product Owner**: check the preview against Figma, then merge PR #10.

## What changed in M1 (for the reviewer)
- **Content**: all home copy, tags, and links are verbatim from `docs/content/home-copy.md` (Figma). Unknown values are `TODO(CONTENT)`. There are 7 markers, all in case-study fields that belong to M2. Production builds fail while any remain.
- **Visual fidelity vs Figma** (`360:3`, `474:1057`, `465:662`):
  - card typography and layout;
  - nav active state;
  - hero credentials row;
  - About tool / skill rows;
  - footer grid order (mobile vs desktop).

  Values are cited in `docs/DESIGN_SYSTEM.md` → Typography.
- **Fonts (ADR-0012 + amendment)**: Noto Sans TC is subset per weight (700 = h1–h3, 500 = tag chips, 400 = all text), with core / ext splits and a per-weight coverage gate on `dist/`. Fonts are not preloaded.
- **Images**: the 7 card images from #12 render through `astro:assets` `<Picture>` (AVIF / WebP). The featured card is eager with `fetchpriority="high"`; the others are lazy.
- **Known limits**:
  - Card images are 1× Figma exports. The Product Owner may replace them with 2× files of the same name.
  - SEO titles / descriptions are set (home, case pages, resume), as chosen by the Product Owner and recorded in `docs/content/home-copy.md` → SEO.

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
- **ADR-0012** (+ amendment): build-time Noto Sans TC subsetting per weight, with no font preloads.
- **ARCHITECTURE §5.1 content fidelity rule**: copy is verbatim from Figma or the Product Owner. Missing values use `TODO(CONTENT)`.
- **Q8**: no analytics or tracking scripts.
- **Q9**: Traditional Chinese only. There is no English site or English PDF.
- **Q10**: hidden Figma layers are never implemented. AMD uses `360:2355`; hidden frame `437:652` is unused. Hwa Fong includes the live link `https://www.duro.com.tw/`. The PRODUCT.md project order wins, and 「深藍」 maps to `--color-bg-inverse`.

## Blockers
| Blocks | Item | Owner |
|---|---|---|
| M1 merge | Independent review of PR #10 | ChatGPT (Reviewer) |
| M2–M3 | Case-study copy (from Figma), assets, and video files | Product Owner |

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
| M1 Home | **PR #10 green; awaiting ChatGPT review** |
| M2 Case template + 88Win | Not started |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges. (M1 only: roles swapped, see above.)
