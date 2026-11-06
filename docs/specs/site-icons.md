# Site icons (favicon) — spec

**Status:** approved by the Product Owner 2026-11-06 (option A: the header signature in white on the brand blue). Owner: Claude (files), Codex (tags).

Until now the site had no icon, so every tab showed the browser's default globe.

## Files (delivered in this change, `public/`)
| File | Size | Use |
|---|---|---|
| `favicon.svg` | vector, 64 × 64 viewBox | modern browsers' tab icon. Rounded square `rx 14`, fill `#1f3bd6` (`--blue-600`); the header logo (`src/assets/site/logo.svg`) in white, stroke 7 (thicker than the header's 4.4 so it reads at 16 px) |
| `favicon.ico` | 32 × 32 (one PNG inside) | browsers that request `/favicon.ico` by default |
| `apple-touch-icon.png` | 180 × 180 | iOS home screen; full-bleed square (iOS rounds the corners) |

Root files fall under the `/*` `max-age=0, must-revalidate` rule, so a replaced icon needs no new name.

## Tags (in `BaseLayout.astro` `<head>`, every page)
```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## Acceptance
- Every route (including `/404/`) has the three tags; the three files return 200 on the preview.
- The CSP still allows the icons (no console CSP error on any route).
