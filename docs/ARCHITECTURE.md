# Architecture

## Owner
Claude — Principal Engineer / Software Architect / Code Reviewer.

## Status
**v1.15 — Approved by the Product Owner up to v1.9** (v1: 2026-10-29). v1.1 (2026-10-30) adds clarifications from the M0 review: the `Captioned` shape, slug = entry id, CSP ownership, and resolutions of Q8–Q10. v1.2 (2026-10-30) adds hosting on Workers (ADR-0011), build-time font subsetting (ADR-0012), and the content fidelity rule (§5.1). v1.3 (2026-10-30) adds template-first delivery: images and videos may be pending with an `expectedFile` (§9.3), and production is gated on content completeness (ADR-0011 amendment). v1.4 (2026-10-30, from the M2 review) adds the `**accent**` markup for brand-coloured words, a Details shape that follows the 88Win bento, and Link card eyebrows (§5.1). v1.5 (2026-10-31) fixes how each media slot is exported from Figma (composite, crop, and art-directed Details visuals), poster naming, and the Product Owner's export list [`docs/ASSETS.md`](ASSETS.md) (§9). v1.6 (2026-10-31) lets fix rounds run only the fast local gates, because CI runs all of them (§16.1), and adds a context budget for the implementer (AGENTS.md). v1.7 (2026-10-31, ADR-0013) makes videos play once when scrolled into view, with hover / re-entry replay, Home cards as videos, and the 88Win featured composition (§5.1, §7, §9.2). v1.8 (2026-10-31, from the PR #21 review) adds a per-project mobile hero title size (`hero.titleSizeMobile`) and −4 % title tracking (§5.1), fixes the 390 back link as centred for every case page, and sets 360 px as the minimum supported width (§10). v1.9 (2026-10-31, from the PR #23 review) starts video loading only after the page `load` event, keeps posters as real image layers under the video, and makes the Lighthouse page-weight gate measure the budget without video, as §13 always intended, with a separate media cap (§7, §13, ADR-0013 amendment). v1.10 (2026-11-01, flaky case-page LCP gate) lays out only the case hero before the first paint (`content-visibility`), makes case-video posters lazy image layers, splits the CJK `ext` subsets per page, and preloads the 400 `core` font on case pages (§7, §13, ADR-0012 amendment). v1.11 (2026-11-02, PO: soft images at 1920 @1x) makes srcsets slot-exact: every desktop slot gets a file of its own 1× / 2× width (§9.1). v1.12 (2026-11-02, M3 specs) adds two template extensions for HUIFA, specified in `docs/specs/huifa.md`: a Details `compare` variant (labelled full-width media, a 390 swipe strip) and a per-project 390 hero showcase scale. No budget changes. v1.13 (2026-11-04, PO) extends scroll reveals to the case pages: fade + rise + stagger by reveal group, 16px rise on phones, no hero entrance, the Visual Extension as the only signature moment (§8, DESIGN_SYSTEM → Motion). v1.14 (2026-11-05, end of M3) records what the M3 PRs already ship: the schema extensions (390 art direction for the hero showcase and the mosaic, the Details `compare` variant), the hard line-break rule (§5.1), current video slots, the 2528 / 1216 frame for wide recordings and the Next preview video (§9.2, §9.5), and the local gates that ADR-0014 made the practice (§16.1). The header spec and the Latin font rule move to DESIGN_SYSTEM. No budget changes. v1.15 (2026-11-05, M4) adds the resume content model and component rules (§5.1, spec `docs/specs/resume.md`), a 1080 px resume content width (§5.3), and resolves Q11 (accepted for v1).

Implementation starts with milestone **M0 (bootstrap)**. The remaining open questions in [§17](#17-open-product--design-questions-blocking-or-shaping-architecture) only gate launch (M5).

ChatGPT must not populate or change architectural decisions on Claude's behalf. See [Architecture governance](#18-architecture-governance).

## Architecture brief
This project is a UI / interaction-heavy portfolio website. Architecture should support excellent visual fidelity, motion, responsive behavior, image-heavy project presentation, maintainability, accessibility, SEO, and strong runtime performance.

## Decision summary

| Area | Decision | ADR |
|---|---|---|
| Framework | **Astro 7.x**, TypeScript strict | [ADR-0002](../ADR/0002-astro-static-site.md) |
| Rendering | **Static site generation only** (`output: 'static'`), no server runtime | [ADR-0002](../ADR/0002-astro-static-site.md) |
| Routing | File-based: `/`, `/work/[slug]/`, `/resume/`, `/404` | §3 |
| Client interactivity | **No UI framework.** Astro components + small progressive-enhancement custom elements in TypeScript | [ADR-0003](../ADR/0003-no-client-ui-framework.md) |
| Styling | **Plain CSS** + CSS custom-property tokens mirrored from Figma variables, Astro scoped styles, cascade layers. No Tailwind / CSS-in-JS | [ADR-0004](../ADR/0004-css-and-design-tokens.md) |
| Content | **Astro content collections** (YAML + Zod schemas); case pages rendered by a fixed-order section renderer that encodes the V9 template rules | [ADR-0005](../ADR/0005-content-model-and-case-template.md) |
| Images | `astro:assets` (`<Picture>`), AVIF + WebP, responsive widths, build-time optimization | [ADR-0006](../ADR/0006-media-pipeline.md) |
| Video | Self-hosted MP4 (H.264) + required poster, `preload="none"`, lazy source, plays once on entering view, hover / re-entry replays | [ADR-0006](../ADR/0006-media-pipeline.md), [ADR-0013](../ADR/0013-video-play-once-in-view.md) |
| Motion | CSS-first, motion tokens, IntersectionObserver reveals, native cross-document View Transitions as enhancement. No animation library | [ADR-0007](../ADR/0007-motion-architecture.md) |
| Fonts | Self-hosted Instrument Sans (Fontsource) + Noto Sans TC **subset at build time** to the rendered glyphs (core + per-page ext), no third-party font CDN | [ADR-0012](../ADR/0012-build-time-cjk-font-subsetting.md) |
| State | No global state, no client store, no browser storage | §6 |
| Hosting | **Cloudflare Workers static assets** (Workers Builds from GitHub), preview URL per branch, `main` = production | [ADR-0011](../ADR/0011-hosting-cloudflare-workers-static-assets.md) |
| Quality gates | `pnpm verify` locally + GitHub Actions: lint, format, typecheck, unit, build, e2e + axe, Lighthouse CI budgets; CI builds once and tests in parallel | [ADR-0010](../ADR/0010-quality-gates-and-ci.md), [ADR-0014](../ADR/0014-ci-build-once.md) |
| Runtime / tooling | Node.js **24 LTS**, **pnpm** (pinned via `packageManager`) | §14 |

---

## 1. Context and constraints

Sources of truth (in priority order for implementation):
1. `docs/PRODUCT.md` — scope and product intent (Product Owner).
2. Figma file `Portfolio-2026` (`gNIygsBj4ODtt5gyY2Twij`), page **「Portfolio｜整理版」** (`360:2`) — visual source of truth. See the node map in [Appendix A](#appendix-a-figma-source-map).
3. `docs/DESIGN_SYSTEM.md` — approved, reusable design rules.
4. This document + `ADR/` — technical decisions.

Facts established from Figma (2026-10-29) that shape the architecture:
- **7 case studies**, all built from one template, **「V9 案例頁模板」** (`360:2669`): fixed section order, required and optional sections, and fallbacks when assets are missing. The architecture encodes this template as code (§5).
- Case pages are long (9,000–12,600 px at 1920) and **media-heavy**: per page about 2 hero/showcase images, 1 16:9 hero video slot, 3–6 close-ups, 3 mobile panels, 1–3 motion videos, and a mosaic band.
- Interaction & Motion sections are a **step list that switches a video** (the AMD switcher `440:668` is one instance of this pattern, not a one-off).
- Colors live in Figma variables (`Portfolio 2026 / Primitives`, `Portfolio 2026 / Color`). Typography / spacing are **not** variables yet.
- Designs exist at **desktop 1920** and **mobile 390** for Home, all 7 case studies, nav, footer, link card, and the AMD switcher (Appendix A). There is **no tablet frame** and **no resume page design** (see §17).
- The page `03 Foundations` (`41:2`) shows an **older warm palette** (Paper / Ink / `#315D7D` blue) that does not match the bound variables. It is **not** a source of truth. Use the bound variables in Appendix A.
- The site has no backend needs: no forms, no CMS, no auth, no user data.

Non-functional priorities, in order: **visual fidelity → performance → accessibility → maintainability**. When a visual requirement conflicts with performance or accessibility budgets, the implementer raises it; it is not silently traded off.

---

## 2. Framework and rendering

- **Astro 7.x** (latest 7.x minor at bootstrap; exact version locked by `pnpm-lock.yaml`). A major upgrade requires an ADR.
- `output: 'static'`. Every page is pre-rendered HTML at build. No SSR adapter, no edge functions, no API routes.
- `trailingSlash: 'always'`, `build.format: 'directory'` → canonical URLs like `/work/88win/`.
- `site` is set from the production domain (open question Q7). Until it is known, use the default `https://portfolio-2026.kimbluesoul.workers.dev/` (ADR-0011).
- Official integrations allowed: `@astrojs/sitemap`. Others need Architect approval (§15).

Note to the implementer: this document names Astro concepts (content collections, `astro:assets`, scoped `<style>`, processed `<script>`). If an API was renamed in Astro 7, follow the current Astro docs and note it in the PR. That is not an architecture change.

---

## 3. Routing and URL design

| Route | Source | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero, featured project (01), project grid (02–07), About, Footer |
| `/work/[slug]/` | `src/pages/work/[slug].astro` + `getStaticPaths()` from the `projects` collection | 7 pages |
| `/resume/` | `src/pages/resume.astro` | Web resume + "Download PDF" |
| `/404` | `src/pages/404.astro` | Static 404 (served via `not_found_handling: "404-page"`) |
| `/files/Syuan-Ci-Resume.pdf` | `public/files/` | Supplied by the Product Owner, not generated |

**Slugs** (stable; changing one is a breaking URL change):

| # | Project | Slug |
|---|---|---|
| 01 | 88Win | `88win` |
| 02 | Hwa Fong Tire 華豐輪胎 | `hwa-fong` |
| 03 | FITZONE | `fitzone` |
| 04 | SSS 超透明提案 | `sss` |
| 05 | JHANYU 展裕建設 | `jhanyu` |
| 06 | AMD 康健生醫 | `amd` |
| 07 | HUIFA 匯發營造 | `huifa` |

**In-page anchors** (part of the public contract):
- `/#work` — selected work list
- `/#about` — About section
- `#contact` — the footer. It exists on **every** page, so "Contact" scrolls within the current page.

Navigation item → href mapping: `Work` → `/#work`, `About` → `/#about`, `Contact` → `#contact`. The header is sticky only if Figma says so. Every anchor target sets `scroll-margin-top` to the header height token.

**Next project** is derived, never hand-written: `next = projects[(index + 1) % projects.length]` by `order`. 07 (HUIFA) → 01 (88Win). Implemented in `src/lib/projects.ts` and unit-tested.

**Language**: single locale, `<html lang="zh-Hant-TW">`. English display strings (eyebrows, `HELLO, I'M SYUAN CI`) stay inline. Mark long English-only blocks with `lang="en"`. No i18n framework (open question Q9).

---

## 4. Project structure

```
/
├─ ADR/                         Architecture Decision Records (Claude)
├─ docs/                        Product, design system, architecture, handoff, reviews
├─ .github/
│  ├─ workflows/ci.yml
│  └─ pull_request_template.md
├─ public/
│  ├─ media/<slug>/*.mp4        Delivery video files (not processed by Astro)
│  ├─ files/Syuan-Ci-Resume.pdf
│  ├─ _headers                  Cloudflare static-asset headers (cache + security)
│  └─ favicon.svg, robots.txt
├─ src/
│  ├─ assets/
│  │  ├─ projects/<slug>/       Raster sources for astro:assets (exported from Figma)
│  │  └─ site/                  Logo, about images, OG fallback
│  ├─ content/
│  │  ├─ projects/<slug>.yaml   One file per case study
│  │  ├─ site.yaml              Nav, hero copy, about, contact links, footer
│  │  └─ resume.yaml            Web resume content
│  ├─ content.config.ts         Collections + Zod schemas (single source of content types)
│  ├─ components/
│  │  ├─ ui/                    Primitives: Button, Tag, Eyebrow, TextLink, ArrowButton, LinkCard
│  │  ├─ media/                 ResponsivePicture, LoopVideo, MediaFrame (image|video)
│  │  ├─ layout/                SiteHeader, SiteFooter, Section, Container
│  │  ├─ home/                  HomeHero, FeaturedProject, ProjectGrid, ProjectCard, About
│  │  ├─ case/
│  │  │  ├─ CaseSections.astro  The section renderer (order + tone + omission rules)
│  │  │  └─ sections/           CaseHero, Overview, KeyScreens, MobileRwd, InteractionMotion,
│  │  │                         Details, VisualExtension, Links, NextProject
│  │  └─ resume/
│  ├─ elements/                 Custom elements (client TS): loop-video, motion-steps, reveal-on-view, footer-tint
│  ├─ lib/                      Pure TS, no DOM: projects.ts, sections.ts, media.ts, seo.ts
│  ├─ layouts/BaseLayout.astro  <head>, SEO, fonts, header/footer slots
│  ├─ pages/
│  └─ styles/
│     ├─ tokens.css             Primitive + semantic tokens (mirror of Figma variables)
│     ├─ fonts.css
│     └─ global.css             @layer reset, base, typography, utilities
├─ tests/
│  ├─ unit/                     Vitest (src/lib/**)
│  └─ e2e/                      Playwright + axe
└─ astro.config.mjs, tsconfig.json, eslint.config.js, .stylelintrc.json,
   .prettierrc, lighthouserc.json, playwright.config.ts, vitest.config.ts
```

Module boundaries:
- `src/lib/**` is pure and framework-free. It must not import `.astro` files or touch the DOM. All non-trivial logic lives here so it is unit-testable.
- `src/elements/**` is the **only** place that ships client JavaScript. Each element is one file and has no cross-imports except `src/lib/**` helpers.
- Components never read content files directly. Pages query collections and pass typed props down.
- `components/case/sections/*` render one section each and do not know about each other. Ordering and tone come from `CaseSections.astro` + `lib/sections.ts`.

---

## 5. Content model and component architecture

### 5.1 Content collections
Content is data, not markup. All copy, links, and media references for a case study live in `src/content/projects/<slug>.yaml`, validated by Zod in `src/content.config.ts`. **An invalid or incomplete content file must fail the build.**

Schema sketch (normative for shape; field names may be refined in M0 with Architect review):

```ts
// Captioned — close-ups, mobile panels, detail items (Figma: "Caption title" + "Caption sub")
type Captioned = { title: string; caption?: string; media: Media };
// v1.4: Details items carry an eyebrow and a bento size (88Win 360:376 has 7 cards of mixed size)
type DetailItem = { eyebrow?: string; title: string; caption?: string; media: Media;
                    mobileMedia?: Media /* v1.5: art-directed 390 visual, §9.1 */;
                    size?: 'third' | 'half' | 'half-tall' | 'full' /* default third */ };
type Stat = { label: string; value: string };

// Media — every visual slot is one of these
type Media =
  | { kind: 'image'; src: ImageMetadata; alt: string }            // alt '' only with decorative: true
  | { kind: 'video'; src: `/media/${string}.mp4`; poster: ImageMetadata; alt: string;
      status?: 'ready' | 'pending' };                                 // 'pending' = asset not delivered yet
// v1.3: image media may also be { status: 'pending'; expectedFile: string } (§9.3)
// v1.7: featured Home card only (ADR-0013): a background image plus two videos placed from Figma
type Composite = { kind: 'composite'; alt: string;
                   background: Media /* image */; desktop: Media /* video */; phone: Media /* video */ };

type Project = {
  // slug = the content entry id (file name); it must be one of the 7 slugs in §3
  order: number;                                    // 1..7, unique, contiguous, validated on every build
  name: string; nameZh: string;                     // "AMD", "康健生醫"
  card: { summary: string; tags: string[]; media: Media | Composite /* v1.7 */; featured?: boolean };
  seo: { title: string; description: string; ogImage?: ImageMetadata };
  next: { oneLiner: string; meta: string; media: Media };   // how this project appears in the previous page's "Next project"

  hero:        { eyebrow: string; title: string; headline: string; subtitle: string;
                 titleSizeMobile?: number /* v1.8: px at 390, from the project's 390 frame */;
                 stats: [Stat, Stat, Stat, Stat];   // Role / Platform / Status / Year
                 showcase: { layout: 'isometric' | 'single'; items: Media[];
                             mobileMedia?: Media /* v1.14: 390 art-directed crop of item 1 */;
                             mobileScale?: 0.25 /* v1.12: HUIFA, 390 shows the 1920 composite at ×0.25 */ } };
  overview:    { heading: string; blocks: { title: string; body: string }[] /* 2–3 */; outputs: string[] };
  keyScreens:  { eyebrow: string; heading: string; subtitle: string;
                 main: Media /* 16:9 */; closeups: Captioned[] /* 2–3 */ };
  mobile?:     { eyebrow: string; heading: string; subtitle: string; panels: Captioned[] /* 3 */ };
  motion?:     { eyebrow: string; heading: string; subtitle: string;
                 steps: { title: string; body: string; media: Media }[] /* 1–3 */ };
  details?:    { variant?: 'cards'; eyebrow: string; heading: string; subtitle: string; items: DetailItem[] /* 1–8 */ }
             | { variant: 'compare' /* v1.12, HUIFA: two labelled full-width media, docs/specs/huifa.md */;
                 eyebrow: string; heading: string; subtitle: string; items: [CompareItem, CompareItem] };
  visualExtension?: { variant: 'mosaic' | 'grid'; items: Media[];
                      mobileMedia?: Media /* v1.14: 390 mosaic art, e.g. HUIFA visual-mosaic-mobile.jpg */ };
  links:       { eyebrow: string; heading: string; subtitle: string;
                 cards: { kind: 'prototype' | 'live' | 'demo'; eyebrow: string; label: string; description: string;
                          url: string }[] /* 1–2 */; note?: string };
};
```

Cardinality rules from the V9 template (2–3 overview blocks, 2–3 close-ups, 1–3 motion steps, 1–2 link cards) are enforced in the schema. **Details** follow the Product Owner's Figma rather than the template table: 1–8 items, each with a `size` that maps to the bento grid (`third` = 1/3 row, `half` = 1/2 row, `half-tall` = 1/2 column spanning two half rows, `full` = full row). 88Win uses `half-tall`, `half`, `half`, `full`, `third` ×3. The other projects use three `third` cards. Layout fallbacks (for example "fewer than 3 close-ups → 2 columns") are then derived from item count in the component, not from extra flags.

**Content fidelity rule (v1.2).** Every user-visible string, tag, number, and URL in content files is copied **verbatim** from Figma (or from the Product Owner / the resume PDF). Nothing is paraphrased, translated, or invented. If a value is not available yet, use the literal marker `TODO(CONTENT)`. The build lists every remaining marker, and the production build (`WORKERS_CI_BRANCH=main`) fails while any remain, the same way as pending media (§9.3). Schema validity is never a reason to write made-up copy.

**Accent markup (v1.4).** Figma headings colour key words with `--color-text-brand` (e.g. 「延伸到**三個裝置**」 in `360:283`, 「PC・H5・App **跨裝置**介面設計」 in `360:255`). Content strings mark these words with `**double asterisks**`. One shared helper (`src/lib/accent.ts`) splits the string into plain text and `<span class="accent">` parts. Astro escapes the text, so no HTML is ever injected. The helper is used by every heading, title, and headline that can carry an accent. Asterisks never reach the rendered page. Each `**…**` must match a brand-coloured span in Figma exactly.

**Hard line breaks (v1.14).** A line break inside a content string renders as `<br>`, and only where Figma breaks the line on purpose (for example the section `heading` that Figma sets on two lines). Write such strings as YAML block scalars (`heading: |-`), one Figma line per YAML line. `AccentText` (`src/components/ui/AccentText.astro`) turns each newline into `<br>`, also inside an `**accent**` span. It is used by every field that goes through the accent helper (hero headline and title, section intros, Overview, Home hero and About). Never add a break that Figma does not have to fix wrapping at another width; fix the width or the type instead. The About body splits paragraphs on a blank line (`\n\n`).

**Transcription checklist.** For every section, the implementer reads **every** text node and link (`href`) in the Figma frame, including card eyebrows, descriptions, captions, counters, and Next-project meta. A Figma field must never be left as `TODO(CONTENT)` when the frame contains it. `TODO(CONTENT)` is only for copy that does not exist in Figma.

`site.yaml` holds nav labels, home hero copy, credentials, About copy, tools/skills tags, contact links (Email, LinkedIn), and footer copy. `resume.yaml` holds the web resume (shape below, v1.15).

**Resume content (v1.15, M4).** A `resume` collection loaded with `file('./src/content/resume.yaml')`, like `site`. Copy is specified in [`docs/specs/resume.md`](specs/resume.md).

```ts
type ResumeEntry = { period: string; duration: string; title: string; badge?: string;
                     org: string; industry?: string; body: string;
                     projects?: { label: string; slug: ProjectSlug /* the §3 slug enum; links /work/<slug>/ */ }[] };
type ResumeSection<T> = { heading: string; eyebrow: string } & T;

type Resume = {
  seo: { title: string; description: string };
  header: { eyebrow: string; nameZh: string; nameEn: string; role: string; focus: string;
            email: string; location: string; download: { label: string; href: '/files/Syuan-Ci-Resume.pdf' } };
  summary: string;                                   // **accent** markup
  facts: [Stat, Stat, Stat, Stat];                   // the existing Stat shape
  experience: ResumeSection<{ entries: ResumeEntry[] /* ≥ 1 */ }>;
  earlier?: ResumeSection<{ entries: ResumeEntry[] }>;
  skills: ResumeSection<{ groups: { label: string; tags: string[] }[]; note?: string }>;
  education: ResumeSection<{ blocks: { label: string; title: string; value?: string; lines?: string[] }[] }>;
  about: ResumeSection<{ body: string /* paragraphs split on a blank line */ }>;
};
```

- Components live in `src/components/resume/` and receive typed props from `src/pages/resume.astro`; they never read content (§4). They reuse `AccentText`, the tag-chip and outline-pill styles, and `<reveal-on-view>`. No new client JavaScript.
- The project slug enum is shared with the `projects` collection (one definition), so a renamed project fails the resume build.
- A unit test rejects CJK radical code points (U+2E80–U+2FDF) in `resume.yaml`: the PDF's text layer uses them, and they would bypass the font subsets.

### 5.2 Case page renderer
`CaseSections.astro` owns the V9 template rules so no individual page can drift:
1. **Fixed order**: Hero → Overview → Key Screens → Mobile/RWD? → Interaction & Motion? → Details? → Visual Extension? → Links → Next Project.
2. **Omission**: an optional section without content is not rendered (no empty shells).
3. **Tone**: `lib/sections.ts#assignTones(sections)` returns a fixed tone per section, independent of optional-section omissions: Hero, Overview, Mobile/RWD, Visual Extension, and Next Project use `canvas` (`--color-bg-canvas`); Key Screens and Details use `surface` (`--color-bg-surface`); Interaction & Motion and Links use `inverse` (`--color-bg-inverse`). Product Owner confirmed this mapping against all 14 case-page Figma frames on 2026-11-02. It is implemented once and unit-tested for every omission combination.
4. **v1.13:** the hero has no entrance motion. The Visual Extension is the one "signature" visual with the richer entrance. All other sections use the standard grouped reveal (§8).

### 5.3 Component layers

| Layer | Examples | Rules |
|---|---|---|
| Tokens | `tokens.css` | Only place raw values live (enforced by Stylelint, §13) |
| UI primitives | `Button` (primary pill, outline pill, contact pill), `Tag` (thin gray border, no fill), `Eyebrow`, `TextLink` (light/dark), `ArrowButton`, `LinkCard` | Map 1:1 to Figma section `Hover 元件｜Interactive components` (`465:662`). All hover/focus/active states are CSS-only |
| Media | `ResponsivePicture`, `LoopVideo`, `MediaFrame` | The only components allowed to emit `<img>`, `<picture>`, or `<video>` |
| Layout | `Container` (content widths: 1728 home / 1440 case / about 1080 resume at desktop), `Section` (tone + spacing), `SiteHeader`, `SiteFooter` | |
| Sections / blocks | Home sections, case sections | Compose primitives; no raw colors or spacing values |
| Pages | `index`, `work/[slug]`, `resume`, `404` | Query content, compose sections, set SEO |

Component rules:
- Components are `.astro` files with typed `Props` interfaces and scoped `<style>`.
- Variants are explicit props (`variant="primary" | "outline"`), not class-name passthrough.
- **Whole-card links** (project cards, link cards) use one real `<a>` that covers the card. Do not nest interactive elements inside it. Do not use `onclick` navigation.
- **External links** (link cards, "正式網站", "Figma 原型") use `target="_blank" rel="noopener noreferrer"` and carry a visually-hidden "（另開新視窗）" label.

---

## 6. State-management policy
- **No global client state, no state library, no `localStorage` / `sessionStorage` / cookies.**
- Interactive state is local to a custom element and reflected in DOM attributes (`aria-selected`, `data-state`). The DOM is the state.
- Navigation state is the URL (path + hash). No client-side router.
- No analytics or third-party scripts by default (open question Q8).

---

## 7. Client interactivity (custom elements)
All interactivity is **progressive enhancement**. With JavaScript disabled, every page is fully readable, all links work, and videos show posters with native controls.

| Element | Responsibility |
|---|---|
| `<loop-video>` | **v1.7, ADR-0013.** Wraps one or more `<video muted playsinline preload="none">` (no `loop`). **v1.9:** each poster is a real `<Picture>` layer under its video (lazy, `aria-hidden`; **eager** when the card is above the fold, i.e. the featured card), so posters show with JS off and in every state. **v1.10:** case-page videos (`LoopVideo.astro`) follow the same rule with a single `<img>` layer (lazy, eager only for a first hero item). The `poster` attribute is not used, because browsers fetch it eagerly. Observers start only after the window `load` event, so no video byte competes with the LCP image. After that, it attaches the source when within one viewport of the screen. **Plays once from 0 each time it enters view** (≥ 50 %), then stays on the last frame. Pauses when it leaves view. **Hover-capable devices** (`(hover: hover) and (pointer: fine)`): `pointerenter` / keyboard `focus-within` on the video or its whole-card link replays it from 0. **Touch**: no play indicator. Tapping a video that is not inside a link replays it, and inside a link a tap only navigates. **Reduced motion or Save-Data**: no playback on view, only on hover / focus / tap. Multiple `<video>` children (the featured composition) start together and end with the longest. Exposes `data-state="idle|playing|ended|paused"` for styling and tests. |
| `<motion-steps>` | Interaction & Motion step switcher, used by every project (AMD 404 / 維護 is one instance). Semantics: WAI-ARIA **Tabs** (`tablist` / `tab` / `tabpanel`), arrow-key + Home/End navigation, roving tabindex. **PO decision 2026-11-02:** when at least 50% of the section enters view, the steps play once in sequence (01 → 02 → 03, or 01 → 02 for the two-step JHANYU and HUIFA) and stop after the last; the Tabs ARIA state follows each automatic switch. Clicking or keyboard-selecting any step plays it once and stops auto-advance. **ADR-0013:** reduced motion or Save-Data disables automatic playback. |
| `<reveal-on-view>` | Adds `data-inview` once when the element enters the viewport. CSS does the animation. Disconnects after firing. |
| `<footer-tint>` | Placed right after the site footer. iOS Safari fills the strip below the page (bottom overscroll, behind its toolbar) from the root background and from fixed elements at the viewport edge. While the footer covers the bottom edge and the page is scrolled, it sets `data-footer-tint` on `<html>`: the root turns `--color-bg-inverse`, and the element shows as an 8 px fixed bar in that color over the footer's bottom padding (invisible). At the top the root stays white, so a pull-down shows white. Without JS the strip is white. No motion, no layout shift. |

Rules:
- Elements are defined in `src/elements/*.ts` and loaded via Astro-processed `<script>` in the component that uses them, so they are bundled, deduped, and only shipped on pages that need them.
- **Client JS budget: ≤ 15 KB gzip per page** (all first-party JS combined).
- No `client:*` hydration directives, because no framework components exist (ADR-0003).

---

## 8. Animation architecture
- **CSS-first.** Hover, focus, press, and reveal motion are CSS transitions/keyframes driven by motion tokens:
  `--motion-duration-*`, `--motion-ease-*`, `--motion-distance-reveal`, `--motion-stagger`. Values and behavior rules are defined in `docs/DESIGN_SYSTEM.md` → Motion.
- Only `transform` and `opacity` are animated (compositor-only). Do not animate layout properties (`width`, `height`, `top`, `margin`). `will-change` only during an active animation.
- Scroll reveals use `<reveal-on-view>`. Scroll-linked animation (`animation-timeline: view()`) may be used as an enhancement behind `@supports`, never as the only path to visible content.
- **Grouped reveals (v1.13).** A `<reveal-on-view>` wraps one reveal group (DESIGN_SYSTEM → Motion). Items inside it are marked in markup (for example `data-reveal-item`), and the stagger delay comes from CSS, such as `:nth-child()` steps capped at 4 × `--motion-stagger`. **No inline `style` attributes**: the CSP (§12) has no `'unsafe-inline'` for styles. One observer fires the whole group once.
  - The hero is never wrapped. Nothing above the fold on first load may start hidden, so LCP and the first paint are unchanged.
  - The Visual Extension group uses the signature variant (scale 0.96 → 1, `signature`). When it finishes, the end state is `transform: none`, not `scale(1)`, so no compositing layer is left behind and the mosaic seam fix keeps working.
  - Reveals only use `opacity` / `transform`, so section heights, the 390 height gates and CLS do not change.
  - `content-visibility: auto` sections still render before they enter view (the browser renders them within its viewport margin), so the observer fires normally. E2E must still scroll groups into view, or use `reducedMotion: 'reduce'`, before asserting visibility or running axe, because an element at `opacity: 0` can fail colour-contrast checks.
- Page transitions: native cross-document **View Transitions** (`@view-transition { navigation: auto; }`) as progressive enhancement. No SPA router.
- **Reduced motion**: a global `@media (prefers-reduced-motion: reduce)` layer sets durations to ~0 and disables smooth scroll, reveals, and View Transitions. Videos are unaffected because they only ever play on user action.
- **Content is visible by default.** Reveal styles hide elements only when JS has loaded (`html.js [data-reveal]:not([data-inview])`), so a JS failure never hides content.
- An animation library (GSAP, Motion One, Lottie, etc.) needs an ADR. The threshold is a Figma motion spec that CSS + IO cannot express, such as a scrubbed multi-element timeline.

---

## 9. Asset strategy

### 9.1 Images
- Source rasters live in `src/assets/projects/<slug>/` and are rendered only through `ResponsivePicture` (`astro:assets` `<Picture>`), with `formats: ['avif', 'webp']`, a fallback, and explicit `widths` + `sizes` per slot.
- **Export from Figma** at **2× the largest rendered CSS size**, capped at 2880 px wide (3840 px for full-bleed 1920 slots). Use PNG for UI/flat graphics and JPG q90 for photographic content. Max 6 MB per source file.
- File naming: `kebab-case` by slot, e.g. `hero-showcase.jpg`, `key-navigation.jpg`, `mobile-app.jpg`, `detail-card.png`, `visual-mosaic.jpg`. The per-project list of exact names, Figma nodes, and pixel sizes is [`docs/ASSETS.md`](ASSETS.md); content `expectedFile` values must match it.
- **Export shapes (v1.5).** Every slot is one of three shapes. The shape decides how many files exist, so components must not assume more.
  - **Composite**: the Figma frame is exported as one pre-composed image, including device mockups, overlaps, and tilt. Used for the **hero showcase** (`hero-showcase.jpg`, frame `360:270` on 88Win) and the **Visual Extension mosaic** (`visual-mosaic.jpg`, `360:1297`). The 390 frames are uniform scales of the 1920 composition (hero ×0.38, mosaic ×0.32, centred and clipped), so mobile uses the **same file**: the slot sets the scaled width, centres it, and clips overflow. Content uses `hero.showcase.layout: 'single'` with one item, and `visualExtension.variant: 'mosaic'` with one item. The hero slot shows the top 1920 × 820 of the 1920 × 920 frame (`object-position: top`), matching the Figma clip.
  - **Crop**: the Figma frame that clips a larger screenshot is exported as shown (close-ups, Mobile/RWD panels). Desktop and 390 crops have the same aspect ratio, so there is one file per slot.
  - **Art-directed (Details)**: only the visual area of a Details card is exported. Eyebrow, title, and caption stay HTML text. The 390 Details cards **reflow** their visuals (e.g. Color swatches go from one row to a column), so each item has `detail-<name>.png` (1920 frame) and `detail-<name>-mobile.png` (390 frame) in `media` / `mobileMedia`, rendered as one `<picture>` whose mobile `<source>` applies below the section's layout switch point (§10). Both files are PNG.
- **Slot-exact srcset (v1.11, PO standard for every image).** At each desktop slot the browser must find a file of exactly the slot's 1× and 2× CSS width, so it never resamples: Chrome's non-integer downscale (for example a 2400 w file in a 1920 slot at DPR 1) visibly softens UI text. Rules:
  - `SRCSET_WIDTHS` (`src/lib/media-srcset.ts`) holds the shared 1× slot widths (960, 1440, 1920) plus steps for phones.
  - A narrower fixed slot passes a `MediaSlot` (`{ width, sizes }`, the width from the Figma 1920 frame) through `ProjectMedia` → `ResponsivePicture` / `LoopVideo`; its 1× and 2× widths join the srcset, and its `sizes` must clamp to that width (`min(<fluid vw>, <width>px)`).
  - Any new image slot must state its slot, or prove that the default `sizes` already equal its rendered width. Verify by capture at 1920 × DPR 1: the downloaded file width equals the rendered CSS width.
- Every `<img>` has intrinsic `width`/`height` (CLS). The LCP image per page (home featured card / case hero showcase) is `loading="eager" fetchpriority="high"`. All others are `loading="lazy" decoding="async"`.
- `alt` is required in the schema. Decorative imagery must set `alt: ''` **and** `decorative: true` explicitly.
- Details section (v1.5, supersedes the earlier SVG preference): Details visuals mix vectors, raster game art, and labels, so they are delivered as 2× PNG per the art-directed shape above. A slot's aspect ratio comes from its Figma visual area (e.g. 88Win Color 647 × 140 desktop, 310 × 280 mobile), not from the whole card.

### 9.2 Video
- Delivery format: **MP4, H.264 (High), yuv420p, no audio track, `+faststart`**. Posters are required (`poster` in schema, rendered via `astro:assets`). WebM/AV1 alternates are optional later.
- Encoding targets / hard caps:

  | Slot | Encode (v1.14) | Target | Hard cap |
  |---|---|---|---|
  | Key Screens main `key-main.mp4` (16:9 slot, 1440 CSS px wide) — also the Next Project preview (§9.5) | 1920 w, CRF 24–26 | ≤ 5 MB | 8 MB |
  | Details video `detail-*.mp4` (e.g. HUIFA LIVE SITE) | 1920 w | ≤ 5 MB | 8 MB |
  | Interaction & Motion step `motion-*.mp4` (960 / 532 slot) | 1920 w, CRF 21 | ≤ 2.5 MB | 4 MB |
  | Home card `card*.mp4` | 1280 w, first 10 s, CRF 24 | ≤ 2 MB | 3 MB |

  All encodes: H.264 High, 30 fps, `-an`, `+faststart`; the poster is frame 1 at the encoded width. Clip length ≤ 20 s. `scripts/check-media.mjs` (run by the build) fails on any file over its hard cap; anyone pushing media runs it locally first.
- **Wide recordings (v1.14).** A recording wider than 1.9 : 1 (the Product Owner's 2528 × 1216 screen captures) keeps its full width: the slot takes the **2528 / 1216** ratio (`aspectRatio: 2528 / 1216`, class `ratio-2528x1216`) instead of cropping to 16 : 9 or 960 / 532. Narrower recordings are cropped to the slot ratio. Each project's ASSETS table names its frame.
- Files live in `public/media/<slug>/`, named by slot (`key-main.mp4`, `motion-1.mp4`, …). Each video's poster is `src/assets/projects/<slug>/<video-name>-poster.jpg` (e.g. `key-main-poster.jpg`, `motion-1-poster.jpg`), exported at 2× the slot. Motion step slots use the Figma ratio **960 / 532**, not 16 / 9. Changing a video changes its filename (`motion-1.v2.mp4`) so it can be cached as immutable.
- No embeds (YouTube/Vimeo/Figma iframes). Prototypes are external links only.
- Repository weight: masters stay **out of git**. If committed delivery media exceeds **300 MB**, open an ADR (Git LFS or R2 object storage).

### 9.3 Missing assets (template-first delivery, v1.3)
The Product Owner delivers images (2× exports from Figma) and videos **after** the templates are built. Layout and code must therefore never wait for media.
- **Both images and videos** may be `status: 'pending'`. A pending entry carries `expectedFile`, the exact path the real file will have (§9.1 naming, e.g. `src/assets/projects/88win/key-main-poster.jpg` or `public/media/88win/motion-1.mp4`).
  - Pending images point `src` at a shared neutral placeholder, `src/assets/placeholders/placeholder.png`.
  - Pending videos render their poster (or the same placeholder) and emit no `<source>`. While a video is pending its poster is pending too: the pending-asset report lists the video's `expectedFile` **and** the derived poster path (§9.2 naming), so the Product Owner sees both files.
- In development and preview builds, pending media renders a neutral box at the slot's real aspect ratio, with a small "素材待補" label so missing assets are obvious on preview URLs. Layout must be identical with placeholder or real media; slot sizes come from CSS, not from the file.
- The **pending-asset report** printed on every build lists each `expectedFile` grouped by project. This is the Product Owner's asset to-do list.
- The **production build fails** while any media is `pending` (as before).
- Delivering an asset = add the file at `expectedFile`, point `src` at it, and delete `status` / `expectedFile`. No component changes.

### 9.4 Play indicator
- **Removed in v1.7** (ADR-0013). Videos play on view, so touch devices no longer need a play indicator.

### 9.5 Home card videos and the featured composition (v1.7)
- Every Home card uses a video: `public/media/<slug>/card.mp4` with the poster `src/assets/projects/<slug>/card-poster.jpg` (the first frame). The clip is the first 10 s, 1280 px wide, H.264, no audio, ≤ 3 MB. `next.media` uses the project's Key Screens `key-main.mp4` + `key-main-poster.jpg` (the same desktop recording at 1920 w): the Next preview is 1440 × 741 CSS px at a 1920 viewport, so the 1280 w card clip would be upscaled and soft. The bytes load only near the page bottom, and the file is cached for the next page.
- The featured 88Win card is `kind: 'composite'`: `card-bg.jpg` (3456 × 1000), `card-pc.mp4` (1280 × 708) and `card-mobile.mp4` (320 × 660, the phone with its bezel, cropped from the delivered recording), each video with a `-poster.jpg`. Positions as a percentage of the card, from Figma:

  | Layer | Desktop `465:999` (card 1728 × 500) | 390 `474:1087` (card 350 × 200) |
  |---|---|---|
  | Background | cover, image 1728 × 1262 at y −365 (centred on the card's vertical middle) | cover, 691 × 505 at x −187, y −146 |
  | PC video | x 397, y 81, 844 × 477 (bottom clipped by the card) | x −2, y 0, 353 × 200 (fills the card) |
  | Phone video | x 1185, y 250, 146 × 301 (bottom clipped) | x 266, y 100, 58 × 120 (bottom clipped) |

  The phone video's black surround is clipped with a corner radius of 15 % of its width. Values are percentages of the card box, so the composition scales with the card. The 88Win `next.media` is its `key-main.mp4`, like every project.
- `card.jpg` stays as the SEO / Open Graph fallback image and is no longer rendered in the cards.

---

## 10. Responsive implementation strategy
- **Mobile-first CSS.** Base styles target small screens; `min-width` media queries add desktop layout.
- **Fluid scale**: type and section spacing use `clamp()` between a 390 px and a 1920 px reference viewport, so the desktop Figma values are hit exactly at 1920.
- **Two design anchors**: mobile frames at 390 and desktop frames at 1920. Implement the 390 frames exactly at 390 and the 1920 frames exactly at 1920.
- Layout breakpoints (provisional tokens): `--bp-md: 768px`, `--bp-lg: 1024px`, `--bp-xl: 1440px`. **Tablet (768–1279) is not designed.** The implementer chooses where each section switches from the mobile to the desktop layout, keeping desktop layouts from cramping. These switch points are shown on the preview deploy for Product Owner approval, then recorded in DESIGN_SYSTEM. CSS custom properties cannot be used inside media queries, so media queries use the literal value followed by the token name in a comment (`@media (min-width: 1024px) /* --bp-lg */`). JS reads the same values from a single `src/lib/breakpoints.ts`.
- Use **container queries** for reusable components whose layout depends on their slot (ProjectCard in featured vs grid, LinkCard).
- Desktop max layout width follows Figma: 1728 px content on Home, 1440 px on case pages, centered beyond 1920.
- Touch: hover-only affordances must have an equivalent visible state under `(hover: none)`. Tap targets ≥ 44×44 px.
- **Case hero at 390 (v1.8).** Figma sizes the project title per project at 390 (88Win 76 px `475:973`, Hwa Fong 56 px `483:1318`), so the title fits its designed line breaks. Content sets `hero.titleSizeMobile` (px, from the spec sheet). Below the case layout switch point, the title uses `calc(titleSizeMobile / 390 * 100vw)`, capped at that px value, and falls back to `--font-size-case-title` when the field is absent. The case title uses `letter-spacing: -0.04em` at every width (Figma −4 %). The 390 back link ("← 所有作品") is **centred** on every case page (Product Owner, 2026-10-31). The Hwa Fong frame's left-aligned link is not followed.
- **Minimum supported width: 360 px.** Nothing may overflow or clip between 360 and 389. Text may wrap there, because Figma only anchors 390. An E2E test at 360 × 800 guards each page type.
- Mobile layouts follow the 390 frames. Where a mobile frame omits something present on desktop, follow the mobile frame and do not invent a layout. If a needed mobile state is missing, raise it in the PR under "Deviations from Figma".

---

## 11. SEO and metadata
- `BaseLayout` sets per page: `<title>`, meta description, canonical, Open Graph (`og:title`, `og:description`, `og:image` 1200×630, `og:type`, `og:locale=zh_TW`), Twitter card `summary_large_image`.
- Per-project values come from `seo` in the content file. OG images are produced at build via `astro:assets` (`getImage`, 1200×630 cover crop) from `seo.ogImage ?? card.media` poster.
- `@astrojs/sitemap` + `robots.txt`. 404 is excluded from the sitemap.
- JSON-LD: `Person` on `/` (name, jobTitle, sameAs LinkedIn), `CreativeWork` on each case page.
- Semantic structure: one `<h1>` per page. Case section headings are `<h2>`, card titles `<h3>`. Landmarks: `header`, `nav`, `main`, `footer`.

---

## 12. Accessibility baseline
Target: **WCAG 2.2 AA**.
- Contrast: all text/background token pairs are verified ≥ 4.5:1 (≥ 3:1 for large text and UI boundaries). **Known constraint:** brand blue `#1F3BD6` on `#141414` / `#222222` is **≈ 2.3:1**, so brand-blue text is not allowed on dark sections. Blue as a fill with white text/icon (7.9:1) is fine.
- Keyboard: everything operable by keyboard, with a visible `:focus-visible` ring (token-defined) and a skip link to `main`.
- Motion: `prefers-reduced-motion` honored (§8). Videos play once on entering view and stop by themselves (ADR-0013). Reduced motion and Save-Data turn this off. **Open (Q11):** clips longer than 5 s that start automatically need a pause mechanism under WCAG 2.2.2.
- Scope note: there is no legal accessibility obligation for a personal portfolio in Taiwan. The Product Owner chose a **pragmatic baseline**: automated checks plus keyboard / contrast / alt text / reduced motion. It must not add design work beyond what Figma already shows.
- Links: "opens in new tab" announced; generic labels like "Figma 原型" get context via `aria-describedby` / visually hidden project name.
- Media: meaningful `alt`; videos are decorative demonstrations (no audio) and are described by the adjacent caption / step text.
- `lang` attributes per §3.
- Enforced: `@axe-core/playwright` on every route with **zero serious/critical violations**, plus a manual keyboard pass in Claude review.

---

## 13. Performance strategy and budgets
Measured with Lighthouse CI (mobile emulation) on the built site, and with field data after launch.

| Metric | Budget (every route) |
|---|---|
| Lighthouse Performance (mobile) | ≥ 90 (home, one case page, resume) |
| Lighthouse Accessibility / Best Practices / SEO | ≥ 95 / ≥ 95 / 100 |
| LCP | ≤ 2.5 s (lab, mobile) |
| CLS | ≤ 0.05 |
| TBT | ≤ 150 ms |
| First-party JS (gzip) | ≤ 15 KB per page |
| CSS (gzip) | ≤ 40 KB per page |
| Font transfer, cold cache | ≤ 250 KB on `/`; ≤ 400 KB on case pages and `/resume/` (ADR-0012) |
| Initial page weight before scroll (excl. video) | ≤ 1.2 MB home, ≤ 1.5 MB case. **v1.9 gate:** LHCI asserts per type, because Lighthouse cannot subtract video from `total`: image ≤ 800 KB, script ≤ 50 KB, stylesheet ≤ 50 KB, document ≤ 50 KB, plus the font budget above |
| Video bytes before the `load` event | **0** (ADR-0013 v1.9: sources attach only after `load`, and only near view) |
| Video bytes after load, lab | ≤ 2 MB on `/` (the featured pair plus the next card), ≤ 3 MB on other routes (LHCI `resource-summary:media:size`) |

Strategy: static HTML, no framework runtime, AVIF/WebP with correct `sizes`, lazy media below the fold, fonts subset by unicode-range with `font-display: swap`, and immutable caching for hashed assets (§14).

**v1.10, case-page LCP** (measured in the ADR-0012 amendment of 2026-11-01). The case LCP is the hero title, so its render delay is set by the bytes and the layout work before the first paint:
- Case sections after the hero use `content-visibility: auto` (`contain-intrinsic-size: auto 60rem`), so the first layout covers only the hero. Tests that measure section boxes must render them first, by scrolling them into view or by setting `content-visibility: visible`.
- Nothing below the fold is fetched before the first paint. Case-page video posters are lazy image layers (§7), not the `poster` attribute, which browsers fetch eagerly. Footer icons are `loading="lazy"`.
- Fonts: per-page `ext` subsets, and case pages preload the 400 `core` subset (ADR-0012). The home page preloads no font, because its LCP is an image.

---

## 14. Build, runtime, and deployment
- **Node.js 24 LTS** (`.node-version` / `engines`), **pnpm** pinned via `packageManager` + Corepack.
- Hosting: **Cloudflare Workers static assets** via Workers Builds (ADR-0011, supersedes ADR-0009). Config in `wrangler.jsonc`.
  - `main` → production; every PR branch → preview URL (used for Claude review and PO visual sign-off).
  - Build command `pnpm build`, output `dist/`.
- `public/_headers`:
  - `/_astro/*` and `/media/*` → `Cache-Control: public, max-age=31536000, immutable`
  - HTML → `Cache-Control: public, max-age=0, must-revalidate`
  - Security: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geolocation off), `X-Frame-Options: DENY`.
  - **CSP has one owner per directive** (v1.1). Astro's built-in CSP (`security.csp`) emits a hashed `<meta>` policy and owns `default-src`, `script-src`, `style-src`, `img-src`, `media-src`, `font-src`, `connect-src`. The `_headers` CSP carries **only** directives a meta tag cannot express: `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'`. Browsers enforce every policy present, so duplicating resource directives in both places would block Astro's hashed inline output in production.
  - Because `astro preview` does not apply `_headers`, an E2E test applies the `_headers` CSP to responses and asserts no console errors / CSP violations on every route.
- The Product Owner creates the Cloudflare account / project and the domain (Q7). Agents never handle account credentials.

---

## 15. Dependency policy
- **Runtime/production dependencies are limited to**: `astro`, `@astrojs/sitemap`, `@fontsource-variable/instrument-sans`, and build-time–generated Noto Sans TC subsets (ADR-0012; `@fontsource/noto-sans-tc` is removed). Anything else requires Architect approval in the PR description, or an ADR if it changes an architecture decision.
- **Dev dependencies (pre-approved)**: `typescript`, `@astrojs/check`, `eslint` + `typescript-eslint` + `eslint-plugin-astro` + `eslint-plugin-jsx-a11y` (Astro a11y rules), `prettier` + `prettier-plugin-astro`, `stylelint` + `stylelint-config-standard`, `vitest`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli`, `wrangler` (deploy only, ADR-0011), `subset-font` (build only, ADR-0012).
- **Not allowed without an ADR**: UI frameworks (React/Vue/Svelte/Solid/Preact), Tailwind or other CSS frameworks, CSS-in-JS, animation libraries, carousel/slider libraries, jQuery, icon fonts, analytics/tag managers, any third-party runtime script or CDN.
- Versions are locked by `pnpm-lock.yaml`. CI uses `pnpm install --frozen-lockfile`. Dependabot (or Renovate) opens grouped monthly update PRs. Majors are reviewed individually.
- Prefer platform features (CSS, IntersectionObserver, View Transitions, `<dialog>`) over packages.

---

## 16. Quality gates (Definition of Done)

### 16.1 Commands (`package.json` scripts, created in M0)
| Script | Runs |
|---|---|
| `pnpm lint` | ESLint (TS + Astro + a11y) and Stylelint (`color-no-hex` and raw-value rules everywhere except `tokens.css`) |
| `pnpm format:check` | Prettier check |
| `pnpm check` | `astro check` (types + templates, TS strict) |
| `pnpm test` | Vitest unit tests (`src/lib/**`) |
| `pnpm build` | Astro build (content schemas validated) + media size check + pending-asset report |
| `pnpm test:e2e` | Playwright against `astro preview`: Chromium desktop + WebKit iPhone viewport, with axe scan on every route |
| `pnpm lhci` | Lighthouse CI on `dist/` with the §13 budgets |
| **`pnpm verify`** | All of the above, in order |

**Local gates (v1.14, replaces the v1.6 rule).** Since ADR-0014, CI builds once and runs every gate on every push in about 5 minutes, and a red CI blocks approval. Locally, every PR and every fix round runs only the fast gates: `pnpm lint && pnpm format:check && pnpm check && pnpm test`. Media PRs add `node scripts/check-media.mjs`. The build, E2E and Lighthouse run in CI; run them locally only to debug a CI failure or to measure (for example a layout or LCP change). `pnpm verify` stays available for a full local run. Nothing is skipped: only the duplicate local run is.

### 16.2 Required tests
- **Unit**: `projects.ts` (ordering, next wrap 07→01, unique order), `sections.ts` (order, omission, tone alternation for all optional-section combinations), `media.ts` (pending detection, size helpers).
- **E2E smoke**: every route returns 200 and has one `h1`. Nav anchors land on `#work` / `#about` / `#contact`. Next-project chain visits all 7 and returns to 88Win. Every link card has `target="_blank"` + `rel` containing `noopener`. `<motion-steps>` keyboard behavior. `<loop-video>` (v1.7): no source is attached before the element nears the viewport; it reaches `playing` after scrolling into view and `ended` without looping; with `reducedMotion: 'reduce'` it stays `idle` after scrolling; hover replays from 0 on a fine pointer; inside a link a tap navigates. The resume page links to an existing PDF. No console errors.
- **Accessibility**: axe zero serious/critical on all routes.
- **Visual regression**: not a blocking gate in v1. The Claude review compares preview deploys against Figma screenshots. It can be added later as an ADR.

### 16.3 CI (GitHub Actions)
- Trigger: `pull_request` and `push` to `main`.
- Jobs (ADR-0014): `verify` (lint, format, check, unit, build, with the `.astro` image cache) uploads `dist/`; then `e2e` (Playwright + axe) and `lighthouse` run in parallel on that same `dist/`. Cloudflare Workers Builds is the fourth check (branch preview). A failed gate blocks merge.
- The Product Owner enables branch protection on `main`: require PR, require CI, no force-push.

### 16.4 PR rules
- Branches: `feat/…`, `fix/…`, `chore/…`, `docs/…`. Conventional Commits.
- **One milestone (or less) per PR.** No unrelated refactors.
- Fill in `.github/pull_request_template.md`: scope, Figma nodes implemented, screenshots (desktop + mobile), local gate results (§16.1) and the CI run, deviations from Figma, and the architecture issues raised.
- All agents push through the Product Owner's GitHub account, so GitHub "Approve" is unavailable. Claude's verdict is recorded as a PR comment: `Architect review: APPROVED | CHANGES REQUESTED`, using the P0–P3 format in `CLAUDE.md`.

---

## 17. Open product / design questions (blocking or shaping architecture)
These are raised for the **Product Owner**. The architecture does not decide them. Details are in [`docs/reviews/PR-1-architecture-review.md`](reviews/PR-1-architecture-review.md).

| # | Question | Blocks |
|---|---|---|
| Q1 | ~~Scope mismatch.~~ **Resolved 2026-10-29**: 7 projects in a fixed order. PRODUCT.md updated. | — |
| Q2 | ~~No mobile designs.~~ **Resolved 2026-10-29**: 390 frames delivered (Appendix A). The tablet range is handled per §10. | — |
| Q3 | ~~Resume page design.~~ **Resolved 2026-10-29**: `public/files/Syuan-Ci-Resume.pdf` is the desktop design reference for `/resume/`. Mobile stacks the two-column rows. | — |
| Q4 | ~~Motion spec.~~ **Resolved 2026-10-29** (delegated to Architect): see DESIGN_SYSTEM → Motion. **Revised 2026-11-02 (PO):** steps play 01 → last once in sequence when the section enters view, then stop (§7 `<motion-steps>`). | — |
| Q5 | ~~Pending media at launch (AMD 維護 video).~~ **Resolved 2026-10-29** by the Product Owner. The video is delivered with the AMD assets in M3. | — |
| Q6 | ~~Video pause control.~~ **Resolved 2026-10-29**, **revised 2026-10-31 (ADR-0013)**: videos play once on entering view. Desktop hover replays, mobile replays on re-entry, and reduced motion / Save-Data keep the old user-initiated behaviour (§7). | — |
| Q7 | **Cloudflare account + domain.** The Cloudflare account exists (2026-10-30); the Worker project is connected per ADR-0011 and is needed **from M1** for preview URLs. A custom domain is optional and only needed at launch. Until then, the site uses `*.workers.dev`. | M1 previews; launch |
| Q8 | ~~Analytics.~~ **Resolved 2026-10-30**: none. No analytics or tracking scripts. | — |
| Q9 | ~~Language.~~ **Resolved 2026-10-30**: Traditional Chinese only. No English site or English PDF. English eyebrows and display labels stay as part of the visual style. | — |
| Q10 | ~~Figma inconsistencies.~~ **Resolved 2026-10-30**: Hwa Fong has prototype + live site (`https://www.duro.com.tw/`). **Hidden Figma layers are never implemented**: AMD uses `360:2355`; `437:652` is hidden and unused. The site order in PRODUCT.md wins over the template suggestion table. 「深藍」 in the template text means `--color-bg-inverse`. | — |
| Q11 | ~~Auto-started video and WCAG 2.2.2.~~ **Resolved 2026-11-05 (PO): option (c), accepted for v1.** Clips keep playing once without a pause control. Reduced motion and Save-Data still disable autoplay (ADR-0013). The automated gates (axe, Lighthouse) do not test 2.2.2, so nothing changes in CI. | — |

---

## 18. Architecture governance
Architecture decisions belong to Claude in the Architect role.

ChatGPT is the Implementation Engineer and must implement against this document.

If implementation reveals that architecture should change:
1. ChatGPT raises an Architecture Issue (format in `AGENTS.md`) with context, impact, and suggested options.
2. Claude reviews the issue.
3. Claude updates this document and/or adds an ADR.
4. Implementation changes only after the architecture decision is recorded.

Not architecture (the implementer decides; mention it in the PR): internal component decomposition below the layers in §5.3, CSS class naming inside scoped styles, test file organization, and helper function names.

## ADR
Material architecture changes are recorded under [`ADR/`](../ADR/README.md), using the template in ADR-0001.

---

## 19. Implementation milestones

| Milestone | Scope | Gate to start |
|---|---|---|
| **M0 — Bootstrap** | Astro project, tooling, scripts (§16.1), CI workflow, `_headers`, tokens.css from Figma variables, fonts, BaseLayout, SiteHeader/SiteFooter skeleton, content schemas + `site.yaml`, empty routes rendering, Cloudflare preview deploy | Architecture approved |
| **M1 — Home** | Hero, featured project, project grid (7 cards), About, Footer, nav anchors, UI primitives + hover states, `<reveal-on-view>`, `<loop-video>` (if cards use video) | M0 merged |
| **M2 — Case template + 88Win** | All 9 section components, `CaseSections` renderer + tone logic, `<motion-steps>`, 88Win content (the complete V9 reference page) | M1 merged |
| **M3 — Remaining 6 case studies** | Content + assets only (no new components unless Architect approves) | M2 merged + Q10 |
| **M4 — Resume** | `/resume/` (content transcribed from the PDF into `resume.yaml`, layout following the PDF), "Download PDF", About "View Resume" + Footer "VIEW RESUME" links | M1 merged |
| **M5 — Launch hardening** | 404, SEO/OG/JSON-LD, sitemap, budget tuning, domain | Q7, Q8 |

Mobile is part of **every** milestone's Definition of Done (mobile + desktop screenshots in each PR, compared against the 390 and 1920 frames).

---

## Appendix A. Figma source map
File `gNIygsBj4ODtt5gyY2Twij`, page `360:2`.

| Item | Desktop 1920 | Mobile 390 |
|---|---|---|
| Home | `360:3` | `474:1057` |
| 88Win case (V9 reference, all sections) | `360:251` | `475:953` |
| Hwa Fong Tire | `360:1603` | `483:1298` |
| FITZONE | `360:1373` | `484:1339` |
| SSS | `360:1814` | `484:1580` |
| JHANYU | `360:2029` | `484:1821` |
| AMD | `360:2240` | `485:1462` |
| HUIFA | `360:2449` | `485:1693` |
| Navigation | instance in each page | `473:913` |
| Footer | instance in each page | `473:921` |
| Link card | `465:714` | `473:935` |
| AMD / Motion switcher (Step=404 `440:655`, Step=維護 `440:656`) | `440:668` | `482:1326` |
| V9 template rules (section rules + per-project suggestion table) | `360:2669` | — |
| Interactive components / hover states | `465:662` | — |

Not a source of truth: page `03 Foundations` (`41:2`, outdated warm palette), and pages `01 Home Low-fi` and `02 Case Study` (earlier explorations).
| Color variables (semantic names used as CSS tokens) | collections `Portfolio 2026 / Primitives`, `Portfolio 2026 / Color` |

Color tokens currently bound in the designs (from `get_variable_defs`). `tokens.css` uses these names, normalized to `--color-*`:

| Figma variable | Value | CSS token |
|---|---|---|
| `color-bg-canvas` | `#F3F3F3` | `--color-bg-canvas` |
| `color-bg-surface` | `#FFFFFF` | `--color-bg-surface` |
| `color-bg-subtle` | `#E6E6E6` | `--color-bg-subtle` |
| `color-bg-brand` / `color-border-brand` / `color-text-brand` | `#1F3BD6` | `--color-bg-brand` … |
| `color-text-primary` | `#111111` | `--color-text-primary` |
| `color-text-secondary` | `#5C5C5C` | `--color-text-secondary` |
| `color-text-on-brand` | `#FFFFFF` | `--color-text-on-brand` |
| `color-border-default` | `#D4D4D4` | `--color-border-default` |
| `bg/inverse` | `#141414` | `--color-bg-inverse` |
| `bg/inverse-raised` | `#222222` | `--color-bg-inverse-raised` |
| `text/on-inverse-muted` | `#B3B3B3` | `--color-text-on-inverse-muted` |
| `project/accent-soft` | `#ECEEFB` | `--color-project-accent-soft` |
| (hover, from brief) | `#182FAD` | `--color-bg-brand-hover`: confirm it exists as a Figma variable |
