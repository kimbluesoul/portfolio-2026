# ADR-0014: CI builds once, then tests in parallel

- Status: Accepted (2026-11-04). Amends [ADR-0010](0010-quality-gates-and-ci.md) (CI layout only; the gates themselves do not change).
- Date: 2026-11-04
- Decider: Claude (Architect), at the Product Owner's request (CI waits slow every change).

## Context
ADR-0010 estimated 5–8 minutes per PR. Now that all seven case pages have media, a PR takes about **60 minutes** (run `41661280727`, PR #60):

| Job | `pnpm build` | Actual test step |
|---|---|---|
| Verify | 1474 s | lint / check / unit < 1 min |
| E2E and axe | 1141 s | `test:e2e` 84 s |
| Lighthouse | 1602 s | `lhci` 125 s |

Almost all of the time is image generation. Astro encodes every `src/assets` image into AVIF q75 4:4:4 and WebP q90 at slot-exact widths (ARCHITECTURE §9.1). It does this from scratch in **each** job, because:
- the Astro asset cache (`node_modules/.astro`) is not kept between runs;
- the three jobs run one after another, and each rebuilds the same `dist/`.

The tests themselves take under 4 minutes in total.

## Decision
1. **Build once.** Only `Verify` runs `pnpm build`. It uploads `dist/` as a workflow artifact (`actions/upload-artifact`, retention 1 day). `E2E and axe` and `Lighthouse` download that artifact and never build.
   - Playwright's `webServer` (`astro preview`) and LHCI (`staticDistDir: ./dist`) only need `dist/`.
   - `scripts/check-media.mjs`, the font coverage check, and the bundle check stay inside `pnpm build`, so they still run once, in `Verify`.
2. **Keep the image cache between runs.** `Verify` restores and saves `node_modules/.astro` with `actions/cache`:
   - key: `astro-assets-<os>-<hash of src/assets/**, astro.config.*, pnpm-lock.yaml>`;
   - `restore-keys`: `astro-assets-<os>-`.

   Astro names cache entries by source content and transform options, so a partial restore still reuses every unchanged image. A PR that adds one image encodes only that image. After a change to the encoder options (`astro.config.*`) or the sharp version (lockfile), the old entries are restored but never used, because their hashes no longer match, so the images are encoded again.
3. **Parallel tests.** `E2E and axe` and `Lighthouse` both `need: verify` and run at the same time, not one after the other.
4. **Cancel stale runs.** Add `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: ${{ github.event_name == 'pull_request' }} }`. A new push to a PR cancels the old run; runs on `main` are never cancelled.
5. **Job names stay the same** (`Verify`, `E2E and axe`, `Lighthouse`), so branch protection's required checks keep matching.

Target: about **10 minutes** per PR on a cache hit (Verify ~5 min, then E2E and Lighthouse ~4 min in parallel). On a cold cache the first run costs what it does today, once.

## Not changed
- The gates, budgets, and `pnpm verify` stay as in ADR-0010 and ARCHITECTURE §13.
- Local checks for implementers stay `pnpm lint && pnpm check && pnpm test` (ARCHITECTURE §16.1). Anyone who pushes new **media** also runs `node scripts/check-media.mjs` locally first, because a media-size failure costs a whole CI round.
- Visual review does not wait for CI. Cloudflare Workers Builds publishes the branch preview separately, a few minutes after a push, so the Product Owner can check the preview while CI runs.

## Considered and rejected
- **Skip E2E / Lighthouse for docs-only PRs** with a path filter. This is possible later, but a skipped required check needs care with branch protection. The gain is small once a docs-only PR builds from cache in a few minutes.
- **Fewer or lower-quality image variants.** This would lose the slot-exact sharpness the Product Owner asked for (ARCHITECTURE §9.1 v1.11).
- **Committing generated images.** This would make the repository much larger and hide encoder changes. The cache gives the same speed without those costs.

## Consequences
- Most PRs get a verdict in about 10 minutes instead of about 60.
- E2E and Lighthouse test exactly the `dist/` that `Verify` checked, so all three jobs see the same build.
- The cache uses GitHub Actions cache storage (10 GB per repository; old entries are evicted automatically).

## Amendment (2026-11-05, public repository and local format check)
- **The repository is public** since 2026-11-05. The private-repository Actions minutes ran out (3,298 of 2,000 minutes on 1–4 November, mostly runs from before this ADR); public repositories have unlimited standard runners. Checked before the switch: no secrets in the tree or the history. GitHub secret scanning and push protection are on. The workflows use no secrets and no `pull_request_target`, so a fork PR cannot reach anything privileged. The Figma design file stays invite-only; the client prototypes the site links to stay "anyone with the link".
- **Local gates add `pnpm format:check`.** Implementers run `pnpm lint && pnpm format:check && pnpm check && pnpm test` before each push (ARCHITECTURE §16.1 v1.14). Without the format check, Prettier failures came back from CI as extra "style: format" pushes, each costing a full CI round.
- **Measured:** about 5 minutes per PR on a cache hit (Verify 1–2 min, then E2E ~2.5 min and Lighthouse ~3 min in parallel; PR #71), better than the 10-minute target.
