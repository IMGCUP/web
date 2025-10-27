# 進站預載入動畫（Preloader）需求與實作計畫

## 目標
- 首次進入網站時，顯示 2–3 秒的預載入動畫，為內部資源初始化與快取爭取緩衝時間。
- 動畫風格需與現有 Cyberpunk/霓虹視覺一致，不干擾主畫面佈局，結束後平滑過渡。
- 不阻斷資源下載，且不影響 SEO 與可用性（可在 JS 故障時優雅降級）。

## 範圍
- 適用於所有主要入口頁面（index.html、slides.html、videos.html、poster.html、intro.html）。
- 預設每次載入皆顯示；可選擇改為「每個 session 僅顯示一次」（以 sessionStorage 控制）。

## 使用者體驗（UX）規格
- 進場：頁面載入即覆蓋全畫面之半透明霓虹背景，中央顯示品牌/專題標誌與小型進度元素（條/點）。
- 動畫：
  - 主要為柔和的霓虹呼吸與掃描線效果，可加入微量粒子漂浮，不可喧賓奪主。
  - 支援 prefers-reduced-motion，減少或關閉高頻動畫。
- 退出：以 250–400ms 的淡出與縮放/模糊過渡，避免突兀閃爍。
- 可及性：
  - role="status" aria-live="polite" 提示「正在載入」。
  - 提供鍵盤可聚焦的「略過載入」按鈕（可隱藏為次要路徑）。

## 行為與時序（2–3 秒緩衝策略）
- 顯示條件：DOM 初始化時即顯示 overlay。
- 隱藏條件：同時滿足下列兩點即可隱藏（取最慢者）：
  1) 最小顯示時間 minDuration = 2000ms 已達成。
  2) 關鍵資源就緒（criticalReady = true）或達最大等待時間 maxDuration = 3000ms。
- 失敗回退：如 3.5s 仍未就緒，強制關閉 overlay 並寫入 console warning。

## 關鍵資源（可配置）
- 字型：document.fonts.ready（上限等待 1000ms，逾時不阻擋）。
- 圖片：標示 data-preload 的關鍵 hero/裝飾圖片（如有）；其餘以瀏覽器預設延後。
- 初始 JS：主要模組與必要的 Web Components（如 x-header），以 DOM 可用為準。
- 遠端設定或片段：如需載入 demo modal partial，納入但設置寬鬆逾時（例如 800ms）。

## 技術設計
- DOM 注入：
  - 由 assets/js/main.js 在 DOMContentLoaded 前即插入 overlay 節點（置於 body 內首位）。
  - 在 <html> 加上 `class="is-preloading"`，以 CSS 控制背景固定與滾動禁用。
- CSS（assets/css/themes.css 或 components.css）：
  - .preloader（全螢幕覆蓋，z-index 高於內容）
  - .preloader__backdrop（霓虹漸層 + 掃描線）
  - .preloader__logo（專題字樣/圖標，Bitcount Grid Single 字型）
  - .preloader__progress（細條/點狀進度，霓虹呼吸）
  - 動畫遵循現有霓虹呼吸曲線與色票（--c-primary, --c-accent）
- JS（assets/js/main.js）：
  - PreloaderManager：
    - show()：插入/顯示 overlay
    - waitForCritical(): Promise，聚合 document.fonts.ready、標記資源、片段載入（各自設逾時）
    - hide(): 移除 overlay + 移除 html.is-preloading
    - run({ min=2000, max=3000, sessionOnce=false })：核心流程
  - sessionOnce：若為 true，使用 sessionStorage.setItem('preloader_seen', '1') 控制。
  - reduced motion：若偵測到 prefers-reduced-motion，縮短動畫時長或改為單純淡入淡出。

## 介面與設定
- siteConfig.preloader（可選）：
  - enabled: boolean（預設 true）
  - minDuration: number（ms, 預設 2000）
  - maxDuration: number（ms, 預設 3000）
  - sessionOnce: boolean（預設 false）
  - resources: { images: string[] | selector, waitFonts: boolean, waitPartials: boolean }
- 除錯：
  - 支援 URL 參數 ?no-preloader=1 直接跳過。
  - 在開發模式下印出各階段耗時。

## 效能與相容性
- 不阻斷資源：overlay 與樣式屬輕量，避免使用巨大圖片。
- 早期繪製：base.css 與 themes.css 已於 <head> 載入，確保 overlay 快速可視。
- 瀏覽器支援：現代瀏覽器；舊版不支援的 API 以逾時回退處理。

## 無障礙（a11y）
- `aria-busy` 套用於 body 或主要容器，在載入完成移除。
- Tab 鍵可到達的「略過載入」按鈕（對螢幕閱讀器可見，對一般使用者半透明）。

## 驗收標準（Acceptance Criteria）
- 初次載入時，overlay 0–100ms 內可見。
- overlay 於 ≥2000ms 且 ≤3000ms 之間消失；在網速正常下趨近 2300–2600ms。
- overlay 淡出過渡 ≤400ms，無明顯閃爍或布局跳動。
- reduced motion 下，動畫改為低動態且耗時 ≤1500ms。
- JS 故障或資源阻塞時，≤3500ms 強制隱藏，不影響主流程。

## 實作步驟
1) 設計/確認動畫與視覺稿（顏色、速率、透明度）。
2) CSS：在 themes.css 新增 preloader 樣式與動畫。
3) JS：在 main.js 新增 PreloaderManager（包含最小/最大時間門檻與資源聚合等待）。
4) DOM 注入：main.js 啟動時插入 overlay（所有頁面共用，不改動多個 HTML）。
5) 資源標記：為關鍵圖片加上 data-preload 或集中清單。
6) sessionOnce/除錯開關：sessionStorage 與 ?no-preloader=1。
7) a11y：role/aria 與 skip 按鈕。
8) 測試：快/慢網路、行動裝置、低階硬體、reduced motion、JS 故障情境。

## 風險與緩解
- 字型等待過久：對 fonts.ready 設 1000ms 上限，逾時不阻擋。
- 第三方資源不穩：放寬逾時並記錄警告，不阻攔主流程。
- 視覺過強：提供亮度/透明度變數以快速微調。

## 時程預估
- CSS 與視覺微調：0.5–1 天。
- JS 管理器與等待邏輯：0.5–1 天。
- 測試與調整：0.5 天。

## 後續擴充（可選）
- 預載入進度估計（以已完成 Promise 比例簡化顯示）。
- 首次載入顯示、後續以細小頂部進度條替代。
- 與現有霓虹呼吸邊框同步節奏，達成整體節拍一致感。
