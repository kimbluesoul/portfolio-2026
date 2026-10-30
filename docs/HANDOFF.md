# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-31)
- **Phase**: **M2 Case template + 88Win review fixes are implemented** on `feat/m2-case-template` in PR #14. P1-1–P1-3 and P2-1 from Claude's review are resolved against ARCHITECTURE v1.4 and Figma `360:251` / `475:953`.
- **Where to see the latest site**: **`https://staging-portfolio-2026.kimbluesoul.workers.dev/`**. `staging` mirrors `main` automatically on every merge (ADR-0011 amendment).
- **Production** (`https://portfolio-2026.kimbluesoul.workers.dev/`) intentionally still shows the M0 build. Production deploys are blocked until no `TODO(CONTENT)` remains (Product Owner decision A, 2026-10-30). Until launch, **a red "Workers Builds" check on `main` is expected and is not a bug.**

## Roles (restored after M1)
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

During M1 the roles were temporarily swapped: Claude implemented the review fixes and ChatGPT reviewed (`a8025a3` recovered ChatGPT's uncommitted work; `3deda7c`–`b333100` are Claude's). This ended with the merge of PR #10.

**ChatGPT, before starting M2:** your local checkout (`Documents/Codex/2026-10-29/.../work/portfolio-2026`) may still hold the old uncommitted M1 files. Run `git fetch origin`, `git checkout main`, and `git reset --hard origin/main` (or use a fresh clone). A backup of those files exists in `%LOCALAPPDATA%\Temp\pf-backup`.

## Next owner
1. **Claude**: re-review PR #14 at the latest commit. Confirm P1-1–P1-3 and P2-1 are resolved, including the v1.4 transcription checklist, Details bento, Links cards, corrected `next` ownership, centred layouts, and user-initiated playback under reduced motion. Leave the standard P0–P3 findings and verdict comment.
2. **ChatGPT**: address any new review findings on `feat/m2-case-template` and rerun `pnpm verify` before requesting another review.
3. **Product Owner**: deliver the listed 2× Figma image exports and videos **after** M2 review (Product Owner decision, 2026-10-30). Until then every 88Win media slot intentionally renders the shared neutral placeholder with `素材待補`.

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

## M2 implementation notes
- The project schema accepts pending images and videos only when `status: pending`, `expectedFile`, and an explicit aspect ratio are present. `ProjectMedia` routes ready images, ready videos, and pending media through one contract.
- `CaseSections` renders the fixed nine-section sequence: hero, overview, key screens, mobile / RWD, interaction / motion, details, visual extension, prototype links, and next project.
- `<motion-steps>` uses a manual WAI-style tab pattern with roving focus, Arrow / Home / End keyboard controls, and no auto-advance. `<loop-video>` never autoplays; ready videos play on desktop hover / focus or mobile tap, pause off-screen, and respect reduced motion.
- ARCHITECTURE v1.4 is implemented: `**accent**` text is parsed without HTML injection; Details accepts 1–8 items and renders the 88Win seven-card bento; Link cards have separate eyebrow, title, and description fields.
- Every visible 88Win text node and both Prototype links were re-read from Figma. `src/content/projects/88win.yaml` contains no `TODO(CONTENT)` markers. All seven Details descriptions, the third Overview block, the exact H5 URL, and the exact Next Project strings are present.
- `next` describes the project that owns the entry. `NextProject` now renders `next.data.next`; Hwa Fong owns the Hwa Fong copy and 88Win owns the copy shown on HUIFA.
- Under reduced motion, only hover-initiated playback is suppressed. Focus, keyboard, tap / click, and motion-step selection remain user-initiated playback paths.
- All 22 88Win image / video slots are pending and grouped under `88win` in the build's pending-asset report. The approved Figma exports and videos are still the only visual deviation from Figma.
- Visual QA screenshots: `docs/screenshots/m2-88win-desktop.png` (1920 px) and `docs/screenshots/m2-88win-mobile.png` (390 px), produced by `scripts/capture-case.mjs` against `pnpm preview`.
- Review-fix validation on 2026-10-31: the final aggregate `pnpm verify` passed, including ESLint / Stylelint / Prettier / Astro check, 49 unit tests, the static build, 24 Playwright desktop + mobile tests, and all 9 Lighthouse runs across `/`, `/work/88win/`, and `/resume/`.
- Production remains intentionally blocked by pending media and content markers. Branch / staging previews are expected to deploy normally under ADR-0011.

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1.1 / v1.2 | Done (PR #3, #11) |
| M0 Bootstrap | Done (PR #2) |
| M1 Home | **Done (PR #10)** |
| M2 Case template + 88Win | **In review (`feat/m2-case-template`)** |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges. 
