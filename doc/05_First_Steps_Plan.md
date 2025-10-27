# 第一波實作計畫（MVP Skeleton）v0.1

> 目的：在最短時間建立「可運行的多頁入口網站骨架」，能以測試連結展示：首頁 Hero、投影片 PDF、YouTube 影片、海報（PNG/PDF）、介紹 PDF；具備純前端 partial、資料驅動（site.json）、特效開關與降級策略。
> 背景決策：多頁 | 純前端 partial（ESM/Web Components）| PDF `<iframe>` + 降級 | 粒子/3D/滾動出場 | Google Fonts（Orbitron + Noto Sans TC）| 自租 Ubuntu（2GB/2CPU/60GB）。

---

## 1. 目標（此階段完成即可 Demo）
- 可瀏覽五頁：`/index.html`、`/slides.html`、`/videos.html`、`/poster.html`、`/intro.html`。
- 共同 Header/Footer 以 Web Components/partials 注入；所有頁面從 `data/site.json` 讀設定。
- PDF 以 `<iframe>` 內嵌；若失敗，自動顯示「下載 / 新視窗開啟」。
- 影片頁載入 YouTube 測試影片；首頁提供明確 CTA 導向 Demo（測試連結）。
- 特效模組具占位與開關（`site.json.effects`、`?fx=off`、`prefers-reduced-motion`）。

## 2. 任務拆解
- A. 專案骨架與目錄
  - 建立資料夾：`assets/css|js|img|media`、`partials/`、`data/`、`assets/js/{components,effects,utils,vendor}`。
  - 新增空白或占位檔：`README.md`（列出本地預覽）、`.nojekyll`（可選）。
- B. 基礎頁面（多頁）
  - `index.html`、`slides.html`、`videos.html`、`poster.html`、`intro.html`（含 head：字型、meta、CSS、ESM `main.js`）。
  - 內容放入 `<x-header/>`、頁面區塊、`<x-footer/>` 占位。
- C. partial 與 Web Components
  - `partials/header.html`、`partials/footer.html`、`partials/hero.html`（簡單結構）。
  - `assets/js/components/{header.js,footer.js,hero.js}`：載入 partial 並綁定 `site.json`。
- D. 樣式
  - `assets/css/{base.css,layout.css,components.css,themes.css}`：色票、排版、BEM、霓虹/玻璃擬態樣式基礎。
- E. 資料與設定
  - `data/site.json`（測試值；結構同 `04_Links_Config.md` 範例）。
- F. 功能腳本
  - `assets/js/main.js`：讀取 `site.json`、註冊元件、解析 `?fx=off`、套用特效 flags。
  - `assets/js/utils/{dom.js,detect.js}`：選取、模板注入、效能/行動端偵測。
  - `assets/js/utils/pdf-fallback.js`：PDF 內嵌檢測與替代 UI。
  - `assets/js/effects/{particles.js,three-hero.js,scroll-reveal.js}`：占位版（先最小可運行）。
- G. 影片與 PDF 頁面邏輯
  - `videos.html`：以 `videos[]` 產卡片；點擊開啟 `<iframe>` modal 或新視窗。
  - `slides.html`、`intro.html`、`poster.html`：`<iframe>` + `pdf-fallback.js`；海報 PNG 直接 `<img>` + 下載連結。
- H. 字型與資產
  - Head 載入 Google Fonts（Orbitron、Noto Sans TC）；支援本地託管替代（後續）。
- I. 文件
  - 更新 `README`：如何放置檔案、修改 `site.json`、本機預覽與部署步驟。

## 3. 產出物（MVP 清單）
- HTML：`index.html`、`slides.html`、`videos.html`、`poster.html`、`intro.html`
- partials：`partials/{header.html,footer.html,hero.html}`
- CSS：`assets/css/{base.css,layout.css,components.css,themes.css}`
- JS（入口與模組）：
  - `assets/js/main.js`
  - `assets/js/components/{header.js,footer.js,hero.js}`
  - `assets/js/utils/{dom.js,detect.js,pdf-fallback.js}`
  - `assets/js/effects/{particles.js,three-hero.js,scroll-reveal.js}`（占位、可關閉）
- 設定檔：`data/site.json`（含測試連結）
- 文件：更新 `README.md`、既有 `02/03/04` 文檔維持一致

## 4. 驗收標準
- 導覽：五頁皆可開啟，Header/Footer 正常重用；`site.json` 更改連結後即時反映。
- 首頁：Hero 文案與 CTA 正常；`effects.*` 全關時畫面仍清晰可用。
- 影片：`videos.html` 正常載入 YouTube 測試影片。
- PDF：能在支援瀏覽器內嵌；不支援時顯示「下載/新視窗」替代。
- 效能與穩定：Console 無 error；行動端與桌面端皆可基本操作。

## 5. 重現步驟（本機預覽與部署）
- 本機預覽（Windows）
  - 推薦：VS Code Live Server 外掛
  - 或：PowerShell 於專案根目錄執行 `python -m http.server 8080`
- Linux/Ubuntu（開發測試）
  - 於專案根目錄：`python3 -m http.server 8080`
- 部署（Ubuntu 自租主機）
  - Nginx/Apache 任一；啟用 gzip/br、正確 MIME（PDF/MP4/WebM）、`assets/` 長快取（指紋）。
  - 上傳整個專案目錄至 Web 根目錄（例：`/var/www/site`）。

## 6. 風險與回滾
- 特效造成掉幀 → 以 `?fx=off`、`prefers-reduced-motion`、`effects.*=false` 關閉。
- YouTube 播放失敗（無網） → 後續支援 `videos[].localSrc` 本地影片切換。
- PDF 內嵌相容性差 → 自動降級；必要時再導入 PDF.js（鎖版本且本地託管）。
- 快速回滾：保留「簡版首頁」（僅 Hero + CTA、無特效）切換。

## 7. 工期估算與資源
- 估時：1–1.5 天（純骨架與占位、基本互動與降級）。
- 測試裝置：桌機 Chrome/Edge、行動 Chrome/Safari。

## 8. 待提供與後續
- 你提供：正式 `demoUrl`、YouTube `youtubeId`、`slidesPdf`、`poster(PNG/PDF)`、`introPdf`（可先留測試）。
- 我後續：在骨架完成後，導入正式連結並進行樣式強化與特效微調（粒子密度/3D LOD/滾動出場節奏）。
