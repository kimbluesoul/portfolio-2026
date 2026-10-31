# Page spec sheets

Adopted by the Product Owner on 2026-10-31 (improvement options 2 and 3).

## Why
In M2, most review findings were copy or layout that did not match Figma. ChatGPT cannot reliably read Figma or export images from it. Claude can, so Claude now transcribes each page **before** implementation, and every PR shows Figma and the built page side by side.

## Spec sheet (option 2)
Before ChatGPT starts a page, Claude writes `docs/specs/<slug>.md` (home and resume use `home.md` / `resume.md`). It contains, section by section in render order (ARCHITECTURE §5.2):

1. **Copy**: every visible string, verbatim, with its Figma node ID, plus the 390 hero title size (`hero.titleSizeMobile`, ARCHITECTURE §10 v1.8). This includes the **next project's** Next-section meta and one-liner that appear in this page's frame, which go into the next project's `next` fields. Accent words are already marked `**…**` (§5.1 v1.4). Hard line breaks that exist in Figma are marked explicitly.
2. **Links**: exact URLs and labels.
3. **Media slots**: export shape, `expectedFile`, slot aspect ratio, desktop and 390 node IDs, and alt text. These rows are also added to [`docs/ASSETS.md`](../ASSETS.md).
4. **Layout notes**: anything the 390 frame does differently (swipe rows, reflowed visuals, omitted items).
5. **Figma reference images**: `docs/specs/<slug>/figma-<section>-desktop.jpg` and `-mobile.jpg`, exported by Claude at 1× (JPG, so the repo stays small).

Rules:
- Figma stays the source of truth. If the sheet and Figma disagree, Figma wins: raise it in the PR, and Claude fixes the sheet.
- ChatGPT copies strings from the sheet. It does not retype them from Figma.
- Values that exist in neither Figma nor the sheet are `TODO(CONTENT)`, as before.

## Side-by-side check (option 3)
Every UI PR fills the **Figma vs page** table in the PR template:
- For each section, the Figma reference image next to a screenshot of the branch preview at the **same width** (1920 and 390).
- Page screenshots are captured from the build (`pnpm preview`), saved as JPG under `docs/screenshots/<slug>/`, and committed on the PR branch. Each new iteration overwrites the same names.
- The implementer lists every visible difference under "Deviations from Figma". An unlisted difference found in review is at least P2.

Claude still checks the preview against Figma during review. The table is the implementer's self-check.
