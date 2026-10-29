# ADR-0009: Static hosting on Cloudflare Pages

- Status: Proposed
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
The output is a static `dist/`. The audience is primarily in Taiwan. The site is media-heavy (video), so bandwidth pricing matters. The workflow needs a preview URL per PR for Architect review and Product Owner visual sign-off.

## Decision
- Host on **Cloudflare Pages** with the GitHub integration:
  - production branch `main`, preview deployment for every PR branch;
  - build `pnpm build`, output `dist/`, Node 24.
- Configure headers in `public/_headers` (immutable caching for `/_astro/*` and `/media/*`, security headers, CSP).
- The Product Owner owns the Cloudflare account, project creation, and custom domain. Agents do not handle credentials.

## Consequences
- Free tier with unmetered static bandwidth, and edge locations serving Taiwan.
- Per-file limit of 25 MiB is well above our video caps (ADR-0006).
- Hosting-specific config is limited to `_headers` (and `_redirects` if ever needed), so moving to another static host is cheap.

## Alternatives considered
- **Vercel**: excellent previews, but the Hobby plan is restricted to non-commercial use and has bandwidth limits that a video-heavy portfolio could approach. There are no Next.js features to benefit from.
- **Netlify**: comparable, but has bandwidth limits on free tier.
- **GitHub Pages**: no per-PR previews, no custom headers, and a 100 MB soft repo / 1 GB site guidance.
