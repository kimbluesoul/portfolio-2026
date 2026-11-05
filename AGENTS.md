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
6. Run the quality gates in `docs/ARCHITECTURE.md` §16.1 before requesting review: the local gates for every push, then wait for all 4 CI checks to be green. Fill in `.github/pull_request_template.md`.
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

## Task brief (from Claude, adopted 2026-11-05)
Every implementation task, first PR or fix round, starts from a brief that Claude writes and the Product Owner pastes. It always has these parts:

- **Goal**: one or two sentences.
- **Branch**: name, from `origin/main`.
- **Files**: the files to add or change, and the doc / spec sections to read. Read only those.
- **Reuse**: existing components, helpers, or tokens that must be used.
- **Do not touch**: files or behavior outside the task, including tests that must not change (a brief names the one test that may change when the markup contract changes).
- **Acceptance**: the checks that make the task done (from the spec sheet's Acceptance section, or listed in the brief).
- **Risks / open questions**: what Claude already knows may go wrong.
- **Gates**: the local gates (ARCHITECTURE §16.1), then push, open the PR, and wait for 4 green CI checks.

If the brief is missing a part you need, ask in the PR or raise an Architecture Issue. Do not guess.

## Fix rounds
- Claude's review comment is the scope: fix the P0 / P1 findings and the P2s Claude names. Nothing else.
- Do not refactor, rename, or "improve" outside those findings. A new problem you notice goes under "Known limits" in the PR, not into the fix.
- Reply on the PR with one line per finding: fixed (commit) or not fixed (why).

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

Fast lane: you raise the issue with options → Claude answers only the architecture decision → the Product Owner joins only when the choice is a product or UI trade-off → Claude records it (ADR, ARCHITECTURE, or the spec) → you continue. The rest of the feature is not reopened.

## Review workflow
Product Owner confirms the spec -> Claude writes the task brief -> ChatGPT implements and passes the gates -> Claude reviews against the spec and architecture (P0–P3 + category, CLAUDE.md) -> ChatGPT fixes in one round -> Claude re-reviews -> Product Owner decides product / UI questions and merges.
