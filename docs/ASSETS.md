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

| 專案 | 交件原檔 | 網站檔案 | 處理 |
|---|---|---|---|
| 88Win（精選卡） | `88win_bg.jpg` | `src/assets/projects/88win/card-bg.jpg` | 原檔 3456 × 1000 |
| 88Win（精選卡） | `88win.mp4` | `public/media/88win/card-pc.mp4` ＋ `card-pc-poster.jpg` | 前 10 秒、1280 寬 |
| 88Win（精選卡） | `88win_moblie.mp4` | `public/media/88win/card-mobile.mp4` ＋ `card-mobile-poster.jpg` | 從黑底裁出手機（含外框）、320 × 660 |
| 華豐輪胎 | `duro.mp4` | `public/media/hwa-fong/card.mp4` ＋ `card-poster.jpg` | 裁掉左右黑邊、前 10 秒 |
| FITZONE | `fitzone.mp4` | `public/media/fitzone/card.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| SSS | `SSS.mp4` | `public/media/sss/card.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| 展裕建設 | `jhanyu.mp4` | `public/media/jhanyu/card.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| AMD | `amd.mp4` | `public/media/amd/card.mp4` ＋ `card-poster.jpg` | 前 10 秒 |
| 匯發營造 | `huifa.mp4` | `public/media/huifa/card.mp4` ＋ `card-poster.jpg` | 前 10 秒 |

之後的建議命名（Claude 收到後也會自己改名，所以不照著命名也沒關係）：資料夾用專案代號（`88win`、`hwa-fong`…），首頁卡片影片叫 `card.mp4`；精選卡的三個圖層叫 `card-bg.jpg`、`card-pc.mp4`、`card-mobile.mp4`。

---

## 88Win（`88win`）

Figma：Desktop `360:251`／Mobile `475:953`。
圖片放 `src/assets/projects/88win/`，影片放 `public/media/88win/`（交件時都放同一個資料夾即可，Claude 會分好）。

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
| 11 | CARD | `detail-card.png` | `360:991` 範圍 (32, 160) 1322 × 300 | 2644 × 600 | `detail-card-mobile.png` | `476:1489` Cards | 620 × 1414 |
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

## 其他專案（M3）
SSS、展裕建設、AMD、匯發營造 的清單，會在各專案開工前由 Claude 寫進該頁的規格表（`docs/specs/<slug>.md`），再整理到這份文件。命名規則同上，資料夾名稱用專案代號：

| 順序 | 專案 | 代號（資料夾名稱） |
|---|---|---|
| 01 | 88Win | `88win` |
| 02 | Hwa Fong Tire 華豐輪胎 | `hwa-fong` |
| 03 | FITZONE | `fitzone` |
| 04 | SSS 超透明提案 | `sss` |
| 05 | JHANYU 展裕建設 | `jhanyu` |
| 06 | AMD 康健生醫 | `amd` |
| 07 | HUIFA 匯發營造 | `huifa` |
