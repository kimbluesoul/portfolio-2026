# SSS spec sheet

Figma: desktop `360:1814`, mobile 390 `484:1580`. Transcribed by Claude on 2026-11-02 from the visible layers only. Hidden layers are never implemented (Q10).

Content file: `src/content/projects/sss.yaml`. Replace every `TODO(CONTENT)` with the values below. Leave `card`, `seo`, and `next` as they are (`next` describes SSS on the FITZONE page and is already correct).

## Sections
| # | Section | Desktop node | Mobile node | Rendered |
|---|---|---|---|---|
| 01 | Hero | `360:1815` | `484:1592` | yes |
| 02 | Overview | `360:1851` | `484:1654` | yes |
| 03 | Key Screens | `360:1880` | `484:1684` | yes |
| 04 | Mobile / RWD | `360:1897` (hidden) | — | **no**: omit `mobile` |
| 05 | Interaction & Motion | `360:1929` | `484:1712` | yes |
| 06 | Details | `360:1944` (hidden) | — | **no**: omit `details` |
| 07 | Visual Extension (mosaic) | `360:1968` | `484:1738` | yes, `variant: mosaic` |
| 08 | Links | `360:2002` | `484:1760` | yes |
| 09 | Next Project → JHANYU | `360:2016` | `484:1781` | yes (values go into `jhanyu.yaml`, see below) |

Tones come from `assignTones()` after omissions. Do not hard-code them.

## Copy (verbatim)
Copy strings exactly, including full-width characters (`，` `「」` `・` `　`). `**…**` marks the brand-blue words. `\n` is a hard line break that exists in Figma.

### 01 Hero
| Field | Value | Node |
|---|---|---|
| `hero.eyebrow` | `CASE STUDY 04 · 展覽活動頁` | `360:1816` |
| `hero.title` | `SSS` (PO decision 2026-11-03; Figma reads `SSS 1.0`) | `360:1817` |
| `hero.titleSizeMobile` | `76` | `484:1600` |
| `hero.headline` | `超透明提案**展覽活動頁**設計` | `360:1818` |
| `hero.subtitle` | `素材不多，主視覺只有一張 SSS 的圖。我把主視覺拆開讓它動起來，再用視差滾動讓每次滑動都有新內容進場，把一場建築展變得想看、也想互動。` | `360:1819` |
| `hero.stats[0]` | label `ROLE`, value `UI / Interaction` | `360:1821` / `360:1820` |
| `hero.stats[1]` | label `PLATFORM`, value `展覽活動頁` | `360:1823` / `360:1822` |
| `hero.stats[2]` | label `STATUS`, value `已上線` | `360:1826` / `360:1825` |
| `hero.stats[3]` | label `YEAR`, value `2024–2025` (en dash) | `360:1829` / `360:1828` |

### 02 Overview
| Field | Value | Node |
|---|---|---|
| `overview.heading` | `一張主視覺，\n**動成一場展覽**` | `360:1855` |
| `overview.blocks[0]` | title `背景`, body `這是寶舖建設「SSS 超透明提案」展覽的活動頁。剛拿到需求和素材時覺得有些普通，主要就是一張 SSS 的圖，照片也不多。` | `360:1861` / `360:1862` |
| `overview.blocks[1]` | title `讓主視覺動起來`, body `看到 SSS 主視覺時，就覺得它動起來一定更豐富有趣。於是拆解裡面的元素讓它們各自動起來，讓人一進站就被吸引停留。` | `360:1866` / `360:1867` |
| `overview.blocks[2]` | title `挑戰`, body `素材有限，怎麼讓人願意看、願意互動是最大的難題。我和前端大量溝通視差滾動的效果，讓每一次滾動都有新元素進入。` | `360:1871` / `360:1872` |
| `overview.outputs` | `[活動頁面, 互動設計]` | `360:1877`, `360:1879` |

### 03 Key Screens
| Field | Value | Node |
|---|---|---|
| `keyScreens.eyebrow` | `DESKTOP` | `360:1881` |
| `keyScreens.heading` | `一進站，SSS 就**動起來**` | `360:1882` |
| `keyScreens.subtitle` | `首頁把主視覺拆成一個個元素，讓它們各自動起來，搭配「世界唯一專為健康・安全建築解析的展覽」標語，第一眼就抓住目光。` | `360:1883` |
| `keyScreens.closeups[0]` | title `展覽介紹`, caption `從 SSS 三個核心，帶出超透明的理念。` | `360:1887` / `360:1888` |
| `keyScreens.closeups[1]` | title `展覽旅程`, caption `把展區動線畫成立體地圖，從黑暗走向透明。` | `360:1891` / `360:1892` |
| `keyScreens.closeups[2]` | title `建物知情權`, caption `用簡單的圖示與時間軸，把專業內容講清楚。` | `360:1895` / `360:1896` |

### 05 Interaction & Motion
| Field | Value | Node |
|---|---|---|
| `motion.eyebrow` | `INTERACTION & MOTION` | `360:1930` |
| `motion.heading` | `每一次滾動，都有新東西` (no accent) | `360:1931` |
| `motion.subtitle` | `整個網站大量運用視差滾動，和前端反覆溝通細節，讓超透明理念、旅程導覽與建物知情權，都能在互動中被看見、被吸收。` | `360:1932` |
| `motion.steps[0]` | title `01　主視覺拆解`, body `把 SSS 主視覺裡的元素拆開、單獨動起來，一進站就被吸引停留。` | `360:1936` / `360:1937` |
| `motion.steps[1]` | title `02　視差滾動`, body `不同圖層以不同速度移動，每一次滾動都有新的元素進入畫面。` | `360:1939` / `360:1940` |
| `motion.steps[2]` | title `03　逐段揭露`, body `從展覽介紹、旅程導覽到建物知情權，內容隨滾動分段出現，更好吸收。` | `360:1942` / `360:1943` |

The space after each step number is a full-width space (`　`, U+3000).

### 08 Links
| Field | Value | Node |
|---|---|---|
| `links.eyebrow` | `FROM FIGMA TO LIVE` | `360:2003` |
| `links.heading` | `從設計稿到正式上線` | `360:2004` |
| `links.subtitle` | `想直接操作看看的話，這裡有 Figma 原型和正式網站。` | `360:2005` |
| `links.cards[0]` | kind `prototype`, eyebrow `FIGMA PROTOTYPE`, label `Figma 原型`, description `在 Figma 裡直接點擊操作，看網站的頁面與互動。` | `465:752` |
| `links.cards[1]` | kind `live`, eyebrow `LIVE SITE`, label `正式網站`, description `展覽已結束，頁面仍可瀏覽。` | `465:758` |

| Card | URL (from the instance's prototype "Open link" action) |
|---|---|
| Figma 原型 | `https://www.figma.com/proto/kqbgqrMy4O5dpz0xgOchhY/m000381-%E5%AF%B6%E8%88%96%E5%BB%BA%E8%A8%AD%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8-%E5%8A%A0%E7%B0%BD-?page-id=928%3A3387&node-id=956-645&p=f&viewport=754%2C34%2C0.02&t=6SS5FcX8jjnDkeGi-8&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=956%3A645&hide-ui=1` |
| 正式網站 | `https://www.baopu.com.tw/exhibition/SSS1.0#kv` |

### 09 Next Project → `jhanyu.yaml` `next`
| Field | Value | Node |
|---|---|---|
| `next.meta` (in `jhanyu.yaml`) | `展裕建設　·　企業網站　·　UI 設計　·　品牌延伸　·　2024–2025` (full-width spaces around `·`, desktop text) | `360:2024` |
| `next.oneLiner` (in `jhanyu.yaml`) | `延伸 Logo 的斜角與亮橘色，用大面積色塊撐起品牌感，也把繁多的服務流程整理得清楚又不單調。` | `360:2025` |

The counter `05 / 07` and the title `JHANYU` come from the template.

## Media slots
All media is `status: pending` until the PO delivers it. Names and export sizes are also in [`docs/ASSETS.md` → SSS](../ASSETS.md).

| Slot | Content field | Shape | Aspect ratio | `expectedFile` | Alt |
|---|---|---|---|---|---|
| Hero showcase | `hero.showcase` (`layout: single`, `objectPosition: top`) | composite | 1920 / 820 | `src/assets/projects/sss/hero-showcase.jpg` | SSS 活動頁 PC 與手機案例展示 |
| Key main (video) | `keyScreens.main` | video | 16 / 9 | `public/media/sss/key-main.mp4` | SSS 活動頁 PC 首頁捲動 |
| Close-up 1 | `keyScreens.closeups[0].media` | crop | 458.67 / 300 | `src/assets/projects/sss/key-intro.jpg` | 展覽介紹區塊特寫 |
| Close-up 2 | `keyScreens.closeups[1].media` | crop | 458.67 / 300 | `src/assets/projects/sss/key-journey.jpg` | 展覽旅程立體地圖特寫 |
| Close-up 3 | `keyScreens.closeups[2].media` | crop | 458.67 / 300 | `src/assets/projects/sss/key-transparency.jpg` | 建物知情權區塊特寫 |
| Motion 1–3 (video) | `motion.steps[0–2].media` | video | 960 / 532 | `public/media/sss/motion-1.mp4` … `motion-3.mp4` | 主視覺拆解動態／視差滾動動態／內容逐段揭露動態 |
| Visual Extension | `visualExtension` (`variant: mosaic`) | composite | 1920 / 1280 | `src/assets/projects/sss/visual-mosaic.jpg` | SSS 活動頁頁面拼貼 |

## Layout notes (390)
Identical to Hwa Fong / FITZONE; no new component or variant.
- Hero `484:1620`: 390 × 312 window onto the same composite (×0.38, 730 × 350).
- Key Screens `484:1684`: main video 350 × 197; close-ups are a swipe row (`484:1693`, items 280 wide, media 280 × 183).
- Motion `484:1712`: video 350 × 194 above the step rail.
- Visual Extension `484:1738`: 390 × 410 window, mosaic ×0.32 (614 × 410).

## Figma reference images
1× full-frame exports: [desktop](sss/figma-desktop.jpg), [mobile](sss/figma-mobile.jpg).
