# ADR-0011: Static hosting on Cloudflare Workers (static assets)

- Status: Accepted (2026-10-30)
- Date: 2026-10-30
- Decider: Claude (Architect)
- Supersedes: [ADR-0009](0009-hosting-cloudflare-pages.md)

## Context
ADR-0009 chose Cloudflare Pages. When the Product Owner set up the account (2026-10-30), the Cloudflare dashboard's "Create application" flow only offered **Workers** with Git integration (Workers Builds). Cloudflare now steers new static sites to Workers static assets. The goals of ADR-0009 are unchanged: free static hosting, Taiwan edge, per-PR previews, custom headers.

## Decision
Deploy the static `dist/` as a **Cloudflare Worker with static assets only** (no Worker script), built by **Workers Builds** from GitHub.

Repository configuration (`wrangler.jsonc` at the repo root):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "portfolio-2026",
  "compatibility_date": "2026-10-01",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "force-trailing-slash"
  }
}
```

- `wrangler` is a pinned dev dependency. The deploy and preview commands use the repo's version.
- Workers Builds settings (set by the Product Owner in the dashboard):
  - build command `pnpm build`;
  - deploy command `npx wrangler deploy`;
  - non-production branch builds **enabled** (preview URLs);
  - production branch `main`;
  - build variables `NODE_VERSION=24` and `PNPM_VERSION` = the version in `packageManager`.
- `public/_headers` keeps working: Workers static assets support `_headers` / `_redirects` with the same syntax as Pages.
- `404.html` is served for unknown paths via `not_found_handling: "404-page"`.
- Branch detection in build scripts uses **`WORKERS_CI_BRANCH`** (replaces `CF_PAGES_BRANCH`). The production pending-media guard triggers when it equals `main`.
- Default URLs until a custom domain exists (Q7): production `https://portfolio-2026.kimbluesoul.workers.dev/`, previews `https://<branch>-portfolio-2026.kimbluesoul.workers.dev/`. `astro.config.mjs` `site` and `robots.txt` use the production URL.

## Consequences
- One extra file (`wrangler.jsonc`) and one dev dependency (`wrangler`, approved).
- Static asset requests are free and unmetered on the Workers free plan. The per-file limit of 25 MiB still exceeds our video caps (ADR-0006).
- Preview URLs are per branch (not per PR number). The PR template's "preview URL" field points to the branch preview.
- If Cloudflare Access ("Protect with Cloudflare Access") is ever enabled for previews, reviewers need sign-in. It stays **off** by default.

## Alternatives considered
- **Hunt for the legacy Pages flow**: may still exist, but it is being de-emphasized. Building on it now risks a forced migration later.
- **Vercel / Netlify**: rejected for the reasons in ADR-0009.

## Amendment (2026-10-30, from Architecture Issue #4)
Workers Builds runs the Cloudflare-managed preview command for non-production branches, and Wrangler 4.155 requires a top-level `previews` block for it. `wrangler.jsonc` therefore also contains:

```jsonc
"previews": {}
```

This is configuration completeness, not a change of decision. Production still deploys `main` with `npx wrangler deploy`. Verified on the `feat/m0-bootstrap` preview: routes return 200, unknown paths return the 404 page, `_headers` are applied, and the trailing-slash redirect works.

## Amendment (2026-10-30, after M1): staging mirror
- **Production deploys only content-complete builds.** `main` builds fail while any `TODO(CONTENT)` marker remains (ARCHITECTURE §5.1), so the production URL keeps the last complete deploy. The Product Owner chose this over publishing the home page early (option A, 2026-10-30). Until launch, a red "Workers Builds" check on `main` is **expected**.
- **`staging` branch = latest `main`.** `.github/workflows/sync-staging.yml` force-pushes `main` to `staging` on every merge. Workers Builds publishes it as a branch preview, where the content guard does not apply: `https://staging-portfolio-2026.kimbluesoul.workers.dev/`. Nobody commits to `staging` directly.
- Feature branches keep their own preview URLs (`<branch>-portfolio-2026.kimbluesoul.workers.dev`), which disappear when the branch is deleted after merge.
