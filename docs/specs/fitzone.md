# FITZONE spec sheet

Figma: desktop `360:1373`, mobile 390 `484:1339`. Transcribed by Claude on 2026-10-31 from the visible layers only. Hidden layers are never implemented (Q10).

Content file: `src/content/projects/fitzone.yaml`. Replace every `TODO(CONTENT)` in it with the values below, **including `next`** (see [Next fields](#next-fields)). Leave `card` and `seo` as they are.

## Sections
| # | Section | Desktop node | Mobile node | Rendered |
|---|---|---|---|---|
| 01 | Hero | `360:1374` | `484:1351` | yes |
| 02 | Overview | `360:1410` | `484:1398` | yes |
| 03 | Key Screens | `360:1439` | `484:1428` | yes |
| 04 | Mobile / RWD | `360:1459` (hidden) | — | **no**: omit `mobile` |
| 05 | Interaction & Motion | `360:1491` | `484:1459` | yes |
| 06 | Details | `360:1506` (hidden) | — | **no**: omit `details` |
| 07 | Visual Extension (mosaic) | `360:1530` | `484:1485` | yes, `variant: mosaic` |
| 08 | Links | `360:1576` | `484:1519` | yes |
| 09 | Next Project → SSS | `360:1801` | `484:1540` | yes (from `sss.yaml`, not this file) |

The section list is the same as Hwa Fong. The tone sequence comes from `assignTones()` after omissions. Do not hard-code tones for this page.

## Copy (verbatim)
Copy strings exactly as written here, including full-width characters (`，` `；` `　`). `**…**` marks the brand-blue words (ARCHITECTURE §5.1 v1.4). `\n` is a hard line break that exists in Figma. The desktop and 390 frames use the same strings, except for the Next meta (see the Notes).

### 01 Hero
| Field | Value | Node |
|---|---|---|
| `hero.eyebrow` | `CASE STUDY 03 · 健身房` | `360:1375` |
| `hero.title` | `FITZONE` | `360:1376` |
| `hero.titleSizeMobile` | `76` (390 title size; one line) | `484:1359` |
| `hero.headline` | `健身房**品牌網站**設計` | `360:1377` |
| `hero.subtitle` | `客戶給了很大的發揮空間。我從 Logo 和健身房現場的色調出發，把品牌特色、四大特點和課程整理成一個節奏明快的網站，最後也順利上線。` | `360:1378` |
| `hero.stats[0]` | label `ROLE`, value `UI / Motion` | `360:1380` / `360:1379` |
| `hero.stats[1]` | label `PLATFORM`, value `品牌網站` | `360:1382` / `360:1381` |
| `hero.stats[2]` | label `STATUS`, value `已上線` | `360:1385` / `360:1384` |
| `hero.stats[3]` | label `YEAR`, value `2024–2025` (en dash) | `360:1388` / `360:1387` |

### 02 Overview
| Field | Value | Node |
|---|---|---|
| `overview.heading` | `黑、黃與一道心跳，\n**撐起整個品牌**` (YAML `\|-` block, two lines) | `360:1414` |
| `overview.blocks[0]` | title `背景`, body `客戶對網站沒有太多限制，主要希望把四大特點、品牌特色和課程內容清楚呈現，視覺和動態的方向幾乎都交給我決定。` | `360:1420` / `360:1421` |
| `overview.blocks[1]` | title `視覺延伸`, body `色彩從 Logo 延伸，也大量參考健身房的黑黃色調與空間裝潢；品牌 O 裡的心跳圖示則被拆出來，貫穿整個網站的圖示與按鈕。` | `360:1425` / `360:1426` |
| `overview.blocks[2]` | title `挑戰`, body `發揮空間大，反而要先替網站定下方向。內容量不少，所以重點放在建立清楚的資訊層級，讓人能很快找到特點與課程。` | `360:1430` / `360:1431` |
| `overview.outputs` | `[品牌網站, Motion]` | `360:1436`, `360:1438` |

The `OVERVIEW` eyebrow, the `01`–`03` numbers, and the `OUTPUT` label come from the template, as on 88Win.

### 03 Key Screens
| Field | Value | Node |
|---|---|---|
| `keyScreens.eyebrow` | `DESKTOP` | `360:1440` |
| `keyScreens.heading` | `一進站，就感覺到**心跳**` | `360:1441` |
| `keyScreens.subtitle` | `首頁用滿版影片和高對比的黑黃配色開場，下方直接帶出四大特點，第一眼就知道 FITZONE 在做什麼。` | `360:1442` |
| `keyScreens.closeups[0]` | title `品牌 O 裡的心跳`, caption `把 Logo 的心跳線延伸成整站的識別符號。` | `360:1449` / `360:1450` |
| `keyScreens.closeups[1]` | title `品牌與特色`, caption `黑黃區塊交錯，讓品牌介紹有節奏地展開。` | `360:1453` / `360:1454` |
| `keyScreens.closeups[2]` | title `團體課程`, caption `用輪播呈現多種課程，一眼看懂每堂課的差別。` | `360:1457` / `360:1458` |

### 05 Interaction & Motion
| Field | Value | Node |
|---|---|---|
| `motion.eyebrow` | `INTERACTION & MOTION` | `360:1492` |
| `motion.heading` | `快、清楚，而且有活力` (no accent) | `360:1493` |
| `motion.subtitle` | `Motion 的目標是活力、快速、清楚又鮮明。動作俐落不拖泥帶水，讓瀏覽的節奏就像一堂高強度訓練。` | `360:1494` |
| `motion.steps[0]` | title `01　心跳識別`, body `心跳線出現在 Logo、圖示和按鈕中，把品牌識別直接放進互動裡。` | `360:1498` / `360:1499` |
| `motion.steps[1]` | title `02　俐落進場`, body `區塊用短而快的位移進場，資訊一段段清楚出現，不拖慢瀏覽。` | `360:1501` / `360:1502` |
| `motion.steps[2]` | title `03　鮮明回饋`, body `Hover 時用黃色色塊和斜切形狀即時回應，可點擊的地方一眼就看得出來。` | `360:1504` / `360:1505` |

The space after the step number is a **full-width space** (`　`, U+3000) in Figma. Keep it.

### 08 Links
| Field | Value | Node |
|---|---|---|
| `links.eyebrow` | `FROM FIGMA TO LIVE` | `360:1577` |
| `links.heading` | `從設計稿到正式上線` | `360:1578` |
| `links.subtitle` | `想直接操作看看的話，這裡有 Figma 原型和正式網站。` | `360:1579` |
| `links.cards[0]` | kind `prototype`, eyebrow `FIGMA PROTOTYPE`, label `Figma 原型`, description `在 Figma 裡直接點擊操作，看網站的頁面與互動。` | `465:728` |
| `links.cards[1]` | kind `live`, eyebrow `LIVE SITE`, label `正式網站`, description `目前上線中的版本。` | `465:734` |
| `links.note` | none (do not add one) | — |

The current `fitzone.yaml` has a single `live` card. Replace it with these two cards, in this order.

## Next fields
`next` describes **FITZONE as it appears on the previous page** (Hwa Fong, `360:1360`). Set these in `fitzone.yaml`:

| Field | Value | Node (Hwa Fong frame) |
|---|---|---|
| `next.meta` | `健身房品牌網站　·　UI 設計　·　Motion　·　2024–2025` (full-width spaces around `·`) | `360:1368` |
| `next.oneLiner` | `從 Logo 與健身房的色調延伸，加入心跳識別和有活力的 Motion，最後順利上線。` | `360:1369` |
| `next.media` | unchanged (`*cardVideo`) | — |

This page's own Next section shows **SSS** (Figma says `SSS 1.0`; Product Owner decision 2026-11-01: use the project name `SSS`, as on the Home card). Its copy belongs in `src/content/projects/sss.yaml` `next`. Set it in the same PR, so SSS does not have to wait for its own spec:

| Field | Value | Node (this frame) |
|---|---|---|
| `sss.yaml` `next.meta` | `超透明提案　·　活動頁面　·　UI 設計　·　互動設計　·　2024–2025` | `360:1809` |
| `sss.yaml` `next.oneLiner` | `把一張主視覺拆開讓它動起來，再用視差滾動讓每次滑動都有新內容，讓建築展變得想看、也想互動。` | `360:1810` |

The `NEXT PROJECT` label, the `04 / 07` counter, the `SSS` name, and the arrow come from the template and from `sss.yaml`.

## Links (URLs)
| Card | URL |
|---|---|
| Figma 原型 | `https://www.figma.com/proto/DzYf6WOFxR4hwyAYzktBUH/m000421-%E4%B8%96%E7%95%8C%E5%81%A5%E8%BA%AB%E4%BA%8B%E6%A5%AD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8-FITZONE%E7%B6%B2%E7%AB%99-?node-id=3028-11832&viewport=1659%2C470%2C0.16&t=1vOqvezv1vsOoD96-8&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=3028%3A11832&page-id=3028%3A11831&hide-ui=1` |
| 正式網站 | `https://www.fitzone.com.tw/` |

⚠️ These come from each card instance's **prototype "Open link" action**. As on Hwa Fong, the label text inside both cards still carries the old **88Win** prototype hyperlink. Do not use that one. Quote both URLs in YAML (single quotes), as `hwa-fong.yaml` does.

## Media slots
All media is `status: pending` until the Product Owner delivers it. File names, Figma nodes, and export sizes are in [`docs/ASSETS.md` → FITZONE](../ASSETS.md). `expectedFile` values must match it exactly. Pending posters use `../../assets/placeholders/placeholder.png`, as in `hwa-fong.yaml`.

| Slot | Content field | Shape | Aspect ratio | `expectedFile` | Alt |
|---|---|---|---|---|---|
| Hero showcase | `hero.showcase` (`layout: single`, one item, `objectPosition: top`) | composite | 1920 / 820 | `src/assets/projects/fitzone/hero-showcase.jpg` | FITZONE PC 與手機首頁案例展示 |
| Key main (video) | `keyScreens.main` | video | 16 / 9 | `public/media/fitzone/key-main.mp4` | FITZONE PC 首頁捲動 |
| Close-up 1 | `keyScreens.closeups[0].media` | crop | 458.67 / 300 | `src/assets/projects/fitzone/key-heartbeat.jpg` | 品牌 O 心跳識別特寫 |
| Close-up 2 | `keyScreens.closeups[1].media` | crop | 458.67 / 300 | `src/assets/projects/fitzone/key-brand.jpg` | 品牌與特色區塊特寫 |
| Close-up 3 | `keyScreens.closeups[2].media` | crop | 458.67 / 300 | `src/assets/projects/fitzone/key-classes.jpg` | 團體課程輪播特寫 |
| Motion 1 (video) | `motion.steps[0].media` | video | 960 / 532 | `public/media/fitzone/motion-1.mp4` | 心跳識別動態 |
| Motion 2 (video) | `motion.steps[1].media` | video | 960 / 532 | `public/media/fitzone/motion-2.mp4` | 區塊俐落進場動態 |
| Motion 3 (video) | `motion.steps[2].media` | video | 960 / 532 | `public/media/fitzone/motion-3.mp4` | 黃色色塊 Hover 回饋 |
| Visual Extension | `visualExtension` (`variant: mosaic`, one item) | composite | 1920 / 1280 | `src/assets/projects/fitzone/visual-mosaic.jpg` | FITZONE 網站頁面拼貼 |

- Alt text is not visible copy, so it is authored here rather than taken from Figma. Use it as written.
- Figma has one video frame in Interaction & Motion (`360:1495`). As on 88Win and Hwa Fong, each step switches to its own video, so there are three files.
- The close-up frames keep the template's layer names (`Navigation close-up`, `Promotion close-up`, `Game Content close-up`). The file names above follow the FITZONE content instead.
- The Next Project preview on this page is SSS's card media, which `sss.yaml` already provides. Nothing to add here.
- The current `hero.showcase` and `keyScreens` placeholders point at `card.jpg`. Replace them with the pending slots above. Keep `card.jpg`, because the card uses it as the SEO / OG fallback.

## Layout notes (390)
The page uses the template exactly as Hwa Fong does. No new component or variant is needed.
- **Hero** (`484:1351`): the title is 76 px on one line (`hero.titleSizeMobile: 76`). The showcase is a full-bleed 390 × 312 window (`484:1379`) onto the same composite file, centred and clipped.
- **Key Screens** (`484:1428`): the main video is 350 × 197. The three close-ups are a **swipe row** (`484:1437`, full-bleed, items 280 wide with 183-tall media).
- **Motion** (`484:1459`): the video is 350 × 194 above a vertical step rail.
- **Visual Extension** (`484:1485`): 390 × 410, the same mosaic file scaled and clipped (`484:1486`).
- **Links** (`484:1519`): the cards stack.
- **Next** (`484:1540`): `SSS` stays on one line next to the arrow.

## Figma reference images
1× exports by Claude, 2026-10-31. Use them for the "Figma vs page" table. Sections 04 and 06 are not rendered, so they have no images.

| # | Section | Desktop image | Mobile image |
|---|---|---|---|
| 01 | Hero | [desktop](fitzone/figma-01-hero-desktop.jpg) | [mobile](fitzone/figma-01-hero-mobile.jpg) |
| 02 | Overview | [desktop](fitzone/figma-02-overview-desktop.jpg) | [mobile](fitzone/figma-02-overview-mobile.jpg) |
| 03 | Key Screens | [desktop](fitzone/figma-03-key-screens-desktop.jpg) | [mobile](fitzone/figma-03-key-screens-mobile.jpg) |
| 05 | Interaction & Motion | [desktop](fitzone/figma-05-motion-desktop.jpg) | [mobile](fitzone/figma-05-motion-mobile.jpg) |
| 07 | Visual Extension | [desktop](fitzone/figma-07-visual-extension-desktop.jpg) | [mobile](fitzone/figma-07-visual-extension-mobile.jpg) |
| 08 | Links | [desktop](fitzone/figma-08-links-desktop.jpg) | [mobile](fitzone/figma-08-links-mobile.jpg) |
| 09 | Next Project | [desktop](fitzone/figma-09-next-desktop.jpg) | [mobile](fitzone/figma-09-next-mobile.jpg) |

## Notes for the Product Owner
- As with Hwa Fong, the SSS Next meta differs between frames: desktop `360:1809` uses `　·　` (full-width spaces), while mobile `484:1556` uses ` · `. The template renders one string, so this sheet follows the desktop text.
- The hero ROLE is `UI / Motion` (Hwa Fong was `UI / Interaction`), and the outputs are `品牌網站` and `Motion`. Both are transcribed exactly from Figma.
