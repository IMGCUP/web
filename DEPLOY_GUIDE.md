# Ubuntu 部署指南

本專案已修改為使用相對路徑，可部署至任意子目錄。

## 快速部署步驟

### 1. 上傳檔案至伺服器

```bash
# 透過 SCP 上傳（從本地執行）
scp -r ./* user@your-server:/var/www/html/aicustom/

# 或使用 rsync（推薦）
rsync -avz --exclude 'node_modules' --exclude '.git' ./* user@your-server:/var/www/html/aicustom/
```

### 2. 設定檔案權限

```bash
# 登入伺服器後執行
cd /var/www/html/aicustom
sudo chown -R www-data:www-data .
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;
```

### 3. 配置 Nginx

#### 方案 A：作為子目錄（推薦）

編輯 Nginx 配置檔：

```bash
sudo nano /etc/nginx/sites-available/default
```

在 `server` 區塊內新增：

```nginx
# AI康斯特專案
location /aicustom {
    alias /var/www/html/aicustom;
    index index.html;
    
    # 處理 SPA 路由（如果需要）
    try_files $uri $uri/ /aicustom/index.html;
    
    # 靜態資源快取
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|pdf|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # 啟用 gzip 壓縮
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;
}
```

#### 方案 B：作為獨立站點

建立新的 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/aicustom
```

內容：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改為你的域名
    
    root /var/www/html/aicustom;
    index index.html;
    
    # 主要 location
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 靜態資源快取
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|pdf|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # 啟用 gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;
    
    # 安全性 headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

啟用站點並重啟 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/aicustom /etc/nginx/sites-enabled/
sudo nginx -t  # 測試配置
sudo systemctl reload nginx
```

### 4. 配置 Apache（替代方案）

如果你使用 Apache 而非 Nginx：

編輯 `.htaccess`（已在專案根目錄）：

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /aicustom/
    
    # 如果檔案或目錄存在，直接訪問
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # 否則導向 index.html
    RewriteRule . /aicustom/index.html [L]
</IfModule>

# 啟用 gzip 壓縮
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml
</IfModule>

# 快取靜態資源
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType application/pdf "access plus 1 year"
</IfModule>
```

確保啟用必要模組：

```bash
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires
sudo systemctl restart apache2
```

## 測試與驗證

### 1. 測試網站是否正常

```bash
# 使用 curl 測試
curl -I http://your-server/aicustom/

# 預期回應：HTTP/1.1 200 OK
```

### 2. 瀏覽器測試

訪問：`http://your-server/aicustom/`

檢查項目：
- [ ] 首頁是否正常顯示
- [ ] CSS 樣式是否正確載入
- [ ] JavaScript 功能是否正常
- [ ] 導覽列連結是否正確
- [ ] 投影片/影片/海報/介紹頁面是否可訪問

### 3. 檢查 Console 錯誤

按 F12 開啟開發者工具，檢查：
- [ ] Network 標籤：所有資源是否成功載入（200 狀態碼）
- [ ] Console 標籤：是否有 404 或其他錯誤

## 常見問題排解

### 問題 1：CSS/JS 無法載入（404 錯誤）

**原因**：路徑配置錯誤或檔案權限問題

**解決**：
```bash
# 檢查檔案是否存在
ls -la /var/www/html/aicustom/assets/

# 確認權限
sudo chmod -R 755 /var/www/html/aicustom/assets/
```

### 問題 2：頁面顯示空白

**原因**：JavaScript 模組載入失敗

**解決**：
1. 檢查瀏覽器 Console 錯誤訊息
2. 確認 Nginx/Apache 正確設定 MIME types：
```nginx
# 在 nginx.conf 或 http 區塊中
types {
    text/html                 html htm shtml;
    text/css                  css;
    text/javascript           js mjs;
    application/javascript    js;
    application/json          json;
    image/svg+xml             svg svgz;
}
```

### 問題 3：PDF 無法顯示

**原因**：瀏覽器或伺服器配置問題

**解決**：
```nginx
# 確保 PDF MIME type 正確
location ~* \.pdf$ {
    types {
        application/pdf pdf;
    }
    add_header Content-Type application/pdf;
}
```

### 問題 4：403 Forbidden 錯誤

**原因**：檔案權限不足

**解決**：
```bash
sudo chown -R www-data:www-data /var/www/html/aicustom
sudo chmod -R 755 /var/www/html/aicustom
```

## 效能優化建議

### 1. 啟用 HTTP/2

```nginx
listen 443 ssl http2;
```

### 2. 設定 CDN（可選）

將 `assets/` 目錄同步至 CDN，並修改 `site.json` 中的路徑。

### 3. 圖片優化

```bash
# 安裝 imagemagick
sudo apt install imagemagick

# 壓縮 PNG
find ./assets -name "*.png" -exec convert {} -quality 85 {} \;
```

## 安全性建議

### 1. 設定 HTTPS（強烈建議）

```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. 隱藏敏感資訊

確保 `.git`、`doc/`、`README.md` 等開發檔案不可訪問：

```nginx
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

location ~ ^/(doc|node_modules) {
    deny all;
}
```

## 變更記錄

- **2025-10-29**：將所有絕對路徑改為相對路徑，支援子目錄部署

## 需要協助？

如遇問題，請檢查：
1. Nginx/Apache 錯誤日誌：`/var/log/nginx/error.log` 或 `/var/log/apache2/error.log`
2. 瀏覽器開發者工具 Console 和 Network 標籤
3. 檔案權限：`ls -la /var/www/html/aicustom/`
