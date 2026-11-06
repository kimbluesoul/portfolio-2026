# Share preview (Open Graph) — spec

**Status:** approved by the Product Owner 2026-11-06 (M5). Owner: Claude (spec, images), Codex (implementation).

## Goal
A pasted link (LINE, Facebook, Slack, X, iMessage) shows a card with an image, the page title and the description. Titles and descriptions already exist per page (`seo.title` / `seo.description`), so this spec adds only the image and the Open Graph / Twitter tags.

## Images (delivered in this PR, `public/og/`)
All images are exactly **1200 × 630** (1.91 : 1).

| Page | File | Source | Alt text (`og:image:alt`) |
|---|---|---|---|
| `/`, `/resume/`, `/404/` | `home.v1.png` | Figma `718:1570` (PO design), 1× render | `Syuan Ci 周泫淇 — 介面設計・互動設計・動態設計・原型設計` |
| `/work/<slug>/` (7 pages) | `<slug>.v1.jpg` | the case hero showcase `src/assets/projects/<slug>/hero-showcase.jpg` | `<project.data.name> 案例主視覺` (e.g. `88Win 案例主視覺`) |

Case images, PO option A (2026-11-06): the full hero showcase is scaled to 1200 px wide (1200 × 513) and placed at the **bottom** of the frame. The top 117 px are filled with `#f3f3f3`, which is the hero's own top-edge colour on all 7 heroes (measured: every pixel of row 0 is `rgb(243, 243, 243)`). The bottom edge is not padded, because the devices run into it, as they do on the site. JPEG q85 4:4:4 mozjpeg, 57–108 KB.

**Versioned names:** platforms cache an image by its URL for days to weeks. A replaced image gets the next name (`home.v2.png`), never the same name (ARCHITECTURE §9.2 rule).

## Tags (in `BaseLayout.astro` `<head>`, after `<link rel="canonical">`)
| Tag | Value |
|---|---|
| `og:type` | `website` |
| `og:site_name` | `Syuan Ci` |
| `og:locale` | `zh_TW` |
| `og:title` | the page `title` prop |
| `og:description` | the page `description` prop |
| `og:url` | the existing `canonical` URL |
| `og:image` | **absolute** URL: `new URL(imagePath, Astro.site)`, e.g. `https://portfolio-2026.kimbluesoul.workers.dev/og/88win.v1.jpg` |
| `og:image:type` | `image/png` for `.png`, `image/jpeg` for `.jpg` |
| `og:image:width` / `og:image:height` | `1200` / `630` |
| `og:image:alt` | from the table above |
| `twitter:card` | `summary_large_image` (X reads the `og:*` tags for the rest) |

`og:image` and `og:url` use `Astro.site` (production origin) on every build, including previews. This is expected: the preview is not meant to be shared.

## Acceptance
- Every route (`/`, `/resume/`, `/404/`, all 7 `/work/<slug>/`) has exactly one of each tag above, with the values above.
- Every `og:image` path exists under `public/og/` (a unit test covers all project slugs, so a new project without an image fails).
- No visual change; the CSP E2E stays green (meta tags load nothing).
- Checked once after merge on production with the Facebook Sharing Debugger and a LINE message (PO).
