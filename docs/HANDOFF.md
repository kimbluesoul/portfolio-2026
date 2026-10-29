# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-29)
- **Phase**: Architecture v1 **approved** by the Product Owner. Ready for implementation.
- **Branch / PR**: `chore/agent-collaboration-scaffold` / PR #1. It contains the scaffold, architecture v1, ADRs 0001–0010 (Accepted), the Architect review, the updated PRODUCT / DESIGN_SYSTEM (motion), and the resume PDF.
- **No website implementation has started.**

## Roles
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

## Next owner
1. **Product Owner**: merge PR #1 into `main`.
2. **ChatGPT**: start **M0 — Bootstrap** (ARCHITECTURE §19) on `feat/m0-bootstrap`, branched from `main` after PR #1 is merged.

## Decisions recorded on 2026-10-29
- **Q1 / A2**: 7 projects in a fixed order (PRODUCT.md updated).
- **Q2**: mobile 390 frames exist for every page (ARCHITECTURE Appendix A). The tablet range is handled per ARCHITECTURE §10.
- **Q3**: the resume page follows the layout of `public/files/Syuan-Ci-Resume.pdf`.
- **Q4**: motion tokens and rules are in DESIGN_SYSTEM → Motion. Steps do not auto-advance.
- **Q5**: AMD 維護 video resolved by the Product Owner.
- **Q6**: videos never autoplay. Desktop plays on hover / focus, mobile on tap with a play indicator.
- **A1**: ChatGPT reads Figma directly and exports image assets itself. Videos come from the Product Owner.

## Blockers
| Blocks | Item | Owner |
|---|---|---|
| M0 start | Merge PR #1 | Product Owner |
| M1 | Type scale, spacing, and layout widths transcribed into DESIGN_SYSTEM from Figma, citing node IDs (A3/A4) | ChatGPT transcribes; Product Owner confirms in the PR |
| M3 | Q10: Figma content inconsistencies (Hwa Fong live link, AMD duplicate motion frame) | Product Owner |
| M2–M3 | Delivery of video files per project (MP4 masters) | Product Owner |
| M5 | Q7 domain + Cloudflare account, Q8 analytics, Q9 language confirmation | Product Owner |

## Next actions for ChatGPT (M0 — Bootstrap)
Read: `docs/PRODUCT.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, `ADR/`, `AGENTS.md`, this file.

M0 deliverables (one PR, `feat/m0-bootstrap`):
1. Astro 7 project, `output: 'static'`, `trailingSlash: 'always'`, TS strictest, Node 24 (`.node-version`), pnpm (`packageManager`).
2. Tooling and scripts exactly as ARCHITECTURE §16.1, including `pnpm verify`.
3. `.github/workflows/ci.yml` per ADR-0010.
4. `src/styles/tokens.css` with colors from ARCHITECTURE Appendix A and motion tokens from DESIGN_SYSTEM. Mark placeholders `/* TODO(DESIGN_SYSTEM) */` for type and spacing. Also add `fonts.css` and `global.css` layers.
5. `src/content.config.ts` with the schemas from ARCHITECTURE §5.1, plus `site.yaml` and one minimal sample project file that passes validation.
6. `BaseLayout`, `SiteHeader`, `SiteFooter` skeletons, and routes `/`, `/work/[slug]/`, `/resume/`, `/404` rendering placeholders.
7. `src/lib/projects.ts` + `src/lib/sections.ts` with unit tests (next-project wrap, order, omission, tone).
8. `public/_headers` per ARCHITECTURE §14. Keep `public/files/Syuan-Ci-Resume.pdf` as is.
9. Playwright smoke + axe and a Lighthouse CI config, both green.
10. Update this file at the end of M0.

Out of scope for M0: visual implementation of any section, real content and assets, motion.

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1 | **Approved** (PR #1) |
| M0 Bootstrap | Not started |
| M1 Home | Not started |
| M2 Case template + 88Win | Not started |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges.
