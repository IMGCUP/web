# Preloader 測試指南

## 已完成功能

✅ **CSS 樣式與動畫**
- 全螢幕覆蓋 `.preloader`
- 霓虹背景效果 `.preloader__backdrop`
- 掃描線動畫
- 網格漂移背景
- 品牌 Logo 呼吸光效
- 進度條動畫
- 略過按鈕（可及性）
- Reduced Motion 支援
- 響應式設計（手機/桌面）

✅ **JavaScript PreloaderManager**
- `show()` - 顯示 overlay 並注入 DOM
- `hide()` - 處理最小顯示時間並優雅移除
- `waitForCritical()` - 等待字型與 data-preload 圖片
- 支援 `sessionOnce` 參數（每 session 只顯示一次）
- 支援 `?no-preloader=1` URL 參數跳過
- 整合到 `main.js` 初始化流程

✅ **可及性（a11y）**
- `role="status"` 與 `aria-live="polite"`
- 可聚焦的「略過載入」按鈕

✅ **設定與控制**
- `minDuration: 2000ms`（最小顯示時間）
- `maxDuration: 3000ms`（最大等待時間）
- `sessionOnce: false`（可改為 true）
- URL 參數 `?no-preloader=1` 跳過

## 測試項目

### 1. 基本功能測試

#### 1.1 首次載入
- [ ] 打開 `index.html`，確認 preloader 在 0-100ms 內可見
- [ ] 觀察 Logo「AI康斯特」呼吸光效
- [ ] 觀察進度條動畫
- [ ] 觀察掃描線由上至下移動
- [ ] 確認 preloader 在 2-3 秒後消失
- [ ] 確認淡出過渡流暢，無閃爍

#### 1.2 多頁面測試
測試所有入口頁面：
- [ ] `index.html`
- [ ] `slides.html`
- [ ] `videos.html`
- [ ] `poster.html`
- [ ] `intro.html`

### 2. 時間規格驗收

#### 2.1 最小顯示時間（2000ms）
```javascript
// 在 console 測試
const start = Date.now();
// 重新載入頁面後觀察
// preloader 消失時記錄：Date.now() - start
// 應該 >= 2000ms
```

#### 2.2 最大等待時間（3000ms）
- [ ] 模擬慢速網路（Chrome DevTools > Network > Slow 3G）
- [ ] 確認即使資源未完全載入，3 秒後也會關閉

### 3. URL 參數與設定測試

#### 3.1 跳過 Preloader
- [ ] 訪問 `index.html?no-preloader=1`
- [ ] 確認沒有顯示 preloader

#### 3.2 SessionOnce 模式
修改 `main.js` 第 175 行：
```javascript
sessionOnce: true  // 改為 true
```
- [ ] 首次載入顯示 preloader
- [ ] 同一分頁內導航到其他頁面，不再顯示
- [ ] 關閉分頁重新開啟，再次顯示

### 4. 可及性（Accessibility）測試

#### 4.1 鍵盤操作
- [ ] 頁面載入時按 `Tab` 鍵
- [ ] 確認可聚焦到「略過」按鈕
- [ ] 按 `Enter` 或 `Space`，確認立即隱藏 preloader

#### 4.2 螢幕閱讀器
- [ ] 使用 NVDA/JAWS/VoiceOver
- [ ] 確認讀出「正在載入網站資源」

### 5. Reduced Motion 測試

#### 5.1 系統偏好設定
**Windows:**
設定 > 輕鬆存取 > 顯示 > 顯示動畫 > 關閉

**macOS:**
系統偏好設定 > 輔助使用 > 顯示器 > 減少動態效果

**或使用 Chrome DevTools:**
- 開啟 DevTools (F12)
- `Ctrl/Cmd + Shift + P` > "Show Rendering"
- 勾選 "Emulate CSS prefers-reduced-motion"

**驗收:**
- [ ] 掃描線動畫停止
- [ ] 網格漂移停止
- [ ] Logo 光效靜態
- [ ] 進度條靜態（固定 50%）
- [ ] 淡出過渡縮短為 200ms

### 6. 響應式測試

#### 6.1 桌面（1920x1080）
- [ ] Logo 大小適中（3rem）
- [ ] 進度條寬度 200px
- [ ] 略過按鈕位置正確

#### 6.2 平板（768x1024）
- [ ] Logo 自動縮放
- [ ] 進度條寬度 150px

#### 6.3 手機（375x667）
- [ ] Logo 縮小為 1.75rem
- [ ] 進度條寬度 150px
- [ ] 略過按鈕字體縮小

### 7. 效能測試

#### 7.1 快速網路
- [ ] 正常 WiFi/4G 連線
- [ ] 確認 preloader 約在 2.3-2.6 秒消失

#### 7.2 慢速網路
- [ ] Chrome DevTools > Network > Slow 3G
- [ ] 確認不超過 3 秒強制關閉

#### 7.3 離線模式
- [ ] Chrome DevTools > Network > Offline
- [ ] 確認 3 秒後仍會關閉（不卡死）

### 8. 資源載入測試

#### 8.1 字型載入
- [ ] 檢查 Bitcount Grid Single 字型是否正確顯示
- [ ] 觀察 Logo 從預設字型切換到目標字型（FOUT）

#### 8.2 圖片預載入（data-preload）
若需測試圖片等待功能，在 HTML 加入：
```html
<img src="./assets/images/test.jpg" data-preload alt="Test">
```
- [ ] 確認 preloader 等待圖片載入完成
- [ ] 確認不超過逾時時間（800ms per image）

### 9. 錯誤處理測試

#### 9.1 JavaScript 錯誤
在 `main.js` 的 `init()` 中故意拋出錯誤：
```javascript
throw new Error('Test error');
```
- [ ] 確認 preloader 仍會在 3 秒後關閉
- [ ] Console 顯示警告但不阻塞

#### 9.2 資源載入失敗
- [ ] 斷開網路載入頁面
- [ ] 確認 preloader 不會永久卡住

### 10. 瀏覽器相容性

測試瀏覽器：
- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）
- [ ] Edge（最新版）
- [ ] Chrome Android
- [ ] Safari iOS

## 驗收標準總結

✅ **視覺驗收**
- Preloader 0-100ms 內可見
- 霓虹風格與主題一致
- 過渡動畫流暢（400ms）

✅ **時間驗收**
- 最小顯示時間 ≥ 2000ms
- 最大等待時間 ≤ 3000ms
- 正常網速下約 2300-2600ms 消失

✅ **功能驗收**
- URL 參數 `?no-preloader=1` 生效
- sessionOnce 模式正確運作
- 略過按鈕可用

✅ **可及性驗收**
- 鍵盤可操作
- ARIA 屬性正確
- Reduced Motion 支援

✅ **效能驗收**
- 不阻塞主執行緒
- 資源載入有逾時保護
- 失敗時優雅降級

## 問題回報格式

如發現問題，請記錄：
1. 瀏覽器與版本
2. 網路環境（快/慢/離線）
3. 裝置類型（桌面/平板/手機）
4. 重現步驟
5. 預期行為 vs 實際行為
6. Console 錯誤訊息（如有）

## 下一步

測試完成後：
1. 根據測試結果微調時間參數
2. 調整視覺效果（顏色/透明度/速度）
3. 更新專案文件（README 或 02_Project_Structure.md）
4. 考慮後續擴充功能（進度估計/頂部進度條）
