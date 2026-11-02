# AMD spec sheet

Figma: desktop `360:2240`, mobile 390 `485:1462`. Transcribed by Claude on 2026-11-02 from the visible layers only. Hidden layers are never implemented (Q10).

Content file: `src/content/projects/amd.yaml`. Replace every `TODO(CONTENT)` with the values below, including `next` (its values come from the JHANYU frame, see [`jhanyu.md`](jhanyu.md) §09). Leave `card` and `seo` as they are.

## Sections
| # | Section | Desktop node | Mobile node | Rendered |
|---|---|---|---|---|
| 01 | Hero | `360:2241` | `485:1474` | yes |
| 02 | Overview | `360:2277` | `485:1536` | yes |
| 03 | Key Screens | `360:2306` | `485:1566` | yes (close-up 3 is a **video**) |
| 04 | Mobile / RWD | `360:2323` (hidden) | — | **no**: omit `mobile` |
| 05 | Interaction & Motion | `360:2355` | `485:1595` | yes, **two** steps |
| 06 | Details | `360:2370` (hidden) | — | **no**: omit `details` |
| 07 | Visual Extension (mosaic) | `360:2394` | `485:1616` | yes, `variant: mosaic` |
| 08 | Links | `360:2422` | `485:1632` | yes |
| 09 | Next Project → HUIFA | `360:2436` | `485:1653` | yes (values go into `huifa.yaml`) |

## Copy (verbatim)
### 01 Hero
| Field | Value | Node |
|---|---|---|
| `hero.eyebrow` | `CASE STUDY 06 · 企業網站` | `360:2242` |
| `hero.title` | `AMD` | `360:2243` |
| `hero.titleSizeMobile` | `76` | `485:1482` |
| `hero.headline` | `康健生醫**企業網站**設計` | `360:2244` |
| `hero.subtitle` | `醫療器材、客群在海外，所以建議以英文開版。經過幾版修改，客戶對內容與動態有了明確要求，我把這些需求一起放進設計，尤其是首頁的產品區域。` | `360:2245` |
| `hero.stats[0]` | label `ROLE`, value `UI / Interaction` | `360:2247` / `360:2246` |
| `hero.stats[1]` | label `PLATFORM`, value `企業網站` | `360:2249` / `360:2248` |
| `hero.stats[2]` | label `STATUS`, value `已上線` | `360:2252` / `360:2251` |
| `hero.stats[3]` | label `YEAR`, value `2024–2025` | `360:2255` / `360:2254` |

### 02 Overview
| Field | Value | Node |
|---|---|---|
| `overview.heading` | `先定英文版型，\n**再把需求一一接住**` | `360:2281` |
| `overview.blocks[0]` | title `背景`, body `康健生醫是醫療器材公司，主要客群在國外。我建議客戶開版時就使用英文，之後切換語言時，版型比較不會跑掉。` | `360:2287` / `360:2288` |
| `overview.blocks[1]` | title `過程`, body `客戶一開始沒有太多想法，改了幾版之後，開始明確要求每個區塊要放哪些內容、期望有哪些動態，我在設計時也一併考慮進去。` | `360:2292` / `360:2293` |
| `overview.blocks[2]` | title `挑戰`, body `客戶要求較多，互動內容也多。首頁產品區要使用描線的產品圖，需要額外處理，還要和整體視覺、動態保持一致。` | `360:2297` / `360:2298` |
| `overview.outputs` | `[企業網站, 互動設計]` | `360:2303`, `360:2305` |

### 03 Key Screens
| Field | Value | Node |
|---|---|---|
| `keyScreens.eyebrow` | `DESKTOP` | `360:2307` |
| `keyScreens.heading` | `專業醫療，也要**好讀**` | `360:2308` |
| `keyScreens.subtitle` | `首頁用手術場景與「Accelerating Excellence」開場，往下依客戶指定的內容依序展開，讓專業的醫療資訊在英文版面裡也清楚好讀。` | `360:2309` |
| `keyScreens.closeups[0]` | title `產品區域`, caption `依手術階段分類，搭配額外處理的描線產品圖。` | `360:2313` / `360:2314` |
| `keyScreens.closeups[1]` | title `產品頁`, caption `產品圖、規格與分類標籤集中呈現，資訊清楚。` | `360:2317` / `360:2318` |
| `keyScreens.closeups[2]` | title `系統頁面`, caption `維護與 404 頁也延續品牌色和插圖風格。` | `360:2321` / `360:2322` |

### 05 Interaction & Motion (two steps)
| Field | Value | Node |
|---|---|---|
| `motion.eyebrow` | `INTERACTION & MOTION` | `360:2356` |
| `motion.heading` | `連出錯的頁面，也有細節` (no accent) | `360:2357` |
| `motion.subtitle` | `除了客戶指定的互動，我也特別替 404 與維護頁面加上動態，讓使用者在找不到頁面或網站維護時，依然感受得到品牌的用心。` | `360:2358` |
| `motion.steps[0]` | title `01　404 頁面`, body `找不到頁面時，手術燈與「Oops」插圖帶著動態出現，讓出錯的時刻輕鬆一點。` | `I440:671;360:2362` / `;360:2363` |
| `motion.steps[1]` | title `02　維護頁面`, body `網站維護時，螢幕與齒輪插圖也有動態，清楚告知狀態，同時延續品牌視覺。` | `I440:671;360:2365` / `;360:2366` |

The steps live inside the instance `AMD / Motion switcher` (`440:671`). The schema already allows 1–3 steps; the rail must lay out two steps as in Figma (two items, the line ends at step 02). Verify the 390 rail against `485:1602`.

### 08 Links
| Field | Value | Node |
|---|---|---|
| `links.eyebrow` | `FROM FIGMA TO LIVE` | `360:2423` |
| `links.heading` | `從設計稿到正式上線` | `360:2424` |
| `links.subtitle` | `想直接操作看看的話，這裡有 Figma 原型和正式網站。` | `360:2425` |
| `links.cards[0]` | kind `prototype`, eyebrow `FIGMA PROTOTYPE`, label `Figma 原型`, description `在 Figma 裡直接點擊操作，看網站的頁面與互動。` | `465:776` |
| `links.cards[1]` | kind `live`, eyebrow `LIVE SITE`, label `正式網站`, description `目前上線中的版本。` | `465:782` |

| Card | URL |
|---|---|
| Figma 原型 | `https://www.figma.com/proto/RWD8hcBr3J1fOz4aM4MV4G/m000434-%E5%BA%B7%E5%81%A5%E7%94%9F%E9%86%AB%E7%A7%91%E6%8A%80%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8?node-id=1909-17526&viewport=475%2C-5181%2C0.31&t=9txsqnNdVeEngBGC-8&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1925%3A16595&page-id=&hide-ui=1` |
| 正式網站 | `https://www.amdintl.com.tw/` |

### 09 Next Project → `huifa.yaml` `next`
| Field | Value | Node |
|---|---|---|
| `next.meta` (in `huifa.yaml`) | `匯發營造　·　企業網站　·　UI 設計　·　Motion　·　2024–2025` | `360:2444` |
| `next.oneLiner` (in `huifa.yaml`) | `客戶不想要一般網站的瀏覽方式，於是像排投影片一樣，設計每段內容怎麼進場、怎麼轉到下一段。` | `360:2445` |

## Media slots
| Slot | Content field | Shape | Aspect ratio | `expectedFile` | Alt |
|---|---|---|---|---|---|
| Hero showcase | `hero.showcase` (`layout: single`, `objectPosition: top`) | composite | 1920 / 820 | `src/assets/projects/amd/hero-showcase.jpg` | 康健生醫網站 PC 與手機案例展示 |
| Key main (video) | `keyScreens.main` | video | 16 / 9 | `public/media/amd/key-main.mp4` | 康健生醫網站 PC 首頁捲動 |
| Close-up 1 | `keyScreens.closeups[0].media` | crop | 458.67 / 300 | `src/assets/projects/amd/key-products.jpg` | 依手術階段分類的產品區特寫 |
| Close-up 2 | `keyScreens.closeups[1].media` | crop | 458.67 / 300 | `src/assets/projects/amd/key-product-page.jpg` | 產品頁特寫 |
| Close-up 3 (video) | `keyScreens.closeups[2].media` (`kind: video`) | video crop | 458.67 / 300 | `public/media/amd/key-system-pages.mp4` + `src/assets/projects/amd/key-system-pages-poster.jpg` | 維護與 404 頁面動態 |
| Motion 1–2 (video) | `motion.steps[0–1].media` | video | 960 / 532 | `public/media/amd/motion-1.mp4`, `motion-2.mp4` | 404 頁面動態／維護頁面動態 |
| Visual Extension | `visualExtension` (`variant: mosaic`) | composite | 1920 / 1280 | `src/assets/projects/amd/visual-mosaic.jpg` | 康健生醫網站頁面拼貼 |

A video close-up has not shipped before. It must follow the close-up slot (`CLOSEUP_SLOT` for its poster srcset, the same ratio class, the play-once rules of ADR-0013). `inferMediaSlot` (`src/lib/media.ts`) must map `key-system-pages.mp4` to a size limit; add a close-up video slot (target 2 MB, cap 3 MB) if none fits.

## Layout notes (390)
Same as SSS: Hero `485:1502` (×0.38), Key swipe row `485:1575`, Motion `485:1595` (two-step rail), mosaic `485:1617` (×0.32).

## Figma reference images
1× full-frame exports: [desktop](amd/figma-desktop.jpg), [mobile](amd/figma-mobile.jpg).
