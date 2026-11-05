# Design System

## Ownership
Product Owner + ChatGPT Implementation Engineer.

ChatGPT may transcribe values from Figma into this document only with a source citation (e.g. `Source: Figma 465:670`), flagged in the PR for Product Owner confirmation. It does not author new design rules.

This document records approved design decisions. It does **not** define engineering architecture.

## Current status
M1 home tokens transcribed from the approved Figma frames on 2026-10-30. Case-page type, hover states, scroll reveals and the site header were added through M2–M3 and are live on staging (2026-11-05).

## Figma source

- Desktop home: `360:3` (1920 px frame)
- Mobile home: `474:1057` (390 px frame)
- Interactive components and hover states: `465:662`

Child-node citations are included beside each measured value. Values are direct Dev Mode measurements, not visual estimates.

## Typography

| Use | Desktop | Mobile | Family / weight | Source |
|---|---:|---:|---|---|
| Home English display | 64 / 83 px | 26 / 31.2 px | Instrument Sans 600 | `360:7`, `474:1071` |
| Home Chinese display | 64 / 83 px | 30 / 39.6 px | Noto Sans TC 700 | `360:8`, `474:1072` |
| Home introduction | 18 / 23 px | 15 / 24.75 px | Noto Sans TC 400 | `360:9`, `474:1073` |
| Section cue | 14 / 18 px | 12 / 15 px | Instrument Sans 700 / 500 | `360:25`, `474:1258` |
| About display | 52 / 68 px | 30 / 39.6 px | Noto Sans TC 700 | `451:667`, `474:1259` |
| About body | 20 / 36 px | 15 / 26.25 px | Noto Sans TC 400 | `451:670`, `474:1261` |
| Project card title | 30 / 39 px | 22 / 30 px | Instrument Sans 700 + Noto Sans TC 700 | `465:1040`, `474:1130` |
| Project card summary | 20 / 26 px | 15 / 24.75 px | Noto Sans TC 400, text-primary | `465:1043`, `474:1133` |
| Tag chip | 13 / 17 px | 12 / 17 px | Noto Sans TC 400 (years: Instrument Sans 500) | `465:1045`, `474:1135` |
| About tool / skill chip | 14 / 20 px | 14 / 20 px | Noto Sans TC 400 | `451:675`, `474:1267` |
| Nav item | 16 / 18 px | 12.8 / 14.4 px | Instrument Sans 500 | `466:895`, `473:918` |
| Footer title | 64 px | 38 / 1.1 | Instrument Sans 700 | `212:209`, `473:923` |

Format is `font-size / line-height`. The About and section labels use `0.12em` letter spacing (`451:666`, `474:1258`).

### Case-study component type

The component roles below use dedicated tokens instead of the general case subheading scale.

| Use | Desktop | Mobile | Family / weight | Source |
|---|---:|---:|---|---|
| Close-up and mobile-panel caption title | 20 px | 16 px | Noto Sans TC 700 | `360:312`, `360:329`, `475:953` |
| Close-up and mobile-panel caption body | 16 px | 14 px | Noto Sans TC 400 | `360:312`, `360:329`, `475:953` |
| Motion step title | 28 px | 18 px | Noto Sans TC 700 | `360:361`, `475:953` |
| Motion step body | 17 px | 14 px | Noto Sans TC 400 | `360:361`, `475:953` |
| Details eyebrow | 13 px | 12 px | Instrument Sans 700 | `360:376`, `475:953` |
| Details title | 24 px | 16 px | Noto Sans TC 700 | `360:376`, `475:953` |
| Details body | 15 px | 14 px | Noto Sans TC 400 | `360:376`, `475:953` |

Desktop close-up and mobile-panel captions begin 20 px after their media. Desktop Details cards use 32 px padding, a 12 px minimum text-to-media gap, and vertically center media in the remaining card space; equal cards in a row stretch to the same height (`360:312`, `360:329`, `360:376`).

### Instrument Sans arrows

Instrument Sans arrows are self-hosted as an OFL-licensed two-glyph WOFF2 subset from the `google/fonts` Instrument Sans original. The face is limited to `U+2192` and `U+2197`: external-link `↗` uses 40 px / 500 and the desktop Next `→` uses 72 px / 700. The 390 px Next arrow keeps its responsive size (`360:251`, `475:953`).

**Noto Sans TC weight usage (implementation constraint, ADR-0012, amended 2026-11-02):** every Chinese glyph is drawn with Noto Sans TC, including text set in the display stack (`--font-family-display` is Instrument Sans for Latin, then Noto Sans TC). Chinese uses only 400 or 700:

| Weight | Where Chinese renders at it | Selectors (`WEIGHT_SELECTORS` in `scripts/font-text.mjs`) |
|---|---|---|
| 700 (and 600) | Headings, hero headline, stats values, story titles, caption / step / link titles, pending-media label, link-card eyebrow (`H5／APP PROTOTYPE`), case hero eyebrow and next-project arrow | `h1`–`h6`, `strong`, `b`, `th` (UA-default bold), `.hero-headline`, `.hero-stats dd`, `.story-title`, `.case-study strong`, `.pending-label`, `.link-eyebrow` (600), `.case-hero .case-eyebrow`, `.next-arrow` |
| 400 | Everything else | all rendered text |

Fonts are subset per weight to the text inside those selectors. Any CSS rule that sets another weight must be either listed there or in `LATIN_ONLY_WEIGHT_SELECTORS` (Latin-only labels such as `OVERVIEW`); the build fails otherwise. Only 400 / 700 Noto Sans TC faces exist, so a 600 rule (Figma SemiBold) is drawn with the 700 face and is checked against the 700 list. The coverage gate rejects 500 unless its selector is explicitly Latin-only. A Chromium E2E test fails if any text node on the main routes is drawn with a system font.

**Which face draws Latin text (recorded 2026-11-05, measured with CDP `CSS.getPlatformFontsForNode` on staging; Figma was updated to match in session 3, 24 ranges):**

| Stack | Elements | Latin drawn in |
|---|---|---|
| Display (`--font-family-display`) | `h1`–`h3` including section `h2`, eyebrows, labels, `.tag-latin` (Home card years and "Motion" tags), nav, footer display text | **Instrument Sans** |
| Body (`--font-family-body`) | hero headline, outputs, captions, step titles, link titles, About tools / skills chips, body copy | **Noto Sans TC** |
| Any | `←` `→` `↗` | Noto Sans TC, except `→` `↗` in `.link-arrow` and the desktop Next arrow, which use the Instrument Sans arrows face above |

A Latin word inside a body-stack element stays in Noto Sans TC; do not wrap it to switch faces. Figma follows the same rule: case hero eyebrows "CASE STUDY 0X · " are Instrument Sans Medium, Latin words in `Heading` layers (DURO, SSS, Logo) are Instrument Sans Bold.

## Spacing

Reusable spacing tokens are a 4 px base sequence: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 72, 96, and 140 px.

| Area | Desktop | Mobile | Source |
|---|---|---|---|
| Navigation padding | 20 px vertical / 96 px horizontal | 12 px vertical / 20 px horizontal | `360:3438`, `474:1058` |
| Hero stack gap | 26 px | 28 px | `360:5`, `474:1069` |
| Hero section padding | measured through 96 px page gutter | 36 px top / 20 px sides / 48 px bottom | `360:3`, `474:1069` |
| Credentials divider offset | 28 px top | included in 28 px Hero stack | `360:10`, `474:1075` |
| Work heading padding | 40 px vertical | 8 px top at section start | `360:26`, `474:1085` |
| Featured card content gap | 30 px | 16 px | `465:999`, `474:1086` |
| Project grid gap | 40 px horizontal and vertical | 48 px vertical | `360:84`, `474:1085` |
| About section | 140 px vertical / 96 px horizontal; 72 px stack gap | 72 px vertical / 20 px horizontal | `451:662`, `474:1256` |
| Footer | desktop uses 96 px page gutter | 56 px top / 20 px sides / 32 px bottom; 32 px gap | `360:220`, `474:1287` |

## Grid and layout widths

| Token / use | Value | Source |
|---|---:|---|
| Desktop frame | 1920 px | `360:3` |
| Home content maximum | 1728 px | `360:5`, `360:26`, `465:999` |
| Desktop page gutter | 96 px | `360:3438`, `451:662` |
| Secondary grid column | 844 px | `465:1080`, `465:1149` |
| Secondary grid gutter | 40 px | derived from 1728 − 844 × 2; confirmed by `360:84` |
| Mobile frame | 390 px | `474:1057` |
| Mobile content width | 350 px | `474:1058`, `474:1069`, `474:1085` |
| Mobile page gutter | 20 px | same nodes above |

The implementation is mobile-first. The two-column work grid switches at 768 px, matching ARCHITECTURE §10; 768–1439 px uses the same two-column relationship with fluid gutters. The exact reference points remain 390 px and 1920 px.

## Card geometry and media

- Featured desktop card: 1728 × 667 px with a 1728 × 558 px media region and 30 px content gap (`465:999`, child `521:617`).
- Secondary desktop cards: 844 × 575 px (`465:1080`, `465:1149`).
- Mobile featured card: 350 × 384 px; secondary card heights vary with content, e.g. 350 × 338 and 350 × 313 px (`474:1086`, `474:1122`, `474:1145`).
- Card media stays clipped while the media layer scales to 1.02 on hover. The whole card lifts 4 px; the entire card is one link (`465:662`).

## Site header

Product Owner decisions 2026-11-04 / 11-05 (PR #69, #70). Implemented in `SiteHeader.astro` + `src/elements/header-tone.ts`.

| State | Header background | Logo | Nav pill |
|---|---|---|---|
| At the top of the page | transparent | brand blue | white (`--color-bg-surface`), always |
| Scrolled (a top sentinel has left the viewport) | 85 % `--color-bg-canvas` + `backdrop-filter: blur(12px)` | as below | white |
| Scrolled, logo over a dark section | 85 % `--color-bg-inverse` + blur 12 px | white (`--color-text-on-inverse`) | white |

- The logo is an inline SVG drawn with `currentColor`. It turns white while the horizontal line through its centre is over a `.case-section.tone-inverse` or the `.site-footer` (IntersectionObserver with a one-line root margin), and back to brand blue elsewhere. The scrolled background follows the same tone.
- Colour and background changes use `250ms ease-out` (`--motion-duration-hover`, `--motion-ease-hover`).
- The header is `position: sticky`. Nav sizes and hover states: see Typography (Nav item) and Motion (Hover / focus-visible).

## Breakpoints
| Token | Value | Use |
|---|---:|---|
| `--bp-md` | 768 px | two-column work grid and wider navigation |
| `--bp-lg` | 1024 px | About two-column composition |
| `--bp-xl` | 1440 px | desktop-scale spacing approaches the 1920 reference |

## Visual direction
- Work-first composition
- Large, confident project imagery
- Minimal explanatory copy
- Strong typography and spacing
- High-quality interaction and motion
- Editorial / showcase feeling rather than a dashboard or conventional UX case-study template

## Interaction principles
- Motion should support hierarchy and discovery.
- Interaction may feel exploratory, but the primary navigation and project access must remain clear.
- Desktop can use richer interaction.
- Mobile must remain complete and usable rather than becoming a reduced afterthought.
- Motion must not compromise performance or accessibility.

## Motion
_Decided by Claude (Architect) on Product Owner delegation, 2026-10-29. The Product Owner may revise these on any preview deploy._

Tokens:

| Token | Value | Use |
|---|---|---|
| `--motion-duration-fast` | 160ms | Press feedback and focus ring |
| `--motion-duration-hover` | 250ms | Case-page and global navigation hover / focus-visible states |
| `--motion-duration-base` | 280ms | Card lift, arrow nudge, tab / step switch, video crossfade |
| `--motion-duration-slow` | 640ms | Section entrance reveal |
| `--motion-duration-signature` | 900ms | Hero showcase and Visual Extension entrance only |
| `--motion-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Hover, state changes |
| `--motion-ease-hover` | `ease-out` | Figma hover / focus-visible variants |
| `--motion-ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances (fast start, long soft settle) |
| `--motion-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |
| `--motion-distance-reveal` | 24px desktop, **16px below 48rem** (PO 2026-11-04) | Reveal translateY |
| `--motion-stagger` | 80ms | Between siblings in a reveal group, max 4 steps (320ms) |

Behavior rules:
- **Scroll reveal: fade + rise + stagger** (PO 2026-11-04). Elements reveal **once** when they enter view, with opacity 0 → 1 and translateY `--motion-distance-reveal` → 0 (`slow`, `emphasized`). They do not re-animate on scroll back.
- **Reveal groups.** Each case section after the hero reveals as groups, not as one block:
  - the **section intro** (eyebrow, heading, subtitle) is one group;
  - each **content group** is one group: Overview blocks, Key Screens main media and the close-up row, Mobile panels, the Motion stage and its step list, Details cards / compare items, Link cards, the Next Project card.
  - Inside a group, items start `--motion-stagger` (80ms) apart, **at most 4 steps** (items after the 4th start with the 4th).
  - Body paragraphs, captions and labels never reveal on their own; they move with their item.
- **Hero: no entrance motion** (PO 2026-11-04). Neither the case hero (text, stats, showcase) nor the Home hero animates in. The hero showcase is the phone LCP element, and a fade would delay LCP (88Win gate ≤ 2500 ms).
- **One signature moment per case page: the Visual Extension mosaic**, opacity + scale 0.96 → 1 (`signature`, `emphasized`). Nothing else gets more than the standard reveal.
- **Home:** the project cards after the featured card and the About section use the same reveal; the project grid staggers per row.
- Reveals never delay content behaviour: videos start and Motion steps auto-advance on their own rules (ADR-0013), even mid-reveal.
- **Hover / focus-visible**: all states below use `250ms ease-out` and apply identically to pointer hover and keyboard focus (`465:662`, case-page frame `360:251`). The case Hero “← 所有作品” pill changes to `#111` with white text. Link cards change background and border from `#222` to `#1F3BD6`, description text from `#B3B3B3` to `#DBE3FF`, and move ↗ 8px right and 8px up. The Next arrow circle changes from `#1F3BD6` to `#111` and moves → 14px right. The lower “← 所有作品” link changes from `#5C5C5C` to `#1F3BD6` and gains an underline. Footer “BACK TO TOP” and “VIEW RESUME” change to `#9AA8FF` and gain an underline; Email / LinkedIn pills change to a white background with `#111` text and icons. Navigation items use a `#E6E6E6` background. Reduced motion removes only the arrow displacement while preserving every color and underline state.
- **Interaction & Motion steps**: switching steps crossfades the video (`base`). The step indicator moves with `base` / `standard`. **Auto-advance once (PO 2026-11-02)**: when half the section is in view, the steps play once in order (01 → 02 → 03; JHANYU and HUIFA have two steps) and stop on the last frame of the last step. Selecting a step plays it once and ends auto-advance. Reduced motion or Save-Data disables automatic playback (ADR-0013).
- **Page transitions**: a cross-document fade (`base`) where the browser supports it. Otherwise, a normal navigation.
- **Reduced motion**: every duration above becomes ~0, and reveals are skipped. Hover color changes stay.

## Required token groups
To be defined from Figma:
- Typography
- Color
- Spacing
- Grid
- Radius
- Breakpoints
- Motion duration / easing (defined above)
- Layering / z-index
- Image ratios

## Component governance
Implementation must follow approved Figma behavior.

If implementation exposes a missing design decision:
1. Do not invent a permanent design rule silently.
2. Flag the decision.
3. Product Owner decides the visual / UX direction.
4. Update this document when the decision becomes reusable.
