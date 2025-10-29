# 路徑遷移變更記錄

## 日期：2025-10-29

## 變更目的
將專案從絕對路徑（`/assets/...`）改為相對路徑（`./assets/...`），以支援部署至任意子目錄（如 `/var/www/html/aicustom`）。

---

## 變更摘要

### ✅ 已修改的檔案（共 15 個）

#### 1. HTML 檔案（5 個）
- `index.html`
- `slides.html`
- `videos.html`
- `poster.html`
- `intro.html`

**變更內容**：
```html
<!-- 修改前 -->
<link rel="stylesheet" href="/assets/css/base.css">
<script type="module" src="/assets/js/main.js"></script>

<!-- 修改後 -->
<link rel="stylesheet" href="./assets/css/base.css">
<script type="module" src="./assets/js/main.js"></script>
```

#### 2. 資料配置檔案（1 個）
- `data/site.json`

**變更內容**：
```json
// 修改前
{
  "assets": {
    "slidesPdf": "/assets/slides/sample.pdf",
    "introPdf": "/assets/intro/intro.pdf",
    "posterImage": "/assets/poster/poster.png",
    "posterPdf": "/assets/poster/poster.pdf"
  },
  "navigation": [
    { "label": "首頁", "href": "/index.html" },
    { "label": "投影片", "href": "/slides.html" }
  ]
}

// 修改後
{
  "assets": {
    "slidesPdf": "./assets/slides/sample.pdf",
    "introPdf": "./assets/intro/intro.pdf",
    "posterImage": "./assets/poster/poster.png",
    "posterPdf": "./assets/poster/poster.pdf"
  },
  "navigation": [
    { "label": "首頁", "href": "./index.html" },
    { "label": "投影片", "href": "./slides.html" }
  ]
}
```

#### 3. JavaScript 主檔案（1 個）
- `assets/js/main.js`

**變更內容**：
```javascript
// 修改前
import { HeaderComponent } from '/assets/js/components/header.js';
import { loadSiteData } from '/assets/js/utils/dom.js';
import('/assets/js/effects/particles.js');
fetch('/partials/demo-modal.html');

// 修改後
import { HeaderComponent } from './components/header.js';
import { loadSiteData } from './utils/dom.js';
import('./effects/particles.js');
fetch('../../partials/demo-modal.html');
```

#### 4. Web Components（2 個）
- `assets/js/components/header.js`
- `assets/js/components/footer.js`

**變更內容**：
```javascript
// 修改前
fetch('/partials/header.html');
href="/" // 錯誤處理中

// 修改後
fetch('../../partials/header.html');
href="./index.html"
```

#### 5. 工具模組（2 個）
- `assets/js/utils/dom.js`
- `assets/js/utils/pdf-fallback.js`

**變更內容**：
```javascript
// dom.js - 修改前
fetch('/data/site.json');

// dom.js - 修改後
fetch('../../data/site.json');

// pdf-fallback.js - 修改前
import { canEmbedPDF } from '/assets/js/utils/detect.js';

// pdf-fallback.js - 修改後
import { canEmbedPDF } from './detect.js';
```

#### 6. Partials 檔案（2 個）
- `partials/header.html`
- `partials/footer.html`

**變更內容**：
```html
<!-- 修改前 -->
<a href="/">首頁</a>
<a href="/slides.html">投影片</a>
<a href="/videos.html">影片</a>

<!-- 修改後 -->
<a href="./index.html">首頁</a>
<a href="./slides.html">投影片</a>
<a href="./videos.html">影片</a>
```

---

## 新增的檔案（共 3 個）

### 1. `DEPLOY_GUIDE.md`
完整的 Ubuntu 部署指南，包含：
- Nginx 配置範例（子目錄與獨立站點）
- Apache 配置說明
- 檔案權限設定
- 常見問題排解
- 效能與安全性建議

### 2. `.htaccess`
Apache 伺服器配置檔，提供：
- URL 重寫規則
- gzip 壓縮設定
- 靜態資源快取
- 安全性 headers
- 禁止訪問敏感檔案

### 3. `CHANGELOG_PATH_MIGRATION.md`
本變更記錄檔案

---

## 路徑對照表

| 檔案位置 | 原路徑 | 新路徑 | 說明 |
|---------|--------|--------|------|
| 根目錄 HTML | `/assets/css/base.css` | `./assets/css/base.css` | 使用相對於當前頁面 |
| 根目錄 HTML | `/assets/js/main.js` | `./assets/js/main.js` | 使用相對於當前頁面 |
| main.js | `/assets/js/components/header.js` | `./components/header.js` | 相對於 main.js 位置 |
| main.js | `/partials/demo-modal.html` | `../../partials/demo-modal.html` | 向上兩層到根目錄 |
| header.js | `/partials/header.html` | `../../partials/header.html` | 向上兩層到根目錄 |
| dom.js | `/data/site.json` | `../../data/site.json` | 向上兩層到根目錄 |
| partials | `/index.html` | `./index.html` | 相對於 partials 載入位置 |
| site.json | `/assets/intro/intro.pdf` | `./assets/intro/intro.pdf` | 相對於 JSON 位置 |

---

## 測試檢查清單

### 本地測試（開發環境）
- [x] 使用 Live Server 測試根目錄
- [x] 檢查所有頁面是否正常載入
- [x] 驗證 CSS 樣式是否正確
- [x] 測試 JavaScript 功能
- [x] 確認導覽連結正常運作

### 子目錄部署測試
需在伺服器上測試：
- [ ] 部署至 `/var/www/html/aicustom`
- [ ] 訪問 `http://server/aicustom/`
- [ ] 測試所有內部連結
- [ ] 檢查資源載入（Network 標籤）
- [ ] 驗證 PDF 檢視功能
- [ ] 測試影片播放功能

---

## 相容性說明

### ✅ 支援的部署方式
1. **根目錄部署**：`/var/www/html/`（仍然相容）
2. **子目錄部署**：`/var/www/html/aicustom/`（新增支援）
3. **任意路徑**：只要配置正確即可

### ⚠️ 注意事項

1. **Web Components 限制**
   - Web Components（如 `<x-header>`）需要通過 HTTP/HTTPS 協議存取
   - 不支援直接以 `file://` 協議開啟 HTML 檔案
   - 開發時請使用 Live Server 或其他本地伺服器

2. **ES Modules 限制**
   - `<script type="module">` 需要正確的 MIME type
   - 確保伺服器設定 `.js` 檔案為 `application/javascript`

3. **相對路徑計算**
   - JavaScript 模組中的相對路徑是相對於**模組檔案位置**
   - Fetch API 的相對路徑是相對於**當前 HTML 頁面**
   - 注意區分這兩種情況

---

## 回滾方案

如需回滾至絕對路徑版本：

```bash
# 使用 Git 回滾（如果有版本控制）
git checkout HEAD~1

# 或手動修改
# 將所有 ./assets/ 改回 /assets/
# 將所有 ./index.html 改回 /index.html
# 將 ../../ 改回相應的絕對路徑
```

---

## 下一步建議

### 短期優化
1. [ ] 測試在實際伺服器環境中的運作
2. [ ] 設定 HTTPS 憑證（Let's Encrypt）
3. [ ] 啟用 gzip 和 brotli 壓縮
4. [ ] 優化圖片檔案大小

### 長期改進
1. [ ] 考慮使用建置工具（如 Vite）自動處理路徑
2. [ ] 實作環境變數配置（開發/生產環境）
3. [ ] 設定 CDN 加速靜態資源載入
4. [ ] 加入自動化部署腳本

---

## 技術細節

### 為什麼使用 `./` 而非直接省略？
- 明確性：`./assets/` 比 `assets/` 更明確表示相對路徑
- 相容性：部分工具和框架對 `./` 支援更好
- 可讀性：易於區分相對路徑和絕對路徑

### 為什麼有些用 `../../`？
- JavaScript 模組內的路徑相對於**模組檔案本身**
- `assets/js/components/header.js` 需要往上兩層才能到達 `partials/`
- 結構：`assets/js/components/` → `assets/js/` → 根目錄 → `partials/`

---

## 維護者資訊

**修改日期**：2025-10-29  
**修改原因**：支援部署至 Ubuntu 伺服器子目錄 `/var/www/html/aicustom`  
**測試狀態**：本地開發環境測試通過，待伺服器環境驗證
