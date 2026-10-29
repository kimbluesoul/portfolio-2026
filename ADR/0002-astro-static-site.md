# ADR-0002: Astro 7 with static site generation

- Status: Proposed
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
The site is 10 pages: home, 7 case studies, resume, and 404. Content changes only when the Product Owner edits it. There are no forms, accounts, personalization, or server data. The dominant costs are images, video, and CJK fonts, not application logic. Priorities are visual fidelity, performance (LCP/CLS on mobile), SEO, and maintainability by an AI implementer.

## Decision
Use **Astro 7.x** with `output: 'static'` (full pre-rendering), TypeScript strict, file-based routing, and content collections. No SSR adapter or server runtime.

## Consequences
- Pages ship as HTML + CSS with zero framework runtime. Client JS exists only where a component opts in.
- Built-in image optimization (`astro:assets`) and typed content collections cover the two hardest parts (media, structured case data) without extra packages.
- Deploys anywhere that serves static files (ADR-0009). There is no server to secure or scale.
- Anything dynamic (contact form, CMS preview) would require a new ADR.

## Alternatives considered
- **Next.js (App Router, static export)**: capable, but ships the React runtime on every page and brings RSC/hydration complexity that buys nothing for a static portfolio. Static export also loses several Next features.
- **Vite + vanilla / 11ty**: lighter, but we would hand-build image optimization, typed content validation, and component scoping.
- **SvelteKit / Nuxt**: similar trade-off to Next. A framework runtime is not needed.
