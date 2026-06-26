# 07_SECURITY_ARCHITECTURE.md

# Production Security Architecture

Version: 1.0

Status: Approved

---

## 1. Authentication Security (JWT & OAuth)

We utilize a double-token (Access + Refresh Token) system to balance session persistence and security.

### A. Access Tokens
* **Type**: JSON Web Token (JWT)
* **TTL (Time to Live)**: 15 minutes
* **Storage**: In-memory on the frontend client (Zustand state). Never store access tokens in `localStorage` or `sessionStorage` due to XSS vulnerability.
* **Transmission**: Sent via HTTP `Authorization: Bearer <access_token>` header on all protected API requests.

### B. Refresh Tokens
* **TTL**: 7 Days
* **Storage**: Stored in a secure cookie on the backend.
* **Cookie Flags**:
  * `httpOnly`: Prevents client-side scripts from reading the cookie (protects against XSS).
  * `secure`: Enforced in production to ensure cookies are only sent over HTTPS.
  * `sameSite: "strict"` or `sameSite: "lax"`: Guards against Cross-Site Request Forgery (CSRF).
  * `path`: `/api/v1/auth/refresh` (only send cookie to the refresh token endpoint to reduce exposure).
* **Refresh Token Rotation (RTR)**:
  * Every time a refresh token is used to generate a new access/refresh pair, the old refresh token is marked as revoked in the database.
  * If a revoked refresh token is sent, the backend assumes a theft attempt, invalidates all active sessions for that user, and forces a re-login.

---

## 2. API Security

### A. Security Headers (Helmet)
* Enforce headers globally using Express `helmet()` middleware:
  * `Content-Security-Policy (CSP)`: Mitigates XSS.
  * `X-Frame-Options: DENY`: Prevents Clickjacking.
  * `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
  * `Strict-Transport-Security (HSTS)`: Forces SSL connections.

### B. Cross-Origin Resource Sharing (CORS)
* Restrict origins to explicitly whitelisted domains:
  ```typescript
  const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };
  ```

### C. Rate Limiting
* Protect servers from Denial of Service (DoS) and brute force:
  * **Global APIs**: Max 100 requests per 15 minutes per IP.
  * **Auth/Login APIs** (`/api/v1/auth/*`): Max 5 attempts per 15 minutes per IP.
  * **Checkout/Payment APIs** (`/api/v1/checkout/*`, `/api/v1/payments/*`): Max 10 requests per 15 minutes per IP.

---

## 3. Data Protection & Inputs

### A. Input Validation & Sanitization
* Use **Zod schemas** in Express controllers to validate structure, types, and lengths of query/body arguments.
* Sanitize user input text to escape HTML tags and script elements to eliminate persistent XSS.

### B. Password Hashing
* For users registering via credentials, use **Argon2id** or **bcrypt** (salt rounds = 12) for secure hashing.
* Never store plain passwords.

### C. Parameterized SQL Queries (SQL Injection)
* Prisma ORM dynamically parameterizes all database queries. Direct query execution via Prisma's `$queryRaw` is prohibited unless explicitly reviewed and parameterized.

---

## 4. Payment Gateway Webhook Signature Verification

To prevent fraudulent payment spoofing (e.g., users forging a fake payment verification call):
* **Webhooks** must be verified using the raw request body buffer and the Razorpay Webhook Secret:
  ```typescript
  import crypto from "crypto";

  function verifyWebhook(rawBody: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return expectedSignature === signature;
  }
  ```
* All webhook processing routes must parse raw text bodies (`express.text()`) rather than parsed JSON to maintain strict signature alignment.

---

## 5. Audit Logging Policy
* Log security events (login failures, rate limit breaches, administrative edits, transaction failures) using Winston to secure files under `/logs`.
* Never write passwords, CVV numbers, credit card tokens, or JWTs to logs.
