# Home — verbatim copy and assets (source of truth for M1)

- Prepared by: Claude (Architect), from Figma file `gNIygsBj4ODtt5gyY2Twij` via the Figma MCP, 2026-10-30
- Desktop `360:3`, mobile `474:1057`. Desktop and mobile copy are identical unless noted.
- Rule (ARCHITECTURE §5.1): use these strings **exactly**, including punctuation (full-width `，。；「」・`, en dash `–` in years, em dash `—` in card headings, `’` in `I’M`).

## Navigation (`360:3438`, mobile `473:913`)
- Logo: `src/assets/site/logo.svg` (vector, 90.64 × 44, stroke `#1F3BD6`; use as `<img alt="Syuan Ci">` inside the home link)
- Items: `Work` (active state on home) · `About` · `Contact`

## Hero (`360:5`)
| Node | Text |
|---|---|
| `360:7` | HELLO, I’M SYUAN CI |
| `360:8` | 設計畫面，⏎也設計畫面之間的**瞬間**。 (line break after「，」; 「瞬間」 in `--color-text-brand`) |
| `360:9` | 專注於介面設計、互動與動態視覺，將靜態畫面延伸成清晰、直覺且富有節奏的數位體驗。 |
| `360:13` / `360:14` | EXPERIENCE / 6 年以上 UI 與數位介面設計 |
| `360:16` / `360:17` | FOCUS / 介面設計・互動設計・動態設計・原型設計 |
| `360:19` / `360:20` | CURRENTLY / Available for opportunities |
| `360:25` | SELECTED WORK ↓ |

## Project cards (`360:84`, mobile `474:1085`)
Heading format: `NN — Name` (Instrument Sans) + `nameZh` (Noto Sans TC Bold). Tags are thin-border chips (Noto Sans TC **Medium 500** for Chinese, Instrument Sans Medium for years).

| # | Heading | nameZh | Summary | Tags |
|---|---|---|---|---|
| 01 | 01 — 88Win | 線上娛樂城 | 整理 PC、H5 與 App 的介面規則，讓不同裝置上的操作與視覺維持一致 | 已上線 · UI設計 · 互動設計 · PC / H5 / App · 2025–2026 |
| 02 | 02 — Hwa Fong Tire | 華豐輪胎 | 以「DURO for Durability」為核心，呈現華豐輪胎可靠的品牌形象與完整產品線，並加入可探索的互動與 Motion。 | 已上線 · UI設計 · 互動設計 · 品牌網站 · 2024–2025 |
| 03 | 03 — FITZONE | 健身房 | 從介面設計到 Motion 都一起處理，最後也真的落地到正式網站，不是只停在 Figma 裡 | 已上線 · UI設計 · Motion · 品牌網站 · 2024–2025 |
| 04 | 04 — SSS | 超透明提案 | 把一張主視覺拆開讓它動起來，再用視差滾動讓每次滑動都有新內容，讓建築展變得想看、也想互動。 | 已上線 · UI設計 · 互動設計 · 活動頁面 · 2024–2025 |
| 05 | 05 — JHANYU | 展裕建設 | 延伸 Logo 的斜角與亮橘色，用大面積色塊撐起品牌感，也把繁多的服務流程整理得清楚又不單調。 | 已上線 · UI設計 · 品牌延伸 · 企業網站 · 2024–2025 |
| 06 | 06 — AMD | 康健生醫 | 客群在海外，以英文開版避免換語系跑版；依客戶指定的內容與動態，重新設計產品區與描線產品圖。 | 已上線 · UI設計 · 互動設計 · 企業網站 · 2024–2025 |
| 07 | 07 — HUIFA | 匯發營造 | 客戶不想要一般網站的瀏覽方式，於是像排投影片一樣，設計每段內容怎麼進場、怎麼轉到下一段。 | 已上線 · UI設計 · Motion · 企業網站 · 2024–2025 |

Notes:
- `name` for SSS is `SSS` (not `SSS 1.0`) in both frames.
- 01 and 03 summaries have **no** final「。」 in Figma. Keep them as is.
- The hidden tag 「網站」 in the 88Win card (`465:957`) is not rendered (hidden layers are never implemented).

### Card images
| Project | File | Source node | Size (1×) | Desktop media box | Mobile media box |
|---|---|---|---|---|---|
| 88Win (featured) | `src/assets/projects/88win/card.jpg` | `465:999` → `465:927` | 1728 × 500 | 1728 × 500, radius 20 | 350 × 200: **center crop** (`object-fit: cover; object-position: center`), matching `474:1087` |
| Others | `src/assets/projects/<slug>/card.jpg` | `465:1080`, `465:1149`, `465:1218`, `465:1293`, `465:1363`, `465:1432` | 844 × 400 | 844 × 400, radius 20 | 350 × 166 (same 2.11 ratio) |

- Exported as flattened 1× renders, because the Figma MCP does not export above 1×. Rounded corners are pre-filled with `#F3F3F3`. Apply the 20 px radius in CSS.
- The Product Owner may later overwrite these files with 2× exports (Figma → Export → JPG/PNG 2x) **using the same filenames**. No code change is needed.
- Alt text: `<Name> 網站作品預覽` (e.g. `華豐輪胎網站作品預覽`). This is not visible copy.

## About (`451:662`)
| Node | Text |
|---|---|
| `451:666` | ABOUT |
| `451:667` | 從需求到上線，⏎**把畫面做到會動** (second line in `--color-text-brand`) |
| `451:670` | 我是 Syuan Ci，具 6 年以上 UI 與數位介面設計經驗。習慣從需求溝通就開始參與，主動提出設計方向，一路做到正式上線，不只停在 Figma 裡。 |
| `451:671` | Motion 是我最喜歡的部分：拆解主視覺、安排內容怎麼進場與轉場，並和前端密切溝通實作細節，讓網站不只好看，也好逛、讓人記得住。 (`--color-text-secondary`) |
| `451:674` + tags | TOOLS: Figma · Photoshop · Illustrator |
| `451:682` + tags | SKILLS: UI · Interaction · Motion · Prototype |
| `465:666` | Primary pill: `View Resume` + `↗` → links to `/resume/` |

## Footer (`360:3419`, component `221:2`, mobile `473:921`)
| Node | Text / target |
|---|---|
| `212:209` | Thanks for scrolling. |
| `212:210` | Based in Taiwan, Feel free to get in touch. |
| `466:910` | BACK TO TOP ↑ → `#top` (scroll to page top) |
| `466:924` | Email pill: `src/assets/site/icon-email.svg` + `Email` → `mailto:kimbluesoul@gmail.com` (address from the resume PDF) |
| `466:937` | LinkedIn pill: `src/assets/site/icon-linkedin.svg` + `LinkedIn` → `https://www.linkedin.com/in/syuanci-chou-design` (supplied by the Product Owner, 2026-10-30), new tab |
| `212:220` | © 2026 SYUAN CI |
| `466:913` | VIEW RESUME → **`/resume/`** |

⚠️ In Figma, the `VIEW RESUME` link (`466:913`) points to `https://www.fardinevanlimon.app/image/Fardin_Resume.pdf`, which is a leftover from a template and **not** the Product Owner's resume. Never use it.

## SEO (Product Owner, 2026-10-30)
| Page | Title | Description |
|---|---|---|
| Home | 周泫淇 Syuan Ci｜UI/UX 設計師作品集 | 具 6 年以上 UI 與數位介面設計經驗，專注於介面設計、互動與動態視覺，將靜態畫面延伸成清晰、直覺且富有節奏的數位體驗。 |
| Case study | `{nameZh} {name}｜周泫淇 Syuan Ci` (e.g. 華豐輪胎 Hwa Fong Tire｜周泫淇 Syuan Ci) | The project's card summary |
| Resume | 履歷｜周泫淇 Syuan Ci | Same as home |
