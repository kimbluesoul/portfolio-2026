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

## Details CARD: the note is text (PO, 2026-11-06)
The line 「等比例的遊戲圖面適應各裝置，不用額外重新作圖。」 (Figma `360:1050` / `476:1517`) belongs to the square game-card images. It was baked into `detail-card.png`, so on 390 it shrank with the desktop image. It becomes real text between two images, as in Figma.

Images (in `src/assets/projects/88win/`, all 2×, transparent PNG, delivered in this change):

| File | Content | Size (2×) | CSS size | Source |
|---|---|---|---|---|
| `detail-card-lead.png` | desktop square cards (`650:1560`) | 780 × 426 | 390 × 213 | crop (0, 22) of `detail-card.png` |
| `detail-card-rest.png` | desktop vendor and list cards | 1784 × 600 | 892 × 300 | crop (860, 0) of `detail-card.png` |
| `detail-card-lead-mobile.png` | 390 `Square` (`476:1490`) | 620 × 358 | 310 × 179 | composed from the PO's 2× layer exports at the `476:1489` positions (mean abs diff vs the Figma 1× render: 8.8 / 4.1) |
| `detail-card-rest-mobile.png` | 390 `28`, `1`, `Vendor` with their 16 px gaps (`476:1518`–`476:1569`) | 620 × 950 | 310 × 475 | same |

Layout, positions measured from the card's top-left corner (`360:991`, 1440 wide) and the 390 `Cards` frame (`476:1489`, 310 wide):

| Element | Desktop (≥ 48rem) | 390 |
|---|---|---|
| Arrangement | two columns: lead image + note on the left, rest image on the right | one column: lead image, note, rest image |
| Lead image | left edge = card left + 32; top = card top + 171 (the visual area top 160 + 11); 390 × 213 | full width 310 × 179 |
| Lead image bottom → note top | 28 (Figma note top 412 − image bottom 384) | 16 |
| Note | Noto Sans TC 400, 15 / 24 px, `--color-text-secondary` (`#5c5c5c`), left-aligned, width 388 | 400, 13 / 20.8 px, same colour, width 310 |
| Note bottom → rest image top | — (side by side) | 16 |
| Rest image | left edge = card left + 462 (column gap 40 after the 390 lead column); top = card top + 160; 892 × 300 | 310 × 475 |

At desktop widths below 1920 the two columns keep the 390 : 892 ratio and the 40 px gap scales with them; the note keeps its type size and may wrap. The card grows to fit it instead of overlapping.
Alt text: lead `88Win 遊戲圖卡片規格（方形）`, rest `88Win 遊戲廠商圖卡片規格`.
`detail-card.png` is no longer used after the implementation and is deleted then.
