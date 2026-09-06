# Comprehensive Research & Technical Integration Guide: Hostinger, Cloudinary & Operations

This document provides in-depth technical research and actionable instructions for deploying the **Yathu Iyarkaiyagam E-Commerce Platform** to **Hostinger**, integrating **Cloudinary** for image delivery, collecting product assets, managing database connections, and registering domains suitable for the Indian market.

---

## 1. Indian Domain Selection & Purchase Guide

### Domain TLD Recommendation for E-Commerce in India
For an organic food, traditional oil, and herbal brand targeting customers in South India and nationwide:
- **Primary Choice**: `.in` (e.g., `yathuiyarkaiyagam.in` or `yathuorganic.in`)
  - **Why**: Signals trust and local authenticity to Indian buyers, has high availability, and costs ~₹399 - ₹599/year.
- **Secondary Choice**: `.com` (e.g., `yathuiyarkaiyagam.com`)
  - **Why**: Global recognition; ideal if international shipping is planned later (~₹899 - ₹1,099/year).
- **Alternative Choice**: `.co.in` (e.g., `yathuiyarkaiyagam.co.in`)
  - **Why**: Cost-effective fallback if `.in` and `.com` are unavailable.

### Best Registrar Options in India
1. **Hostinger India (`hostinger.in`)** *(Recommended)*:
   - Includes **Free Domain Name** for 1 year when purchasing Hostinger VPS or Business Web Hosting plans.
   - Simplified DNS management inside the single hPanel dashboard.
2. **Namecheap**:
   - Includes Free Privacy Protection (WhoisGuard) forever, lower renewal prices.

---

## 2. Research 1: How to Create a Database in Hostinger

Hostinger provides two primary hosting models for running PostgreSQL databases for Node.js / Express applications:

### Option A: Managed PostgreSQL via Hostinger Cloud / VPS (Recommended for Production)
1. **Access Hostinger hPanel**: Log into `https://hpanel.hostinger.com`.
2. **Navigate to VPS / Cloud Server**: Select your Ubuntu 22.04 LTS VPS instance.
3. **Provision PostgreSQL Database Server**:
   ```bash
   # Connect via SSH to your Hostinger VPS
   ssh root@<your_vps_ip>

   # Install PostgreSQL and contrib package
   sudo apt update && sudo apt install postgresql postgresql-contrib -y

   # Start and enable PostgreSQL service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```
4. **Create Database User & Production Database**:
   ```bash
   sudo -u postgres psql

   # Create dedicated production database
   CREATE DATABASE yathu_ecommerce_db;

   # Create secure database user with password
   CREATE USER yathu_admin WITH PASSWORD 'SecureProductionPassword2026!';

   # Grant full privileges
   GRANT ALL PRIVILEGES ON DATABASE yathu_ecommerce_db TO yathu_admin;
   \q
   ```
5. **Configure Remote Access & SSL (If external access needed)**:
   - Edit `/etc/postgresql/14/main/pg_hba.conf` and `/etc/postgresql/14/main/postgresql.conf` to allow secure connection listening on `localhost` or SSL remote.

---

## 3. Research 2: How to Create a Cloudinary Account & Integrate into Website

### Step 1: Create Cloudinary Account
1. Visit `https://cloudinary.com` and sign up for a free tier account (25 GB free storage, 25K transformations/mo).
2. Go to **Dashboard** and copy your environment credentials:
   - **Cloud Name**: `yathu-iyarkaiyagam`
   - **API Key**: `839281729381`
   - **API Secret**: `your_api_secret_here`
   - **Environment Variable String**: `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@yathu-iyarkaiyagam`

### Step 2: Configure Upload Preset
1. Go to **Settings** > **Upload** > **Upload Presets**.
2. Add upload preset named `yathu_product_preset`.
3. Set Mode to **Unsigned** (for client side) or **Signed** (for secure admin upload).
4. Set Folder path to `yathu/products/`.

### Step 3: Backend Node.js Code Integration (`upload.middleware.ts`)
The project uses `multer` and `cloudinary` v2 SDK:
```typescript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yathu/products',
    allowed_formats: ['jpg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  } as any,
});

export const upload = multer({ storage });
```

---

## 4. Research 3: Methods to Collect Product Images & Optimization SOP

### Product Photography SOP for Client & GM
To build a stunning, professional catalog UI without expensive studio setups:

1. **Lighting & Setup**:
   - Place products on a flat table near natural indirect window light or under bright daylight LED.
   - Use a clean white card or fabric as a background.
2. **Angle & Resolution**:
   - Capture a straight-on **Front Shot (1:1 Square ratio)** showing product label clearly.
   - Capture a **Back Shot** showing ingredients and nutritional info.
   - Take photos at **1080x1080 pixels** or higher using any modern smartphone.
3. **Automated AI Background Removal**:
   - Use free/affordable AI tools to remove cluttered backgrounds instantly:
     - **PhotoRoom** (`photoroom.com`)
     - **Remove.bg** (`remove.bg`)
     - **Clipdrop** (`clipdrop.co/remove-background`)
4. **Standardized Naming Convention**:
   - Save photos matching the product slug:
     - `wood-pressed-coconut-oil_front.jpg`
     - `kodo-millet-noodles_front.jpg`
5. **Bulk Upload Script**:
   - Place all edited images in `./product_photos/` folder.
   - Dev runs custom Node/Python script to upload all files to Cloudinary in bulk and update database `thumbnailUrl`.

---

## 5. Research 4: How to Integrate Website into Hostinger (Deployment Guide)

### Architecture on Hostinger VPS (Ubuntu 22.04 LTS)
```
  [ Client Web Browser ]
            │
            ▼
    [ Cloudflare CDN ]  (SSL & DDoS Protection)
            │
            ▼
     [ Nginx Proxy ]    (Listens on Port 80 / 443)
      │           │
      ▼           ▼
[ Next.js UI ] [ Express Backend ]  (PM2 Process Manager)
 (Port 3000)     (Port 5000)
                  │
                  ▼
          [ PostgreSQL DB ]         (Localhost:5432)
```

### Deploy Steps:
1. **Connect via SSH**:
   ```bash
   ssh root@<hostinger_vps_ip>
   ```
2. **Install Node.js 20 LTS & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git nginx
   sudo npm install -y -g pm2 pnpm
   ```
3. **Clone Repository**:
   ```bash
   git clone https://github.com/Devaprem1996/Ecommerce_Production.git /var/www/yathu
   cd /var/www/yathu
   pnpm install
   ```
4. **Build & Start Backend with PM2**:
   ```bash
   cd /var/www/yathu/backend
   pnpm build
   pm2 start dist/server.js --name "yathu-backend"
   ```
5. **Build & Start Frontend with PM2**:
   ```bash
   cd /var/www/yathu/frontend
   pnpm build
   pm2 start npm --name "yathu-frontend" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```

---

## 6. Research 5: How to Integrate Database into Hostinger Account

### Connecting Backend Prisma ORM to Hostinger PostgreSQL
1. **Set `backend/.env` environment variables**:
   ```env
   DATABASE_URL="postgresql://yathu_admin:SecureProductionPassword2026!@localhost:5432/yathu_ecommerce_db?schema=public"
   PORT=5000
   NODE_ENV=production
   JWT_SECRET="production_jwt_secret_key_987654"
   CLOUDINARY_CLOUD_NAME="yathu-iyarkaiyagam"
   CLOUDINARY_API_KEY="839281729381"
   CLOUDINARY_API_SECRET="your_cloudinary_secret"
   ```
2. **Execute Database Migrations on Hostinger**:
   ```bash
   cd /var/www/yathu/backend
   npx prisma migrate deploy
   ```
3. **Seed Product Catalog**:
   ```bash
   npx prisma db seed
   ```

---

## 7. Research 6: How to Add New Products into Database

Store managers (GM and Client) can add and update products through 3 options:

### Method A: Admin Web Portal Interface (No Coding Required)
1. Log into `https://yathuiyarkaiyagam.in/admin/login` using Admin credentials (`admin@yathu.com`).
2. Navigate to **Catalog Management** > **Products** > **Add New Product**.
3. Fill in:
   - Product Name (English & Tamil)
   - Category Dropdown
   - Brand & Description
   - Image File Upload (automatically uploads to Cloudinary)
   - Variants (Price, SKU, Weight, Available Stock)
4. Click **Save Product**.

### Method B: CMS REST API Endpoint (For Mobile App / Automated Scripts)
- **POST** `/api/v1/cms/products`
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Payload**:
  ```json
  {
    "nameEn": "Wood Pressed Groundnut Oil",
    "nameTa": "மரச்செக்கு கடலை எண்ணெய்",
    "categoryId": "category-uuid",
    "brand": "Yathu Iyarkaiyagam",
    "descriptionEn": "Pure cold pressed oil",
    "descriptionTa": "சுத்தமான கடலை எண்ணெய்",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "variants": [
      {
        "nameEn": "1 Litre Bottle",
        "nameTa": "1 லிட்டர் பாட்டில்",
        "sku": "YI-OIL-GROUN-1L",
        "price": 380.00,
        "discountPrice": 350.00,
        "weight": 1.0,
        "availableQuantity": 50
      }
    ]
  }
  ```

### Method C: Bulk Import via Script / Prisma Studio
- Run Prisma Studio GUI directly on server or dev machine:
  ```bash
  npx prisma studio
  ```
  Opens web UI at `http://localhost:5555` allowing visual spreadsheet-like editing of products.
