# Master Production Launch Checklist & Setup Guide

**Project**: Yathu Arokiyagam E-Commerce Platform  
**Target Architecture**: Hostinger VPS (Ubuntu 22.04 LTS) + PostgreSQL + Next.js Frontend + Express Backend + Cloudinary + Razorpay + Shiprocket  
**Status**: Pre-Launch Readiness Audit  

---

## 1. Executive Summary & Audit Overview

This document presents the complete pre-launch operational checklist, code audit findings, architectural verification, security protocols, and credentials configuration guide to take the application **LIVE**.

---

## 2. Comprehensive Analysis of Your 7 Key Points

### 1. Database Tables & Relationship Mapping Verification
* **Current Status**: 16 Prisma models defined (`users`, `user_profiles`, `addresses`, `categories`, `products`, `product_variants`, `inventory`, `cart`, `wishlist`, `orders`, `order_items`, `payments`, `reviews`, `audit_logs`, `pincodes`, `coupons`).
* **Checks & Fixes Needed**:
  * [ ] **Referential Integrity**: Verify `onDelete` behaviors (`Product` -> `ProductVariant` deletes cascade; `Category` -> `Product` sets null).
  * [ ] **Soft-Delete Uniformity**: Ensure all DB queries filter `deletedAt: null` across `Product`, `ProductVariant`, `User`, `Address`, and `Order` models.
  * [ ] **Database Migration Sync**: Execute `npx prisma migrate deploy` on production database instead of `prisma db push` to maintain strict migration history.
  * [ ] **Index Coverage**: Confirm indexes exist on high-frequency query columns (`slug`, `categoryId`, `sku`, `userId`, `orderNumber`, `createdAt`).

---

### 2. Hostinger VPS Setup (App & Database Sources)
* **Architecture Standard**: Single VPS (Ubuntu 22.04 LTS) running Nginx reverse proxy, PM2 process management, and local PostgreSQL.
* **Checks & Fixes Needed**:
  * [ ] **System Dependencies**: Install Node.js 20 LTS, pnpm, PM2, PostgreSQL 14+, Nginx, and Certbot.
  * [ ] **Database Setup**: Create dedicated database `yathu_ecommerce_db` and restricted DB user `yathu_admin`.
  * [ ] **Nginx Reverse Proxy**: Route `https://yathuarokiyagam.in` to Next.js frontend (Port 3000) and `/api` to Express backend (Port 5000).
  * [ ] **Firewall (`ufw`) Security**: Allow ports `22` (SSH), `80` (HTTP), and `443` (HTTPS). Block public external access to ports `5000` (Express) and `5432` (PostgreSQL).

---

### 3. Security Protocols, Breach Prevention & Error Handling
* **Current Status**: Express configured with `helmet`, `cors`, `express-rate-limit`, Zod schema validation, and global `errorMiddleware`.
* **Checks & Fixes Needed**:
  * [ ] **Auth Brute-Force Rate Limiter**: Apply strict rate limiting (`5 attempts per 15 minutes`) specifically on `/api/v1/auth/login` and `/api/v1/auth/forgot-password`.
  * [ ] **Production CORS Whitelist**: Set explicit `FRONTEND_URL` without wildcards or fallback defaults.
  * [ ] **Secure Cookies**: Enable `secure: true`, `httpOnly: true`, and `sameSite: 'strict'` for JWT cookies in production mode (`NODE_ENV=production`).
  * [ ] **XSS Input Sanitization**: Sanitize product Tamil/English rich text descriptions against HTML script injection.
  * [ ] **Sanitized Error Middleware**: Verify stack traces and DB error details are hidden from API error responses when `NODE_ENV=production`.

---

### 4. Environment Setup & Credentials Guides
* **Checks & Fixes Needed**:
  * [ ] Populate backend `.env` and frontend `.env.production` (see complete guide in Section 4 below).
  * [ ] Secure storage: Ensure `.env` is listed in `.gitignore` and never committed to version control.
  * [ ] Systemd / PM2 env injection: Pass environment variables safely on VPS restart.

---

### 5. Pre-Setup for Payment Partner (Razorpay) & Shipping Partner (Shiprocket)
* **Current Status**: Schema includes `Payment` and `Pincode` models. Razorpay key fields exist in `.env.example`.
* **Checks & Fixes Needed**:
  * [ ] **Razorpay Integration**:
    * Create Razorpay Merchant Account & generate API Key ID + Secret.
    * Implement backend endpoints: `/api/v1/payments/create-order` and `/api/v1/payments/verify`.
    * Configure webhook secret endpoint `/api/v1/payments/webhook` to handle async payment notifications.
  * [ ] **Shipping Partner Integration (Shiprocket / Pincode)**:
    * Seed initial Tamil Nadu & South India pincodes into `pincodes` table.
    * Integrate Shiprocket API for dynamic rate calculation, pincode serviceability checks, and automatic AWB generation upon order confirmation.

---

### 6. Cloudinary Setup for Product Images
* **Current Status**: `config/cloudinary.ts` handles stream uploads to Cloudinary; `upload.middleware.ts` restricts memory uploads to 5MB images.
* **Checks & Fixes Needed**:
  * [ ] **Cloudinary Account Setup**: Configure cloud name, API Key, and API Secret.
  * [ ] **Image Transformations**: Enable automatic format (`f_auto`) and quality (`q_auto`) optimization on uploaded product thumbnails.
  * [ ] **Fallback System**: Ensure UI gracefully displays fallback placeholder SVG when `thumbnailUrl` is null.
  * [ ] **Asset Deletion**: Add deletion logic in `CmsService` to remove old images from Cloudinary when products or categories are deleted/updated.

---

### 7. Admin Product Edits & Database Persistence
* **Current Status**: `CmsService.updateProduct` and `CmsService.updateVariant` update DB records via Prisma.
* **Checks & Fixes Needed**:
  * [ ] **Audit Logging Integration**: Update `CmsController`/`CmsService` to write records to `AuditLog` table whenever admin creates, edits, or deletes a product or variant.
  * [ ] **Slug Auto-Regeneration Collision Check**: Verify product name changes update slug cleanly without breaking foreign relationships or colliding with soft-deleted items.
  * [ ] **Frontend Cache Invalidation**: Implement Next.js revalidation (`revalidatePath` or `revalidateTag`) so updated prices and stock levels instantly reflect on the frontend storefront.

---

## 3. ADDITIONAL CRITICAL CHECKS BEFORE GOING LIVE

Beyond your 7 points, the following 6 areas are mandatory for a production release:

| Area | Check Item | Purpose / Impact |
|---|---|---|
| **8. Transactional Messaging** | SMTP / Email Provider (Resend / SendGrid) | Sending order confirmation receipts, password reset links, and OTP login codes to customers. |
| **9. Database Backups** | Automated `pg_dump` daily cron job | Prevents catastrophic data loss. Backup files should be pushed to offsite storage (S3 / B2). |
| **10. SSL Certificate & Domain** | Let's Encrypt SSL via Certbot | Enables HTTPS protection (`https://yathuarokiyagam.in`) with automated cert renewal. |
| **11. Server Log Rotation** | `pm2-logrotate` module | Prevents PM2 log files from consuming 100% of Hostinger VPS disk space. |
| **12. SEO & Social Metadata** | Next.js Metadata, `sitemap.xml`, `robots.txt` | Ensures Google indexing, Tamil/English meta titles, OpenGraph sharing images for WhatsApp & Facebook. |
| **13. Load & Health Monitoring** | UptimeRobot / Sentry / Health Check | Monitors `/api/v1/health` endpoint and sends instant alerts if the database or server drops. |

---

## 4. Master Environment Setup & Credentials Template

### Backend Production `.env` (`/var/www/yathu/backend/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL="https://yathuarokiyagam.in"

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://yathu_admin:YOUR_STRONG_DB_PASSWORD@localhost:5432/yathu_ecommerce_db?schema=public"

# Authentication Security Secrets
JWT_SECRET="GENERATE_64_CHAR_HEX_SECRET_KEY_FOR_ACCESS_TOKEN"
REFRESH_TOKEN_SECRET="GENERATE_64_CHAR_HEX_SECRET_KEY_FOR_REFRESH_TOKEN"

# Cloudinary Integration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_live_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_signature_secret"

# Shipping Partner API (Shiprocket)
SHIPROCKET_EMAIL="your_shiprocket_email@example.com"
SHIPROCKET_PASSWORD="your_shiprocket_password"

# Transactional Email (Resend / SMTP)
SMTP_HOST="smtp.resend.com"
SMTP_PORT=587
SMTP_USER="resend"
SMTP_PASS="re_xxxxxxxxxxxx"
EMAIL_FROM="Yathu Arokiyagam <orders@yathuarokiyagam.in>"
```

### Frontend Production `.env.production` (`/var/www/yathu/frontend/.env.production`)
```env
NEXT_PUBLIC_API_URL="https://yathuarokiyagam.in/api/v1"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
NEXT_PUBLIC_SITE_URL="https://yathuarokiyagam.in"
```

---

## 5. Phased Deployment Plan

```mermaid
graph TD
    A[Phase 1: Environment & Security Audit] --> B[Phase 2: Database Migration & Seeding]
    B --> C[Phase 3: Hostinger VPS Provisioning]
    C --> D[Phase 4: Integrations Setup Cloudinary, Razorpay, Shiprocket]
    D --> E[Phase 5: Admin DB Verification & Audit Logging]
    E --> F[Phase 6: Domain, SSL & Go Live]
```

---
*Documentation generated for Devaprem1996/Ecommerce_Production*.
