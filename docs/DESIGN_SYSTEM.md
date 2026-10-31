# Design System

## Ownership
Product Owner + ChatGPT Implementation Engineer.

ChatGPT may transcribe values from Figma into this document only with a source citation (e.g. `Source: Figma 465:670`), flagged in the PR for Product Owner confirmation. It does not author new design rules.

This document records approved design decisions. It does **not** define engineering architecture.

## Current status
M1 home tokens transcribed from the approved Figma frames on 2026-10-30. Values below are flagged for Product Owner confirmation in the M1 PR.

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
| Tag chip | 13 / 17 px | 12 / 17 px | Noto Sans TC 500 (years: Instrument Sans 500) | `465:1045`, `474:1135` |
| About tool / skill chip | 14 / 20 px | 14 / 20 px | Noto Sans TC 500 | `451:675`, `474:1267` |
| Nav item | 16 / 18 px | 12.8 / 14.4 px | Instrument Sans 500 | `466:895`, `473:918` |
| Footer title | 64 px | 38 / 1.1 | Instrument Sans 700 | `212:209`, `473:923` |

Format is `font-size / line-height`. The About and section labels use `0.12em` letter spacing (`451:666`, `474:1258`).

**Noto Sans TC weight usage (implementation constraint, ADR-0012):** 700 only in headings (`h1`–`h3`), 500 only in tag chips (`li`), 400 everywhere else. Fonts are subset per weight to exactly those elements. A new Chinese use of 500 or 700 outside these elements must be added to `scripts/font-text.mjs`, or the glyphs fall back to the system font.

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
| `--motion-duration-fast` | 160ms | Hover / press color and border changes, focus ring |
| `--motion-duration-base` | 280ms | Card lift, arrow nudge, tab / step switch, video crossfade |
| `--motion-duration-slow` | 640ms | Section entrance reveal |
| `--motion-duration-signature` | 900ms | Hero showcase and Visual Extension entrance only |
| `--motion-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Hover, state changes |
| `--motion-ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances (fast start, long soft settle) |
| `--motion-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |
| `--motion-distance-reveal` | 24px | Reveal translateY |
| `--motion-stagger` | 80ms | Between siblings in a reveal group, max 4 steps (320ms) |

Behavior rules:
- **Quiet by default.** Sections reveal once with opacity 0 → 1 and translateY 24px → 0 (`slow`, `emphasized`). They do not re-animate on scroll back.
- **Two signature moments per case page** (Hero showcase, Visual Extension): opacity + scale 0.96 → 1 (`signature`, `emphasized`). Nothing else gets more than the quiet reveal.
- **Hover**: project cards lift by translateY -4px, and the media scales 1.02 inside its clipped frame (`base`, `standard`). Buttons and links change color only (`fast`). Use the exact hover colors and states in Figma `465:662`.
- **Interaction & Motion steps**: switching steps crossfades the video (`base`). The step indicator moves with `base` / `standard`. **No auto-advance**: the selected video plays once (on entering view or on selection) and stays on its last frame until the user picks another step (ADR-0013).
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
