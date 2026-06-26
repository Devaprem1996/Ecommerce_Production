# AI Handover Context

This file serves as the single source of truth for any AI developer joining the project. It outlines the current state, technical decisions, core rules, and the step-by-step roadmap to avoid project deviations.

---

## 1. Project Overview & Current Phase
* **Project Name**: Production Ecommerce Platform
* **Current Status**: Core Architecture Completed & Repos Scaffolded.
* **Next Active Sprint**: Sprint 1 - Authentication Module.
* **SOP Authority**: Follow [00_PROJECT_RULES.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/00_PROJECT_RULES.md) and [29_AI_DEVELOPMENT_GUIDE.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/29_AI_DEVELOPMENT_GUIDE.md).

---

## 2. Technology Stack & Directories

### A. Frontend (`/frontend`)
* **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
* **Client State**: Zustand (for user session, theme preferences, and cart status).
* **Server Cache**: TanStack Query (for data fetching, mutation state).
* **Forms & Validation**: React Hook Form + Zod.
* **Icons**: Lucide React.
* **Build Target**: Output to standalone HTML/JS bundles. Run `npm run build` to verify.

### B. Backend (`/backend`)
* **Runtime**: Node.js + TypeScript + Express.js.
* **ORM**: Prisma Client v5 (connected to PostgreSQL database).
* **Logging**: Winston Logger.
* **Security Headers**: Helmet & express-rate-limit.
* **Build Target**: Emit to `/dist`. Run `npm run build` to verify.

---

## 3. Core Concepts & Safety Rules

Do not deviate from the decisions approved in [docs](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs):
1. **Dynamic Cart Pricing**: Cart items must calculate live prices from database product records at viewing time. Do not lock prices when items are added to the cart. Lock pricing only inside `OrderItem` upon checkout completion.
2. **Stock Reservation**: Do not block stock when adding items to the cart. Reserve stock upon checkout session creation (with a 10-15 minute expiry lock). Permanently decrement stock only when payment is verified.
3. **Razorpay Webhooks**: All payment verifications must have a backend webhook listener (`POST /api/v1/payments/webhook`) validating signatures via request raw buffers to avoid dropped browser redirection issues.
4. **Prisma Source of Truth**: All database modeling must happen inside [schema.prisma](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/prisma/schema.prisma). Do not create standalone SQL schema files.
5. **No implicit `any`**: TypeScript strict compilation (`strict: true`) is enforced. All APIs must follow standard format return structures defined in [04_API_DESIGN.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/04_API_DESIGN.md).

---

## 4. Completed Milestones
* [x] Finalized database schemas, domain entities, and API endpoints.
* [x] Wrote full [07_SECURITY_ARCHITECTURE.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/07_SECURITY_ARCHITECTURE.md) and [08_DEPLOYMENT_ARCHITECTURE.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/08_DEPLOYMENT_ARCHITECTURE.md).
* [x] Documented Git rules, coding styles, branch pipelines, and review checklists.
* [x] Scaffolded Express/Prisma directories and verified zero compiler errors.
* [x] Scaffolded Next.js client, configured state stores, and verified zero compiler errors.
* [x] Cleaned up redundant process placeholder folders.

---

## 5. Next Steps of Development (Sprints)

Each sprint must be implemented file-by-file. Verify with unit tests before progressing:

### Sprint 1: Authentication & User Session (Current Objective)
1. **Backend Configuration**: Set up Google OAuth credentials and JWT parameters in `.env`.
2. **Endpoints**: Implement `/api/v1/auth/google`, `/api/v1/auth/me`, and `/api/v1/auth/refresh`.
3. **Security**: Add backend middleware to verify JWT access tokens and perform Refresh Token Rotation (RTR).
4. **Client UI**: Create `/login` page with Google button, connect to Zustand store, and restrict protected layout routes.

### Sprint 2: Products Catalog & Admin CRUD
1. **Database Seeding**: Build database seeding script for products and categories.
2. **Endpoints**: Write product list route with keywords filter, sort params, and pagination. Write product insert/update endpoints for admins.
3. **Client UI**: Build products list page, search queries, details viewer page, and dashboard management tools.

### Sprint 3: Shopping Cart & Wishlist
1. **Endpoints**: Cart state modification routes.
2. **Client**: Integrations with backend cart lists sync.