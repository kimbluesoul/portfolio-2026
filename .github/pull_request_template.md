## Summary
<!-- What this PR does, in 1–3 sentences. -->

- **Agent**: ChatGPT / Claude / Product Owner
- **Milestone**: M0 / M1 / M2 / M3 / M4 / M5 / other
- **Figma nodes implemented**: <!-- e.g. 360:3 Home, 465:670 Button / Primary pill -->
- **Spec sheet**: <!-- docs/specs/<slug>.md, or "n/a" for non-UI PRs -->
- **Preview URL**: <!-- https://<branch>-portfolio-2026.kimbluesoul.workers.dev/... -->

## Figma vs page
<!-- Required for any UI change (docs/specs/README.md). One row per section, same width on both sides.
     Figma images: docs/specs/<slug>/figma-<section>-{desktop,mobile}.jpg. Page images: docs/screenshots/<slug>/<section>-{desktop,mobile}.jpg -->
| Section | Figma 1920 | Page 1920 | Figma 390 | Page 390 | Differences |
|---|---|---|---|---|---|
|  |  |  |  |  | None |

## Quality gates
- [ ] Local gates pass (`pnpm lint && pnpm format:check && pnpm check && pnpm test`; media PRs also `node scripts/check-media.mjs`), and all 4 CI checks are green (ARCHITECTURE §16.1)
- [ ] No new runtime dependency, or Architect approval noted below (ARCHITECTURE §15)
- [ ] No raw color/spacing values outside `tokens.css`
- [ ] Keyboard and reduced-motion checked for new interactive elements
- [ ] Copy taken from the spec sheet; every difference in the Figma vs page table is listed under "Deviations from Figma"
- [ ] Pending-asset report reviewed (no unintended `pending` media); `expectedFile` names match `docs/ASSETS.md`
- [ ] `docs/HANDOFF.md` updated if project state changed

## Deviations from Figma
<!-- Anything that does not match Figma, and why. "None" if none. Missing design decisions are flagged here, not invented. -->

## Architecture issues raised
<!-- Link or paste any Architecture Issue (AGENTS.md format). "None" if none. -->
