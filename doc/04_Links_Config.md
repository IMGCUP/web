# 連結設定說明（Links Config）v0.1

> 適用：AI 客服專題入口網站（多頁，純前端 partial）。
> 目的：集中管理 Demo/影片/PDF/海報等連結，初期使用測試連結，之後可一處修改全站生效。

---

## 目錄
- 概念與位置
- site.json 結構與測試值
- 修改步驟
- 降級與備援（PDF/YouTube）
- 驗證與重現步驟
- 常見問題

---

## 概念與位置
- 全站連結與特效開關集中於：`data/site.json`
- 各頁面（`index.html / slides.html / videos.html / poster.html / intro.html`）在初始化時會讀取 `site.json`。
- 你只需更新 `site.json`，無須逐頁修改 HTML。

> 註：目前僅提供規劃文件。實作結構建立後，請在專案根目錄建立 `data/site.json` 文件並填入下方範例內容。

## site.json 結構與測試值（範例）
```json
{
  "project": {
    "title": "AI 客服專題",
    "tagline": "以 AI 強化客服體驗與效率",
    "demoUrl": "https://example.com/demo" // 測試連結：AI 客服系統入口
  },
  "assets": {
    "slidesPdf": "./assets/slides/sample.pdf",  // 測試：投影片 PDF
    "introPdf": "./assets/intro/intro.pdf",     // 測試：介紹 PDF
    "posterImage": "./assets/poster/poster.png",// 測試：海報 PNG（若有 PDF 亦可）
    "posterPdf": "./assets/poster/poster.pdf"   // 測試：海報 PDF（可選）
  },
  "videos": [
    { "title": "總覽 Demo", "youtubeId": "dQw4w9WgXcQ" } // 測試：YouTube 影片 ID
  ],
  "effects": {
    "particles": true,
    "three": true,
    "scrollReveal": true
  }
}
```

> 之後上線前，請將測試值替換為實際連結與檔案路徑。

## 修改步驟
1. 放置檔案
   - 將 PDF/圖片/（可選）本地影片放入：`assets/slides|intro|poster|media` 等對應資料夾。
2. 更新 `data/site.json`
   - `project.demoUrl` → 你的 AI 客服系統 URL
   - `assets.*` → 實際檔案路徑（相對於專案根目錄）
   - `videos[].youtubeId` → YouTube 影片 ID（或新增多筆）
   - `effects.*` → 是否啟用粒子/3D/滾動出場
3. 儲存後重新整理頁面，即可看到更新。

## 降級與備援（PDF/YouTube）
- PDF 內嵌失敗：頁面會顯示「下載」與「新視窗開啟」按鈕。
- YouTube 無法播放（無網路）：可準備本地 MP4/WEBM 置於 `assets/media/`，未來在 `site.json` 加入 `videos[].localSrc` 以供無網環境切換（實作時提供開關）。
- 全域關閉特效：網址加 `?fx=off` 或將 `effects.*` 設為 `false`。

## 驗證與重現步驟
- 本機預覽（僅示意；專案建立後執行於專案根目錄）
  - Windows：建議使用 VS Code Live Server 外掛
  - Linux/Ubuntu：`python3 -m http.server 8080`
- 驗收重點
  - 首頁 CTA 可正確導向 `demoUrl`
  - `slides.html / poster.html / intro.html` 能顯示 PDF 或提供下載/新視窗替代
  - `videos.html` 能載入 YouTube（或顯示無網備援）

## 常見問題（FAQ）
- 路徑要用絕對還是相對？
  - 建議以「從專案根目錄出發的相對路徑」（例：`/assets/poster/poster.png`）。
- YouTube 要填整個網址嗎？
  - 填 ID（例：`dQw4w9WgXcQ`）。若未來支援完整網址，會在文件中更新說明。
- 想關閉特效但保留樣式？
  - 將 `effects` 中對應項目設為 `false`，或於網址加 `?fx=off`。
