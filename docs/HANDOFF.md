# Handoff

> Every agent reads this first and updates it before ending a session in which project state changed.

## Status (2026-10-30)
- **Phase**: **M0 — Bootstrap implemented; awaiting Architect review.**
- **Branch / PR**: `feat/m0-bootstrap` / PR pending. PR #1 was merged into `main` before this branch was created.
- **Quality gate**: `pnpm verify` passes locally (lint, format, Astro check, 42 unit tests, static build, 12 Playwright/axe checks, and 9 Lighthouse runs across 3 routes).
- **Scope**: Project scaffold, tooling, CI, content schemas, placeholder routes, and test infrastructure only. No visual section implementation, real project content, media, or motion was added.

## Roles
- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

## Next owner
1. **Claude**: review the M0 PR as Architect / Code Reviewer and record `APPROVED` or `CHANGES REQUESTED` using the P0–P3 format.
2. **ChatGPT**: address any review findings on `feat/m0-bootstrap`.
3. **Product Owner**: merge M0 after Claude approval. M1 must not start before M0 is merged.

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
| M1 | Type scale, spacing, and layout widths transcribed into DESIGN_SYSTEM from Figma, citing node IDs (A3/A4) | ChatGPT transcribes; Product Owner confirms in the PR |
| M3 | Q10: Figma content inconsistencies (Hwa Fong live link, AMD duplicate motion frame) | Product Owner |
| M2–M3 | Delivery of video files per project (MP4 masters) | Product Owner |
| M5 | Q7 domain + Cloudflare account, Q8 analytics, Q9 language confirmation | Product Owner |

## M0 implementation notes
- Astro 7 static output, Node 24, pnpm, TypeScript strictest, approved dependencies, and all §16.1 scripts are configured.
- Content schemas enforce the §5.1 media and project cardinality rules. `site.yaml` and one schema-valid 88Win placeholder entry are included.
- `BaseLayout`, header/footer skeletons, and `/`, `/work/[slug]/`, `/resume/`, `/404` placeholders are present.
- CSS includes approved color and motion tokens. Typography and spacing remain marked `TODO(DESIGN_SYSTEM)` for M1 transcription and Product Owner confirmation.
- Noto Sans TC uses generated Fontsource unicode slices based on repository content so CSS/font budgets remain enforced without a third-party font service.
- `postcss-html` is a dev-only parser required for Stylelint to enforce token rules inside Astro scoped styles; it has no runtime output.
- CI runs verify → E2E/axe → Lighthouse. Media size, pending media, gzip CSS, and gzip first-party JS budgets are build gates.

## Milestone tracker
| Milestone | State |
|---|---|
| Collaboration scaffold | Done (PR #1) |
| Architecture v1 | **Approved** (PR #1) |
| M0 Bootstrap | **In review** (`feat/m0-bootstrap`) |
| M1 Home | Not started |
| M2 Case template + 88Win | Not started |
| M3 Remaining case studies | Not started |
| M4 Resume | Not started |
| M5 Launch hardening | Not started |

## Workflow reminder
ChatGPT implements on a feature branch → `pnpm verify` green → PR using the template → Claude review (P0–P3, verdict comment) → ChatGPT fixes → Claude re-review → Product Owner merges.
