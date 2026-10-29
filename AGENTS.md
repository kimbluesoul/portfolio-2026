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
1. Read `docs/PRODUCT.md`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, and `docs/HANDOFF.md` before implementation.
2. Do not silently change architecture.
3. Do not override Product Owner UI / UX decisions.
4. Keep changes scoped to the requested feature.
5. Use feature branches and Pull Requests.
6. Run the architecture-defined lint, typecheck, tests, and build checks before requesting review.
7. Update `docs/HANDOFF.md` when project state materially changes.
8. Prefer clear, maintainable implementation over clever abstractions.
9. Avoid unrelated refactors inside feature PRs.

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
