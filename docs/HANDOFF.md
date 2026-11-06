# Handoff

> A status index, not a log (adopted 2026-11-05). Every agent reads it first and updates it when project state changes. Details live in specs, ADRs, ARCHITECTURE, and the PRs; link to them instead of copying them here. The M0–M2 implementation notes that used to be here are in the git history of this file (before PR #72).

## Status (2026-11-06)
- **Milestone**: **M1–M5 are done** (2026-11-06). M5 shipped the share preview (#85 / #86, checked on Facebook and LINE) and JSON-LD (#89, Google Rich Results Test: crawled, no errors; Person / WebSite / CreativeWork are not rich-result types, so "no items detected" is expected). The PO decided against a custom domain.
- **Content**: 88Win's Promotion caption states the AI use (#90, PO 2026-11-06). The other case studies say nothing about AI, which is a PO decision.
- **Content**: no pending media and no `TODO(CONTENT)` remain.
- **Architecture**: ARCHITECTURE v1.17 records the share preview and the cache-header fix (#86); v1.16 records `<scroll-restore>` (#81), the media manifest (#79) and CSS browser targets (#83).
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
| #75 note | `mosaics have no bright or dark viewport boundary rows` flaked once on Chromium (sss / amd at DPR 1.25 / 1.5; passed on retry). Watch; fix if it repeats |
| #80 P3 | `.stylelintrc.json`: the token rule and the ADR-0012 `writing-mode` rule share one message; give each its own |
| #81 P3 | `smoke.spec.ts`: the "wait for the current section's reveals" block is duplicated in the two scroll-restore tests; use one helper |
| #89 P3 | `structured-data.test.ts`: the CreativeWork test passes `name: '88Win'` for every slug; read each slug's YAML `name` / `nameZh` instead |
| #52 P3s | Remaining small items (see the PR comments) |

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
