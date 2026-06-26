# Continuation Context (AI Session Resumption Guide)

This document is a state checkpoint. If you are starting a new session or pairing with a new AI agent due to token limits, **read this document first** alongside [01_PROJECT_PLAN.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/01_PROJECT_PLAN.md) and [PROJECT_STATUS.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/PROJECT_STATUS.md) to resume work.

---

## 1. Project Overview & Tech Stack
* **Architecture**: Decoupled Client-Server.
  * **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide icons, Zustand (client state), TanStack Query (server state), React Hook Form, Zod.
  * **Backend**: Express.js, TypeScript, Prisma ORM, PostgreSQL (Neon Serverless in production, Local in dev).
  * **Authentication**: Google OAuth + JWT (Short-lived Access Token in-memory, Secure HttpOnly SameSite Refresh Token in cookies with rotation).
  * **Payments**: Razorpay with verification webhook listener.

---

## 2. Current Project State
The planning, security architecture, engineering standards, and initial codebases have been successfully bootstrapped and validated:
* **All compilations pass**:
  * Backend builds via `npm run build` inside `/backend`.
  * Frontend builds via `npm run build` inside `/frontend`.
* **Git Status**: Clean. Commit hash captures the initialized state (`chore: clean up redundant templates, prompt folders, and raw sql schemas`).

---

## 3. Directory and Core File Registry

### Backend (`/backend`)
* [package.json](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/package.json): Dependencies (express, prisma, zod, winston, cors, helmet, express-rate-limit).
* [tsconfig.json](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/tsconfig.json): Strict TypeScript configurations.
* [prisma/schema.prisma](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/prisma/schema.prisma): DB models with exact indexes, UUID primary keys, and relationships.
* [src/app.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/src/app.ts) & [server.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/src/server.ts): Express server setup with Helmet, CORS configuration, rate limits, audit logging request wrapper, database health-check route, and global exception middlewares.
* [src/logger/index.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/src/logger/index.ts): Winston logging system.
* [src/middleware/error.middleware.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/src/middleware/error.middleware.ts) & [src/exceptions/api-error.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/src/exceptions/api-error.ts): Normalized HTTP error wrappers.
* [src/config/db.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/backend/src/config/db.ts): Prisma client singleton connection manager.

### Frontend (`/frontend`)
* [package.json](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/frontend/package.json): Next.js app dependencies (zustand, @tanstack/react-query, lucide-react, react-hook-form, zod).
* [src/services/api-client.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/frontend/src/services/api-client.ts): generic fetch client that appends bearer tokens and parses responses cleanly.
* [src/store/auth-store.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/frontend/src/store/auth-store.ts): Zustand state tracker for logged-in profile.
* [src/components/ui/Button.tsx](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/frontend/src/components/ui/Button.tsx): Reusable customized button component with variants and loading spinner animation.

---

## 4. Immediate Next Steps for the Next AI Session

When resuming, execute the development of **Sprint 1 (Authentication)**. Do not deviate from these steps:

### Backend Task List (Authentication)
1. Configure Google OAuth Strategy using official libraries or custom JWT verification logic.
2. Implement backend endpoint `POST /api/v1/auth/google`:
   * Unpack the Google OAuth token.
   * Verify identity against Google's API.
   * upsert the user record in `User` and `UserProfile` tables.
   * Generate an Access Token (15m expiration) and a Refresh Token (7d expiration).
   * Write the Refresh Token into a secure, `httpOnly`, `sameSite`, `path=/api/v1/auth/refresh` cookie.
   * Return the user profile and Access Token in the JSON body payload.
3. Implement refresh endpoint `POST /api/v1/auth/refresh` that reads the cookie, validates token, and rotates BOTH tokens.
4. Implement logout endpoint `POST /api/v1/auth/logout` that invalidates the refresh token in the database and clears the browser cookie.
5. Write the `authMiddleware` to protect user-level routes by parsing and validating the Authorization header bearer token.

### Frontend Task List (Authentication)
1. Create `/login` page:
   * Build login form with Google Sign-in buttons.
   * Use Zod to parse parameters.
2. Integrate client authentication with the API calls (`apiClient.post("/auth/google")`).
3. On successful login, trigger `setAuth(user, token)` inside [auth-store.ts](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/frontend/src/store/auth-store.ts).
4. Build a route guard wrapper component to redirect unauthenticated users away from private directories (e.g. `/profile`, `/cart`, `/checkout`).

---

## 5. Core Concepts & Security Mandates (Non-Negotiable)

To prevent security vulnerabilities or business logic errors, any AI session resuming this project **must** adhere strictly to the following rules:

1. **Dynamic Cart Prices**: The database `cart` table does NOT store the item price. At render time, cart items must pull live prices from the `Product` table. Price locking is only allowed inside `OrderItem` records upon successful order completion.
2. **Checkout Stock Lock**: Do not reserve stock when items are added to the cart. Reserve stock only when the checkout sequence begins. Hold this stock for a maximum of 15 minutes. Release it if the user fails to pay. Enforce stock deduction only after payment signature verification.
3. **Razorpay Webhooks**: Never rely solely on frontend client-side redirection API callbacks to verify a transaction. A backend webhook endpoint (`POST /api/v1/payments/webhook`) must listen for Razorpay payment triggers, verifying signatures with raw request text buffers.
4. **Token Security**: The backend Access Token is short-lived (15 minutes) and must only be stored in-memory (Zustand state) on the client. The Refresh Token is long-lived (7 days) and must be stored in a secure, `httpOnly`, `sameSite: "strict"`, `path=/api/v1/auth/refresh` cookie with database rotation records.
5. **Type Safety & Schema Rules**: Prisma schema (`schema.prisma`) is the database source of truth. No raw SQL schema files. Enable strict TypeScript checks throughout the frontend and backend.

