# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-29)
- **Phase**: Architecture v1 written by Claude. It is **awaiting Product Owner approval**.
- **Branch / PR**: `chore/agent-collaboration-scaffold` / PR #1 (draft). It contains the scaffold, architecture v1, ADRs 0001–0010, and the Architect review.
- **No website implementation has started.**

## Roles
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

## Next owner
1. **Product Owner**: review `docs/ARCHITECTURE.md` and `docs/reviews/PR-1-architecture-review.md`, answer the open questions, then approve architecture v1 (merge PR #1, or comment "Architecture v1 approved").
2. **ChatGPT**: after approval, start **M0 — Bootstrap** (ARCHITECTURE §19) on a new branch `feat/m0-bootstrap` from `main`.

## Blockers
| Blocks | Item | Owner |
|---|---|---|
| M0 start | Architecture v1 approval | Product Owner |
| M1 start | A1: how the implementer reads Figma and who exports assets | Product Owner |
| M1 | A4: type scale / spacing recorded in DESIGN_SYSTEM | Product Owner (ChatGPT may transcribe with citations) |
| M2+ | Q1 / A2: PRODUCT.md scope update (7 projects, case pages, resume) | Product Owner |
| M3 | Q10: Figma content inconsistencies | Product Owner |
| M4 | Q3: confirm the PDF as the resume page's design reference (PDF delivered at `public/files/Syuan-Ci-Resume.pdf`) | Product Owner |
| M3 (AMD) | 維護 video file (960×532) delivered with AMD assets (Q5 resolved) | Product Owner |

## Open questions
See ARCHITECTURE §17 and the review doc, Part B.

Resolved on 2026-10-29: **Q2** (mobile 390 frames delivered), **Q5** (AMD 維護 video), **Q6** (videos never autoplay: hover/focus on desktop, tap with a play indicator on mobile).
Still open: Q1, Q3 (confirmation), Q4, Q7, Q8, Q9, Q10, plus process items A1 and A2.

## Next actions for ChatGPT (M0 — Bootstrap), once approved
Read: `docs/PRODUCT.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, `ADR/`, `AGENTS.md`, this file.

M0 deliverables (one PR, `feat/m0-bootstrap`):
1. Astro 7 project, `output: 'static'`, `trailingSlash: 'always'`, TS strictest, Node 24 (`.node-version`), pnpm (`packageManager`).
2. Tooling and scripts exactly as ARCHITECTURE §16.1, including `pnpm verify`.
3. `.github/workflows/ci.yml` per ADR-0010.
4. `src/styles/tokens.css` (colors from ARCHITECTURE Appendix A, with placeholders clearly marked `/* TODO(DESIGN_SYSTEM) */` for type/spacing/motion), `fonts.css`, `global.css` layers.
5. `src/content.config.ts` with the schemas from ARCHITECTURE §5.1, plus `site.yaml` and one minimal sample project file that passes validation.
6. `BaseLayout`, `SiteHeader`, `SiteFooter` skeletons, and routes `/`, `/work/[slug]/`, `/resume/`, `/404` rendering placeholders.
7. `src/lib/projects.ts` + `src/lib/sections.ts` with unit tests (next-project wrap, order, omission, tone).
8. `public/_headers` per ARCHITECTURE §14.
9. Playwright smoke + axe and a Lighthouse CI config, both green.
10. Update this file at the end of M0.

Out of scope for M0: visual implementation of any section, real content and assets, motion.

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1 | Written, awaiting approval (PR #1) |
| M0 Bootstrap | Not started |
| M1 Home | Not started |
| M2 Case template + 88Win | Not started |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges.
