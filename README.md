# AI 客服專題入口網站

> 科技未來 × 賽博龐克風格的專題展示網站，作為 AI 客服系統的入口門戶。

## 快速開始

### 本機預覽
- **Windows**: 使用 VS Code Live Server 外掛，或在專案根目錄執行 `python -m http.server 8080`
- **Linux/Ubuntu**: 在專案根目錄執行 `python3 -m http.server 8080`

### 修改連結與內容
1. 所有連結與設定集中於 `data/site.json`
2. 修改後儲存，重新整理頁面即可看到更新
3. 詳細說明請參考 `doc/04_Links_Config.md`

### 特效控制
- URL 參數：加上 `?fx=off` 關閉所有特效
- 設定檔：修改 `data/site.json` 中的 `effects` 區塊
- 自動偵測：支援 `prefers-reduced-motion` 自動降級

## 專案結構
```
/ (project root)
├─ index.html         # 首頁
├─ slides.html        # 投影片
├─ videos.html        # 影片
├─ poster.html        # 海報
├─ intro.html         # 介紹
├─ assets/            # 資源檔案
├─ partials/          # 可重用元件
├─ data/              # 設定與資料
└─ doc/               # 專案文件
```

## 技術棧
- 純靜態 HTML/CSS/JavaScript
- Web Components（原生）
- Google Fonts（Orbitron + Noto Sans TC）
- 特效：粒子背景、Three.js 3D、滾動動效

## 部署
適用於 Ubuntu 伺服器（2GB RAM / 2 CPU / 60GB SSD）
- Web Server: Nginx 或 Apache
- 啟用 gzip/br 壓縮
- 設定正確的 MIME types（PDF/MP4/WebM）
- 為 assets/ 設定長期快取

## 文件
- [專案計畫書](doc/01_Project_Plan.md)
- [專案架構](doc/02_Project_Structure.md)
- [風格指南](doc/03_Style_Guide.md)  
- [連結設定說明](doc/04_Links_Config.md)
- [第一步實作計畫](doc/05_First_Steps_Plan.md)
