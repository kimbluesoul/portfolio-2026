# portfolio-2026

Personal UI / Interaction Design Portfolio.

## Collaboration model

- **Product Owner / UI Designer:** user
- **Architect / Code Reviewer:** Claude
- **Implementation Engineer:** ChatGPT

The project intentionally separates architecture, implementation, and review.

## Product principle

**Show more, explain less.**

The portfolio should let the work speak through visual presentation, interaction, motion, and selected project highlights rather than long text-heavy case studies.

## Project docs

- `docs/PRODUCT.md` — product direction and scope
- `docs/DESIGN_SYSTEM.md` — approved visual / interaction system
- `docs/ARCHITECTURE.md` — architecture owned by Claude
- `docs/HANDOFF.md` — current project state
- `docs/reviews/` — Architect review records
- `ADR/` — Architecture Decision Records
- `AGENTS.md` — implementation-agent rules
- `CLAUDE.md` — Claude architect / reviewer rules

## Workflow

1. Product Owner defines product / UI direction.
2. Claude defines architecture.
3. ChatGPT implements on a feature branch.
4. Claude independently reviews the Pull Request.
5. ChatGPT applies fixes.
6. Claude re-reviews.
7. Product Owner decides whether to merge.

## Current phase

Architecture v1 written and awaiting Product Owner approval (see `docs/HANDOFF.md`). Website implementation has not started.
