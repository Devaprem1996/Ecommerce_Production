# Sprint 1: User Authentication Documentation & Instructions

This document covers the architecture, files, endpoints, security policies, and setup instructions implemented during **Sprint 1 (Authentication)** of the Ecommerce Production project.

---

## 1. Directory & File Registry

The following files and folders were created or modified during this sprint:

```
backend/
├── prisma/
│   └── seed.ts                      # [NEW] Seeds mock categories, products, inventory, pincodes, & coupons
├── src/
│   ├── app.ts                       # [MODIFIED] Mounted cookieParser, express-rate-limit, and auth routes
│   ├── controllers/
│   │   └── auth.controller.ts       # [NEW] Express handlers for signup, login, Google OAuth, refresh, & logout
│   ├── middleware/
│   │   └── auth.middleware.ts       # [NEW] Authentication checks, role checks, and Zod validator middleware
│   ├── routes/
│   │   └── auth.routes.ts           # [NEW] Connects request endpoints to validators and controllers
│   ├── services/
│   │   └── auth.service.ts          # [NEW] Hashing, database operations, JWT generation, & OAuth verification
│   └── validations/
│       └── auth.validation.ts       # [NEW] Zod validation schemas
└── package.json                     # [MODIFIED] Registered prisma seed script tsx configuration
```

---

## 2. API Endpoint Specification

All authentication routes are prefix-mounted under `/api/v1/auth`.

### A. Register User (Credentials)
* **Method**: `POST`
* **Path**: `/api/v1/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "customer@gmail.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "data": {
      "user": {
        "id": "uuid-string",
        "email": "customer@gmail.com",
        "role": "CUSTOMER",
        "isActive": true,
        "isVerified": false,
        "lastLoginAt": null,
        "createdAt": "2026-08-14T08:00:00.000Z",
        "updatedAt": "2026-08-14T08:00:00.000Z",
        "deletedAt": null
      }
    },
    "timestamp": "2026-08-14T08:00:00.000Z",
    "requestId": "request-id-header"
  }
  ```

### B. Login User (Credentials)
* **Method**: `POST`
* **Path**: `/api/v1/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "customer@gmail.com",
    "password": "securepassword123"
  }
  ```
* **Cookie Set**: `refreshToken` (Secure, httpOnly, sameSite: strict/lax, path: `/api/v1/auth/refresh`, expires in 7 days).
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully.",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "uuid-string",
        "email": "customer@gmail.com",
        "role": "CUSTOMER",
        "isActive": true,
        "isVerified": true,
        "lastLoginAt": "2026-08-14T08:01:00.000Z"
      }
    }
  }
  ```

### C. Google OAuth Sign-in
* **Method**: `POST`
* **Path**: `/api/v1/auth/google`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "idToken": "google-oauth-id-token"
  }
  ```
* **Cookie Set**: `refreshToken` (path: `/api/v1/auth/refresh`).
* **Success Response (200 OK)**: Returns the short-lived access token and user information.

### D. Token Rotation & Refresh
* **Method**: `POST`
* **Path**: `/api/v1/auth/refresh`
* **Access**: Public (Requires `refreshToken` cookie)
* **Cookie Set**: Overwrites `refreshToken` with a newly rotated token.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully.",
    "data": {
      "accessToken": "new-access-token-string",
      "user": { ... }
    }
  }
  ```

### E. Logout User
* **Method**: `POST`
* **Path**: `/api/v1/auth/logout`
* **Access**: Private (Requires Access Token)
* **Action**: Clears the `refreshToken` cookie inside the client.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

### F. Get Logged-in User Profile (`/me`)
* **Method**: `GET`
* **Path**: `/api/v1/auth/me`
* **Access**: Private (Requires Access Token)
* **Success Response (200 OK)**: Returns full user account details including user profile, active addresses, and identity statuses.

---

## 3. Security Policies Applied
1. **Token Lifetime**: Access Token = 15 minutes, Refresh Token = 7 days.
2. **XSS Mitigation**: The refresh token is sent only in an HTTP-Only cookie, preventing JavaScript injection scripts from harvesting active sessions.
3. **CSRF Mitigation**: `sameSite` is configured as `"strict"` in production and `"lax"` in development.
4. **Path-Restricted Cookie**: The refresh token is scoped exclusively to `/api/v1/auth/refresh`, meaning it is not sent during general API page requests.
5. **Rate Limiting**: Integrated using `express-rate-limit` globally and on auth paths (custom limits can be stacked).

---

## 4. Setup & Deployment Instructions

### Local Environment Setup
Configure your `backend/.env` file:
```env
PORT=8080
NODE_ENV=development
JWT_SECRET="generate-a-long-random-string"
REFRESH_TOKEN_SECRET="generate-another-long-random-string"

# Neon/Postgres connection string
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host/neondb?sslmode=require"
```

### Run Migrations & Seeding
Execute the following commands sequentially:
```bash
# Apply schema models to database
pnpm --filter ecommerce-backend prisma:migrate

# Seed categories, products, inventory, pincodes (loads directly from ProductListForWebsite.xlsx)
pnpm --filter ecommerce-backend prisma:seed
```

### Build & Run Backend
```bash
# Run server watch mode
pnpm --filter ecommerce-backend dev

# Compile server production dist files
pnpm --filter ecommerce-backend build

# Run compiled build server
pnpm --filter ecommerce-backend start
```
