# Master Setup & Operations Standard Operating Procedure (SOP)
## Yathu Iyarkaiyagam E-Commerce Platform

This document is the master operational manual and technical deployment guide for the **Yathu Iyarkaiyagam E-Commerce Application**. It covers end-to-end administration, from displaying products to customers on the frontend storefront to updating products in the admin login, setting up Hostinger database & hosting, managing Cloudinary image assets, and configuring domains and security.

---

## 1. Section A: Storefront Product Display Logic

### How Products are Displayed to Customers
1. **Catalog Categories**:
   - The homepage and navigation bar dynamically query `/api/v1/cms/categories`.
   - All 10 catalog categories (`Traditional Oils`, `Millet Noodles`, `Millet Vermicelli`, `Natural Sweeteners & Salts`, `Organic Millets`, `Traditional Heritage Rices`, `Healthy Grain Flours`, `Millet & Rice Flakes`, `Organic Pulses & Dals`, `Traditional Healthy Snacks & Sweets`) display localized English & Tamil names.
2. **Product List & Filters**:
   - Customers filter products by Category, Search query, Language (EN/TA), and Sorting (Price Low-to-High, High-to-Low, Popularity).
   - API Endpoint: `GET /api/v1/cms/products?category=traditional-oils&search=coconut`
3. **Product Detail Page (PDP)**:
   - Displays high-resolution Cloudinary image, brand tag (`Yathu Iyarkaiyagam`), Tamil description, variant selector buttons (e.g., `1L Bottle`, `500ml Bottle`), price, discount price, and real-time inventory badge (`In Stock` / `Out of Stock`).
4. **Pincode Delivery Availability Checker**:
   - Customers enter their 6-digit Pincode (e.g., `600001` Chennai).
   - System checks `pincodes` table and displays estimated delivery days and delivery charge.

---

## 2. Section B: Admin Login & Product Management Guide

### Accessing the Admin Portal
1. **URL**: `https://yathuiyarkaiyagam.in/admin/login` (or `http://localhost:3000/admin/login` in development).
2. **Default Super Admin Credentials**:
   - **Email**: `admin@yathu.com`
   - **Password**: `admin123` *(Must be changed upon initial deployment)*
3. **Role-Based Access Control**:
   - Only accounts with `Role = ADMIN` can execute CRUD operations on categories, products, variants, and stock.

### Operational Walkthrough: Adding & Updating Products

#### 1. Adding a New Product
1. Log into Admin Portal > Navigate to **Catalog** > **Products**.
2. Click **+ Add New Product**.
3. **Basic Information**:
   - Select **Category** from dropdown.
   - Enter **Name (English)**: e.g., `Organic Palm Candy`
   - Enter **Name (Tamil)**: e.g., `பனங்கற்கண்டு`
   - **Brand**: Defaulted to `Yathu Iyarkaiyagam`.
   - Enter **Description (English & Tamil)**.
4. **Product Image**:
   - Click **Upload Thumbnail**. Select image file from device.
   - The file automatically uploads to Cloudinary folder `yathu/products/` and populates `thumbnailUrl`.
5. **Add Variants**:
   - Click **+ Add Variant**.
   - Select Weight / Size (e.g., `500GM`, `1KG`).
   - Enter **SKU** (e.g., `YI-SWE-PALM-500GM`).
   - Enter **Selling Price (₹)** and **Discount Price (₹)**.
   - Enter **Initial Available Stock Quantity** (e.g., `50`).
6. Click **Save Product**. Product becomes instantly visible on storefront.

#### 2. Updating Prices & Stock Levels
1. Go to Admin Portal > **Products**.
2. Search for the product name. Click **Edit**.
3. In the Variants table:
   - Change **Price** or **Discount Price**.
   - Update **Available Quantity**. Setting stock to `0` automatically displays an **Out of Stock** badge to customers and disables the "Add to Cart" button.
4. Click **Update Product**.

#### 3. Deleting / Deactivating Products
- **Soft Delete**: Clicking **Deactivate** sets `isActive = false`, hiding it from storefront search while preserving historical customer orders.
- **Hard Delete**: Available only for products with zero past order history.

---

## 3. Section C: Hostinger Deployment & Database Setup

### Step-by-Step Server Provisioning
1. **Server Choice**: Hostinger VPS (Ubuntu 22.04 LTS, 2 vCPU, 4GB RAM).
2. **System Preparation**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y nodejs npm git nginx postgresql postgresql-contrib
   sudo npm install -y -g pm2 pnpm
   ```

3. **Database Creation**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE yathu_ecommerce_db;
   CREATE USER yathu_admin WITH PASSWORD 'ProductionPass2026!';
   GRANT ALL PRIVILEGES ON DATABASE yathu_ecommerce_db TO yathu_admin;
   \q
   ```

4. **Code Deployment**:
   ```bash
   git clone https://github.com/Devaprem1996/Ecommerce_Production.git /var/www/yathu
   cd /var/www/yathu/backend
   pnpm install
   ```

5. **Configuring Environment Variables (`/var/www/yathu/backend/.env`)**:
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL="postgresql://yathu_admin:ProductionPass2026!@localhost:5432/yathu_ecommerce_db?schema=public"
   JWT_SECRET="super_secret_jwt_key_yathu_2026"
   CLOUDINARY_CLOUD_NAME="yathu-iyarkaiyagam"
   CLOUDINARY_API_KEY="839281729381"
   CLOUDINARY_API_SECRET="your_cloudinary_secret"
   ```

6. **Run Database Migrations & Seed**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

7. **Start Backend with PM2**:
   ```bash
   pnpm build
   pm2 start dist/server.js --name "yathu-backend"
   ```

8. **Build & Start Frontend**:
   ```bash
   cd /var/www/yathu/frontend
   pnpm install
   pnpm build
   pm2 start npm --name "yathu-frontend" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```

---

## 4. Section D: Database Backup & Security Protocols

### Automated Daily Database Backups
To protect against data corruption or hardware issues:
1. Create backup script `/var/www/yathu/backup.sh`:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/postgres"
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   mkdir -p $BACKUP_DIR
   pg_dump -U yathu_admin -d yathu_ecommerce_db | gzip > "$BACKUP_DIR/yathu_db_$TIMESTAMP.sql.gz"
   # Keep only last 14 days of backups
   find $BACKUP_DIR -type f -mtime +14 -name "*.sql.gz" -delete
   ```
2. Make executable and add cron job:
   ```bash
   chmod +x /var/www/yathu/backup.sh
   (crontab -l 2>/dev/null; echo "0 2 * * * /var/www/yathu/backup.sh") | crontab -
   ```
   *(Executes automated compressed backup every night at 2:00 AM).*

### Security Protocols
- **SSL / TLS Encryption**: Let's Encrypt SSL installed via certbot (`sudo certbot --nginx -d yathuiyarkaiyagam.in`).
- **HTTP Security Headers**: `helmet` middleware enforced on Express backend.
- **Rate Limiting**: Express rate limiting enabled (`100 requests per 15 minutes` per IP address) to prevent DDoS attacks.
- **Database Firewall**: PostgreSQL bound exclusively to `localhost` (port 5432 blocked from public internet).

---

## 5. Section E: Domain Configuration Guide (Hostinger India / Namecheap)

### Pointing Domain DNS Records to Hostinger VPS
1. Log into Domain Registrar (Hostinger India or Namecheap).
2. Go to **DNS Zone Manager** / **Nameservers**.
3. Add/Update **A Records**:
   - **Type**: `A` | **Host/Name**: `@` | **Value/Points To**: `<YOUR_HOSTINGER_VPS_IP>` | **TTL**: `3600`
   - **Type**: `A` | **Host/Name**: `www` | **Value/Points To**: `<YOUR_HOSTINGER_VPS_IP>` | **TTL**: `3600`
4. Configure Nginx virtual host (`/etc/nginx/sites-available/yathu`):
   ```nginx
   server {
       listen 80;
       server_name yathuiyarkaiyagam.in www.yathuiyarkaiyagam.in;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
5. Enable and test Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/yathu /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```
6. Issue SSL Certificate:
   ```bash
   sudo certbot --nginx -d yathuiyarkaiyagam.in -d www.yathuiyarkaiyagam.in
   ```

---

## 6. Section F: Phase 2 Hold Notice (Payments & Shipping)

As instructed, **Payment Gateway** (Razorpay/Cashfree) and **Logistics API** (Shiprocket) integrations are placed **ON HOLD for Phase 2**.

### Initial Phase 1 Operation:
- **Orders**: Processed with **Manual Order Confirmation** / **Cash on Delivery (COD)** or **Direct Store UPI QR Transfer**.
- **Delivery**: Managed via local delivery team and pincode table (`pincodes`) seeded with Tamil Nadu & South India pincodes.
- **Phase 2 Transition Plan**: When ready to enable automated online payments and automated courier dispatch, activate Razorpay API keys and Shiprocket SDK modules without interrupting the live storefront.
