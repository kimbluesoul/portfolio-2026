# HUIFA spec sheet

Figma: desktop `360:2449`, mobile 390 `485:1693`. Transcribed by Claude on 2026-11-02 from the visible layers only. Hidden layers are never implemented (Q10).

Content file: `src/content/projects/huifa.yaml`. Replace every `TODO(CONTENT)` with the values below, including `next` (its values come from the AMD frame, see [`amd.md`](amd.md) §09). Leave `card` and `seo` as they are.

**This page needs two template extensions** (§ "Template extensions"). Everything else is the existing template.

## Sections
| # | Section | Desktop node | Mobile node | Rendered |
|---|---|---|---|---|
| 01 | Hero | `360:2450` | `485:1705` | yes (390 showcase differs, see extensions) |
| 02 | Overview | `360:2486` | `485:1767` | yes |
| 03 | Key Screens | `360:2515` | `485:1797` | yes |
| 04 | Mobile / RWD | `360:2532` (hidden) | — | **no**: omit `mobile` |
| 05 | Interaction & Motion | `360:2564` | `485:1825` | yes, **two** steps (PO 2026-11-03) |
| 06 | Details | `360:2579` | `485:1851` | **yes, new `compare` variant** |
| 07 | Visual Extension (mosaic) | `360:2603` | `485:1868` | yes, `variant: mosaic` |
| 08 | Links | `360:2642` | `485:1895` | yes |
| 09 | Next Project → 88WIN | `360:2656` | `485:1916` | yes (`88win.yaml` `next` already matches Figma; no change) |

## Copy (verbatim)
### 01 Hero
| Field | Value | Node |
|---|---|---|
| `hero.eyebrow` | `CASE STUDY 07 · 企業網站` | `360:2451` |
| `hero.title` | `HUIFA` | `360:2452` |
| `hero.titleSizeMobile` | `76` | `485:1713` |
| `hero.headline` | `匯發營造**企業網站**設計` | `360:2453` |
| `hero.subtitle` | `客戶完全不想要一般網站的瀏覽方式，希望特別一點。我一邊和客戶確認需求，一邊照著期望設計，讓整個網站像一份會動的簡報。` | `360:2454` |
| `hero.stats[0]` | label `ROLE`, value `UI / Motion` | `360:2456` / `360:2455` |
| `hero.stats[1]` | label `PLATFORM`, value `企業網站` | `360:2458` / `360:2457` |
| `hero.stats[2]` | label `STATUS`, value `已上線` | `360:2461` / `360:2460` |
| `hero.stats[3]` | label `YEAR`, value `2024–2025` | `360:2464` / `360:2463` |

### 02 Overview
| Field | Value | Node |
|---|---|---|
| `overview.heading` | `不像網站，\n**更像一份會動的簡報**` | `360:2490` |
| `overview.blocks[0]` | title `背景`, body `客戶完全不想要一般網站的瀏覽方式，希望整個網站特別一點，不以操作效率為優先，而是重視瀏覽時的體驗。` | `360:2496` / `360:2497` |
| `overview.blocks[1]` | title `過程`, body `一邊和客戶確認需求，一邊依照期望調整設計，把想像中的瀏覽方式一步步具體化，最後真的做成網站。` | `360:2501` / `360:2502` |
| `overview.blocks[2]` | title `挑戰`, body `回頭看，有些部分真的很像在做投影片：每段內容要怎麼進場、怎麼轉到下一個區塊才自然，都需要一格一格安排。` | `360:2506` / `360:2507` |
| `overview.outputs` | `[企業網站, Motion]` | `360:2512`, `360:2514` |

### 03 Key Screens
| Field | Value | Node |
|---|---|---|
| `keyScreens.eyebrow` | `DESKTOP` | `360:2516` |
| `keyScreens.heading` | `一進站，先看見**品牌**` | `360:2517` |
| `keyScreens.subtitle` | `首頁以 Logo 搭配線稿建築開場，乾淨、有份量；往下滾動後，一個區塊一個區塊地展開，像翻開一份簡報。` | `360:2518` |
| `keyScreens.closeups[0]` | title `執行準則`, caption `PLAN 到 ACTION 五個步驟，一字排開說清楚。` | `360:2522` / `360:2523` |
| `keyScreens.closeups[1]` | title `工程實績`, caption `建案實景搭配工程數據，成果一目了然。` | `360:2526` / `360:2527` |
| `keyScreens.closeups[2]` | title `服務項目`, caption `側邊圖示導覽，逐項切換各類工程內容。` | `360:2530` / `360:2531` |

### 05 Interaction & Motion
| Field | Value | Node |
|---|---|---|
| `motion.eyebrow` | `INTERACTION & MOTION` | `360:2565` |
| `motion.heading` | `每一次滾動，都是一次換頁` (no accent) | `360:2566` |
| `motion.subtitle` | `整個網站的動態就像投影片的轉場：每段內容怎麼進場、怎麼轉到下一個區塊，都經過安排，讓瀏覽的節奏自然流暢。` | `360:2567` |
| `motion.steps[0]` | title `01　一頁一畫面`, body `每個區塊都是一個完整畫面，像簡報一樣一頁講一件事。` | `360:2571` / `360:2572` |
| `motion.steps[1]` | title `02　內容進場`, body `標題、圖片和文字依序出現，讓視線跟著內容走。` | `360:2574` / `360:2575` |

PO decision 2026-11-03: Motion has **two** steps. Figma's step `03　區塊轉場` (`360:2577` / `360:2578`) is dropped; no `motion-3.mp4` ships.

### 06 Details (compare variant)
| Field | Value | Node |
|---|---|---|
| `details.eyebrow` | `DETAILS` | `360:2580` |
| `details.heading` | `從設計稿，到真的**動起來**` | `360:2581` |
| `details.subtitle` | `上方是設計時排的分鏡，下方是實際完成的樣貌，可以對照看看構想怎麼一步步落地。` | `360:2582` |
| item 1 label | `DESIGN DRAFT` | `443:663` |
| item 2 label | `LIVE SITE` | `443:664` |

### 08 Links
| Field | Value | Node |
|---|---|---|
| `links.eyebrow` | `FROM FIGMA TO LIVE` | `360:2643` |
| `links.heading` | `從設計稿到正式上線` | `360:2644` |
| `links.subtitle` | `想直接操作看看的話，這裡有 Figma 原型和正式網站。` | `360:2645` |
| `links.cards[0]` | kind `prototype`, eyebrow `FIGMA PROTOTYPE`, label `Figma 原型`, description `在 Figma 裡直接點擊操作，看網站的頁面與互動。` | `465:788` |
| `links.cards[1]` | kind `live`, eyebrow `LIVE SITE`, label `正式網站`, description `目前上線中的版本。` | `465:794` |

| Card | URL |
|---|---|
| Figma 原型 | `https://www.figma.com/proto/R8ikmMzwONpWdm8pmxfdS6/m000424-%E5%8C%AF%E7%99%BC%E7%87%9F%E9%80%A0%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8?node-id=893-5500&p=f&viewport=255%2C529%2C0.08&t=9PoucpoevO8aNQ96-8&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=893%3A5520&page-id=393%3A274&hide-ui=1` |
| 正式網站 | `https://www.huifa.com.tw/` |

## Template extensions (architect decisions)
### E1 — Details `compare` variant
Required outcome, measured from `360:2579` / `485:1851`:
- Content shape: `details.variant: 'cards' | 'compare'` (default `cards`, today's behaviour). For `compare`, `items` are `{ label, media }` (no title, no card chrome); keep `eyebrow` / `heading` / `subtitle`.
- Desktop: each item is a label (the detail-eyebrow style, brand blue, 14 px) and, below it, full-width media in the case column. Item 1 is an image (1436 × 234, no radius); item 2 a video (1440 × 702, radius 16). The label sits 15 px above its media; 64 px between item 1's media and item 2's label; 64 px from the subtitle to item 1's label.
- 390: item 1's media is a horizontal **swipe strip**: a 390 × 180 full-bleed scroller holding the same image at 1107 × 180 (radius 8, first edge at x 20). Item 2 is a 350 × 171 video, radius 12. Labels 12 px, 10 px above their media; 28 px from the strip to item 2's label.
- The swipe strip must be keyboard-scrollable (`tabindex="0"`, `role="region"`, an `aria-label`), like the existing swipe rows.

### E2 — Hero showcase 390 scale per project
Other projects show the composite at ×0.38 (730 × 350) in a 390 × 312 window. HUIFA's 390 hero (`485:1733`) shows it at **×0.25 (480 × 230) in a 390 × 205 window**, centred and clipped. Add an optional content field (for example `hero.showcase.mobileScale: 0.25`) that maps to a CSS class (CSP: no inline style), and keep the 390 hero height gate for HUIFA against `485:1693`.

## Media slots
| Slot | Content field | Shape | Aspect ratio | `expectedFile` | Alt |
|---|---|---|---|---|---|
| Hero showcase | `hero.showcase` (`layout: single`, `objectPosition: top`) | composite | 1920 / 820 | `src/assets/projects/huifa/hero-showcase.jpg` | 匯發營造網站 PC 與手機案例展示 |
| Key main (video) | `keyScreens.main` | video | 2528 / 1216 (recording 2544 × 1220, PO wide-frame rule) | `public/media/huifa/key-main.mp4` | 匯發營造網站 PC 首頁捲動 |
| Close-up 1 | `keyScreens.closeups[0].media` | crop | 458.67 / 300 | `src/assets/projects/huifa/key-guidelines.jpg` | 執行準則區塊特寫 |
| Close-up 2 | `keyScreens.closeups[1].media` | crop | 458.67 / 300 | `src/assets/projects/huifa/key-projects.jpg` | 工程實績區塊特寫 |
| Close-up 3 | `keyScreens.closeups[2].media` | crop | 458.67 / 300 | `src/assets/projects/huifa/key-services.jpg` | 服務項目區塊特寫 |
| Motion 1–2 (video) | `motion.steps[0–1].media` | video | 2528 / 1216 (recordings ≈ 2.1:1, PO wide-frame rule) | `public/media/huifa/motion-1.mp4`, `motion-2.mp4` | 一頁一畫面／內容進場 |
| Details draft | `details.items[0].media` | image | 1436 / 234 | `src/assets/projects/huifa/detail-draft.jpg` | 匯發營造網站設計分鏡 |
| Details live (video) | `details.items[1].media` | video | 1440 / 702 | `public/media/huifa/detail-live.mp4` | 匯發營造網站完成畫面捲動 |
| Visual Extension | `visualExtension` (`variant: mosaic`) | composite | 1920 / 1280 | `src/assets/projects/huifa/visual-mosaic.jpg` | 匯發營造網站頁面拼貼 |

The 390 draft strip uses the same file (1107 / 1436 ≈ 0.77 of desktop); no mobile export.

## Layout notes (390)
Key swipe row `485:1806`, Motion video `485:1832`, mosaic `485:1869` (verify its scale against the frame; the others use ×0.32).

## Figma reference images
1× full-frame exports: [desktop](huifa/figma-desktop.jpg), [mobile](huifa/figma-mobile.jpg).
