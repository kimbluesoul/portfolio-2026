# ADR-0005: Typed content collections and a code-enforced case template

- Status: Proposed
- Date: 2026-10-29
- Decider: Claude (Architect)

## Context
All 7 case studies use the Figma 「V9 案例頁模板」 (`360:2669`), which defines:
- 9 sections in a fixed order: Hero, Overview, 主要畫面, Mobile/RWD, Interaction & Motion, Details, Visual Extension, Links, Next project;
- required vs optional sections; optional sections are removed entirely when assets are missing;
- count-based fallbacks (e.g. fewer than 3 close-ups → 2 columns);
- background alternation of light sections recomputed after removals; dark background only on Interaction & Motion and Links;
- "Next project" from the last project wraps to the first.

Hand-building 7 pages would let these rules drift. Copy must be editable without touching layout code.

## Decision
- One YAML file per project in `src/content/projects/`, validated by a **Zod schema** in `src/content.config.ts`. The schema encodes required sections, optional sections, item-count limits, and required `alt` / `poster`. **Invalid content fails the build.**
- One dynamic route `src/pages/work/[slug].astro` renders every project through `CaseSections.astro`. That renderer owns order, omission, and tone (`src/lib/sections.ts`, unit-tested). Content files cannot reorder or restyle sections.
- Section components derive layout fallbacks from item counts, not from extra flags.
- Next project is derived from `order` (`src/lib/projects.ts`), never written by hand.
- Global copy (nav, home hero, About, contact, footer) lives in `src/content/site.yaml`. Resume content lives in `src/content/resume.yaml`.
- Content files become the **source of truth for copy** after transcription from Figma. Later copy edits happen in the repo, then Figma if the Product Owner wants them in sync.

## Consequences
- Adding or editing a project is a content-only change (M3 needs no new components).
- A template change, such as a new section type, is a deliberate code change reviewed by the Architect.
- A per-project layout exception that the template cannot express needs a Product Owner decision first, then a schema extension. No one-off page files.

## Alternatives considered
- **MDX per project**: flexible, but lets layout and copy mix and makes the template rules unenforceable.
- **Headless CMS**: unnecessary operational cost for a single editor.
- **JSON instead of YAML**: workable. YAML is chosen because Chinese prose is easier to read and edit without escaping.
