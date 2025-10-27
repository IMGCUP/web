# 風格指南（科技未來 × 賽博龐克）v0.1

> 適用：AI 客服專題入口網站（多頁、純靜態、前端 partial）。
> 版本相依（建議鎖版）：Three.js 0.15x、tsParticles 3.x、GSAP 3.x、pdfjs-dist 4.x（僅必要時）。

---

## 目錄
- 設計原則
- 色彩系統（CSS 變數）
- 字體與排版
- 版面與斷點
- 元件規範（Hero/Button/Card/Nav/Footer/Section）
- 動效與特效（粒子/3D/滾動）
- 圖像與背景
- 可近用（A11y）與降級策略
- 效能與預算
- 測試清單

---

## 設計原則
- 高對比、霓虹光暈、深色分層，營造未來感。
- 30 秒內傳達 Why/What/Impact，CTA 明確。
- 動效服務資訊，能關則關：`prefers-reduced-motion` 與 `?fx=off`。

## 色彩系統（CSS 變數）
於 `:root` 定義，集中在 `assets/css/base.css`：
```css
:root{
  --c-primary:#00E5FF; /* 霓虹青 */
  --c-accent:#FF2D95;  /* 霓虹洋紅 */
  --c-success:#2EE59D;
  --c-warning:#FFC107;
  --c-danger:#FF5E57;
  --c-info:#6EC1FF;

  --bg-0:#0B0F14; /* 基底深色 */
  --bg-1:#0F141B; /* 次層 */
  --bg-2:#141A22; /* 元件表層 */

  --tx-0:#E6F7FF; /* 主要文字 */
  --tx-1:#A9B8C6; /* 次要文字 */
  --tx-dim:#6C7A89; /* 附註 */

  --brd:#1E2A36;      /* 邊框 */
  --glow:0 0 16px rgba(0,229,255,.35);
}
```
使用規則：
- 主行動色使用 `--c-primary`，強調/互動狀態使用 `--c-accent`。
- 深色背景多層分明：背景（`--bg-0`）→ 區塊（`--bg-1`）→ 卡片（`--bg-2`）。

## 字體與排版
- Google Fonts：Orbitron（英、標題）、Noto Sans TC（中、內文）。
- 推薦載入（HTML `<head>`）：preconnect + display=swap。
- 文字層級（可依實測微調）：
  - H1 40–64px（Hero 使用 56–64px，允許大寫字距 0.04em）
  - H2 32–40px
  - H3 24–28px
  - Body 16–18px，行高 1.6
- 斷詞與混排：中文使用 Noto Sans TC，英文縮寫/數字允許 Orbitron 強調。

## 版面與斷點
- 容器寬度：
  - ≥1440：1140px
  - ≥1200：1040px
  - ≥992：  920px
  - ≥768：  680px
  - <768：  92% 寬
- 間距尺度（rem）：4、8、12、16、24、32、48、64。
- 命名：BEM（如 `.btn`, `.btn--primary`, `.card__title`）。

## 元件規範
- Hero
  - 內容：標語、短副標、主 CTA（前往 Demo）＋ 次 CTA（Slides/Video/Poster/Intro）。
  - 背景：粒子＋可選 3D 低多邊形（置於 canvas 層）。
  - 光暈：文字/按鈕可用 `text-shadow` / `box-shadow: var(--glow)`。
- Button
  - 尺寸：L（48px）、M（40px）。
  - 狀態：default/hover/active/focus/disabled；hover 提升亮度並加輕微光暈。
- Card
  - 背景 `--bg-2`，1px 邊框 `--brd`，內陰影或玻璃擬態可用 backdrop-filter（有降級）。
- Nav/Header
  - 固定頂部，半透明背景（玻璃），滾動時加深陰影。
  - 行動端為抽屜式選單。
- Footer
  - 簡潔版權、QR、外部連結。
- Section
  - 頁塊上下留白 64–96px；標題左側可加霓虹條裝飾。

## 動效與特效
- 全域開關：`data/site.json.effects`；網址參數 `?fx=off` 強制關閉。
- 粒子（`effects/particles.js`）
  - 輕量模式（預設）：粒子數量 ≤ 80、移動速度 ≤ 1.0。
  - 桌面展示模式：可提高至 120，但須守 FPS ≥ 50。
- 3D（`effects/three-hero.js`）
  - 低多邊形、LOD（level of detail），禁用高成本後處理。
  - 行動端或低效能自動禁用（偵測 `deviceMemory` / `RTT`）。
- 滾動（`effects/scroll-reveal.js`）
  - IntersectionObserver + CSS `transform/opacity`，duration 200–400ms。
  - 僅限出場與輕微視差；避免 layout thrash（只用 `transform`）。

## 圖像與背景
- 背景建議層：
  - 層1：純色深背景 `--bg-0`
  - 層2：細網格/掃描線（低透明度 PNG/SVG）
  - 層3：粒子/3D canvas
- 圖片：主視覺 1440px 寬，壓縮 WebP；提供 PNG 後備。
- 海報：若 PNG，寬邊 2000px；若 PDF，提供縮圖預覽。

## 可近用（A11y）與降級策略
- 對比比：主要互動元素 ≥ 4.5:1。
- 焦點可見：`:focus-visible` 自訂外框（與主色一致）。
- 動效降級：遵循 `prefers-reduced-motion: reduce`；同時支援 `?fx=off`。
- 文字替代：影像/按鈕/連結皆需 `alt`/`aria-label`。

## 效能與預算（Ubuntu 2GB/2CPU/60GB）
- CSS 總量 ≤ 150KB；JS 應用層 ≤ 200KB（不含 vendor）。
- Three/tsParticles 僅首頁載入；子頁面按需載入。
- 圖片優先 WebP；影片預設外嵌 YouTube（需網路），若要離線另行提供 MP4。

## 測試清單
- 首頁 Hero：60FPS 接近；關閉特效後 LCP 明顯改善。
- PDF 內嵌可讀；無法嵌入時出現下載/新視窗選項。
- 行動端：導覽可操作，Canvas 自動降級或關閉。
- 鍵盤可導航，焦點順序合理；Console 無 error。
