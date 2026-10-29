# Architecture

## Owner
Claude — Principal Engineer / Software Architect / Code Reviewer.

## Status
**Pending architecture definition.**

ChatGPT must not populate architectural decisions on Claude's behalf.

## Architecture brief
This project is a UI / interaction-heavy portfolio website. Architecture should support excellent visual fidelity, motion, responsive behavior, image-heavy project presentation, maintainability, accessibility, SEO, and strong runtime performance.

## Claude must define
- Frontend framework and version
- Rendering strategy
- Routing strategy
- Project / folder structure
- Component architecture
- State-management policy
- Animation architecture
- Asset and image strategy
- Responsive implementation strategy
- SEO and metadata strategy
- Accessibility baseline
- Performance budgets / strategy
- Deployment strategy
- Testing strategy
- Lint / typecheck / formatting requirements
- CI expectations
- Dependency policy

## Architecture governance
Architecture decisions belong to Claude in the Architect role.

ChatGPT is the Implementation Engineer and must implement against this document.

If implementation reveals that architecture should change:
1. ChatGPT raises an Architecture Issue with context, impact, and suggested options.
2. Claude reviews the issue.
3. Claude updates this document and/or adds an ADR.
4. Implementation changes only after the architecture decision is recorded.

## ADR
Material architecture changes should be recorded under `ADR/`.
