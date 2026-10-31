# AGENTS.md

## Project roles

### Product Owner / UI Designer
The user owns:
- product direction
- UX
- UI
- visual direction
- content
- final product decisions

### Claude
Claude acts as:
- Principal Engineer
- Software Architect
- independent Code Reviewer

Claude owns architecture and reviews implementation.

### ChatGPT
ChatGPT acts as:
- Implementation Engineer

ChatGPT owns implementation after architecture is approved.

## Implementation rules
1. Read only what the task needs (see [Context budget](#context-budget)). The docs are the source of truth, but a fix round does not need all of them again.
2. Do not silently change architecture.
3. Do not override Product Owner UI / UX decisions.
4. Keep changes scoped to the requested feature.
5. Use feature branches and Pull Requests.
6. Run the quality gates in `docs/ARCHITECTURE.md` §16.1 before requesting review: the full `pnpm verify` for the first review of a PR, the fast gates for later fix rounds. Fill in `.github/pull_request_template.md`.
7. Update `docs/HANDOFF.md` when project state materially changes.
8. Prefer clear, maintainable implementation over clever abstractions.
9. Avoid unrelated refactors inside feature PRs.

## Context budget
Implementer usage is limited. Read in this order and stop when the task is covered.

| Task | Read |
|---|---|
| New page or milestone (first PR) | `docs/HANDOFF.md`, `docs/specs/<slug>.md` and its reference images, the `docs/ARCHITECTURE.md` sections the task touches (§5 content model, §9 assets, §16 gates are the usual ones), and the ADRs those sections link. Read `docs/PRODUCT.md` / `docs/DESIGN_SYSTEM.md` only for sections you build for the first time. |
| Fix round after review | The review comment, plus only the files and doc sections it names. Do not re-read the other docs. |
| Docs or asset-only change | The file being changed. |

Rules:
- Start a new session for each PR and each fix round. Do not continue a long session.
- Copy, links, and media slots come from `docs/specs/<slug>.md`. Do not read Figma. If the sheet seems wrong or incomplete, say so in the PR and Claude fixes the sheet.
- Search with `rg` for the symbol or file you need instead of opening whole folders.
- If a doc section you skipped turns out to matter, read it then. Do not guess architecture.

## Architecture issue format
When architecture blocks implementation, report:

### Architecture Issue
- Context
- Current architecture
- Problem
- Suggested option(s)
- Impact
- Files / systems affected

Do not implement an architecture change until Claude records the decision.

## Review workflow
ChatGPT implements -> Claude reviews -> ChatGPT fixes -> Claude re-reviews -> Product Owner decides merge.
