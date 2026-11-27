# Devlog

> One short entry per working day, newest first. What happened and why; state lives in [`HANDOFF.md`](HANDOFF.md), details in the PRs.

## 2026-11-28
**Today**: no product work. Started this devlog and reviewed the last three weeks; PR #118 records #115–#117 in HANDOFF.

**Review, 2026-11-08 → 2026-11-28** (18 PRs merged, all live on production):
- **Case copy pass done** (11-08 → 11-09): new copy for all seven case studies, 88Win #100, Hwa Fong #104, FITZONE #105, SSS #107 (+ entry video #106), AMD #108, HUIFA #109, JHANYU #110; closed in #111. HUIFA and JHANYU Motion now show two steps in Figma and on the site.
- **Phone speed kept under the gate** (11-08): the 88Win copy pushed phone LCP to 2488 ms; #101 loads the non-hero Chinese fonts after the page loads, back to about 2337 ms (gate 2500). ARCHITECTURE v1.20 (#102), cleanup #103.
- **Home opening motion** (11-10 → 11-12): prototyped first, then spec #112, built in #113 (the 「瞬間」 loop and the featured-card reveal; the "SELECTED WORK ↓" cue removed), recorded in #114 / ARCHITECTURE v1.22.
- **Small fixes** (11-17 → 11-18): JHANYU Demo card copy explains the demo may no longer open (#115); its 390 link cards keep their natural height (#116); new home / resume / 404 share card v2 (#117).
- **11-19 → 11-27**: no changes. The site is stable; no milestone open, no pending media, no blockers.

**Where it stands**: M1–M5 done; the site is complete and live. What is left is the optional P3 backlog in HANDOFF (code tidiness, no visible change).
