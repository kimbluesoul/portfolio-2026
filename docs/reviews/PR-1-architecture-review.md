# PR #1 — Architect review: collaboration scaffold + architecture kickoff

- Reviewer: Claude (Architect)
- Date: 2026-10-29
- Scope: `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/PRODUCT.md`, `docs/DESIGN_SYSTEM.md`, `docs/HANDOFF.md`, plus a cross-check against Figma `Portfolio-2026` page `360:2`
- Verdict: **Scaffold is sound. Approve with changes.** Two P1 process gaps (A1, A2) must be resolved by the Product Owner before M1 starts. M0 (bootstrap) can start once architecture v1 is approved.

## Part A — Multi-agent collaboration scaffold

What works well:
- Clear separation of Product Owner / Architect / Implementer, with an explicit "do not silently change architecture" rule.
- A structured Architecture Issue format and P0–P3 review severities. Both are directly usable.
- "Product Owner decides merge" keeps final authority with the user.

### A1 — P1 — Figma access and asset export have no owner
- **Where**: `AGENTS.md`, `docs/HANDOFF.md`
- **Problem**: Implementation needs exact values from Figma (spacing, type styles, hover states) and needs exported images and videos. Neither document says how ChatGPT reads Figma or who exports assets.
- **Why it matters**: If the implementer can't read Figma, it will approximate from screenshots. That breaks fidelity, the top non-functional priority. Missing assets block M1–M3.
- **Recommended direction (Product Owner decides)**:
  1. The implementer has Figma read access (Dev Mode / Figma MCP), **or**
  2. The Product Owner exports assets to an agreed folder using the naming spec in ARCHITECTURE §9, and provides node links per PR.

  In both cases, videos are delivered by the Product Owner, since they are produced outside Figma.

### A2 — P1 — PRODUCT.md is out of date with the approved Figma direction
- **Where**: `docs/PRODUCT.md` "Initial project set" and "Initial implementation scope"
- **Problem**: PRODUCT.md lists 4 projects with order TBD. It also says "do not implement full case studies" and doesn't mention the About section, the resume page, or "Contact" navigation. Figma and the brief have 7 projects in a fixed order (88Win → 華豐 → FITZONE → SSS → 展裕 → AMD → 匯發), 7 designed case pages, an About section, a web resume, and Work / About / Contact navigation.
- **Why it matters**: `AGENTS.md` tells the implementer to follow PRODUCT.md first. Read literally, it would build the wrong project set.
- **Recommended direction**: The Product Owner updates PRODUCT.md (scope, project list and order, About, resume, navigation), or confirms which source wins. The architecture already supports the full scope. Phasing stays a product decision (see Q1).

### A3 — P2 — DESIGN_SYSTEM ownership invites the implementer to author design rules
- **Where**: `docs/DESIGN_SYSTEM.md` "Ownership: Product Owner + ChatGPT"
- **Problem**: Shared ownership conflicts with the governance rule "do not invent a permanent design rule silently".
- **Recommended direction**: The Product Owner owns the document. ChatGPT may **transcribe** values from Figma with a source citation (`Source: Figma 465:670`) and flag them in the PR for Product Owner confirmation.

### A4 — P2 — Design tokens are not recorded yet
- **Where**: `docs/DESIGN_SYSTEM.md` "Required token groups"
- **Problem**: Colors exist as Figma variables, and the brief states fonts and colors. Typography scale, spacing, radius, breakpoints, and motion are not recorded, and only colors are Figma variables.
- **Why it matters**: M0 can map colors (ARCHITECTURE Appendix A). M1 needs the type scale and spacing.
- **Recommended direction**: Before M1 is accepted, record the color tokens (from variables), the type scale (from Figma text styles), the spacing/layout widths, and provisional motion tokens.

### A5 — P2 — One GitHub identity for all agents
- **Problem**: Every agent pushes and comments as `kimbluesoul`. GitHub "Approve" on your own PR is impossible, and commit authorship doesn't show which agent did the work.
- **Resolution in this PR**: The PR template has an "Agent" field. Review verdicts are PR comments starting with `Architect review: APPROVED | CHANGES REQUESTED` (ARCHITECTURE §16.4).

### A6 — P2 — The handoff has no fixed structure
- **Problem**: `HANDOFF.md` describes phases but not blockers, open questions, the last verified state, or who acts next. Agents start each session with no memory, so this file is their only context.
- **Resolution in this PR**: `HANDOFF.md` is restructured with Status / Next owner / Blockers / Open questions / Next actions sections.

### A7 — P3 — Reading lists are incomplete
- `AGENTS.md` rule 1 omitted `ADR/`. **Fixed in this PR.**
- `CLAUDE.md` doesn't ask Claude to read `AGENTS.md`, which a reviewer needs in order to review against the implementer rules. Suggest adding it. Left unchanged because CLAUDE.md is the Product Owner's instruction file.

### A8 — P3 — "Architecture approved" isn't defined
- **Recommended direction**: The Product Owner approves architecture v1 by merging PR #1, or by commenting "Architecture v1 approved". After that, the ADRs change from Proposed to Accepted.

## Part B — Product / design issues that block or shape architecture
Raised for the **Product Owner**. None of these were changed. They are mirrored as Q1–Q10 in ARCHITECTURE §17.

| # | Severity | Issue | Recommended direction |
|---|---|---|---|
| Q1 | Blocks M2+ | Scope mismatch (see A2). | Confirm the 7-project scope, the fixed order, and the milestone phasing in ARCHITECTURE §19. |
| Q2 | **Blocks M1 acceptance** | **No mobile frames exist.** Every Figma frame is 1920 desktop, but "電腦版與手機版都要做". Mobile layout is a UI decision. | Provide 390-wide frames for Home, the case template (all 9 sections), nav, footer, and resume. Alternatively, authorize "implementer proposes mobile adaptation following documented rules → PO approves on the preview deploy". |
| Q3 | Blocks M4 | The resume page has no design, and `Syuan-Ci-Resume.pdf` is not in the repo yet. (The two `Resume cover / 104` frames are 104-platform covers, not a web resume.) | Provide a design (or approve a simple text layout built from existing tokens) and the PDF. |
| Q4 | Shapes M1–M2 | No motion spec (durations, easings, reveal style). Unknown whether Interaction & Motion steps auto-advance when a video ends. | Approve the provisional tokens or define them. Decide whether steps auto-advance. |
| Q5 | Blocks AMD launch | AMD 「Step=維護」 video is empty. | Choose: hide the step until the video exists, show it disabled with the poster, or hold the launch. |
| Q6 | Accessibility gate | Looping videos longer than 5 s need a pause mechanism (WCAG 2.2.2). Figma has no pause UI. | Design a small pause/play toggle, or switch to click-to-play. |
| Q7 | Launch | Domain and Cloudflare account. | Product Owner creates them. |
| Q8 | Launch | Analytics. | None (default) or cookieless Cloudflare Web Analytics. |
| Q9 | Routing | Locale: zh-Hant only? | Confirm. An English version later would add `/en/` routes via a new ADR. |
| Q10 | Content accuracy | Figma inconsistencies: (a) the template table marks Hwa Fong 「只放原型／未上線」 but the brief lists `duro.com.tw`; (b) the template table's project order (FITZONE 02) differs from the site order (華豐 02); (c) the template text says dark sections are 「深藍」 but they use `#141414`; (d) AMD has two Interaction & Motion frames (`360:2355`, `437:652`); (e) home grid layers 05–07 are named `Project 04 / SSS 1.0`. | Confirm (a), (b), (d). (c) and (e) are cosmetic; rename when convenient. |

Additional constraints the Product Owner should know (no action required):
- **Brand blue on dark backgrounds fails contrast** (`#1F3BD6` on `#141414` ≈ 2.3:1). The architecture forbids blue *text* in dark sections. Blue fills with white content are fine.
- The **展裕 Demo link is `http://`**. It works as an outbound link, but browsers may show "Not secure" on arrival. Use an `https` URL if one exists.
- Figma color variable naming is mixed (`color-bg-canvas` vs `bg/inverse`). The code normalizes everything to `--color-*`. Renaming in Figma is optional.
