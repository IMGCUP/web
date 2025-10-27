# 專案架構說明（多頁＋純前端 partial＋PDF iframe）

> 決策摘要：
> - 站型：多頁（index/slides/videos/poster/intro）
> - partial：純前端（ES Modules + Web Components + fetch）
> - PDF：`<iframe>` 內嵌，失敗自動降級為「下載/新視窗開啟」
> - 特效：粒子背景、Hero 小型 3D、滾動出場/視差（皆可開關）
> - 字型：Google Fonts（Orbitron + Noto Sans TC）
> - 連結：先使用測試連結，集中於 `data/site.json`；修改方式詳見 `04_Links_Config.md`

---

## 1. 目錄結構
```
/ (project root)
├─ index.html                 # 首頁（Hero / 快速入口 / 速覽）
├─ slides.html                # 投影片 PDF 嵌入
├─ videos.html                # 影片清單（YouTube）
├─ poster.html                # 海報（PNG/PDF）
├─ intro.html                 # 介紹 PDF
├─ partials/                  # 靜態 partial HTML（header/footer/hero 等）
│  ├─ header.html
│  ├─ footer.html
│  └─ hero.html
├─ assets/
│  ├─ css/
│  │  ├─ base.css            # Reset、變數、排版、色票
│  │  ├─ layout.css          # 容器、Grid、斷點
│  │  ├─ components.css      # 元件（按鈕/卡片/Modal）
│  │  └─ themes.css          # 主題（霓虹/玻璃擬態/背景層）
│  ├─ js/
│  │  ├─ main.js             # 入口：載入 site.json、初始化 partial/特效/路由
│  │  ├─ components/         # Web Components（x-header/x-footer/x-hero）
│  │  │  ├─ header.js
│  │  │  ├─ footer.js
│  │  │  └─ hero.js
│  │  ├─ effects/            # 粒子、3D、滾動出場
│  │  │  ├─ particles.js     # 封裝 tsParticles 或自製 Canvas
│  │  │  ├─ three-hero.js    # 三維場景（低多邊形、可關閉）
│  │  │  └─ scroll-reveal.js # IntersectionObserver 動效
│  │  ├─ utils/
│  │  │  ├─ dom.js           # 查詢、模板注入
│  │  │  ├─ detect.js        # 特性/效能偵測（行動裝置/低效能）
│  │  │  └─ pdf-fallback.js  # PDF 內嵌失敗時的降級流程
│  │  └─ vendor/             # 鎖定版本的第三方（可改用 CDN）
│  │     ├─ three.min.js     # 建議鎖定 0.15x.x（例）
│  │     ├─ tsparticles.min.js# 建議鎖定 3.x（例）
│  │     └─ pdfjs/           # 若採用 PDF.js 再加入（可選）
│  ├─ img/                   # 靜態圖、背景、海報 PNG
│  └─ media/                 # 本地影片（可選離線 fallback）
├─ data/
│  └─ site.json              # 站點標題、連結、影片清單、特效開關（集中管理）
├─ doc/                      # 規劃文件（本資料夾）
│  ├─ 01_Project_Plan.md
│  ├─ 02_Project_Structure.md
│  ├─ 03_Style_Guide.md
│  └─ 04_Links_Config.md
└─ README.md                 # （後續補）本地預覽與部署說明
```

## 2. 頁面路由與資料流
- 每個 HTML 頁面：
  - 以 `<x-header/>`、`<x-footer/>` 作為可重用區塊；`main.js` 於 DOMContentLoaded 註冊 Web Components 並渲染。
  - 從 `data/site.json` 載入站點設定（標題、連結、影片清單、特效 flags）。
  - 視頁面型別載入對應模組（如 `pdf-fallback.js` 在 slides/intro/poster 頁面啟用）。

- 站點設定（site.json）統一控制：
  - `project.title`、`project.tagline`、`project.demoUrl`
  - `assets.slidesPdf`、`assets.introPdf`、`assets.posterImage`、`assets.posterPdf`
  - `videos[]`（YouTube `youtubeId`）
  - `effects.{particles,three,scrollReveal}` 布林開關

## 3. partial 與 Web Components
- partials/*.html 僅存放結構與基本占位。
- assets/js/components/*.js 以 Web Components 將 partial 注入頁面並綁定資料：
  - `<x-header>`：導覽列（首頁/投影片/影片/海報/介紹/系統 Demo）
  - `<x-footer>`：版權、QR、外部連結
  - `<x-hero>`：首頁 Hero（霓虹標題、副標、CTA、背景特效掛載點）
- 好處：
  - 純靜態即可重用區塊，無需 PHP/include。
  - 改動 header/footer 僅動到單一 JS/HTML partial。

## 4. PDF 內嵌與降級
- 內嵌：`<iframe src="/path/to.pdf" class="pdf-frame" loading="lazy">`
- 偵測失敗（如 Safari/行動端或 3rd-party 禁嵌）：
  - 以 `pdf-fallback.js` 檢測 `navigator.pdfViewerEnabled` / 嘗試載入失敗事件
  - 顯示「下載」按鈕與「新視窗開啟」連結
- 如需一致的檢視體驗再引入 PDF.js（鎖版本，放置於 vendor/pdfjs/）。

## 5. 特效模組與開關
- 粒子：`effects/particles.js`
  - 支援兩種實作：tsParticles 或自製 Canvas（選其一）
  - 設定於 `site.json.effects.particles`
- Hero 3D：`effects/three-hero.js`
  - Three.js 低多邊形模型/幾何；可偵測效能自動降採樣
  - 設定於 `site.json.effects.three`
- 滾動出場/視差：`effects/scroll-reveal.js`
  - 優先使用 IntersectionObserver；必要時再加 GSAP（鎖 3.x）
  - 設定於 `site.json.effects.scrollReveal`
- 全域關閉：網址加上 `?fx=off`，或偵測 `prefers-reduced-motion: reduce` 時自動關閉高動態。

## 6. 字型與資產
- Google Fonts：Orbitron（英）＋ Noto Sans TC（中）
  - 以 `<link rel="preconnect">` 優化；若需離線，改為本地託管至 `assets/fonts/`
- 圖片與影片：
  - 圖片：優先 PNG/SVG；背景可使用 WebP（並提供 PNG 後備）
  - 影片：YouTube 為主；若要離線 Demo，放入 `assets/media/` 並提供切換控制

## 7. Ubuntu（2GB/2CPU/60GB）部署要點（簡版）
- 伺服器：Nginx 或 Apache 任一
- 建議：
  - 開啟 gzip/br（text/html, css, js, svg, json）
  - 正確 MIME：PDF、MP4、WebM
  - Cache-Control：長快取給 `assets/`（指紋檔名）
  - HTTPS 與 HTTP/2（若可）
- 純靜態可直接放至 Web 根目錄（例：`/var/www/site`）。

## 8. 本地預覽（Windows/Linux）
- Windows：VS Code Live Server 外掛，或 PowerShell 啟動簡易伺服器
- Linux（Ubuntu）：`python3 -m http.server 8080` 於專案根目錄（僅開發用）

## 9. 版本鎖定建議（示例）
- three.js：`0.15x.x`
- tsParticles：`3.x`
- GSAP：`3.x`
- pdfjs-dist（若用）：`4.x`
> 最終以實際上線前測試為準，並固定至特定小版本；CDN 開發、上線改用本地 vendor。

## 10. 待補與下一步
- 建立初始 `site.json`（含測試連結）
- 產出各頁面骨架與 `<x-*>` 元件占位
- 在 `03_Style_Guide.md` 依據色票與組件規範完成基本樣式
- 依 `04_Links_Config.md` 寫入實際連結後上線
