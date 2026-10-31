# Hwa Fong Tire spec sheet

Figma: desktop `360:1603`, mobile 390 `483:1298`. Transcribed by Claude on 2026-10-31 from the visible layers only. Hidden layers are never implemented (Q10).

Content file: `src/content/projects/hwa-fong.yaml`. Replace every `TODO(CONTENT)` in it with the values below. Leave `card`, `seo`, and `next` as they are. They are already correct, and `next` describes Hwa Fong on the 88Win page.

## Sections
| # | Section | Desktop node | Mobile node | Rendered |
|---|---|---|---|---|
| 01 | Hero | `360:1604` | `483:1310` | yes |
| 02 | Overview | `360:1640` | `483:1372` | yes |
| 03 | Key Screens | `360:1669` | `483:1402` | yes |
| 04 | Mobile / RWD | `360:1686` (hidden) | — | **no**: omit `mobile` |
| 05 | Interaction & Motion | `360:1718` | `483:1431` | yes |
| 06 | Details | `360:1733` (hidden) | — | **no**: omit `details` |
| 07 | Visual Extension (mosaic) | `360:1757` | `483:1457` | yes, `variant: mosaic` |
| 08 | Links | `360:1787` | `483:1475` | yes |
| 09 | Next Project → FITZONE | `360:1360` | `483:1496` | yes (from `fitzone.yaml`, not this file) |

The tone sequence comes from `assignTones()` after omissions. Do not hard-code tones for this page.

## Copy (verbatim)
Copy strings exactly as written here, including full-width characters (`，` `「」` `　`). `**…**` marks the brand-blue words (ARCHITECTURE §5.1 v1.4). `\n` is a hard line break that exists in Figma.

### 01 Hero
| Field | Value | Node |
|---|---|---|
| `hero.eyebrow` | `CASE STUDY 02 · 輪胎品牌` | `360:1605` |
| `hero.title` | `HWA FONG TIRE` | `360:1606` |
| `hero.headline` | `華豐輪胎**品牌網站**設計` | `360:1607` |
| `hero.subtitle` | `從「DURO for Durability」出發，把華豐輪胎可靠的品牌形象與二輪到四輪的完整產品線，整理成一個好找、好逛，也有品牌感的網站。` | `360:1608` |
| `hero.stats[0]` | label `ROLE`, value `UI / Interaction` | `360:1610` / `360:1609` |
| `hero.stats[1]` | label `PLATFORM`, value `品牌網站` | `360:1612` / `360:1611` |
| `hero.stats[2]` | label `STATUS`, value `已上線` | `360:1615` / `360:1614` |
| `hero.stats[3]` | label `YEAR`, value `2024–2025` (en dash) | `360:1618` / `360:1617` |

### 02 Overview
| Field | Value | Node |
|---|---|---|
| `overview.heading` | `可靠的品牌，\n**完整的產品線**` (YAML `\|-` block, two lines) | `360:1644` |
| `overview.blocks[0]` | title `背景`, body `客戶希望參考其他輪胎品牌的網站，要有方便的搜尋功能，盡可能呈現輪胎種類、清楚的胎紋與產品，同時傳達華豐輪胎可靠的品牌形象。` | `360:1650` / `360:1651` |
| `overview.blocks[1]` | title `過程`, body `一開始做得有點卡，找到方向後就順利很多。過程中一邊更認識各種輪胎，一邊把能互動探索的 Motion 融入其中，做得很享受。` | `360:1655` / `360:1656` |
| `overview.blocks[2]` | title `品牌與產品`, body `網站不斷強調「可靠」與豐富的產品線：用越野場景和標語建立品牌感，再用小 icon 區分胎種，讓五大類輪胎一目了然。` | `360:1660` / `360:1661` |
| `overview.outputs` | `[品牌網站, 互動設計]` | `360:1666`, `360:1668` |

The `OVERVIEW` eyebrow, the `01`–`03` numbers, and the `OUTPUT` label come from the template, as on 88Win.

### 03 Key Screens
| Field | Value | Node |
|---|---|---|
| `keyScreens.eyebrow` | `DESKTOP` | `360:1670` |
| `keyScreens.heading` | `**可靠**，從第一眼開始` | `360:1671` |
| `keyScreens.subtitle` | `首頁以越野場景和「DURO for Durability」開場，傳達耐用可靠的品牌印象；右側直接帶出主打輪胎，讓品牌與產品同時被看見。` | `360:1672` |
| `keyScreens.closeups[0]` | title `輪胎指南`, caption `大尺寸輪胎特寫，讓胎紋成為畫面的主角，並選用與輪胎搭配的照片加強選對輪胎的重要性。` | `360:1676` / `360:1677` |
| `keyScreens.closeups[1]` | title `五大胎種`, caption `從汽車到特殊用途，用小 icon 一眼分辨。` | `360:1680` / `360:1681` |
| `keyScreens.closeups[2]` | title `胎種專區`, caption `分類頁延續越野氛圍，產品和品牌感並存。` | `360:1684` / `360:1685` |

### 05 Interaction & Motion
| Field | Value | Node |
|---|---|---|
| `motion.eyebrow` | `INTERACTION & MOTION` | `360:1719` |
| `motion.heading` | `滾動，點亮 DURO` (no accent) | `360:1720` |
| `motion.subtitle` | `品牌識別是動態的重點。依照客戶提供的字母意義，用滾動一步步點亮品牌，讓「可靠」不只是一句標語。` | `360:1721` |
| `motion.steps[0]` | title `01　逐字點亮`, body `隨著滾動，DURO 的字母依序亮起，並帶出各自代表的單字與意義。` | `360:1725` / `360:1726` |
| `motion.steps[1]` | title `02　完整品牌`, body `每個字母都點亮後，整個 LOGO 一起亮起，呈現完整的品牌形象。` | `360:1728` / `360:1729` |
| `motion.steps[2]` | title `03　探索式互動`, body `產品與分類加入 Hover 回饋，讓逛輪胎更像在探索，而不只是查資料。` | `360:1731` / `360:1732` |

The space after the step number is a **full-width space** (`　`, U+3000) in Figma. Keep it.

### 08 Links
| Field | Value | Node |
|---|---|---|
| `links.eyebrow` | `FROM FIGMA TO LIVE` | `360:1788` |
| `links.heading` | `從設計稿到正式上線` | `360:1789` |
| `links.subtitle` | `想直接操作看看的話，這裡有 Figma 原型和正式網站。` | `360:1790` |
| `links.cards[0]` | kind `prototype`, eyebrow `FIGMA PROTOTYPE`, label `Figma 原型`, description `在 Figma 裡直接點擊操作，看網站的頁面與互動。` | `465:740` |
| `links.cards[1]` | kind `live`, eyebrow `LIVE SITE`, label `正式網站`, description `目前上線中的版本。` | `465:746` |
| `links.note` | none (do not add one) | — |

## Links (URLs)
| Card | URL |
|---|---|
| Figma 原型 | `https://www.figma.com/proto/nnprFxDKbj3ETdK4LEVGnI/m000470-%E8%8F%AF%E8%B1%90%E6%A9%A1%E8%86%A0%E5%B7%A5%E6%A5%AD%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8?page-id=&node-id=5555-5702&viewport=3910%2C-748%2C0.2&t=CART4LgcirHvOKuU-8&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=5555%3A6371&hide-ui=1` |
| 正式網站 | `https://www.duro.com.tw/` |

⚠️ These come from each card instance's **prototype "Open link" action**. The label text inside both cards still carries an old hyperlink to the **88Win** prototype, which was copied over with the component. Do not use that one.

## Media slots
All media is `status: pending` until the Product Owner delivers it. File names, Figma nodes, and export sizes are in [`docs/ASSETS.md` → 華豐輪胎](../ASSETS.md). `expectedFile` values must match it exactly.

| Slot | Content field | Shape | Aspect ratio | `expectedFile` | Alt |
|---|---|---|---|---|---|
| Hero showcase | `hero.showcase` (`layout: single`, one item, `objectPosition: top`) | composite | 1920 / 820 | `src/assets/projects/hwa-fong/hero-showcase.jpg` | 華豐輪胎 PC 與手機首頁案例展示 |
| Key main (video) | `keyScreens.main` | video | 16 / 9 | `public/media/hwa-fong/key-main.mp4` | 華豐輪胎 PC 首頁捲動 |
| Close-up 1 | `keyScreens.closeups[0].media` | crop | 458.67 / 300 | `src/assets/projects/hwa-fong/key-tire-guide.jpg` | 輪胎指南頁面特寫 |
| Close-up 2 | `keyScreens.closeups[1].media` | crop | 458.67 / 300 | `src/assets/projects/hwa-fong/key-tire-types.jpg` | 五大胎種分類特寫 |
| Close-up 3 | `keyScreens.closeups[2].media` | crop | 458.67 / 300 | `src/assets/projects/hwa-fong/key-tire-category.jpg` | 胎種專區頁面特寫 |
| Motion 1 (video) | `motion.steps[0].media` | video | 960 / 532 | `public/media/hwa-fong/motion-1.mp4` | DURO 字母逐字點亮動態 |
| Motion 2 (video) | `motion.steps[1].media` | video | 960 / 532 | `public/media/hwa-fong/motion-2.mp4` | DURO 完整品牌點亮動態 |
| Motion 3 (video) | `motion.steps[2].media` | video | 960 / 532 | `public/media/hwa-fong/motion-3.mp4` | 產品與分類 Hover 互動 |
| Visual Extension | `visualExtension` (`variant: mosaic`, one item) | composite | 1920 / 1280 | `src/assets/projects/hwa-fong/visual-mosaic.jpg` | 華豐輪胎網站頁面拼貼 |

- Alt text is not visible copy, so it is authored here rather than taken from Figma. Use it as written.
- Figma has one video frame in Interaction & Motion (`376:657`). As on 88Win, each step switches to its own video, so there are three files.
- The Next Project preview on this page is FITZONE's `card.jpg`, which `fitzone.yaml` already provides. Nothing to add here.

## Layout notes (390)
The page uses the template exactly as 88Win does after PR #17. No new component or variant is needed.
- **Hero** (`483:1310`): same structure as 88Win. The showcase is a full-bleed 390 × 312 window onto the same composite file (scale ×0.38, centred, clipped).
- **Key Screens** (`483:1402`): the main video is 350 × 197. The three close-ups are a **swipe row** (`483:1411`, full-bleed, first item at x 20, items 280 wide with 183-tall media), as on 88Win.
- **Motion** (`483:1431`): the video is 350 × 194 above a vertical step rail. This is the same template behaviour as 88Win, including the P2 rail item tracked from the PR #17 review.
- **Visual Extension** (`483:1457`): 390 × 410, the same mosaic file scaled ×0.32, centred and clipped.
- **Links** (`483:1475`): the cards stack (350 × 177 and 350 × 153).
- **Next** (`483:1496`): `FITZONE` is one word, so the name stays on one line next to the 64 px arrow.

## Figma reference images
1× exports by Claude, 2026-10-31. Use them for the "Figma vs page" table. Sections 04 and 06 are not rendered, so they have no images.

| # | Section | Desktop image | Mobile image |
|---|---|---|---|
| 01 | Hero | [desktop](hwa-fong/figma-01-hero-desktop.jpg) | [mobile](hwa-fong/figma-01-hero-mobile.jpg) |
| 02 | Overview | [desktop](hwa-fong/figma-02-overview-desktop.jpg) | [mobile](hwa-fong/figma-02-overview-mobile.jpg) |
| 03 | Key Screens | [desktop](hwa-fong/figma-03-key-screens-desktop.jpg) | [mobile](hwa-fong/figma-03-key-screens-mobile.jpg) |
| 05 | Interaction & Motion | [desktop](hwa-fong/figma-05-motion-desktop.jpg) | [mobile](hwa-fong/figma-05-motion-mobile.jpg) |
| 07 | Visual Extension | [desktop](hwa-fong/figma-07-visual-extension-desktop.jpg) | [mobile](hwa-fong/figma-07-visual-extension-mobile.jpg) |
| 08 | Links | [desktop](hwa-fong/figma-08-links-desktop.jpg) | [mobile](hwa-fong/figma-08-links-mobile.jpg) |
| 09 | Next Project | [desktop](hwa-fong/figma-09-next-desktop.jpg) | [mobile](hwa-fong/figma-09-next-mobile.jpg) |

## Notes for the Product Owner
- FITZONE's Next meta differs between frames: desktop `360:1368` uses `　·　` (full-width spaces), while mobile `483:1512` uses ` · `. The template renders one string. The FITZONE spec will follow the desktop text, as 88Win does, unless you say otherwise.
