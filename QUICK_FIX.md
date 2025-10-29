# 快速修正指南

## 問題說明
檔案部署在 `/var/www/html/aicustom/web/網頁內容/`，路徑比預期深，導致資源載入 404 錯誤。

## ✅ 已修正內容

### 1. 所有 HTML 檔案已添加 `<base>` 標籤
```html
<base href="/aicustom/web/網頁內容/">
```

這會讓瀏覽器知道所有相對路徑的起始位置。

### 2. `.htaccess` 已更新
```apache
RewriteBase /aicustom/web/網頁內容/
RewriteRule . /aicustom/web/網頁內容/index.html [L]
```

---

## 🚀 立即部署步驟

### 1. 上傳修改後的檔案到伺服器

```bash
# 使用 SCP 上傳（從你的本地電腦執行）
scp index.html user@your-server:/var/www/html/aicustom/web/網頁內容/
scp slides.html user@your-server:/var/www/html/aicustom/web/網頁內容/
scp videos.html user@your-server:/var/www/html/aicustom/web/網頁內容/
scp poster.html user@your-server:/var/www/html/aicustom/web/網頁內容/
scp intro.html user@your-server:/var/www/html/aicustom/web/網頁內容/
scp .htaccess user@your-server:/var/www/html/aicustom/web/網頁內容/

# 或者一次上傳所有檔案
scp -r ./* user@your-server:/var/www/html/aicustom/web/網頁內容/
```

### 2. 設定檔案權限（SSH 登入伺服器後執行）

```bash
cd /var/www/html/aicustom/web/網頁內容
sudo chown -R www-data:www-data .
sudo find . -type f -exec chmod 644 {} \;
sudo find . -type d -exec chmod 755 {} \;
```

### 3. 確認 Apache 模組已啟用

```bash
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires
sudo a2enmod headers
sudo systemctl restart apache2
```

### 4. 測試網站

瀏覽器訪問：
```
https://your-domain.com/aicustom/web/網頁內容/
```

或

```
https://your-domain.com/aicustom/web/網頁內容/index.html
```

---

## 🔍 驗證檢查

### 瀏覽器 Console 檢查
1. 按 F12 打開開發者工具
2. 查看 **Console** 標籤：
   - ✅ 應該沒有紅色錯誤訊息
   - ✅ 看到 "🚀 AI康斯特網站已成功初始化"

3. 查看 **Network** 標籤：
   - ✅ `site.json` - 狀態 200
   - ✅ `header.html` - 狀態 200
   - ✅ `footer.html` - 狀態 200
   - ✅ `main.js` - 狀態 200
   - ✅ 所有 CSS 檔案 - 狀態 200

### 功能測試
- [ ] 首頁正常顯示
- [ ] 導覽列可點擊切換頁面
- [ ] 投影片頁面 PDF 正常顯示
- [ ] 影片頁面可開啟 YouTube modal
- [ ] 海報頁面圖片正常載入
- [ ] 介紹頁面 PDF 正常顯示

---

## ⚠️ 如果還是有問題

### 問題 A：仍然出現 404 錯誤

**可能原因 1：檔案沒有正確上傳**
```bash
# 檢查檔案是否存在
ls -la /var/www/html/aicustom/web/網頁內容/
ls -la /var/www/html/aicustom/web/網頁內容/assets/
ls -la /var/www/html/aicustom/web/網頁內容/partials/
ls -la /var/www/html/aicustom/web/網頁內容/data/
```

**可能原因 2：.htaccess 沒有生效**
```bash
# 檢查 Apache 配置是否允許 .htaccess
sudo nano /etc/apache2/sites-available/000-default.conf

# 確認有以下設定：
<Directory /var/www/html>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

# 儲存後重啟 Apache
sudo systemctl restart apache2
```

### 問題 B：CSS/JS 載入但樣式不正確

清除瀏覽器快取：
- Chrome：Ctrl + Shift + Delete
- Firefox：Ctrl + Shift + Delete
- 或使用無痕模式測試

### 問題 C：「網頁內容」資料夾名稱問題

如果資料夾名稱包含中文導致問題，建議重新命名：

```bash
# 在伺服器上執行
cd /var/www/html/aicustom/web
sudo mv 網頁內容 web_content

# 然後修改所有 HTML 的 <base> 標籤：
<base href="/aicustom/web/web_content/">

# 同時修改 .htaccess：
RewriteBase /aicustom/web/web_content/
RewriteRule . /aicustom/web/web_content/index.html [L]
```

---

## 📊 `<base>` 標籤的作用

```html
<base href="/aicustom/web/網頁內容/">
```

這個標籤告訴瀏覽器：
- 所有 `./assets/css/base.css` 會解析為 `/aicustom/web/網頁內容/assets/css/base.css`
- 所有 `./index.html` 會解析為 `/aicustom/web/網頁內容/index.html`
- JavaScript 中的 fetch 路徑也會相對於這個 base

**優點**：
- ✅ 不需要修改所有相對路徑
- ✅ 集中管理基礎 URL
- ✅ 容易遷移到其他路徑

**注意**：
- ⚠️ 影響頁面內所有相對 URL（包括錨點 `#section`）
- ⚠️ 如果有錨點導航，需要改為完整路徑：`/aicustom/web/網頁內容/index.html#section`

---

## 🎯 下次部署建議

為了避免路徑問題，建議：

### 選項 1：簡化路徑結構
```bash
/var/www/html/aicustom/  ← 直接在這裡放網頁檔案
```

### 選項 2：使用 Apache Virtual Host
建立獨立站點配置，將 DocumentRoot 直接指向內容資料夾：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/aicustom/web/網頁內容
    
    <Directory /var/www/html/aicustom/web/網頁內容>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

這樣就不需要 `<base>` 標籤，所有路徑從網站根目錄開始。

---

## 需要協助？

如果上述步驟無法解決問題，請提供：
1. 瀏覽器 Console 完整錯誤訊息截圖
2. Network 標籤中失敗的請求詳情
3. Apache error.log 內容：
   ```bash
   sudo tail -f /var/log/apache2/error.log
   ```
