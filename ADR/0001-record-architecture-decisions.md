# ADR-0001: Record architecture decisions

- Status: Accepted
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
The project separates Architect (Claude), Implementation Engineer (ChatGPT), and Product Owner. Decisions must survive between agent sessions, which keep no memory of each other, so they need a durable, reviewable record.

## Decision
Material architecture decisions are recorded as numbered Markdown files in `ADR/`, named `NNNN-short-title.md`, using this template:

```
# ADR-NNNN: Title
- Status: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- Date: YYYY-MM-DD
- Decider: Claude (Architect)

## Context
## Decision
## Consequences
## Alternatives considered
```

Rules:
- Only Claude writes or changes ADRs. ChatGPT proposes changes through an Architecture Issue (`AGENTS.md`).
- Accepted ADRs are not edited for substance. They are superseded by a new ADR.
- `docs/ARCHITECTURE.md` is the current-state summary. ADRs hold the reasoning.

## Consequences
Each agent can load the full decision context from the repo alone.
