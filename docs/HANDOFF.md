# Handoff

> A status index, not a log (adopted 2026-11-05). Every agent reads it first and updates it when project state changes. Details live in specs, ADRs, ARCHITECTURE, and the PRs; link to them instead of copying them here. The M0–M2 implementation notes that used to be here are in the git history of this file (before PR #72).

## Status (2026-11-05)
- **Milestone**: M1 Home, M2 case template and **M3 (all seven case studies, with media) are done**. M4 (`/resume/`) and M5 (launch hardening) have not started.
- **Content**: no pending media and no `TODO(CONTENT)` remain.
- **Architecture**: ARCHITECTURE v1.14 (PR #72) records the M3 state.
- **Staging** (mirrors `main` on every merge): `https://staging-portfolio-2026.kimbluesoul.workers.dev/`
- **Production** (`https://portfolio-2026.kimbluesoul.workers.dev/`) still shows the M0 build by decision (option A, 2026-10-30). Its content gate is now open; production updates when the Product Owner turns production deploys back on. Until then **a red "Workers Builds" check on `main` is expected**.
- **Repository** is public since 2026-11-05 (ADR-0014 amendment).

## Open PRs
| PR | What | Waiting on |
|---|---|---|
| #72 | Docs v1.14 + collaboration process (task brief, Definition of Done, review categories, this index) | Product Owner merge |

## Next owner and next action
1. **Product Owner**: merge #72; choose the next step: production switch, M4 resume, or Q11.
2. **Claude**: production-switch steps when asked; the M4 spec sheet when M4 starts; re-encode HUIFA `detail-live.mp4` at 1920 w (media PR).
3. **Codex**: the backlog below, one task brief at a time.

## Blockers and decisions pending
| Item | Blocks | Owner |
|---|---|---|
| Turn production deploys on | Production showing the current site | Product Owner |
| Q11: WCAG 2.2.2 for auto-started clips (ARCHITECTURE §17) | M5 | Product Owner |
| Q7: custom domain (optional) | Launch on a custom domain | Product Owner |

## Backlog (non-blocking review findings)
| Source | Item |
|---|---|
| #70 P3 | `-webkit-backdrop-filter` on the scrolled header |
| #65 P3-2 | Image-only schema for `mobileMedia` |
| #67 P3 | One source for the media slot rules |
| #36 P2-1 | Case-page scroll restore |
| #31 P3 | `--font-size-body` is 17.91 px at 1920 |
| #30 P3 | Stylelint guard for `font-feature-settings` / `font-variant-*` |
| #26, #52 P3s | Remaining small items (see the PR comments) |

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
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow
Product Owner confirms the spec → Claude writes the task brief (AGENTS.md) → Codex implements, local gates green → PR (template: acceptance, not done, known limits, review focus) → 4 CI checks green → Claude reviews (P0–P3 + category) → one fix round → Claude re-reviews → Product Owner decides product / UI questions and merges.
