# Product Brief

## Product
Personal UI / Interaction Design Portfolio.

## Product owner
The user is the Product Owner and UI Designer. Product, UX, content, and visual decisions ultimately belong to the user.

## Goal
Present the user's work through the work itself rather than through long explanatory case-study text.

The portfolio should communicate:
- UI design quality
- interaction and motion design
- visual systems
- shipped / implemented product experience
- ability to collaborate with engineering

## Core principle
**Show more, explain less.**

The interface should prioritize large visual presentation, interaction, motion, and selected project details. Text should explain responsibility, context, and a few important decisions only when it adds value.

## Project set
_Updated 2026-10-29 by Product Owner decision: 7 projects, in this order._

| # | Project | Live site |
|---|---|---|
| 01 | 88Win 線上娛樂城 | — (prototype links only) |
| 02 | 華豐輪胎 Hwa Fong Tire | duro.com.tw |
| 03 | FITZONE 健身房 | fitzone.com.tw |
| 04 | SSS 超透明提案 | baopu.com.tw/exhibition/SSS1.0 |
| 05 | 展裕建設 JHANYU | jhanyu.com (+ design demo) |
| 06 | AMD 康健生醫 | amdintl.com.tw |
| 07 | 匯發營造 HUIFA | huifa.com.tw |

Figma Portfolio-2026, page 「Portfolio｜整理版」, is the visual source of truth for all of them (desktop 1920 + mobile 390).

## Site scope
- **Home**: Navigation (Work / About / Contact), Hero, Selected Work (01 featured + 02–07 grid), About (with "View Resume"), Footer (Contact, "VIEW RESUME").
- **Case study pages** for all 7 projects, built from the V9 case template. The page ends with "← 所有作品｜NEXT PROJECT 0X / 07", and 07 links back to 01. Link cards are whole-card clickable and open in a new tab.
- **Web resume page** (responsive) with a "Download PDF" button. Content and layout follow `Syuan-Ci-Resume.pdf`.
- Desktop and mobile are both in scope.

## Delivery order
1. Home / Project Index (validates the visual system and the collaboration workflow)
2. Case study template + 88Win
3. Remaining 6 case studies
4. Resume page
5. Launch

The milestone mapping is in `docs/ARCHITECTURE.md` §19.

## Non-goals
- Traditional text-heavy UX case studies
- Generic template portfolio styling
- Architecture decisions made implicitly during UI implementation
- Excessive effects that reduce readability or performance

## Success criteria
A visitor should understand within seconds that this is a UI / interaction-focused portfolio and should be drawn into the work visually before needing to read detailed explanations.
