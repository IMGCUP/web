# AI 客服專題入口網站 計畫書（v0.1）

> 目的：作為評審與觀眾的單一入口，快速理解專題價值，並串連至實際「AI 客服」網頁系統與多媒體成果（簡報、影片、海報、介紹）。
> 語言：繁體中文。部署：自租主機。技術：純靜態 HTML/CSS/JavaScript（無框架）、可選 PHP（若主機支援）僅作為 include。

---

## 1. 目標與範圍
- 快速抓住目光：首螢呈現科技未來/賽博龐克風格 Hero，30 秒內傳達 Why/What/Impact。
- 清楚導流：一鍵前往「AI 客服系統 Demo」、投影片 PDF、YouTube 影片、海報、介紹 PDF。
- 展示穩定：即使現場網路狀況一般，頁面仍可載入核心內容，重動效可關閉。
- 高可維護：以模組化結構與可配置化資料檔，降低後續維護成本。

不納入：時間線/過程、團隊與分工、Press Kit/下載頁。

## 2. 受眾與展示情境
- 受眾：評審、指導老師、同學與一般觀眾。
- 情境：
  - 現場投影由網站首頁開始，依序示範重點與導流至 AI 客服系統。
  - 評審可能會於個人裝置自行瀏覽，須適配 1366×768 以上解析度與行動端基本可用。

## 3. 內容清單（可上線素材）
- 簡報：PDF（嵌入式檢視＋下載 fallback）。
- 影片：YouTube（可選本地 MP4/WEBM 作為無網 fallback）。
- 海報：PNG 或 PDF（PDF 嵌入有瀏覽器相容差異，提供下載/新視窗開啟）。
- 介紹：PDF（或轉為頁內章節，但以 PDF 為準）。
- 導流：AI 客服系統入口（外部連結）。

## 4. IA / Site Map（初稿）
- /（首頁）
  - Hero（標語、亮點、背景特效）
  - 專題速覽（問題/方法/成果/影響）
  - 快速入口（Demo、簡報、影片、海報、介紹）
  - FAQ/亮點（可選）
  - 聯絡/QR（簡短）
- /slides（投影片瀏覽）
- /videos（影片集）
- /poster（海報檢視）
- /intro（介紹 PDF）

備註：若偏好單頁，也可以單頁多段落 + 內部錨點實作，上述路徑則為錨點 ID。

## 5. 頁面與模組（概要）
- 共用模組
  - Header/Nav（固定導覽）
  - Footer（版權與 QR）
  - Section/Hero/Card/Button/Modal（Web Component 或 HTML partial）
- 首頁
  - Hero：標語、CTA（前往 Demo/Slides/Video/Poster/Intro）
  - 速覽：四欄亮點（可用 data 驅動）
  - 特效區：粒子/掃描線/霓虹邊框（可關閉）
- Slides 頁
  - 內嵌 PDF（<iframe> 或 PDF.js）＋ 下載連結
- Videos 頁
  - YouTube 影片清單（縮圖預載、點擊後 modal 播放）
- Poster 頁
  - 圖片 Viewer（PNG）或 PDF 嵌入＋下載
- Intro 頁
  - 內嵌 PDF（<iframe>/PDF.js）

## 6. 視覺與風格指南（科技未來 × 賽博龐克）
- 色彩（可於 :root 宣告 CSS 變數）
  - 霓虹主色：--c-primary: #00E5FF；輔色：--c-accent: #FF2D95
  - 背景深色：--bg-0: #0B0F14；分層：--bg-1: #0F141B
  - 成功/警示/資訊色各一（用於徽章）
- 字體
  - Google Fonts：如 Orbitron/Noto Sans TC（中英混排），以 font-display: swap。
- 元件風格
  - 霓虹邊框、玻璃擬態、網格/掃描線疊加（用 linear-gradient/::before）
- 版面
  - 12-column，1440、1200、992、768、576 斷點，容器寬度與 gutter 固定
- 可近用
  - 對比比 ≥ 4.5:1；提供 prefers-reduced-motion 媒體查詢關閉高動態特效

## 7. 動效策略
- 層級
  - L0 基礎：CSS transition/transform、陰影/光暈
  - L1 互動：滾動出場、Parallax 微動（IntersectionObserver）
  - L2 展示：粒子背景、3D 裝飾（可開關）
- 實作選項（不強制引入；上線前將固定版本）
  - 粒子：tsParticles 或粒子自製（Canvas）
  - 3D：Three.js（僅作為 Hero 小型裝飾、控制多邊形數量）
  - 滾動觸發：原生 IntersectionObserver 或 GSAP ScrollTrigger（若必要）
- 風險控管
  - 以 data-config 與查詢參數 ?fx=off 關閉特效
  - 手機/低效能偵測時降級為靜態背景

## 8. 技術選型與架構
- 選型
  - 純靜態 HTML/CSS/JS；不依賴打包流程，直接以 ES Modules 載入
  - 可選 PHP include（若主機支援）用於 header/footer partials，否則以 fetch 注入 partials 或 Web Components
- 架構要點
  - UI 元件：Web Components（如 <x-header>、<x-hero>）或 HTML partial + 初始化腳本
  - 路由：多頁或單頁錨點；YouTube 以 no-cookie domain 嵌入
  - PDF 閱讀：優先 iframe；Safari/行動端可自動 fallback 至下載；必要時內嵌 PDF.js（靜態可用）

## 9. 目錄結構與命名（提案）
```
/ (repo root)
├─ index.html               # 首頁
├─ slides.html              # 投影片
├─ videos.html              # 影片
├─ poster.html              # 海報
├─ intro.html               # 介紹
├─ assets/
│  ├─ css/
│  │  ├─ base.css          # Reset、變數、排版
│  │  ├─ layout.css        # Grid、容器
│  │  ├─ components.css    # 元件（按鈕/卡片/表單）
│  │  └─ themes.css        # 顏色、暗色層
│  ├─ js/
│  │  ├─ main.js           # 初始化、feature flags、路由/錨點
│  │  ├─ components/       # Web Components or partial loader
│  │  ├─ effects/          # 粒子/3D/滾動
│  │  └─ vendor/           # 可選：pdfjs、particles、three（固定版本）
│  ├─ fonts/               # Webfonts（Google Fonts 可改本地託管）
│  ├─ img/                 # 靜態圖
│  └─ media/               # 本地影片（可選 fallback）
├─ data/
│  └─ site.json            # 連結、清單、特效開關
└─ docs/                   # 說明文件（或使用 d:/web/doc）
```

## 10. 可維護性設計
- BEM 命名 + CSS 變數，避免深層選擇器
- Web Components 或 partial include，單一來源修改 Header/Footer
- site.json 管理外部連結、清單（影片/檔案），避免改動 HTML
- 特效分模組，彼此零耦合，以 data-config 控制載入

## 11. 資料與配置（site.json 範例）
```json
{
  "project": {
    "title": "AI 客服專題",
    "tagline": "以 AI 強化客服體驗與效率",
    "demoUrl": "https://example.com/ai-support"
  },
  "assets": {
    "slidesPdf": "/assets/slides/final.pdf",
    "introPdf": "/assets/intro/intro.pdf",
    "poster": "/assets/poster/poster.png",
    "posterPdf": "/assets/poster/poster.pdf"
  },
  "videos": [
    { "title": "總覽 Demo", "youtubeId": "XXXXXXXXXXX" }
  ],
  "effects": {
    "particles": true,
    "three": false,
    "scrollReveal": true
  }
}
```

## 12. 部署與環境（自租主機）
- 伺服器：Nginx/Apache 任一
- 建議設定
  - gzip/br 壓縮（text/css/js/svg）
  - Cache-Control：靜態資產長快取（附指紋）
  - PDF/MP4 正確 MIME 類型
  - CORS：同源即可，若跨網域嵌入需允許
- PHP：若採用 include，需啟用 .php；否則維持純靜態

## 13. 風險與回滾
- 網路不穩 → 提供本地 MP4/WEBM/PNG/PDF fallback；所有外連皆附替代連結
- 效能不足 → 啟用 prefers-reduced-motion 或 ?fx=off 關閉特效
- PDF 嵌入相容性 → 自動偵測，失敗時顯示下載按鈕
- 回滾：
  - 特效以 data-config 關閉
  - 快速替換首頁為簡版（僅 Hero + CTA）

## 14. 測試與驗收
- 裝置/瀏覽器：Chrome / Edge / Firefox / Safari（行動與桌面）
- 基線
  - 首頁 LCP < 2.5s（一般網路與中階筆電）
  - 所有入口可點擊、PDF/影片可正常載入或提供 fallback
  - 無阻塞錯誤（Console 無 error）
- 可近用：鍵盤可導航、對比比合格、替代文字齊全

## 15. 重現步驟（本機預覽與上線）
- 檔案放置
  - 將 PDF/PNG/影片放入 assets 對應資料夾，更新 data/site.json
- 本機預覽（Windows）
  - 使用 VS Code Live Server 外掛，或 PowerShell 啟動簡易伺服器
  - 直接用檔案路徑開啟 HTML 可能導致 PDF/模組載入受限，建議用本機伺服器
- 上線
  - 將整個專案目錄上傳至主機對應 Web 根目錄
  - 若使用 PHP include，首頁請部署為 index.php

---

## 附錄：開源庫候選與參考（後續最終實作前再鎖定版本）
- PDF.js（PDF 內嵌檢視）
- tsParticles / particles.js（粒子背景）
- Three.js（3D 裝飾）
- GSAP ScrollTrigger 或原生 IntersectionObserver（滾動觸發）

> 註：實作時將固定 CDN 版本號並記錄於 README，避免不預期變更；若無網依賴，將改為本地託管 vendor 檔案。
