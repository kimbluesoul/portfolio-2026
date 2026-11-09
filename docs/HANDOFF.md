# Handoff

> A status index, not a log (adopted 2026-11-05). Every agent reads it first and updates it when project state changes. Details live in specs, ADRs, ARCHITECTURE, and the PRs; link to them instead of copying them here. The M0–M2 implementation notes that used to be here are in the git history of this file (before PR #72).

## Status (2026-11-08)
- **Milestone**: **M1–M5 are done** (2026-11-06). M5 shipped the share preview (#85 / #86, checked on Facebook and LINE) and JSON-LD (#89, Google Rich Results Test: crawled, no errors; Person / WebSite / CreativeWork are not rich-result types, so "no items detected" is expected). The PO decided against a custom domain.
- **Content**: 88Win's Promotion caption states the AI use (#90, PO 2026-11-06). The other case studies say nothing about AI, which is a PO decision.
- **Content**: no pending media and no `TODO(CONTENT)` remain.
- **Architecture**: ARCHITECTURE v1.20 records critical / deferred font faces (#101). v1.17 records the share preview and the cache-header fix (#86); v1.16 records `<scroll-restore>` (#81), the media manifest (#79) and CSS browser targets (#83).
- **PO requests 2026-11-07** (#96–#98): 88Win Mobile captions centred; order AMD 05 / HUIFA 06 / JHANYU 07 (JHANYU year 2024); site icons (favicon); the 88Win CARD note is HTML text (Details `split`, ARCHITECTURE v1.19).
- **2026-11-08**: 88Win copy update (#100, PO; Figma `360:251` / `475:953` updated by Claude). It pushed the phone LCP over 2500 ms, so #101 now loads non-hero CJK faces after `load` (ADR-0012 amendment, ARCHITECTURE v1.20): 88Win LCP 2488 → 2337 ms.
- **404 page** redesigned (Figma `728:1945`, spec [`specs/404.md`](specs/404.md) #92, implementation #93). The 390 layout is a proportional proposal; the PO checks it on the live site.
- **Since 2026-11-05**: the backlog PRs A–C (#79, #80, #83) and the scroll-restore fix (#81) are merged, plus smooth anchor scrolling (#84, PO request). #88 made every test scroll explicit, because #84 had made `main` CI flaky.
- **Staging** (mirrors `main` on every merge): `https://staging-portfolio-2026.kimbluesoul.workers.dev/`
- **Production** (`https://portfolio-2026.kimbluesoul.workers.dev/`) is **live and current**. The content gate (option A, ADR-0011 amendment) opened once all media were delivered; every merge to `main` since then has deployed to production automatically (green Workers Builds checks from 2026-11-05 at the latest; verified after #76: all routes 200, unknown paths 404, the PDF served). A red Workers check on `main` is now a real failure.
- **Repository** is public since 2026-11-05 (ADR-0014 amendment).

## Open PRs
| PR | What | Waiting on |
|---|---|---|
| — | None | — |

## Next owner and next action
1. **Product Owner**: new content or design changes as they come; no milestone is open.
2. **Codex**: the backlog below, one task brief at a time, when the Product Owner wants it.
3. **Claude**: media PRs when the Product Owner delivers new files (always a new versioned filename, ARCHITECTURE §9.2).

## Blockers and decisions pending
| Item | Blocks | Owner |
|---|---|---|
| — | None (Q7 resolved 2026-11-06: no custom domain) | — |

## Backlog (non-blocking review findings)
| Source | Item |
|---|---|
| #93 P3 | `global.css`: the shared brand button is still named `.resume-link` although the 404 "Return Home" uses it too; give it a generic name |
| #93 P3 | `404.astro`: the viewport layout uses `body:has(.not-found-page)`; `:has()` needs Firefox 121 while `cssTarget` is Firefox 114. Older Firefox falls back to the normal layout (footer below the fold) |
| #93 P3 | `smoke.spec.ts`: the 404 layout test covers 1920 only; add 390 × 844 (no vertical scroll, footer bottom = 844) |
| #98 P3 | `DETAIL_SPLIT_SLOTS` mobile `sizes` is a fixed `310px`; on phones wider than 390 the image renders wider. No visible loss while the source is 620 w; follow the real width if a wider source is added |
| #94 P3 | `.stylelintrc.json` only extends `stylelint.config.mjs`: point `stylelint-guards.test.ts` at the `.mjs`, delete the shim, update the ARCHITECTURE §tree line, and assert each rule's message |

## Recorded decisions
Decisions live where they apply. Start here:
- Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md) (status line lists every version) and [`ADR/`](../ADR/README.md).
- Design: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) (typography, header, motion).
- Product questions Q1–Q11: ARCHITECTURE §17.
- Media and per-project assets: [`ASSETS.md`](ASSETS.md). Page specs: [`specs/`](specs/README.md).
- Process: roles and review format in `CLAUDE.md`; task brief, fix rounds and the architecture fast lane in `AGENTS.md`.

## Operational notes
- Workers Builds: build `pnpm build`, deploy `npx wrangler deploy`, root `/`, Node 24, pnpm 11.25.0. Retrying an old failed build reuses its old settings, so validate settings with a new commit.
- Production guard: the build fails on pending media or `TODO(CONTENT)` when `WORKERS_CI_BRANCH === 'main'`.
- CSP: Astro's hashed meta CSP owns the resource directives; `_headers` holds only `frame-ancestors`, `base-uri`, `object-src`, `form-action`.
- Local E2E: run `CI=true pnpm test:e2e`, otherwise Playwright reuses a stale `astro preview` on port 4321.

## Milestone tracker
| Milestone | State |
|---|---|
| M0 Bootstrap | Done (#2) |
| M1 Home | Done (#10) |
| M2 Case template + 88Win | Done (#14, follow-ups through #46) |
| M3 Remaining case studies | Done: pages #21, #31, #49–#53; media #54–#60, #66, #71; reveals #68; header #69 / #70 |
| M4 Resume | Done (#73 spec, #74 implementation, #75 polish) |
| M5 Launch hardening | Done: 404 and sitemap (M0–M1), share preview #85 / #86, JSON-LD #89; no custom domain (PO) |

## Workflow
Product Owner confirms the spec → Claude writes the task brief (AGENTS.md) → Codex implements, local gates green → PR (template: acceptance, not done, known limits, review focus) → 4 CI checks green → Claude reviews (P0–P3 + category) → one fix round → Claude re-reviews → Product Owner decides product / UI questions and merges.
