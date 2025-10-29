# Nginx 子路徑部署設定指引

## 問題情境
- 站點部署於：`https://aicustom.rezyln.dpdns.org/web-reverse/`
- 子路徑：`/web-reverse/`
- 靜態資源必須正確回應，不可被 SPA fallback 攔截

---

## 推薦 Nginx 設定

### 方案 A：使用 location /web-reverse/（推薦）

```nginx
server {
    server_name aicustom.rezyln.dpdns.org;
    
    # 引入 MIME 類型
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 子路徑部署
    location /web-reverse/ {
        alias /var/www/web/;  # 注意：alias 必須有結尾斜線！
        
        # 先嘗試直接回應檔案，否則回退到 index.html（SPA）
        try_files $uri $uri/ /web-reverse/index.html;
        
        # 靜態資源快取（可選）
        location ~* ^/web-reverse/assets/.*\.(png|jpe?g|gif|webp|svg|ico|pdf|css|js)$ {
            alias /var/www/web/;
            expires 1y;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }
}
```

### 方案 B：使用 root + location（備選）

```nginx
server {
    server_name aicustom.rezyln.dpdns.org;
    root /var/www;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    location /web-reverse/ {
        # root 模式：Nginx 會在 /var/www/web-reverse/ 找檔案
        # 確保實際路徑為 /var/www/web-reverse/
        try_files $uri $uri/ /web-reverse/index.html;
    }
    
    # 靜態資源優先處理（避免被 try_files 攔截為 404 後回退）
    location ~* ^/web-reverse/assets/.*\.(png|jpe?g|gif|webp|svg|ico|pdf)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## 關鍵點說明

### 1. alias vs root
- **alias**：路徑替換，`location /web-reverse/` + `alias /var/www/web/` → 請求 `/web-reverse/assets/poster/poster.png` 對應 `/var/www/web/assets/poster/poster.png`
- **root**：路徑附加，`location /web-reverse/` + `root /var/www/` → 請求 `/web-reverse/assets/poster/poster.png` 對應 `/var/www/web-reverse/assets/poster/poster.png`

**注意**：`alias` 結尾必須有 `/`，且 `location` 結尾也要有 `/` 才能匹配！

### 2. try_files 順序
```nginx
try_files $uri $uri/ /web-reverse/index.html;
```
- `$uri`：先嘗試直接檔案（如 `poster.png`）
- `$uri/`：嘗試目錄 + index
- `/web-reverse/index.html`：SPA 回退（**必須是絕對路徑**）

### 3. MIME 類型
確保 `/etc/nginx/mime.types` 包含：
```nginx
types {
    text/html                             html htm shtml;
    text/css                              css;
    application/javascript                js;
    application/json                      json;
    image/png                             png;
    image/jpeg                            jpg jpeg;
    image/gif                             gif;
    image/webp                            webp;
    image/svg+xml                         svg svgz;
    application/pdf                       pdf;
}
```

若缺少 WebP/PDF，手動補充：
```nginx
types {
    image/webp webp;
    application/pdf pdf;
}
```

---

## 部署與驗證步驟

### 1. 備份現有設定
```bash
sudo cp /etc/nginx/sites-available/your-site /etc/nginx/sites-available/your-site.bak.$(date +%Y%m%d)
```

### 2. 編輯設定
```bash
sudo nano /etc/nginx/sites-available/your-site
```

### 3. 測試設定
```bash
sudo nginx -t
```
若輸出 `syntax is ok` 與 `test is successful` 即可繼續。

### 4. 重新載入
```bash
sudo systemctl reload nginx
# 或
sudo nginx -s reload
```

### 5. 驗證資源
```bash
# 測試圖片
curl -I https://aicustom.rezyln.dpdns.org/web-reverse/assets/poster/poster.png

# 測試 PDF
curl -I https://aicustom.rezyln.dpdns.org/web-reverse/assets/intro/intro.pdf

# 測試 CSS
curl -I https://aicustom.rezyln.dpdns.org/web-reverse/assets/css/base.css
```

預期回應：
- **Status**: `200 OK`
- **Content-Type**: `image/png` / `application/pdf` / `text/css`
- **Content-Length**: 檔案實際大小（非 HTML 的幾 KB）

### 6. 瀏覽器測試
開啟 DevTools → Network：
- 勾選 **Disable cache**
- 重新整理 `https://aicustom.rezyln.dpdns.org/web-reverse/poster.html`
- 確認：
  - `poster.png` → 200，Type: `png`
  - `base.css` → 200，Type: `css`
  - `main.js` → 200，Type: `js`

---

## 常見錯誤排查

### 錯誤 1：404 Not Found
**現象**：`/web-reverse/assets/poster/poster.png` 回應 404  
**檢查**：
```bash
# 確認實體檔案存在
ls -lh /var/www/web/assets/poster/poster.png

# 確認權限
sudo chown -R www-data:www-data /var/www/web
sudo find /var/www/web -type f -exec chmod 644 {} +
sudo find /var/www/web -type d -exec chmod 755 {} +
```

### 錯誤 2：200 但回傳 HTML（被 SPA fallback 攔截）
**現象**：Network 顯示 200，但 Response 是 `<!DOCTYPE html>`  
**原因**：`try_files` 找不到檔案，回退到 `index.html`  
**解決**：
- 確認 `alias` 或 `root` 路徑正確
- 確認 `location` 與 `alias` 結尾斜線一致
- 靜態資源的 `location` 區塊要在 `try_files` 之前或內部正確處理

### 錯誤 3：Content-Type 錯誤（text/plain 或 application/octet-stream）
**現象**：PDF 顯示為 `application/octet-stream` 或 `text/plain`  
**解決**：
```nginx
include /etc/nginx/mime.types;
default_type application/octet-stream;

# 或手動補充
types {
    application/pdf pdf;
    image/webp webp;
}
```

### 錯誤 4：alias 與 location 不匹配
**錯誤範例**：
```nginx
location /web-reverse {  # 無結尾斜線
    alias /var/www/web/;  # 有結尾斜線
}
```
**正確**：
```nginx
location /web-reverse/ {  # 有結尾斜線
    alias /var/www/web/;  # 有結尾斜線
}
```

---

## 進階：反向代理情境

若 Nginx 僅作為反向代理，上游應用處理 `/web-reverse/`：

```nginx
upstream backend {
    server 127.0.0.1:3000;
}

server {
    server_name aicustom.rezyln.dpdns.org;

    # 靜態資源直接回應
    location /web-reverse/assets/ {
        alias /var/www/web/assets/;
        expires 1y;
    }

    location /web-reverse/data/ {
        alias /var/www/web/data/;
        expires 1h;
    }

    # 其餘代理到上游
    location /web-reverse/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 檢查清單

- [ ] 確認部署目錄路徑與 Nginx `alias`/`root` 一致
- [ ] `location` 與 `alias` 結尾斜線匹配
- [ ] `include /etc/nginx/mime.types;` 存在
- [ ] `try_files` 回退路徑為 `/web-reverse/index.html`（絕對路徑）
- [ ] 靜態資源 location 在 SPA fallback 之前或正確處理
- [ ] 權限：`www-data` 可讀取，檔案 644，目錄 755
- [ ] `nginx -t` 通過測試
- [ ] 瀏覽器 DevTools Network 確認 200 + 正確 MIME
- [ ] PDF/圖片實際可開啟與內嵌顯示

---

## 回滾方案

若設定出錯導致站點無法存取：
```bash
# 還原備份
sudo cp /etc/nginx/sites-available/your-site.bak.YYYYMMDD /etc/nginx/sites-available/your-site
sudo nginx -t && sudo systemctl reload nginx
```

---

## 參考資料
- Nginx alias vs root: https://nginx.org/en/docs/http/ngx_http_core_module.html#alias
- try_files directive: https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files
- MIME types: https://nginx.org/en/docs/http/ngx_http_core_module.html#types
