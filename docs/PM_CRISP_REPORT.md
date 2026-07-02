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

## 5. Commercial Features & Customer Value Proposition
The Proof of Concept implements the following business-critical features designed to drive sales, build trust, and streamline shopping:
*   **Regional Market Customization (Bilingual English/Tamil):** Allows customers to toggle the storefront language. This increases customer trust, expands accessibility to regional shoppers, and makes local marketing campaigns more effective.
*   **Logistics Protection (Pincode Delivery Validator):** Checks customer delivery postcodes *before* they can add items to their cart. This eliminates out-of-boundary order coordination costs and minimizes manual shipping cancellations.
*   **Frictionless Fast Checkout (OTP-Based Mobile Login):** Simplifies customer entry by replacing easily forgotten passwords with a 1-click mobile verification. This removes buying friction, resulting in up to **20-30% higher checkout conversions**.
*   **Flexible Catalog Packaging (Dynamic Variant Selector):** Allows customers to choose different weights/quantities (e.g. 250g, 500g, 1kg) directly on a single product page. This encourages larger pack sizes (boosting Average Order Value) while keeping listing pages clean.
*   **Operations Control Panel (Admin Dashboard):** Provides your staff with a centralized panel to update stock levels, edit product prices, create categories, and configure SEO details without requiring programmer assistance.
*   **Self-Service Tracking (Visual Order Timeline):** Customers can track their order progression (Pending &rarr; Shipped &rarr; Delivered) in their profile, significantly reducing "Where is my order?" customer support tickets.

## 6. Process Automations (Reducing Operational Overhead)
Automated business rules are coded to run in the background, eliminating manual checks and protecting profit margins:
*   **Smart Store Maintenance Routing:** Allows the admin team to safely make updates or restock inventory in the backend while automatically redirecting incoming shoppers to a branded, professional "Harvest update in progress" message rather than showing a broken web page.
*   **Automated Shipping Details:** Instantly maps city and state details based on the customer’s postal code entry, reducing shipping address typing mistakes.
*   **Frictionless Verification:** The mobile code verification interface automatically transitions inputs and submits verification instantly, reducing checkout abandonment.
*   **Anti-Double Sell Stock Reservation:** Automatically reserves stock in the inventory for 15 minutes when checkout begins. If the customer cancels or fails to pay, the inventory is auto-released back to the store shelf, preventing stock lockups.
*   **Payment Fraud Verification:** Direct backend verification processes confirm that funds are securely captured at the bank prior to updating the order status, blocking any payment fraud attempts.
*   **Continuous Store Deployments:** Git-integrated pipelines automatically push inventory improvements, promotional banners, and visual tweaks to the live website instantly, avoiding server downtime.

## 7. Strategic Talking Points for Business Stakeholders
Use these key points to guide discussions with clients regarding costs and scalability:
1.  **Downtime vs. Wake-up Delay ($0 hosting choice):** On a $0/month budget, the server sleeps during quiet hours. The first customer visiting the site after an idle period experiences a 30-50 second delay. We recommend consolidating the server routes into our Next.js API configuration to run on Vercel's free platform, securing a **$0 budget with instant, sub-second load times**.
2.  **Infrastructure Triggers for Upgrades:** The free tiers for storage (500MB) and image bandwidth (100GB) are ideal for launch testing. However, once daily traffic exceeds 300 visitors or product logs expand, we recommend moving to the Growth Tier (~$20-$40/month total) to prevent customer drop-offs.
3.  **Communication Cost Management:** Text messages (SMS) carry cellular network charges. To keep fixed monthly overhead at $0, we suggest validating checkouts via **Email OTP** and integrating **WhatsApp Business Web APIs** which carry no fee per message.

## 8. Next Actions & Client Deliverables Needed
To proceed without blockage, the business team must provide:
1.  **Reference links confirm:** Final approval of layout designs.
2.  **Brand Assets:** Logo file (.svg) and Hex brand colors.
3.  **Initial Catalog:** Product lists containing rates, descriptions, and UoMs.
4.  **Payment Info:** Razorpay sandbox credentials.
5.  **Shipping Pincodes:** List of active delivery postcodes.
