# Hostinger & Cloudinary Costing & Infrastructure Analysis Guide
**Brand**: Yathu Iyarkaiyagam (யாது இயற்கையகம்)  
**Target Audience**: Client, Project Lead, & Finance Team  
**Document Version**: 1.0.0  
**Date**: September 2026  
**Associated Excel Sheet**: `Hostinger_Cloudinary_Costing_Matrix.xlsx`  
**Associated CSV Export**: `Hostinger_Cloudinary_Costing_Matrix.csv`  

---

## 1. Executive Summary & Production Costing Overview

This document presents the complete production costing and resource analysis for hosting the **Yathu Iyarkaiyagam E-Commerce Platform** on **Hostinger VPS** and managing product images via **Cloudinary**.

### Total Cost Projections (Year 1)

| Plan Option | VPS Tier | Monthly Cost | Annual Cost (Yr 1) | Cloudinary | Domain (.in) | SSL & Database | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Option 1 (Budget)** | Hostinger KVM 1 | **~₹499 / mo** | **~₹5,988 / yr** | Free Tier | Free (1st yr) | Included Free | Lowest cost entry point for initial store launch (< 10k visits/mo) |
| **Option 2 (Recommended)** | Hostinger KVM 2 | **~₹699 / mo** | **~₹8,388 / yr** | Free Tier | Free (1st yr) | Included Free | **Recommended**: High performance for peak traffic & fast PostgreSQL queries |

---

## 2. Hostinger VPS Hosting Plan Comparison

Hostinger's Linux KVM VPS (Ubuntu 22.04 LTS) hosts the **Next.js Frontend**, **Express Backend**, and **PostgreSQL Database** together on a single server instance.

| Feature / Resource | Hostinger KVM 1 VPS | Hostinger KVM 2 VPS *(Recommended)* | Hostinger KVM 4 VPS |
| :--- | :--- | :--- | :--- |
| **vCPU Cores** | 1 Core | **2 Cores** | 4 Cores |
| **RAM (Memory)** | 4 GB | **8 GB** | 16 GB |
| **NVMe SSD Storage** | 50 GB | **100 GB** | 200 GB |
| **Monthly Bandwidth** | 4 TB | **8 TB** | 16 TB |
| **Estimated Monthly Cost** | ~₹499 / month | **~₹699 / month** | ~₹1,299 / month |
| **Estimated Annual Cost** | ~₹5,988 / year | **~₹8,388 / year** | ~₹15,588 / year |
| **Domain Included** | FREE (1st Year) | **FREE (1st Year)** | FREE (1st Year) |
| **Dedicated IP** | 1 IPv4 & IPv6 | **1 IPv4 & IPv6** | 1 IPv4 & IPv6 |
| **Suited Traffic Level** | < 10,000 Visitors / mo | **10,000 – 50,000 Visitors / mo** | 50,000+ Visitors / mo |

---

## 3. Cloudinary Capacity Analysis (For 85 Catalog Items)

Because the product catalog currently consists of **85 items** across 10 categories, Cloudinary's **Free Credit Tier** easily covers all production image storage and streaming needs without requiring any paid subscription.

### Resource Usage Breakdown

```text
📦 Total Products       : 85 Products
📸 Images per Product   : ~3 Photos (Front, Back, Label)
🖼️ Total Media Assets   : ~255 Images
💾 Avg Image Size       : 200 KB (Auto-optimized WebP / JPG)
------------------------------------------------------------
📊 Storage Required     : ~51 MB (0.05 GB) 
🆓 Cloudinary Free Limit : 25.0 GB Storage
📈 Storage Limit Used   : 0.20%  <-- EXTREMELY SAFE!
------------------------------------------------------------
👥 Est. Store Visitors  : 10,000 Pageviews / month
📶 Est. Net Bandwidth   : ~2.55 GB / month
🆓 Free Bandwidth Limit : 25.0 GB / month
📈 Bandwidth Limit Used : 10.20% <-- 100% FREE!
```

---

## 4. Key Infrastructure Inclusions (Zero Additional Cost)

1. **PostgreSQL Database Server**: Self-hosted on Hostinger VPS (`₹0` extra database fee).
2. **SSL Encryption**: Wildcard SSL via Let's Encrypt / Certbot (`₹0` lifetime free).
3. **Domain Name**: `.in` domain registration included free for 1 year with Hostinger VPS (`₹0` in Year 1, `~₹599/yr` on renewal).
4. **Transactional Emails**: Order confirmations and admin notifications using Brevo or Hostinger Business Email (`₹0` on free tier up to 300 emails/day).

---

## 5. File Location Reference

The generated spreadsheet files are saved in the project root:
- 📊 **Excel Spreadsheet**: [`Hostinger_Cloudinary_Costing_Matrix.xlsx`](file:///e:/Personal%20Projects/ecommerce-production/Hostinger_Cloudinary_Costing_Matrix.xlsx)
- 📄 **CSV Export**: [`Hostinger_Cloudinary_Costing_Matrix.csv`](file:///e:/Personal%20Projects/ecommerce-production/Hostinger_Cloudinary_Costing_Matrix.csv)
- 🐍 **Generator Script**: [`generate_costing_excel.py`](file:///e:/Personal%20Projects/ecommerce-production/generate_costing_excel.py)
