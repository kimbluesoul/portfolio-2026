# 素材匯出清單（Product Owner 用）

> 這份是給 Product Owner 的素材待辦清單：每個檔案要從 Figma 哪個節點匯出、存成什麼檔名、多大尺寸。
> 技術規則的正式版本在 [ARCHITECTURE §9](ARCHITECTURE.md#9-asset-strategy)（v1.5）。兩邊不一致時以 ARCHITECTURE 為準，並請告訴 Claude。
> 每次 build 印出的 **pending-asset report** 會列出所有還沒交的檔案，可以拿來對照。

## 共通規則

| 項目 | 規則 |
|---|---|
| 檔名 | 全小寫英文、單字之間用 `-`，例如 `key-navigation.jpg`。**請照下表一字不差**，程式會依檔名自動找檔案。 |
| 圖片倍率 | Figma 匯出設定選 **2x**。下表的「匯出尺寸」就是 2x 之後的像素。 |
| 圖片格式 | 截圖、照片類用 **JPG**（品質約 90）；扁平 UI、元件規格圖用 **PNG**。 |
| 色彩 | sRGB（Figma 預設即可）。 |
| 單檔上限 | 圖片 6 MB。 |
| 影片 | **MP4（H.264）**、**不要有聲音軌**、長度 ≤ 20 秒、24–30 fps。大小上限見下表。如果只能匯出 .mov 或檔案太大，直接交原檔，Claude 會轉檔壓縮。 |
| 影片封面（poster） | 每支影片都要一張封面圖，檔名＝影片檔名＋`-poster.jpg`，通常用影片第一格畫面。 |
| 換檔 | 之後要替換已上線的影片時，檔名要加版本：`motion-1.v2.mp4`。圖片直接同名覆蓋即可。 |

### 匯出方式（三種）
1. **整張合成圖**：直接選取下表的 Frame 匯出。手機版用同一張圖縮放裁切，**不用另外匯出手機版**。
2. **裁切框**：選取下表的 Frame 匯出（Frame 會把超出的部分裁掉，匯出的就是頁面上看到的範圍）。Desktop 和手機比例相同，**只要一張**。
3. **元件規格圖（Details）**：只匯出卡片裡「圖」的部分，上方的小標、標題、說明文字由網頁排版，**不要包進圖裡**。手機版 390 的排列和 Desktop 不同，所以 **Desktop、手機各一張**。Desktop 卡片裡的圖沒有獨立 Frame 的，請用 Slice（快捷鍵 S）框出下表的範圍，或先把那些圖層包成 Frame 再匯出。

## 交件方式
把檔案依專案放進一個資料夾（例如 `桌面\portfolio-assets\88win\`），然後跟 Claude 說「素材放好了」和資料夾位置。Claude 會檢查尺寸與檔名，開一個 assets PR 放進網站。

**交原檔就好**：影片可以直接交螢幕錄影原檔（有聲音、很長、很大都沒關係）。Claude 會用 ffmpeg 去聲音、剪長度、壓縮，並從第一格產生封面圖。所以你**不用自己做封面圖、不用自己壓縮**。如果只想用影片的某一段，在檔名或訊息裡寫「從第幾秒到第幾秒」即可。

---

## 首頁卡片（`home`）

2026-10-31 已交件並放進網站（ADR-0013）。首頁每張卡片都是影片，**捲到時播一次，桌機滑鼠移過去會重播，手機捲回來會重播**。

2026-11-05 換成重新錄製的桌機影片（`home/<專案>_desktop.mp4`，與各案例頁 Key Screens 主影片同一份錄影）；88Win 精選卡只換 PC 影片，手機影片不變。底部「下一個作品」的框比卡片大（1920 螢幕上 1440 寬），1280 寬的卡片影片會被放大變糊，所以改用各案例頁 1920 寬的 Key Screens 主影片（`key-main.mp4`）。

| 專案 | 交件原檔 | 網站檔案 | 處理 |
|---|---|---|---|
| 88Win（精選卡） | `88win_bg.jpg` | `src/assets/projects/88win/card-bg.jpg` | 原檔 3456 × 1000 |
| 88Win（精選卡） | `88win_desktop.mp4` | `public/media/88win/card-pc.v2.mp4` ＋ `card-pc-poster.jpg` | 前 10 秒、1280 寬 |
| 88Win（精選卡） | `88win_moblie.mp4` | `public/media/88win/card-mobile.mp4` ＋ `card-mobile-poster.jpg` | 從黑底裁出手機（含外框）、320 × 660 |
| 華豐輪胎 | `duro_desktop.mp4` | `public/media/hwa-fong/card.v2.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| FITZONE | `fitzone_desktop.mp4` | `public/media/fitzone/card.v2.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| SSS | `sss_desktop.mp4` | `public/media/sss/card.v2.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| 展裕建設 | `jhanyu_desktop.mp4` | `public/media/jhanyu/card.v2.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| AMD | `amd_desktop.mp4` | `public/media/amd/card.v2.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| 匯發營造 | `huifa_desktop.mp4` | `public/media/huifa/card.v2.mp4` ＋ `card-poster.jpg` | 全長 8 秒 |

之後的建議命名（Claude 收到後也會自己改名，所以不照著命名也沒關係）：資料夾用專案代號（`88win`、`hwa-fong`…），首頁卡片影片叫 `card.mp4`；精選卡的三個圖層叫 `card-bg.jpg`、`card-pc.mp4`、`card-mobile.mp4`。

---

## 88Win（`88win`）

Figma：Desktop `360:251`／Mobile `475:953`。
圖片放 `src/assets/projects/88win/`，影片放 `public/media/88win/`（交件時都放同一個資料夾即可，Claude 會分好）。

**進度（2026-11-01 收到第一批）：**
- 已上線：#1 Hero（Claude 依 `360:270` 合成背景）、#2–4 主要畫面特寫、#5 H5 首頁（合成到面板底色）、#8 拼貼、#9 ICON、#11 CATEGORY、#12 CARD（Claude 依 `360:991` 用 6 張零件合成，透明底）、#14 BUTTON、#15 NAVIGATION、#16 PC 首頁捲動影片。
- 元件規格的手機版：產品負責人決定先沿用桌機圖（ICON、CATEGORY、CARD、BUTTON、NAVIGATION），手機版圖片到了再換回。期間 88Win 390 的 Details 高度閘門暫停比對（`tests/e2e/smoke.spec.ts` 標為 interim）。
- App 與遊戲列表兩格改用影片（`panel_app.mp4`、`panel_game.mp4`，裁掉黑底、套手機外框遮罩），取代 #6、#7 的靜態圖。
- 元件規格的手機版（2026-11-05 現況）：390 一律沿用桌機圖，已不列為待補素材（網站目前沒有任何待補素材或 `TODO(CONTENT)`）。之後如果要換成手機版構圖，再交 #9、#11–14 的手機檔即可，程式不用改（`mobileMedia`）。
- H5 首頁畫面清晰度（2026-11-05，產品負責人決定維持現狀）：Figma 裡的 H5 手機截圖本身只有約 491 px 寬（2 倍需要 558 px），App／遊戲列表兩支錄影裡的手機畫面也一樣約 490 px。1 倍螢幕上已接近極限；要更清楚，只能交 3x 的原始設計稿，或用更大尺寸重錄。

### 圖片

| # | 區塊 | 檔名 | Figma 節點（Desktop） | 匯出方式 | 匯出尺寸（2x） | 備註 |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero-showcase.jpg` | `360:270` Hero showcase | 整張合成圖 | 3840 × 1840 | PC 畫面＋手機一起匯出。網頁只顯示上方 820 px 高的部分（和 Figma 一樣）。手機版 `475:994` 是同一張縮小。 |
| 2 | 主要畫面 | `key-navigation.jpg` | `360:317` Navigation close-up | 裁切框 | 918 × 600 | |
| 3 | 主要畫面 | `key-promotion.jpg` | `360:321` Promotion close-up | 裁切框 | 918 × 600 | |
| 4 | 主要畫面 | `key-game-content.jpg` | `360:325` Game Content close-up | 裁切框 | 918 × 600 | |
| 5 | Mobile／RWD | `mobile-h5-home.jpg` | `360:333` Panel / H5 首頁 | 裁切框 | 918 × 1380 | 含手機外框與底色 |
| 6 | Mobile／RWD | `mobile-app.jpg` | `360:342` Panel / App 實機 | 裁切框 | 916 × 1380 | 同上 |
| 7 | Mobile／RWD | `mobile-game-list.jpg` | `360:352` Panel / 遊戲列表 | 裁切框 | 918 × 1380 | 同上 |
| 8 | Visual Extension | `visual-mosaic.jpg` | `360:1297` Mosaic band | 整張合成圖 | 3840 × 2560 | 傾斜拼貼整片一起匯出。手機版 `476:1866` 是同一張縮小。 |

### 元件規格圖（Details，PNG，每項兩張）

Desktop 的「範圍」是相對於該張卡片左上角的座標（x, y, 寬 × 高），用 Slice 框這個範圍即可。

| # | 卡片 | Desktop 檔名 | Desktop 來源 | 尺寸（2x） | 手機檔名 | 手機來源 | 尺寸（2x） |
|---|---|---|---|---|---|---|---|
| 9 | ICON | `detail-icon.png` | `360:403`（已是獨立 Frame） | 1274 × 1100 | `detail-icon-mobile.png` | `476:1002` | 620 × 468 |
| 10 | CATEGORY | `detail-category.png` | `360:785` 範圍 (32, 160) 640 × 134 | 1280 × 268 | `detail-category-mobile.png` | `476:1281` Category grid | 620 × 536 |
| 11 | CARD | `detail-card-lead.png` + `detail-card-rest.png`（2026-11-06 拆開，說明文字改為網頁文字，見 `specs/88win.md`） | `650:1560` 與右側卡片 | 780 × 426、1784 × 600 | `detail-card-lead-mobile.png` + `detail-card-rest-mobile.png` | `476:1490`、`476:1518`–`476:1569` | 620 × 358、620 × 950 |
| 12 | HEADER | `detail-header.png` | `360:1051` 範圍 (32, 184) 373 × 148 | 746 × 296 | `detail-header-mobile.png` | `476:1634` Headers | 620 × 225 |
| 13 | BUTTON | `detail-button.png` | `360:1057` 範圍 (32, 165) 399 × 187 | 798 × 374 | `detail-button-mobile.png` | `476:1794` Buttons | 613 × 274 |
| 14 | NAVIGATION | `detail-navigation.png` | `360:1080` Tab Bar | 786 × 210 | `detail-navigation-mobile.png` | `476:1820` Tab Bar | 620 × 166 |

### 影片

| # | 區塊 | 影片檔名 | 內容 | 尺寸 | 大小（目標／上限） | 封面檔名（2x） |
|---|---|---|---|---|---|---|
| 15 | 主要畫面 | `key-main.mp4` | PC 首頁捲動（Figma `360:316`） | 1440 × 810 | 5 MB／8 MB | `key-main-poster.jpg` 2880 × 1620 |
| 16 | Interaction & Motion | `motion-1.mp4` | 01 滑入遊戲類別 | 960 × 532 | 2.5 MB／4 MB | `motion-1-poster.jpg` 1920 × 1064 |
| 17 | Interaction & Motion | `motion-2.mp4` | 02 選擇廠商／遊戲 | 960 × 532 | 2.5 MB／4 MB | `motion-2-poster.jpg` 1920 × 1064 |
| 18 | Interaction & Motion | `motion-3.mp4` | 03 進入遊戲 | 960 × 532 | 2.5 MB／4 MB | `motion-3-poster.jpg` 1920 × 1064 |

Interaction & Motion 在 Figma 只有一個影片框（`360:365`），網頁上點選 01／02／03 時會切換成對應的影片，所以需要三支。

### 首頁卡片（選做）
`card.jpg` 已經有 1x 版本，網站可以正常顯示。若要更清晰，請匯出 2x 版本，**同名覆蓋** `card.jpg`（寬度上限 2880 px）。其他 6 個專案的 `card.jpg` 也一樣。

COLOR 色票已改由 HTML／CSS 繪製，不需匯出圖片。

**88Win 合計：圖片 24 張（8 張畫面＋12 張元件規格＋4 張影片封面）、影片 4 支。**

---

## 華豐輪胎 Hwa Fong Tire（`hwa-fong`）

Figma：Desktop `360:1603`／Mobile `483:1298`。規格表：[`docs/specs/hwa-fong.md`](specs/hwa-fong.md)。
圖片放 `src/assets/projects/hwa-fong/`，影片放 `public/media/hwa-fong/`（交件時都放同一個資料夾即可）。
這個專案**沒有** Mobile／RWD 和 Details 區塊（Figma 裡是隱藏的），所以沒有手機面板圖和元件規格圖。

### 圖片

| # | 區塊 | 檔名 | Figma 節點（Desktop） | 匯出方式 | 匯出尺寸（2x） | 備註 |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero-showcase.jpg` | `360:1622` Hero showcase | 整張合成圖 | 3840 × 1840 | PC 畫面＋手機一起匯出。網頁只顯示上方 820 px 高的部分。手機版 `483:1338` 是同一張縮小。 |
| 2 | 主要畫面 | `key-tire-guide.jpg` | `360:1674`（輪胎指南） | 裁切框 | 918 × 600 | Figma 圖層名稱是 Navigation close-up |
| 3 | 主要畫面 | `key-tire-types.jpg` | `360:1678`（五大胎種） | 裁切框 | 918 × 600 | 圖層名稱是 Promotion close-up |
| 4 | 主要畫面 | `key-tire-category.jpg` | `360:1682`（胎種專區） | 裁切框 | 918 × 600 | 圖層名稱是 Game Content close-up |
| 5 | Visual Extension | `visual-mosaic.jpg` | `360:1758` Mosaic band | 整張合成圖 | 3840 × 2560 | 15 張頁面拼貼整片一起匯出。手機版 `483:1459` 是同一張縮小。 |

### 影片

| # | 區塊 | 影片檔名 | 內容 | 尺寸 | 大小（目標／上限） | 封面檔名（2x） |
|---|---|---|---|---|---|---|
| 6 | 主要畫面 | `key-main.mp4` | PC 首頁捲動（Figma `360:1673`） | 1440 × 810 | 5 MB／8 MB | `key-main-poster.jpg` 2880 × 1620 |
| 7 | Interaction & Motion | `motion-1.mp4` | 01 逐字點亮 | 960 × 532 | 2.5 MB／4 MB | `motion-1-poster.jpg` 1920 × 1064 |
| 8 | Interaction & Motion | `motion-2.mp4` | 02 完整品牌 | 960 × 532 | 2.5 MB／4 MB | `motion-2-poster.jpg` 1920 × 1064 |
| 9 | Interaction & Motion | `motion-3.mp4` | 03 探索式互動 | 960 × 532 | 2.5 MB／4 MB | `motion-3-poster.jpg` 1920 × 1064 |

Interaction & Motion 在 Figma 只有一個影片框（`376:657`），和 88Win 一樣，點選 01／02／03 會切換成對應的影片，所以需要三支。如果 01 和 02 其實是同一段捲動錄影，可以剪成兩段。

**華豐輪胎合計：圖片 9 張（5 張畫面＋4 張影片封面）、影片 4 支。**

---

## FITZONE（`fitzone`）

Figma：Desktop `360:1373`／Mobile `484:1339`。規格表：[`docs/specs/fitzone.md`](specs/fitzone.md)。
圖片放 `src/assets/projects/fitzone/`，影片放 `public/media/fitzone/`（交件時都放同一個資料夾即可）。
這個專案和華豐輪胎一樣，**沒有** Mobile／RWD 和 Details 區塊（Figma 裡是隱藏的）。

### 圖片

| # | 區塊 | 檔名 | Figma 節點（Desktop） | 匯出方式 | 匯出尺寸（2x） | 備註 |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero-showcase.jpg` | `360:1392` Hero showcase | 整張合成圖 | 3840 × 1840 | PC 畫面＋手機一起匯出。網頁只顯示上方 820 px 高的部分。手機版 `484:1379` 是同一張縮小。 |
| 2 | 主要畫面 | `key-heartbeat.jpg` | `360:1444`（品牌 O 裡的心跳） | 裁切框 | 918 × 600 | Figma 圖層名稱是 Navigation close-up |
| 3 | 主要畫面 | `key-brand.jpg` | `360:1451`（品牌與特色） | 裁切框 | 918 × 600 | 圖層名稱是 Promotion close-up |
| 4 | 主要畫面 | `key-classes.jpg` | `360:1455`（團體課程） | 裁切框 | 918 × 600 | 圖層名稱是 Game Content close-up |
| 5 | Visual Extension | `visual-mosaic.jpg` | `360:1531` Mosaic band | 整張合成圖 | 3840 × 2560 | 13 張頁面拼貼整片一起匯出。手機版 `484:1486` 是同一張縮小。 |

### 影片

| # | 區塊 | 影片檔名 | 內容 | 尺寸 | 大小（目標／上限） | 封面檔名（2x） |
|---|---|---|---|---|---|---|
| 6 | 主要畫面 | `key-main.mp4` | PC 首頁捲動（Figma `360:1443`） | 1440 × 810 | 5 MB／8 MB | `key-main-poster.jpg` 2880 × 1620 |
| 7 | Interaction & Motion | `motion-1.mp4` | 01 心跳識別 | 960 × 532 | 2.5 MB／4 MB | `motion-1-poster.jpg` 1920 × 1064 |
| 8 | Interaction & Motion | `motion-2.mp4` | 02 俐落進場 | 960 × 532 | 2.5 MB／4 MB | `motion-2-poster.jpg` 1920 × 1064 |
| 9 | Interaction & Motion | `motion-3.mp4` | 03 鮮明回饋 | 960 × 532 | 2.5 MB／4 MB | `motion-3-poster.jpg` 1920 × 1064 |

Interaction & Motion 在 Figma 只有一個影片框（`360:1495`），和 88Win、華豐輪胎一樣，點選 01／02／03 會切換成對應的影片，所以需要三支。影片可以直接交螢幕錄影原檔，封面圖由 Claude 從第一格產生。

**FITZONE 合計：圖片 9 張（5 張畫面＋4 張影片封面）、影片 4 支。**

---

## SSS 超透明提案（`sss`）

Figma：Desktop `360:1814`／Mobile `484:1580`。規格表：[`docs/specs/sss.md`](specs/sss.md)。
圖片放 `src/assets/projects/sss/`，影片放 `public/media/sss/`（交件時都放同一個資料夾即可）。
沒有 Mobile／RWD 和 Details 區塊（Figma 裡是隱藏的）。

### 圖片

| # | 區塊 | 檔名 | Figma 節點（Desktop） | 匯出方式 | 匯出尺寸（2x） | 備註 |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero-showcase.jpg` | `360:1833` Hero showcase | 整張合成圖 | 3840 × 1840 | PC 畫面＋手機一起匯出，網頁只顯示上方 820 px。手機版用同一張縮小。 |
| 2 | 主要畫面 | `key-intro.jpg` | `360:1885`（展覽介紹） | 裁切框 | 918 × 600 |  |
| 3 | 主要畫面 | `key-journey.jpg` | `360:1889`（展覽旅程） | 裁切框 | 918 × 600 |  |
| 4 | 主要畫面 | `key-transparency.jpg` | `360:1893`（建物知情權） | 裁切框 | 918 × 600 |  |
| 5 | Visual Extension | `visual-mosaic.jpg` | `360:1969` Mosaic band | 整張合成圖 | 3840 × 2560 | 拼貼整片一起匯出，手機版用同一張縮小。 |

### 影片

| # | 區塊 | 影片檔名 | 內容 | 尺寸 | 大小（目標／上限） | 封面檔名（2x） |
|---|---|---|---|---|---|---|
| 6 | 主要畫面 | `key-main.mp4` | PC 首頁捲動（Figma `360:1884`） | 1440 × 810 | 5 MB／8 MB | `key-main-poster.jpg` 2880 × 1620 |
| 7 | Interaction & Motion | `motion-1.mp4` | 01 主視覺拆解 | 960 × 532 | 2.5 MB／4 MB | `motion-1-poster.jpg` 1920 × 1064 |
| 8 | Interaction & Motion | `motion-2.mp4` | 02 視差滾動 | 960 × 532 | 2.5 MB／4 MB | `motion-2-poster.jpg` 1920 × 1064 |
| 9 | Interaction & Motion | `motion-3.mp4` | 03 逐段揭露 | 960 × 532 | 2.5 MB／4 MB | `motion-3-poster.jpg` 1920 × 1064 |

**SSS 合計：圖片 9 張（5 張畫面＋4 張影片封面，封面由 Claude 產生）、影片 4 支。**

---

## JHANYU 展裕建設（`jhanyu`）

Figma：Desktop `360:2029`／Mobile `484:1821`。規格表：[`docs/specs/jhanyu.md`](specs/jhanyu.md)。
圖片放 `src/assets/projects/jhanyu/`，影片放 `public/media/jhanyu/`（交件時都放同一個資料夾即可）。
沒有 Mobile／RWD 和 Details 區塊。

### 圖片

| # | 區塊 | 檔名 | Figma 節點（Desktop） | 匯出方式 | 匯出尺寸（2x） | 備註 |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero-showcase.jpg` | `360:2048` Hero showcase | 整張合成圖 | 3840 × 1840 | PC 畫面＋手機一起匯出，網頁只顯示上方 820 px。手機版用同一張縮小。 |
| 2 | 主要畫面 | `key-about.jpg` | `360:2100`（關於展裕） | 裁切框 | 918 × 600 |  |
| 3 | 主要畫面 | `key-projects.jpg` | `360:2104`（熱銷建案） | 裁切框 | 918 × 600 |  |
| 4 | 主要畫面 | `key-process.jpg` | `360:2108`（購屋簽約流程） | 裁切框 | 918 × 600 |  |
| 5 | Visual Extension | `visual-mosaic.jpg` | `360:2184` Mosaic band | 整張合成圖 | 3840 × 2560 | 拼貼整片一起匯出，手機版用同一張縮小。 |

### 影片

| # | 區塊 | 影片檔名 | 內容 | 尺寸 | 大小（目標／上限） | 封面檔名（2x） |
|---|---|---|---|---|---|---|
| 6 | 主要畫面 | `key-main.mp4` | PC 首頁捲動（Figma `360:2099`） | 1440 × 810 | 5 MB／8 MB | `key-main-poster.jpg` 2880 × 1620 |
| 7 | Interaction & Motion | `motion-1.mp4` | 01 圖示化步驟 | 960 × 532 | 2.5 MB／4 MB | `motion-1-poster.jpg` 1920 × 1064 |
| 8 | Interaction & Motion | `motion-2.mp4` | 02 編號與版面節奏（PO 2026-11-03 合併 02 / 03） | 960 × 462（2528 / 1216 寬框） | 2.5 MB／4 MB | `motion-2-poster.jpg` 1920 × 1064 |

**展裕建設合計：圖片 8 張（含 3 張封面）、影片 3 支。**

---

## AMD 康健生醫（`amd`）

Figma：Desktop `360:2240`／Mobile `485:1462`。規格表：[`docs/specs/amd.md`](specs/amd.md)。
圖片放 `src/assets/projects/amd/`，影片放 `public/media/amd/`（交件時都放同一個資料夾即可）。
沒有 Mobile／RWD 和 Details 區塊。主要畫面第 3 張改為**產品內容頁**圖片（PO 2026-11-03）；Interaction & Motion 只有 **2** 個步驟。

### 圖片

| # | 區塊 | 檔名 | Figma 節點（Desktop） | 匯出方式 | 匯出尺寸（2x） | 備註 |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero-showcase.jpg` | `360:2259` Hero showcase | 整張合成圖 | 3840 × 1840 | PC 畫面＋手機一起匯出，網頁只顯示上方 820 px。手機版用同一張縮小。 |
| 2 | 主要畫面 | `key-products.jpg` | `360:2311`（產品區域） | 裁切框 | 918 × 600 |  |
| 3 | 主要畫面 | `key-product-page.jpg` | `360:2315`（產品頁） | 裁切框 | 918 × 600 |  |
| 4 | 主要畫面 | `key-product-content.jpg` | `360:2319`（改為產品內容頁） | 裁切框 | 918 × 600 | PO 2026-11-03：原為系統頁面影片 |
| 5 | Visual Extension | `visual-mosaic.jpg` | `360:2395` Mosaic band | 整張合成圖 | 3840 × 2560 | 拼貼整片一起匯出，手機版用同一張縮小。 |

### 影片

| # | 區塊 | 影片檔名 | 內容 | 尺寸 | 大小（目標／上限） | 封面檔名（2x） |
|---|---|---|---|---|---|---|
| 6 | 主要畫面 | `key-main.mp4` | PC 首頁捲動（Figma `360:2310`） | 1440 × 810 | 5 MB／8 MB | `key-main-poster.jpg` 2880 × 1620 |
| 7 | Interaction & Motion | `motion-1.mp4` | 01 404 頁面 | 960 × 462（2528 / 1216 寬框） | 2.5 MB／4 MB | `motion-1-poster.jpg` 1920 × 1064 |
| 8 | Interaction & Motion | `motion-2.mp4` | 02 維護頁面 | 960 × 462（2528 / 1216 寬框） | 2.5 MB／4 MB | `motion-2-poster.jpg` 1920 × 1064 |

**康健生醫合計：圖片 8 張（含 3 張封面）、影片 3 支。**

---

## HUIFA 匯發營造（`huifa`）

Figma：Desktop `360:2449`／Mobile `485:1693`。規格表：[`docs/specs/huifa.md`](specs/huifa.md)。
圖片放 `src/assets/projects/huifa/`，影片放 `public/media/huifa/`（交件時都放同一個資料夾即可）。
沒有 Mobile／RWD 區塊。**有 Details**，但是新的「設計稿 vs 完成」版型：一張分鏡長圖＋一支完成畫面影片。手機版的分鏡圖用同一張橫向滑動，不用另外匯出。

### 圖片

| # | 區塊 | 檔名 | Figma 節點（Desktop） | 匯出方式 | 匯出尺寸（2x） | 備註 |
|---|---|---|---|---|---|---|
| 1 | Hero | `hero-showcase.jpg` | `360:2468` Hero showcase | 整張合成圖 | 3840 × 1840 | PC 畫面＋手機一起匯出，網頁只顯示上方 820 px。手機版用同一張縮小。 |
| 2 | 主要畫面 | `key-guidelines.jpg` | `360:2520`（執行準則） | 裁切框 | 918 × 600 |  |
| 3 | 主要畫面 | `key-projects.jpg` | `360:2524`（工程實績） | 裁切框 | 918 × 600 |  |
| 4 | 主要畫面 | `key-services.jpg` | `360:2528`（服務項目） | 裁切框 | 918 × 600 |  |
| 5 | Details | `detail-draft.jpg` | `385:672`（設計分鏡） | 直接匯出圖層 | 2872 × 468 | 手機版用同一張橫向滑動 |
| 6 | Visual Extension | `visual-mosaic.jpg` | `360:2604` Mosaic band | 整張合成圖 | 3840 × 2560 | 拼貼整片一起匯出，手機版用同一張縮小。 |
| 6b | Visual Extension（390） | `visual-mosaic-mobile.jpg` | `485:1868` Mosaic band（390） | 整張合成圖 | 1170 × 1230（3x） | 390 專用裁切（Figma 手機版位置與桌機不同），PO 匯出 PNG，Claude 轉 JPG。 |

### 影片

| # | 區塊 | 影片檔名 | 內容 | 尺寸 | 大小（目標／上限） | 封面檔名（2x） |
|---|---|---|---|---|---|---|
| 7 | 主要畫面 | `key-main.mp4` | PC 首頁捲動（Figma `360:2519`） | 1440 × 693（2528 / 1216 寬框） | 5 MB／8 MB | `key-main-poster.jpg` 2880 × 1620 |
| 8 | Interaction & Motion | `motion-1.mp4` | 01 一頁一畫面 | 960 × 462（2528 / 1216 寬框） | 2.5 MB／4 MB | `motion-1-poster.jpg` 1920 × 1064 |
| 9 | Interaction & Motion | `motion-2.mp4` | 02 內容進場 | 960 × 462（2528 / 1216 寬框） | 2.5 MB／4 MB | `motion-2-poster.jpg` 1920 × 1064 |
| 10 | Details | `detail-live.v2.mp4` | LIVE SITE 完成畫面捲動（Figma `385:667`） | 1440 × 702（2026-11-05 改為 1920 × 936、CRF 24、6.5 MB；原檔 `LIVE SITE.mp4` 2544 × 1220 置中裁成 2502 寬） | 5 MB／8 MB | `detail-live-poster.jpg` 2502 × 1220（原檔寬度） |

**匯發營造合計：圖片 11 張（含 4 張封面）、影片 4 支。**（PO 2026-11-03：Motion 改為 2 步，拿掉 03 區塊轉場）

---

## 專案代號一覽
資料夾名稱用專案代號：

| 順序 | 專案 | 代號（資料夾名稱） |
|---|---|---|
| 01 | 88Win | `88win` |
| 02 | Hwa Fong Tire 華豐輪胎 | `hwa-fong` |
| 03 | FITZONE | `fitzone` |
| 04 | SSS 超透明提案 | `sss` |
| 05 | JHANYU 展裕建設 | `jhanyu` |
| 06 | AMD 康健生醫 | `amd` |
| 07 | HUIFA 匯發營造 | `huifa` |
