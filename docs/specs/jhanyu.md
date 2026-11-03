# JHANYU spec sheet

Figma: desktop `360:2029`, mobile 390 `484:1821`. Transcribed by Claude on 2026-11-02 from the visible layers only. Hidden layers are never implemented (Q10).

Content file: `src/content/projects/jhanyu.yaml`. Replace every `TODO(CONTENT)` with the values below, including `next` (its values come from the SSS frame, see [`sss.md`](sss.md) §09). Leave `card` and `seo` as they are.

## Sections
| # | Section | Desktop node | Mobile node | Rendered |
|---|---|---|---|---|
| 01 | Hero | `360:2030` | `484:1833` | yes |
| 02 | Overview | `360:2066` | `484:1895` | yes |
| 03 | Key Screens | `360:2095` | `484:1925` | yes |
| 04 | Mobile / RWD | `360:2112` (hidden) | — | **no**: omit `mobile` |
| 05 | Interaction & Motion | `360:2144` | `484:1953` | yes (eyebrow is `SERVICE FLOW`), **two** steps (PO 2026-11-03) |
| 06 | Details | `360:2159` (hidden) | — | **no**: omit `details` |
| 07 | Visual Extension (mosaic) | `360:2183` | `484:1979` | yes, `variant: mosaic` |
| 08 | Links | `360:2213` | `484:1997` | yes |
| 09 | Next Project → AMD | `360:2227` | `484:2018` | yes (values go into `amd.yaml`) |

## Copy (verbatim)
`**…**` marks the brand-blue words. `\n` is a hard line break that exists in Figma.

### 01 Hero
| Field | Value | Node |
|---|---|---|
| `hero.eyebrow` | `CASE STUDY 05 · 企業網站` | `360:2031` |
| `hero.title` | `JHANYU` | `360:2032` |
| `hero.titleSizeMobile` | `76` | `484:1841` |
| `hero.headline` | `展裕建設**企業網站**設計` | `360:2033` |
| `hero.subtitle` | `溝通順利，設計上大量延伸 Logo 的造型語言，加入大面積的亮橘色塊，讓整個網站一看就是展裕建設；也把圖量很多的服務流程，整理得清楚又不單調。` | `360:2034` |
| `hero.stats[0]` | label `ROLE`, value `UI / 品牌延伸` | `360:2036` / `360:2035` |
| `hero.stats[1]` | label `PLATFORM`, value `企業網站` | `360:2038` / `360:2037` |
| `hero.stats[2]` | label `STATUS`, value `已上線` | `360:2041` / `360:2040` |
| `hero.stats[3]` | label `YEAR`, value `2024–2025` | `360:2044` / `360:2043` |

### 02 Overview
| Field | Value | Node |
|---|---|---|
| `overview.heading` | `從 Logo 延伸，\n**讓亮橘撐起品牌**` | `360:2070` |
| `overview.blocks[0]` | title `背景`, body `和客戶確認需求的過程很順利，沒有太多狀況，重點放在如何讓網站更有展裕建設自己的樣子。` | `360:2076` / `360:2077` |
| `overview.blocks[1]` | title `品牌延伸`, body `大量延伸 Logo 的造型語言，把屋頂般的斜角變成版面裡的色塊與分割，再加入大面積的亮橘色，讓品牌感更鮮明。` | `360:2081` / `360:2082` |
| `overview.blocks[2]` | title `挑戰`, body `服務流程的圖比較多，如何清楚呈現、又不讓內容顯得單調無聊，是這個案子印象最深的挑戰。` | `360:2086` / `360:2087` |
| `overview.outputs` | `[企業網站, 品牌延伸]` | `360:2092`, `360:2094` |

### 03 Key Screens
| Field | Value | Node |
|---|---|---|
| `keyScreens.eyebrow` | `DESKTOP` | `360:2096` |
| `keyScreens.heading` | `聚建築，也聚**品牌**` | `360:2097` |
| `keyScreens.subtitle` | `首頁用建案實景大圖開場，往下以 Logo 延伸的斜角橘色塊串起關於展裕與品牌理念，讓建築和品牌一起被看見。` | `360:2098` |
| `keyScreens.closeups[0]` | title `關於展裕`, caption `斜角橘色塊延伸自 Logo，讓版面有品牌的節奏。` | `360:2102` / `360:2103` |
| `keyScreens.closeups[1]` | title `熱銷建案`, caption `實景照片搭配清楚的規格表，資訊一目了然。` | `360:2106` / `360:2107` |
| `keyScreens.closeups[2]` | title `購屋簽約流程`, caption `用圖示和步驟編號，把繁瑣的流程講清楚。` | `360:2110` / `360:2111` |

### 05 Interaction & Motion
| Field | Value | Node |
|---|---|---|
| `motion.eyebrow` | `SERVICE FLOW` | `360:2145` |
| `motion.heading` | `服務流程，清楚也不無聊` (no accent) | `360:2146` |
| `motion.subtitle` | `這個案子動態不多，重點放在服務流程的設計。流程的圖量多，所以用一致的圖示、步驟標籤和連接線，讓每個流程清楚好讀，又延續品牌的視覺語言。` | `360:2147` |
| `motion.steps[0]` | title `01　圖示化步驟`, body `每個步驟都搭配一致的線條圖示，讓繁瑣的流程不必細讀文字也能看懂。` | `360:2151` / `360:2152` |
| `motion.steps[1]` | title `02　編號與版面節奏`, body `橘色編號標籤與連接線帶出先後順序，流程、色塊與留白交錯安排，讓圖量多的頁面清楚又不單調。` | PO 2026-11-03 (merges Figma 02 `360:2154` and 03 `360:2157`; Figma still shows three steps) |

### 08 Links
| Field | Value | Node |
|---|---|---|
| `links.eyebrow` | `FROM DESIGN TO LIVE` (not "FIGMA") | `360:2214` |
| `links.heading` | `從設計稿到正式上線` | `360:2215` |
| `links.subtitle` | `想直接看看的話，這裡有原本的設計稿和正式網站。` | `360:2216` |
| `links.cards[0]` | kind `demo`, eyebrow `DESIGN DEMO`, label `設計稿 Demo`, description `原本交付的設計稿頁面，可以直接瀏覽。` | `465:764` |
| `links.cards[1]` | kind `live`, eyebrow `LIVE SITE`, label `正式網站`, description `目前上線中的版本。` | `465:770` |

| Card | URL |
|---|---|
| 設計稿 Demo | `http://demo.m000409.24241872.tw/demo/index.html` (plain `http` in Figma; see PO note) |
| 正式網站 | `https://www.jhanyu.com/` |

### 09 Next Project → `amd.yaml` `next`
| Field | Value | Node |
|---|---|---|
| `next.meta` (in `amd.yaml`) | `康健生醫　·　企業網站　·　UI 設計　·　互動設計　·　2024–2025` | `360:2235` |
| `next.oneLiner` (in `amd.yaml`) | `客群在海外，以英文開版避免換語系跑版；依客戶指定的內容與動態，重新設計產品區與描線產品圖。` | `360:2236` |

## Media slots
| Slot | Content field | Shape | Aspect ratio | `expectedFile` | Alt |
|---|---|---|---|---|---|
| Hero showcase | `hero.showcase` (`layout: single`, `objectPosition: top`) | composite | 1920 / 820 | `src/assets/projects/jhanyu/hero-showcase.jpg` | 展裕建設網站 PC 與手機案例展示 |
| Key main (video) | `keyScreens.main` | video | 16 / 9 | `public/media/jhanyu/key-main.mp4` | 展裕建設網站 PC 首頁捲動 |
| Close-up 1 | `keyScreens.closeups[0].media` | crop | 458.67 / 300 | `src/assets/projects/jhanyu/key-about.jpg` | 關於展裕區塊特寫 |
| Close-up 2 | `keyScreens.closeups[1].media` | crop | 458.67 / 300 | `src/assets/projects/jhanyu/key-projects.jpg` | 熱銷建案區塊特寫 |
| Close-up 3 | `keyScreens.closeups[2].media` | crop | 458.67 / 300 | `src/assets/projects/jhanyu/key-process.jpg` | 購屋簽約流程特寫 |
| Motion 1–2 (video) | `motion.steps[0–1].media` | video | 2528 / 1216 | `public/media/jhanyu/motion-1.mp4`, `motion-2.mp4` | 圖示化步驟／編號與版面節奏 |
| Visual Extension | `visualExtension` (`variant: mosaic`) | composite | 1920 / 1280 | `src/assets/projects/jhanyu/visual-mosaic.jpg` | 展裕建設網站頁面拼貼 |

## Layout notes (390)
Identical to SSS; no new component. Hero `484:1861` (×0.38), Key swipe row `484:1934`, Motion video `484:1960`, mosaic `484:1980` (×0.32).

## Figma reference images
1× full-frame exports: [desktop](jhanyu/figma-desktop.jpg), [mobile](jhanyu/figma-mobile.jpg).

## Notes for the Product Owner
- The 設計稿 Demo link is `http://` (not `https://`). Browsers may warn on it. If the demo host supports `https`, give Claude the `https` address.
