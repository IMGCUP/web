# PDF/圖片無法載入（Ubuntu）排查與修復計畫書

- 版本：v1.0
- 日期：2025-10-29
- 狀態：草案可執行
- 範圍：部署於 Ubuntu 的本站專案。症狀為 PDF 與圖片無法載入（瀏覽器主控台無明顯錯誤）。

---

## 1. 背景與症狀
- 使用者反映：PDF 與圖片資源在生產站點無法載入。
- 瀏覽器主控台：未見腳本錯誤，但頁面呈現缺圖、PDF 無法顯示/下載。
- 高機率現象：
  - Network 面板顯示資源為 404 或 200 text/html（被 index.html 回退攔截）。
  - 或 Content-Type 不正確（PDF 非 application/pdf、WebP 非 image/webp）。
  - 或實體檔未部署/路徑錯、大小寫不符（Linux 區分大小寫）。

---

## 2. 成因假設清單（優先順序）
- 路由重寫/SPA fallback 攔截靜態檔案，導致資源回傳 200 text/html（index.html）。
- 靜態檔未部署到正確目錄，或 public 路徑/baseHref/assetPrefix 設定錯誤。
- Linux 檔名大小寫不一致（本地大小寫忽略 → 伺服器大小寫敏感）。
- Web server MIME 設定缺失或順序錯誤（Nginx 未 include mime.types、Apache 未啟用 mod_mime）。
- 權限/所有權不當（www-data 無讀取權限、755/644 未正確設定）。
- 反向代理配置錯誤（靜態請求被代理到上游應用，未從磁碟回應）。
- CSP/安全標頭導致嵌入式顯示受限（PDF 內嵌被 frame/object 限制）。
- CDN/CORS/防火牆攔截或回應變形（較少見，但需排除）。

---

## 3. 10 分鐘快速鑑別流程
1) 瀏覽器 DevTools → Network：
   - 勾選 Disable cache。
   - 分類篩選為 Img / Other（查看 .pdf）。
   - 隨機點一個失敗資源 → 檢查 Status、Content-Type、Response。
   - 若看到 200 且 Response 是 HTML，極可能是 SPA fallback 攔截。
2) 直接存取資源 URL：
   - 於新分頁開啟 https://<domain>/<path-to-asset>.png 或 .pdf，觀察狀態碼與檔案行為。
3) 以 cURL 驗證（本地或遠端）：
   ```bash
   curl -I -L https://<domain>/assets/sample.pdf
   curl -I -L https://<domain>/images/logo.png
   ```
   - 確認狀態碼為 200，Content-Type 是否正確（application/pdf、image/png/webp/svg 等）。

---

## 4. 詳細排查步驟

### 4.1 收集環境資訊
- 網域與是否子路徑部署（例如 https://example.com/app/）。
- Web server 類型（Nginx / Apache / 其他）與是否反向代理至上游（Node、PHP、等）。
- 前端框架與建置（React/Vite、Next.js、Angular、Vue、純靜態等）。
- 部署目錄（DocumentRoot/root/alias）與靜態資源實際存放位置。

### 4.2 檔案實體與路徑檢查（Ubuntu）
```bash
# 以實際部署目錄替換 /var/www/site
sudo -s
cd /var/www/site
find . -maxdepth 4 -iname "*.pdf" | head -n 20
find . -maxdepth 4 -iregex ".*\.(png|jpe?g|gif|webp|svg)$" | head -n 20

# 檢查特定檔名（注意大小寫）
ls -l ./public/images/logo.png
```
- 確認建置輸出（例如 dist、build、.next/static、public）是否包含目標資源。
- 檔名在程式碼中引用與磁碟是否一致（Logo.png vs logo.png）。

### 4.3 權限與所有權
```bash
# 假設 Web 使用者群組為 www-data（Nginx/Apache 常見）
sudo chown -R www-data:www-data /var/www/site
find /var/www/site -type d -exec chmod 755 {} +
find /var/www/site -type f -exec chmod 644 {} +
```
- 確保 Web server 具有讀取權限；避免 403 或無法讀取。

### 4.4 Nginx 設定檢查
```bash
sudo nginx -T | sed -n '1,200p'   # 匯出完整設定以檢視（請審閱與脫敏）
```
- 必要重點：
  - `include /etc/nginx/mime.types;` 存在且未被覆蓋。
  - 有 `default_type application/octet-stream;`（缺型別時作為保底）。
  - SPA 站點常見：`location / { try_files $uri $uri/ /index.html; }`
  - 確認靜態資源的 `location` 規則位於能匹配並早於 fallback 的位置，例如：
```nginx
server {
  server_name example.com;
  root /var/www/site;  # 或使用 alias，注意與 try_files 相容性

  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # 先處理靜態資源（避免被 / 的 fallback 攔截）
  location ~* \.(?:png|jpe?g|gif|webp|svg|ico|bmp|tiff|pdf)$ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # 應用主路由（SPA fallback）
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```
- 若使用 `alias`：`location /assets/ { alias /var/www/assets/; }` 需確保尾斜線與實際路徑一致。

### 4.5 Apache 設定檢查
```bash
sudo apachectl -S
sudo apachectl -M | grep mime  # 確認 mod_mime 已啟用
```
- 建議設定重點：
```apache
<VirtualHost *:80>
  ServerName example.com
  DocumentRoot /var/www/site

  # 確保 MIME 型別
  AddType application/pdf .pdf
  AddType image/webp .webp

  <Directory /var/www/site>
    Options FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>

  # SPA 重寫，並避免覆蓋靜態檔案
  RewriteEngine On
  # 先讓實體檔案通過
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # 其餘回退 index.html
  RewriteRule ^ index.html [L]
</VirtualHost>
```

### 4.6 反向代理/上游檢查
- 確認靜態檔未被 proxy_pass 到上游（Node/PHP），應直接從磁碟回應。
- Nginx 範例：
```nginx
# 僅將 API 代理到上游，其餘靜態以檔案回應
location /api/ {
  proxy_pass http://127.0.0.1:3000;
}
```

### 4.7 應用層設定（依框架）
- React（Create React App）：`homepage` 或部署時設置 `PUBLIC_URL`。
- Vite：vite.config.ts 中 `base: '/<子路徑>/'`。
- Next.js：`basePath` 與（必要時）`assetPrefix`。
- Angular：建置參數 `--base-href` 與 `--deploy-url`。
- Vue CLI：`publicPath`。

### 4.8 CSP/安全標頭
- 若使用嚴格 CSP，確認允許 PDF 內嵌的情境：
  - `frame-ancestors` 與 `frame-src`/`object-src` 不應阻擋本站載入 PDF。
- `X-Content-Type-Options: nosniff` 通常不影響圖片與 PDF 顯示，但若 Content-Type 設錯仍可能導致問題 → 請確保型別正確。

### 4.9 日誌檢視與關鍵字
```bash
# Nginx 常見
sudo tail -F /var/log/nginx/access.log | grep -E "\.(png|jpe?g|gif|webp|svg|ico|pdf)"
sudo tail -F /var/log/nginx/error.log

# Apache 常見
sudo tail -F /var/log/apache2/access.log
sudo tail -F /var/log/apache2/error.log
```
- 檢查是否頻繁 404/403 或回應體積異常（HTML 大小回傳給圖片/PDF）。

---

## 5. 修復方案矩陣
- 回傳 200 text/html：
  - 調整 Nginx/Apache 規則順序，先比對靜態副檔名，命中即 `try_files $uri =404;`，再做 SPA fallback。
- 404 Not Found：
  - 確認部署包是否包含資源；修正 public 路徑或 base；修正大小寫；更新引用路徑（相對/絕對）。
- Content-Type 錯誤：
  - Nginx `include /etc/nginx/mime.types;` 並保留 `default_type application/octet-stream;`。
  - Apache 啟用 `mod_mime` 並補齊 `AddType application/pdf .pdf`、`AddType image/webp .webp` 等。
- 權限問題：
  - `chown -R www-data:www-data`、`chmod 755/644`；確認 SELinux/AppArmor 狀態（Ubuntu 常見為 AppArmor）。
- 反向代理：
  - 僅代理 API；靜態透過磁碟；必要時為靜態設定 `location` 或 `Alias`。
- 子路徑部署：
  - 設定 base/publicPath（Vite/Angular/Next.js/Cra），確保產出資源 URL 正確。

---

## 6. 變更與回滾策略
- 以 staging 驗證設定後再上線。
- Nginx/Apache 改動保存備份，例如：`/etc/nginx/sites-available/site.bak`。
- 上線採用 `nginx -t && systemctl reload nginx`（或 `apachectl configtest && systemctl reload apache2`）。
- 出現異常立即回滾至備份設定。

---

## 7. 驗收標準（Acceptance Criteria）
- 指定圖片與 PDF：
  - 以直鏈與頁面內引用皆可載入，狀態碼 200。
  - Content-Type 正確（image/*、application/pdf）。
  - Network 面板 Response 非 HTML。
- 子路徑/多頁面皆可正常存取資源。
- 首頁、內頁、行動裝置與主流瀏覽器（Chrome/Edge/Safari/Firefox）均驗證通過。
- 伺服器存取與錯誤日誌不再出現持續性 404/403/5xx 與回退 HTML 給靜態資源的情形。

---

## 8. 推薦設定範例（可擇一採用並調整路徑）

### 8.1 Nginx（SPA + 靜態資源）
```nginx
server {
  server_name example.com;
  root /var/www/site;

  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # 靜態資源（在 fallback 前）
  location ~* \.(?:png|jpe?g|gif|webp|svg|ico|bmp|tiff|pdf)$ {
    try_files $uri =404;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # 其餘路由回退給 SPA
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 8.2 Apache（SPA + 靜態資源）
```apache
<VirtualHost *:80>
  ServerName example.com
  DocumentRoot /var/www/site

  AddType application/pdf .pdf
  AddType image/webp .webp

  <Directory /var/www/site>
    Options FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>

  RewriteEngine On
  # 先讓實體檔案通過
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  # 其餘回退 index.html
  RewriteRule ^ index.html [L]
</VirtualHost>
```

---

## 9. 驗證腳本與命令（參考）
```bash
# 驗證 Content-Type
curl -sI https://example.com/images/logo.png | grep -i "content-type"
curl -sI https://example.com/assets/sample.pdf | grep -i "content-type"

# 觀察伺服器日誌
sudo tail -n 200 /var/log/nginx/access.log | grep -E "\.(png|jpe?g|gif|webp|svg|ico|pdf)"
sudo tail -n 200 /var/log/nginx/error.log
```

---

## 10. 待辦清單（與實施順序）
- [ ] 收集現場資訊（域名、反代、框架、部署路徑、是否子路徑）
- [ ] 瀏覽器側快速檢查（Network、URL、狀態碼、MIME）
- [ ] 檔案與路徑檢查（實體檔、大小寫、部署輸出）
- [ ] 伺服器設定檢查（Nginx/Apache：重寫規則、mime.types、static/alias、try_files）
- [ ] 權限與所有權檢查（www-data、644/755）
- [ ] CORS/CSP/安全標頭檢查（必要時放寬）
- [ ] 反向代理/上游行為調整（避免靜態被代理）
- [ ] 套用修復（調整設定並 reload）
- [ ] 多瀏覽器/裝置驗證與回歸測試

---

## 11. 需要您提供的資訊（以便快速定製修復）
- 站點 URL 與是否子路徑部署。
- Web server 類型與版本（Nginx/Apache），是否反向代理上游。
- 前端框架與建置方式（例如 Vite/Next.js/Angular/CRA）。
- 任一無法載入之資源的實際 URL。
- 伺服器設定（`nginx -T` 或 vhost/.htaccess 節錄，請脫敏）。
