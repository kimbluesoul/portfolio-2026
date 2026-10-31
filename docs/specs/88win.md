# 88Win spec sheet

Figma: desktop `360:251`, mobile 390 `475:953`.

88Win was implemented (PR #14) before spec sheets existed. Its copy was checked node by node in the PR #14 reviews, so this sheet only has the reference images and media slots. Spec sheets for M3 projects follow the full format in [README.md](README.md).

## Template values (v1.8)
- `hero.titleSizeMobile`: `76` (`475:973`, the 390 title fits one line).

## Figma reference images
1× exports by Claude, 2026-10-31. Use these for the "Figma vs page" table.

| # | Section | Desktop node | Mobile node | Desktop image | Mobile image |
|---|---|---|---|---|---|
| 01 | Hero | `360:252` | `475:965` | [desktop](88win/figma-01-hero-desktop.jpg) | [mobile](88win/figma-01-hero-mobile.jpg) |
| 02 | Overview | `360:279` | `475:1003` | [desktop](88win/figma-02-overview-desktop.jpg) | [mobile](88win/figma-02-overview-mobile.jpg) |
| 03 | Key Screens | `360:312` | `475:1037` | [desktop](88win/figma-03-key-screens-desktop.jpg) | [mobile](88win/figma-03-key-screens-mobile.jpg) |
| 04 | Mobile / RWD | `360:329` | `475:1065` | [desktop](88win/figma-04-mobile-desktop.jpg) | [mobile](88win/figma-04-mobile-mobile.jpg) |
| 05 | Interaction & Motion | `360:361` | `476:964` | [desktop](88win/figma-05-motion-desktop.jpg) | [mobile](88win/figma-05-motion-mobile.jpg) |
| 06 | Details | `360:376` | `476:990` | [desktop](88win/figma-06-details-desktop.jpg) | [mobile](88win/figma-06-details-mobile.jpg) |
| 07 | Visual Extension | `360:1296` | `476:1865` | [desktop](88win/figma-07-visual-extension-desktop.jpg) | [mobile](88win/figma-07-visual-extension-mobile.jpg) |
| 08 | Links | `360:1345` | `476:1899` | [desktop](88win/figma-08-links-desktop.jpg) | [mobile](88win/figma-08-links-mobile.jpg) |
| 09 | Next Project | `360:1590` | `476:1925` | [desktop](88win/figma-09-next-desktop.jpg) | [mobile](88win/figma-09-next-mobile.jpg) |

## Media slots
See [`docs/ASSETS.md` → 88Win](../ASSETS.md#88win88win) for every file name, Figma node, export shape, and pixel size. Content `expectedFile` values must match it.

Slot aspect ratios used in content (ARCHITECTURE §9.1 v1.5):

| Slot | Aspect ratio |
|---|---|
| Hero showcase (composite, one item) | 1920 / 820 visible from a 1920 × 920 export, `object-position: top` |
| Key main video | 16 / 9 |
| Close-ups | 458.67 / 300 |
| Mobile panels | 459 / 690 (App panel 458 / 690) |
| Motion step videos | 960 / 532 |
| Details visuals | desktop / mobile visual area, e.g. Color 647 / 140 and 310 / 280 (see ASSETS.md) |
| Visual Extension mosaic (composite, one item) | 1920 / 1280 |
