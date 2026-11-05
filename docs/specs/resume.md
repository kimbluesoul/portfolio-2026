# Resume spec sheet (M4)

Design reference: [`public/files/Syuan-Ci-Resume.pdf`](../../public/files/Syuan-Ci-Resume.pdf), 2 pages (ARCHITECTURE §17 Q3). There is **no Figma frame** for this page; Figma `456:663` / `458:684` are job-site cover images, not this page. Transcribed by Claude on 2026-11-05.

Route `/resume/` (`src/pages/resume.astro`). Content file: `src/content/resume.yaml` (new; schema in ARCHITECTURE §5.1 "Resume content"). Product Owner decisions on 2026-11-05: content width about 1080 px, a 「下載 PDF」 button beside the title, the MINMAX project tags link to the case pages, and scroll reveals on.

## Character rule (read first)
The PDF's text layer uses **Kangxi radical code points** for many characters (for example `⾯` U+2F61 instead of `面` U+9762, `⼯` instead of `工`). **Never copy text out of the PDF.** Copy it from this sheet, which uses the standard characters. A unit test checks that `resume.yaml` contains no character in U+2E80–U+2FDF (CJK radicals).

Dots: `·` (U+00B7, with spaces) in Latin lines (`RESUME · 2026`); `・` (U+30FB, no spaces) between Chinese or mixed items, as the PDF shows them. Date ranges use an en dash with spaces: `2025.04 – 2026.09`.

## Sections
| # | Section | PDF | Reveal |
|---|---|---|---|
| 01 | Header (name, role, contact, 下載 PDF) | p1 top | **none** (same as every hero) |
| 02 | Summary + 4 fact cards | p1 | one group: summary, then the cards (stagger) |
| 03 | 工作經歷 EXPERIENCE (3 entries) | p1 | intro, then each entry |
| 04 | 其他經歷 EARLIER (2 entries) | p2 top | intro, then each entry |
| 05 | 專長與工具 SKILLS / 學歷與語言 EDUCATION (two columns) | p2 | one group each |
| 06 | 關於我 ABOUT (5 paragraphs) | p2 bottom | intro, then the text block |

The PDF page footers (`SYUAN CI · UI/UX DESIGNER`, `01 / 02`) are print artifacts and are **not** rendered. The site header and footer stay as on every page.

## Copy (verbatim, standard characters)

### 01 Header
| Field | Value | Note |
|---|---|---|
| `header.eyebrow` | `RESUME · 2026` | brand blue, letter-spaced label |
| `header.nameZh` | `周泫淇` | the page `h1` contains both names |
| `header.nameEn` | `Syuan Ci` | grey, smaller, same line |
| `header.role` | `UI/UX 設計師` | brand blue, bold |
| `header.focus` | `介面設計・互動設計・動態設計` | same line as the role |
| `header.email` | `kimbluesoul@gmail.com` | `mailto:` link (same address as `site.yaml` contact) |
| `header.location` | `台中市・可遠端工作` | grey |
| `header.download.label` | `下載 PDF` | PO 2026-11-05; links to `/files/Syuan-Ci-Resume.pdf` with `download` |

### 02 Summary and facts
`summary` (accent markup, ARCHITECTURE §5.1):

`具 **6 年以上** UI 與數位介面設計經驗，經手超過 15 個品牌與企業網站，以及跨 PC、H5、APP 的產品介面。習慣從需求溝通就開始參與、主動提出設計方向，一路做到**正式上線**；也擅長規劃網站的 **Motion 與互動**，並與前端密切溝通實作細節。`

`facts` (label / value):
| Label | Value |
|---|---|
| `EXPERIENCE` | `6 年以上` |
| `FOCUS` | `UI・Interaction・Motion` |
| `WORK STYLE` | `遠端協作經驗` |
| `AVAILABLE` | `錄取後一週到職` |

### 03 工作經歷
Section: heading `工作經歷`, eyebrow `EXPERIENCE`.

**Entry 1**
- period `2025.04 – 2026.09`, duration `1 年 6 個月`
- title `UI 設計師`, badge `遠端` (brand-blue outline pill)
- org `碼斯克科技探索有限公司`, industry `電腦軟體服務業`
- body: `以遠端方式參與娛樂平台與 APP 相關產品的 UI 介面與視覺設計，涵蓋 PC、H5 與 APP。整理跨裝置的介面規則與元件，讓不同平台的操作與視覺維持一致；依產品需求進行頁面規劃、介面設計與 Prototype 動效製作，並透過線上溝通與產品及前端工程師協作，完成設計交付與上線調整。同時負責 Banner、Icon、遊戲分類及活動視覺設計，並導入 AI 工具輔助素材生成與視覺延伸，提升設計效率。`

**Entry 2**
- period `2021.03 – 2025.04`, duration `4 年 2 個月`
- title `網頁設計師`
- org `雲端數位科技有限公司（MINMAX）`, industry `網際網路相關業`
- body: `負責品牌與企業網站專案，四年多參與超過 15 個案件，從需求確認到設計驗收的完整流程，包含客戶溝通、設計排程、首頁視覺提案、內頁與 RWD 介面設計，以及前端切版後的畫面驗收。案件涵蓋建設營造、科技電子、生技醫療、綠能與消費品牌等產業。除了介面設計，也負責規劃網站的 Motion 與互動效果，並與前端工程師密切溝通實作細節，確保上線成果符合設計。`
- projects (links, PO 2026-11-05), in this order:

  | Label | Case page |
  |---|---|
  | `華豐輪胎 DURO` | `hwa-fong` |
  | `FITZONE 健身房` | `fitzone` |
  | `寶舖建設 SSS 超透明提案` | `sss` |
  | `展裕建設` | `jhanyu` |
  | `康健生醫 AMD` | `amd` |
  | `匯發營造` | `huifa` |

**Entry 3**
- period `2018.12 – 2019.12`, duration `1 年 1 個月`
- title `UI/UX 設計師`
- org `新思路文創有限公司`, industry `電腦系統整合服務業`
- body: `負責 APP 與網頁介面設計，並設計粉絲專頁標誌、繪製貼圖，以及製作商品 Banner。`

### 04 其他經歷
Section: heading `其他經歷`, eyebrow `EARLIER`.

**Entry 1**
- period `2020.06 – 2020.11`, duration `6 個月`
- title `設計助理`
- org `布丁牛企業社`, industry `餐館業`
- body: `為各分店設計海報、菜單與文宣，經營官方 LINE 的形象、選單與圖文宣傳，並協助主管處理事務與文件整理。`

**Entry 2**
- period `2015.11 – 2017.04`, duration `學生工讀` (this line replaces the duration)
- title `影片剪輯`
- org `東海大學` (no industry)
- body: `拍攝並剪輯學校演講影片，上傳至學校平台。`

### 05 Skills and education
Left column: heading `專長與工具`, eyebrow `SKILLS`.
- group `SKILLS`: `UI 設計`, `Interaction`, `Motion`, `Prototype`, `RWD`, `設計規範與元件`
- group `TOOLS`: `Figma`, `Photoshop`, `Illustrator`, `HTML / CSS 基礎`, `AI 輔助工具`
- note: `熟悉 Figma 介面設計、Prototype 與元件製作，擅長規劃網站的動態與互動效果；具 HTML／CSS 基礎概念，能理解前端實作方式並與工程師溝通。`

Right column: heading `學歷與語言`, eyebrow `EDUCATION`.
- block `EDUCATION`: title `私立東海大學`; lines `資訊工程系 數位創意組｜大學畢業`, `2013.09 – 2017.06`
- block `LANGUAGE`: title `英文`, value `聽、說、讀、寫：中等` (one line, a gap between them as in the PDF)
- block `LOOKING FOR`: title `UI/UX 設計師、網頁設計師、產品設計師`; line `全職｜台中市或遠端工作`

### 06 關於我
Section: heading `關於我`, eyebrow `ABOUT`. `about` is one string with paragraphs separated by a blank line (YAML `|-`, rendered like the Home About body):

1. `你好，我是泫淇，目前主要從事 UI 與視覺設計相關工作。大學就讀資訊工程系，一開始是因為喜歡遊戲與數位內容而選擇這個科系，後來在課程中接觸到使用者體驗與介面設計，才慢慢發現自己真正有興趣的方向是設計。雖然最後沒有往程式開發發展，但資訊背景讓我在與前端工程師合作時，比較能理解設計實際製作與落地時會遇到的問題。`
2. `過去幾年的工作經驗主要涵蓋網站、RWD、數位平台與 APP UI。早期以網站專案為主，從收到案件後與客戶確認需求、安排設計時程、提出首頁提案，到延伸內頁與 RWD 設計，前端切版完成後也會再進行畫面驗收與修改。這段經驗讓我熟悉一個網站從需求確認到實際完成的流程，也累積了不少與客戶溝通及整理需求的經驗；我也特別喜歡替網站規劃動態，讓內容的進場與轉場更有節奏、更好閱讀。`
3. `後來的工作則以遠端方式，接觸到更多不同平台的 UI 與視覺設計，包含 PC、H5、Mobile、APP、Prototype、活動視覺與 Icon 等，也需要和產品及前端工程師一起討論與調整。比起單純完成一張畫面，我會比較在意整體的視覺是否一致、資訊是否清楚，以及最後實際做出來的效果是不是符合原本的設計。`
4. `這幾年隨著 AI 工具快速發展，我也開始把 AI 加進自己的工作流程，用來協助素材製作、視覺方向探索與一些重複性的工作。對我來說它是一個提高效率的工具，但最後該怎麼取捨、怎麼讓畫面變得更完整，還是需要設計本身的判斷。平常喜歡畫畫、看電影、玩遊戲，也習慣看看不同網站、APP 或其他設計作品，這些一直都是很自然的靈感來源。`
5. `未來我希望繼續往 UI 與數位產品設計發展。比起只把畫面做完，我更希望參與產品從需求、設計到實際上線的過程，也持續累積自己在介面、互動與產品判斷上的能力。`

### SEO
- `seo.title`: `履歷｜周泫淇 Syuan Ci` (the current page title)
- `seo.description`: the summary above without the `**` markers.

## Links
| Element | href | Notes |
|---|---|---|
| Email | `mailto:kimbluesoul@gmail.com` | |
| 下載 PDF | `/files/Syuan-Ci-Resume.pdf` | `download` attribute; same tab |
| Project tags (6) | `/work/<slug>/` | internal links, same tab |

## Media
None. No images or videos on this page.

## Layout (desktop, from the PDF)
- **Content width**: about 1080 px, centred (PO 2026-11-05). One new layout token, e.g. `--layout-resume-content: 67.5rem`, beside the existing layout widths. Side gutters as on the case pages below that width.
- **Header**: two columns. Left: eyebrow, then `周泫淇` large and bold with `Syuan Ci` smaller and grey on the same baseline, then the role line (`UI/UX 設計師` brand blue bold + focus). Right, right-aligned and bottom-aligned with the role line: email, location, then the 下載 PDF button (the site's existing outline-pill style, e.g. the footer contact pills, with its existing hover). A hairline below the header.
- **Summary**: body text, the accent words brand blue and bold, as in the PDF.
- **Facts**: four equal cards in a row on `--color-bg-subtle` with the card radius; label small, letter-spaced, grey; value bold.
- **Section intro** (03–06): `h2` (bold Chinese) + eyebrow (brand blue, letter-spaced) on one line, then a 2 px dark rule.
- **Entry row**: a fixed left column (period, then duration in grey) and a right column (title `h3` + optional badge; org ｜ industry in grey; body; then project tags). A hairline between entries.
- **Tags**: the existing tag-chip look (thin grey border, no fill). The six project tags are links: on hover / focus-visible they take the site's link hover (brand colour), using the 250 ms ease-out tokens.
- **Skills / education**: two equal columns, each with its own section intro and rule. Group labels (`SKILLS`, `TOOLS`, `EDUCATION`, `LANGUAGE`, `LOOKING FOR`) are brand-blue letter-spaced labels.
- **About**: full width, paragraphs with a gap between them.
- Type sizes come from the existing tokens (case body, caption, heading, label, tag). Map each PDF style to the nearest existing token. A new token is allowed only where none fits, and the PR lists it under "Deviations".

## Layout (mobile, below the 48rem switch)
No 390 design exists. Q3: mobile **stacks** the two-column rows.
- Header: one column. Name block, role line, then email, location, 下載 PDF, all left-aligned.
- Facts: 2 × 2 grid.
- Entry row: period and duration above the title, on one line (`2025.04 – 2026.09 · 1 年 6 個月` style is not required; two short lines are fine).
- Skills and education: stacked, skills first.
- Tags wrap. Nothing overflows between 360 and 390 px (ARCHITECTURE §10).

## Acceptance and scope
**Behavior**
- [ ] 390, the 48rem switch point, and 1920 render as described above; at 1920 the content is about 1080 px wide and centred; at 360 nothing overflows or clips.
- [ ] One `h1` (`周泫淇 Syuan Ci`); section headings are `h2`; entry titles are `h3`.
- [ ] 下載 PDF downloads `/files/Syuan-Ci-Resume.pdf`; the email opens `mailto:`; each project tag opens its case page.
- [ ] Reveals: sections 02–06 reveal with the standard grouped reveal (DESIGN_SYSTEM → Motion: fade + rise, 80 ms stagger, max 4); the header does not animate. Under reduced motion everything is visible at once.
- [ ] Hover and focus-visible on the download button and the project tags; tap targets ≥ 44 × 44 px.

**Sources**
- [ ] Every string comes from this sheet, in `resume.yaml`; none is hard-coded in components. No CJK radical code points (unit test).
- [ ] Project tag targets are slugs validated by the schema, so a renamed slug fails the build.

**Gates**
- [ ] axe: no serious / critical issues on `/resume/`.
- [ ] Every text node renders in a self-hosted font (the existing E2E font test covers `/resume/`); new 700-weight selectors are added to `WEIGHT_SELECTORS`.
- [ ] Lighthouse on `/resume/` stays inside §13 (fonts ≤ 400 KB).

**Out of scope**
- Print styles and a generated PDF (the PDF stays the PO's file).
- English version, photos, icons, or any content not in the PDF.
- Changing the Home About or footer resume links (they already point to `/resume/`).
- The PDF page footers.
