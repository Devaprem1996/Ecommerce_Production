# E-Commerce Project Summary Report
**Author:** Devaprem  
**Date:** June 29, 2026  
**Audience:** Project Manager  

---

## 1. Project Overview & Scope
*   **Goal:** Build a production-ready, fully responsive e-commerce web application with billing based on activity logs.
*   **Tech Stack:** Next.js (Frontend UI), Express.js (REST API backend), Prisma ORM, and PostgreSQL (Database).
*   **Total Project Estimate:** **376 Hours** (includes 30h Planning, 70h Design, 220h Implementation, 20h Testing, 16h Deployment, 20h Hypercare support).
*   **Detailed Billing Breakdown:** Match-by-match columns mapped directly to our Excel log in `docs/excel_billing_columns.csv`.

---

## 2. Reference UX/UI Key Takeaways
We analyzed three organic e-commerce websites and extracted the following key features:
1.  **myharvestfarms.com:** Pincode validation popup to ensure delivery eligibility prior to cart checkout.
2.  **twobrothersindiashop.com:** Collapsible tabs for product descriptions/FAQs and high-converting sticky bottom Add-to-Cart buttons.
3.  **ueirorganic.com:** Multi-column view toggles (2 to 5 columns grid) and integrated coupon drawers inside fast OTP checkouts (Gokwik-style).

---

## 3. Zero-Cost Hosting Architecture (100% Free Tiers)
To meet the constraint of **$0 monthly hosting costs**, we propose:
*   **Frontend UI:** Hosted on **Vercel** (Free Tier - 100 GB bandwidth limit/month, free SSL).
*   **Backend Server:** Hosted on **Koyeb / Render** (Free Tier - web service sleeps after 15 mins of inactivity).
*   **Database:** Hosted on **Supabase / Neon** (Free Tier - 500 MB storage capacity, auto-suspends when idle).
*   **Product Media:** Hosted on **Cloudinary** (Free Tier - 25 Credits/month limit).
*   **Payment Gateway:** **Razorpay** (0 monthly setup cost; standard 2% transaction fee per purchase).

### 💡 Recommendation to Prevent Cold Starts:
To avoid the **30-50 second loading delay** when Render/Koyeb servers wake up from sleep mode, we recommend refactoring the Express endpoints into **Next.js App Router API Routes (`/src/app/api`)**. This allows both backend and frontend to run on Vercel's free serverless architecture with **millisecond-range wake-up times** and **automatic scaling**.

---

## 4. Scalability briefing for Business Stakeholders
*   **The Issue:** Free hosting tiers are designed for staging, not high-volume production. They enforce strict resource ceilings (500MB database limits, 100GB bandwidth, and server sleep modes).
*   **The Risk:** During peak marketing campaigns or sales, concurrent requests will overwhelm the server, leading to **504 Gateway Timeout** crashes, slow checkouts, and customer churn.
*   **The Solution:** Launch on the Vercel/Supabase free tier first. If monthly visits exceed 10,000 or the database fills up, upgrade incrementally to pay-as-you-go tiers (approx. $10-$25/month) which scale dynamically without manual re-architecting.

---

## 5. Next Actions & Client Deliverables Needed
To proceed without blockage, the business team must provide:
1.  **Reference links confirm:** Final approval of layout designs.
2.  **Brand Assets:** Logo file (.svg) and Hex brand colors.
3.  **Initial Catalog:** Product lists containing rates, descriptions, and UoMs.
4.  **Payment Info:** Razorpay sandbox credentials.
5.  **Shipping Pincodes:** List of active delivery postcodes.
