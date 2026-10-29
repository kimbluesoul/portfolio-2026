# ADR-0010: Quality gates and CI

- Status: Proposed
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
Implementation is done by an AI agent and reviewed by another. Review time should go to design fidelity and architecture, not to catching problems a machine can catch. Every gate must be runnable locally with the same command CI uses.

## Decision
- A single local entry point, **`pnpm verify`**, runs in order: `lint` → `format:check` → `check` → `test` → `build` → `test:e2e` → `lhci`.
- Tools:
  - ESLint (`typescript-eslint`, `eslint-plugin-astro` with its a11y rules), Prettier (`prettier-plugin-astro`), Stylelint (`stylelint-config-standard` + no raw colors outside `tokens.css`);
  - `astro check` with `astro/tsconfigs/strictest`;
  - Vitest for `src/lib/**`;
  - Playwright (Chromium desktop 1440×900 + WebKit iPhone 13 viewport) with `@axe-core/playwright` on every route, zero serious/critical violations;
  - Lighthouse CI on `dist/` with the budgets in ARCHITECTURE §13;
  - a media-size check and pending-asset report as part of `build`.
- GitHub Actions (`.github/workflows/ci.yml`) runs the same scripts on every PR and on `main`. Jobs: `verify` → `e2e` → `lighthouse`. Install with `pnpm install --frozen-lockfile`, and cache pnpm store + Playwright browsers.
- Branch protection on `main` (configured by the Product Owner): PR required, CI required, no force-push.
- `.github/pull_request_template.md` is the PR Definition-of-Done checklist.
- Visual regression testing is **not** a v1 gate. Fidelity is reviewed on Cloudflare preview deploys against Figma.

## Consequences
- CI time is about 5–8 minutes per PR, which is acceptable.
- Lighthouse scores fluctuate. Use 3 runs with median assertions, and treat a single-run dip in a non-budget category as a warning.
- Flaky E2E caused by video autoplay is avoided by testing `<loop-video>` state through attributes, not playback timing.
