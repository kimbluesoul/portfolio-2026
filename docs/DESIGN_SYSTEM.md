# Design System

## Ownership
Product Owner + ChatGPT Implementation Engineer.

ChatGPT may transcribe values from Figma into this document only with a source citation (e.g. `Source: Figma 465:670`), flagged in the PR for Product Owner confirmation. It does not author new design rules.

This document records approved design decisions. It does **not** define engineering architecture.

## Current status
Foundation only. Detailed tokens and component specifications should be added from the approved Figma direction before implementation.

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
- **Interaction & Motion steps**: switching steps crossfades the video (`base`). The step indicator moves with `base` / `standard`. **No auto-advance**: the selected video loops until the user picks another step.
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
