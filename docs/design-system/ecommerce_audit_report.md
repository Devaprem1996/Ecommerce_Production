# E-Commerce Application — Full API, Route, Logic & Error-Handling Audit Report

**Audit Date**: September 30, 2026  
**Auditor**: Senior Full-Stack Architect, API Integration Engineer, QA & Debugging Specialist  
**Application**: Yathu Arokiyagam (Organic E-Commerce Platform)  
**Repository**: `/frontend` (Next.js 16 + React 19 + TypeScript + Zustand + Tailwind v4) & `/backend` (Express.js + TypeScript + Prisma ORM + PostgreSQL / Neon + Razorpay + Fast2SMS)

---

## Executive Summary

A comprehensive, zero-assumption audit was conducted across the entire codebase of both `/frontend` and `/backend`. The system features an advanced architecture combining Next.js 16 (App Router), Express.js REST APIs, PostgreSQL via Prisma ORM, Razorpay payment processing, and Fast2SMS integration. 

While core business pathways are architected with clean separation of concerns, the audit identified **7 critical (P0)** security and transactional vulnerabilities, **8 high-severity (P1)** contract and lifecycle mismatches, and multiple medium-severity UX/data consistency anomalies. Notably:
1. **Critical Price Tampering Vulnerability**: Backend order placement trusts client-submitted line-item unit prices instead of verifying catalog variant prices from the database.
2. **Hardcoded Secrets & Live Credentials**: An active Fast2SMS API key is embedded directly into backend source code, and shared JWT development fallback secrets exist across frontend route handlers.
3. **Hardcoded Admin Authentication Fallback**: The Next.js API route `/api/auth/admin/login` contains hardcoded email/password credentials that bypass database authentication.
4. **Administrative Security Bypass**: An unauthenticated call to `/api/v1/admin/dashboard` automatically generates and signs a Super Admin JWT token using a hardcoded development secret.
5. **Client-Side OTP Mocking & Disconnection**: Multiple frontend modals and profile forms generate and verify fake OTPs (`123456` or random math strings) entirely in browser state, bypassing backend SMS verification and database synchronization.
6. **Razorpay Webhook Signature Mismatch**: Express `json()` middleware consumes the request stream without preserving `rawBody`, causing webhook HMAC-SHA256 signature verification to fail on JSON serialization differences.
7. **Phantom Checkout Completion**: The `/checkout/pending` page uses a timed progress bar that automatically redirects customers to `/checkout/success` after 6 seconds without validating payment completion from the backend or Razorpay.

---

# 1. Application Architecture

```
                                      ┌────────────────────────────────────────────────────────┐
                                      │                     USER BROWSER                       │
                                      │   (Desktop / Tablet / Mobile - Chrome / Safari / Edge)  │
                                      └───────────────────────────┬────────────────────────────┘
                                                                  │
                                      ┌───────────────────────────┴────────────────────────────┐
                                      │              Next.js 16 Frontend (App Router)          │
                                      │  • Port 3000 / Vercel                                  │
                                      │  • Zustand State (authStore, cartStore)                │
                                      │  • Next.js Edge Middleware (Auth & Maintenance Guards) │
                                      │  • API Clients (@/services/api-client, @/lib/apiClient)│
                                      └─────────────┬────────────────────────────┬─────────────┘
                                                    │                            │
                                      [Next Rewrites / Proxy]            [Direct API Calls]
                                                    │                            │
                                                    ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express.js Backend Application                                 │
│  • Port 8080 / Fly.io / Node.js                                                               │
│  • Security Middleware: Helmet, CORS Whitelist, CookieParser, Express Rate Limiter          │
│  • Routing Engine: /api/v1/auth, /api/v1/cms, /api/v1/user, /api/v1/admin, /api/v1/shipping  │
│  • Payment Engine: /api/create-order, /api/verify-payment, /api/v1/payments                  │
│  • Validation: Zod schemas on body, params, query                                            │
│  • Error Handler: Winston Structured Logger & Centralized ApiError Middleware                │
└──────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                               │
                       ┌───────────────────────┼───────────────────────┐
                       ▼                       ▼                       ▼
        ┌────────────────────────────┐ ┌───────────────┐ ┌───────────────────────────┐
        │       PostgreSQL (Neon)    │ │   Razorpay    │ │          Fast2SMS         │
        │ • Prisma ORM Client        │ │ • Orders API  │ │ • Quick SMS Route (q)     │
        │ • 12 Relational Tables     │ │ • Webhooks    │ │ • GSM-7 Single Segment    │
        │ • Atomic Transactions      │ │ • Refunds     │ │ • OTP Route Fallback      │
        └────────────────────────────┘ └───────────────┘ └───────────────────────────┘
```

### Folder Architecture Map

```text
ecommerce-production/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma             # PostgreSQL schema (User, Order, Payment, Category, etc.)
│   │   └── seed.ts                   # Initial database seeds
│   ├── src/
│   │   ├── app.ts                    # Express app initialization, middleware, routes mounting
│   │   ├── server.ts                 # HTTP server bootstrap & port listener
│   │   ├── config/
│   │   │   ├── cloudinary.ts         # Cloudinary SDK image upload
│   │   │   ├── db.ts                 # Prisma Client singleton
│   │   │   └── razorpay.ts           # Razorpay SDK initialization & retry wrapper
│   │   ├── controllers/
│   │   │   ├── admin.controller.ts   # Admin KPIs, order status updates, coupon/pincode management
│   │   │   ├── auth.controller.ts    # Register, login, google login, refresh, logout, me
│   │   │   ├── cms.controller.ts     # Category & product CRUD, image upload
│   │   │   ├── otp.controller.ts     # Mobile SMS OTP generation & bcrypt verification
│   │   │   ├── payment.controller.ts # Razorpay order creation, signature verification, webhooks
│   │   │   ├── shipping.controller.ts# Pincode serviceability & listing
│   │   │   └── user.controller.ts    # Customer profile, orders, addresses, wishlist, OTP track
│   │   ├── exceptions/
│   │   │   └── api-error.ts          # Standardized HTTP error class
│   │   ├── logger/
│   │   │   └── index.ts              # Winston structured logging
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # requireAuth, optionalAuth, requireRole, validateRequest
│   │   │   ├── error.middleware.ts   # Global Express error catcher
│   │   │   └── upload.middleware.ts  # Multer memory storage upload
│   │   ├── routes/
│   │   │   ├── admin.routes.ts       # /api/v1/admin
│   │   │   ├── auth.routes.ts        # /api/v1/auth
│   │   │   ├── cms.routes.ts         # /api/v1/cms
│   │   │   ├── payment.routes.ts     # /api and /api/v1/payments
│   │   │   ├── shipping.routes.ts    # /api/v1/shipping
│   │   │   └── user.routes.ts        # /api/v1/user
│   │   ├── services/
│   │   │   ├── admin.service.ts      # Analytics aggregation & management logic
│   │   │   ├── auth.service.ts       # Password hashing, JWT generation & verification
│   │   │   ├── cms.service.ts        # Product & category business logic
│   │   │   ├── email.service.ts      # Nodemailer SMTP notifications
│   │   │   ├── payment.service.ts    # Razorpay orders, HMAC signatures, webhooks, refunds
│   │   │   ├── shipping.service.ts   # Pincode query logic
│   │   │   ├── sms.service.ts        # Fast2SMS GSM-7 compliant dispatch
│   │   │   └── user.service.ts       # Orders, addresses, profile, wishlist transactions
│   │   ├── utils/
│   │   │   └── sms-char-counter.ts   # GSM-7 segment validation & cost estimation
│   │   └── validations/              # Zod validation schemas
├── frontend/
│   ├── next.config.ts                # Next.js rewrites to backend, CSP headers, webpack config
│   ├── src/
│   │   ├── middleware.ts             # Edge route protection & maintenance mode handler
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── shop/                 # Product catalog & [slug] product details
│   │   │   ├── cart/                 # Shopping cart & coupon calculations
│   │   │   ├── checkout/             # Multi-step checkout & payment (/success, /failed, /pending)
│   │   │   ├── track-order/          # Public & guest OTP-based order tracking
│   │   │   ├── login/ & register/    # Authentication pages
│   │   │   ├── account/              # Customer portal (/orders, /addresses, /profile, /wishlist)
│   │   │   ├── admin/                # Admin portal (/products, /categories, /orders, /coupons, etc.)
│   │   │   └── api/                  # Next.js Route Handlers (auth, admin proxies, pincode)
│   │   ├── components/               # UI components, layout, shop, home, auth
│   │   ├── hooks/                    # useCart, useWishlist, useAdmin, useAdminDashboard
│   │   ├── lib/
│   │   │   ├── apiClient.ts          # Relative URL client with auto token refresh
│   │   │   ├── auth.ts               # HS256 JWT sign/verify & cookie session extraction
│   │   │   └── razorpay.ts           # Dynamic checkout.js CDN loader & modal launcher
│   │   ├── services/
│   │   │   ├── account.service.ts    # Customer API service
│   │   │   ├── admin.service.ts      # Admin API service
│   │   │   ├── api-client.ts         # Direct backend URL client with token injection
│   │   │   └── payment.service.ts    # Checkout & Razorpay payment API caller
│   │   └── store/
│   │       ├── auth-store.ts         # Zustand authentication store
│   │       └── cartStore.ts          # Zustand cart store with localStorage persistence
```

---

# 2. Complete Backend API Inventory

| Method | Endpoint | File | Controller | Service | Auth Required | Role | Request Body | Query Params | Path Params | Response | External API | DB Operation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | `auth.routes.ts` | `AuthController.register` | `AuthService.registerUser` | No | Any | `{ email, password, firstName, lastName, phone? }` | None | None | `{ success, message, data: { user } }` | None | User, UserProfile create |
| **POST** | `/api/v1/auth/login` | `auth.routes.ts` | `AuthController.login` | `AuthService.loginUser` | No | Any | `{ email, password }` | None | None | `{ success, data: { accessToken, user } }` | None | User findUnique, update lastLogin |
| **POST** | `/api/v1/auth/google` | `auth.routes.ts` | `AuthController.googleLogin` | `AuthService.loginWithGoogle` | No | Any | `{ idToken }` | None | None | `{ success, data: { accessToken, user } }` | Google OAuth tokeninfo | User, UserProfile upsert |
| **POST** | `/api/v1/auth/refresh` | `auth.routes.ts` | `AuthController.refresh` | `AuthService.verifyRefreshToken` | Cookie | Any | None | None | None | `{ success, data: { accessToken, user } }` | None | User findUnique |
| **POST** | `/api/v1/auth/otp/send` | `auth.routes.ts` | `OtpController.sendOtp` | `SmsService.sendOtp` | No | Any | `{ phone, purpose? }` | None | None | `{ success, message, resendAfterSeconds, devOtp? }` | Fast2SMS Bulk V2 | OtpVerification create/delete |
| **POST** | `/api/v1/auth/otp/verify` | `auth.routes.ts` | `OtpController.verifyOtp` | `AuthService.generateTokens` | No | Any | `{ phone, otp, purpose?, name?, email? }` | None | None | `{ success, data: { accessToken, user } }` | None | OtpVerification, User upsert, Order updateMany |
| **POST** | `/api/v1/auth/logout` | `auth.routes.ts` | `AuthController.logout` | None | Yes | Any | None | None | None | `{ success, message }` | None | None (clears cookie) |
| **GET** | `/api/v1/auth/me` | `auth.routes.ts` | `AuthController.me` | None | Yes | Any | None | None | None | `{ success, data: { user } }` | None | User findUnique with profile & addresses |
| **GET** | `/api/v1/cms/categories` | `cms.routes.ts` | `CmsController.listCategories` | `CmsService.listCategories` | No | Any | None | `includeInactive` | None | `{ success, data: { categories } }` | None | Category findMany |
| **GET** | `/api/v1/cms/categories/:slug` | `cms.routes.ts` | `CmsController.getCategory` | `CmsService.getCategoryBySlug` | No | Any | None | None | `slug` | `{ success, data: { category } }` | None | Category findUnique |
| **POST** | `/api/v1/cms/categories` | `cms.routes.ts` | `CmsController.createCategory` | `CmsService.createCategory` | Yes | ADMIN | Category creation payload | None | None | `{ success, data: { category } }` | None | Category create |
| **PATCH**| `/api/v1/cms/categories/:id` | `cms.routes.ts` | `CmsController.updateCategory` | `CmsService.updateCategory` | Yes | ADMIN | Category update payload | None | `id` | `{ success, data: { category } }` | None | Category update |
| **DELETE**| `/api/v1/cms/categories/:id`| `cms.routes.ts` | `CmsController.deleteCategory` | `CmsService.deleteCategory` | Yes | ADMIN | None | None | `id` | `{ success, message }` | None | Category delete |
| **GET** | `/api/v1/cms/products` | `cms.routes.ts` | `CmsController.listProducts` | `CmsService.listProducts` | Optional | Any | None | `page, limit, search, category, minPrice, maxPrice, sortBy, sortOrder` | None | `{ success, data: { products, total, totalPages, page, limit } }` | None | Product findMany with variants, inventory, category |
| **GET** | `/api/v1/cms/products/:slug` | `cms.routes.ts` | `CmsController.getProduct` | `CmsService.getProductBySlug` | No | Any | None | None | `slug` | `{ success, data: { product } }` | None | Product findUnique with variants, reviews |
| **POST** | `/api/v1/cms/upload` | `cms.routes.ts` | `CmsController.uploadImage` | `uploadToCloudinary` | Yes | ADMIN | `multipart/form-data` ('image') | None | None | `{ success, data: { url, public_id } }` | Cloudinary | None |
| **POST** | `/api/v1/cms/products` | `cms.routes.ts` | `CmsController.createProduct` | `CmsService.createProduct` | Yes | ADMIN | Product creation payload | None | None | `{ success, data: { product } }` | None | Product, ProductVariant, Inventory create |
| **PATCH**| `/api/v1/cms/products/:id` | `cms.routes.ts` | `CmsController.updateProduct` | `CmsService.updateProduct` | Yes | ADMIN | Product update payload | None | `id` | `{ success, data: { product } }` | None | Product update |
| **PUT** | `/api/v1/cms/products/:id` | `cms.routes.ts` | `CmsController.updateProduct` | `CmsService.updateProduct` | Yes | ADMIN | Product update payload | None | `id` | `{ success, data: { product } }` | None | Product update |
| **DELETE**| `/api/v1/cms/products/:id` | `cms.routes.ts` | `CmsController.deleteProduct` | `CmsService.deleteProduct` | Yes | ADMIN | None | None | `id` | `{ success, message }` | None | Product soft delete (`deletedAt`) |
| **POST** | `/api/v1/cms/products/:productId/variants` | `cms.routes.ts` | `CmsController.createVariant` | `CmsService.createVariant` | Yes | ADMIN | Variant payload | None | `productId` | `{ success, data: { variant } }` | None | ProductVariant, Inventory create |
| **PATCH**| `/api/v1/cms/variants/:id` | `cms.routes.ts` | `CmsController.updateVariant` | `CmsService.updateVariant` | Yes | ADMIN | Variant payload | None | `id` | `{ success, data: { variant } }` | None | ProductVariant, Inventory update |
| **DELETE**| `/api/v1/cms/variants/:id` | `cms.routes.ts` | `CmsController.deleteVariant` | `CmsService.deleteVariant` | Yes | ADMIN | None | None | `id` | `{ success, message }` | None | ProductVariant soft delete |
| **POST** | `/api/create-order` & `/api/v1/payments/create-order` | `payment.routes.ts` | `PaymentController.createOrder` | `PaymentService.createPaymentOrder` | Optional | Any | `{ orderId?, amount?, currency?, receipt?, notes? }` | None | None | `{ success, order_id, amount, currency, key_id, receipt }` | Razorpay Orders API | Order findFirst, Payment create |
| **POST** | `/api/verify-payment` & `/api/v1/payments/verify-payment` | `payment.routes.ts` | `PaymentController.verifyPayment` | `PaymentService.verifyPayment` | Optional | Any | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId? }` | None | None | `{ success, verified, order_id, payment_id }` | None | Payment updateMany, Order update, SmsService dispatch |
| **GET** | `/api/order-status/:order_id` & `/api/v1/payments/order-status/:order_id` | `payment.routes.ts` | `PaymentController.getOrderStatus` | `PaymentService.getOrderStatus` | Optional | Any | None | None | `order_id` | `{ success, order_id, payments }` | Razorpay Orders.fetchPayments | None |
| **POST** | `/api/webhook` & `/api/v1/payments/webhook` | `payment.routes.ts` | `PaymentController.handleWebhook` | `PaymentService.handleWebhook` | Public (Header) | None | Razorpay webhook event JSON | None | None | `{ success, data: { processed: true } }` | None | Payment updateMany |
| **GET** | `/api/v1/shipping/pincode/:pincode` | `shipping.routes.ts` | `ShippingController.checkPincode` | `ShippingService.checkPincode` | No | Any | None | `subtotal` | `pincode` | `{ success, data: { serviceable, city, state, estimatedDays, freeDeliveryThreshold, shippingCharge } }` | None | Pincode findUnique |
| **GET** | `/api/v1/shipping/pincodes` | `shipping.routes.ts` | `ShippingController.listPincodes` | `ShippingService.listPincodes` | No | Any | None | None | None | `{ success, data: { pincodes } }` | None | Pincode findMany |
| **GET** | `/api/v1/admin/dashboard` & `/api/v1/admin/overview` | `admin.routes.ts` | `AdminController.getDashboardOverview` | `AdminService.getDashboardOverview` | Yes | ADMIN | None | None | None | `{ success, data: DashboardOverviewResponse }` | None | Order, User, Product, Inventory aggregations |
| **GET** | `/api/v1/admin/orders` | `admin.routes.ts` | `AdminController.listOrders` | `AdminService.listOrders` | Yes | ADMIN | None | `status, search, page, limit` | None | `{ success, data: { orders, total, totalPages, page, limit } }` | None | Order findMany with items, payments, address, user |
| **PATCH**| `/api/v1/admin/orders/:id/status` | `admin.routes.ts` | `AdminController.updateOrderStatus` | `AdminService.updateOrderStatus` | Yes | ADMIN | `{ status }` | None | `id` | `{ success, data: { order } }` | None | Order update, SmsService dispatch |
| **GET** | `/api/v1/admin/coupons` | `admin.routes.ts` | `AdminController.listCoupons` | `AdminService.listCoupons` | Yes | ADMIN | None | None | None | `{ success, data: { coupons } }` | None | Coupon findMany |
| **POST** | `/api/v1/admin/coupons` | `admin.routes.ts` | `AdminController.createCoupon` | `AdminService.createCoupon` | Yes | ADMIN | Coupon creation payload | None | None | `{ success, data: { coupon } }` | None | Coupon create |
| **PATCH**| `/api/v1/admin/coupons/:id/toggle` | `admin.routes.ts` | `AdminController.toggleCoupon` | `AdminService.toggleCoupon` | Yes | ADMIN | None | None | `id` | `{ success, data: { coupon } }` | None | Coupon update |
| **DELETE**| `/api/v1/admin/coupons/:id` | `admin.routes.ts` | `AdminController.deleteCoupon` | `AdminService.deleteCoupon` | Yes | ADMIN | None | None | `id` | `{ success, message }` | None | Coupon delete |
| **POST** | `/api/v1/admin/pincodes` | `admin.routes.ts` | `AdminController.createPincode` | `AdminService.createPincode` | Yes | ADMIN | Pincode creation payload | None | None | `{ success, data: { pincode } }` | None | Pincode create |
| **PATCH**| `/api/v1/admin/pincodes/:pincode` | `admin.routes.ts` | `AdminController.updatePincode` | `AdminService.updatePincode` | Yes | ADMIN | Pincode update payload | None | `pincode` | `{ success, data: { pincode } }` | None | Pincode update |
| **DELETE**| `/api/v1/admin/pincodes/:pincode` | `admin.routes.ts` | `AdminController.deletePincode` | `AdminService.deletePincode` | Yes | ADMIN | None | None | `pincode` | `{ success, message }` | None | Pincode delete |
| **POST** | `/api/v1/user/orders/track-by-otp` | `user.routes.ts` | `UserController.trackOrdersByOtp` | `UserService.trackOrdersByOtp` | No | Any | `{ phone, otp }` | None | None | `{ success, data: { orders, user, accessToken } }` | None | OtpVerification check, User & Order linking |
| **GET** | `/api/v1/user/profile` | `user.routes.ts` | `UserController.getProfile` | `UserService.getProfile` | Yes | Any | None | None | None | `{ success, data: { user } }` | None | User findUnique |
| **PUT** | `/api/v1/user/profile` | `user.routes.ts` | `UserController.updateProfile` | `UserService.updateProfile` | Yes | Any | `{ firstName, lastName, phone?, dateOfBirth?, gender?, avatarUrl? }` | None | None | `{ success, data: { profile } }` | None | UserProfile upsert |
| **GET** | `/api/v1/user/wishlist` | `user.routes.ts` | `UserController.getWishlist` | `UserService.getWishlist` | Yes | Any | None | None | None | `{ success, data: { items } }` | None | Wishlist findMany |
| **POST** | `/api/v1/user/wishlist` | `user.routes.ts` | `UserController.addToWishlist` | `UserService.addToWishlist` | Yes | Any | `{ productId }` | None | None | `{ success, data: { wishlistItem } }` | None | Wishlist create |
| **DELETE**| `/api/v1/user/wishlist/:productId` | `user.routes.ts` | `UserController.removeFromWishlist` | `UserService.removeFromWishlist` | Yes | Any | None | None | `productId` | `{ success, message }` | None | Wishlist delete |
| **POST** | `/api/v1/user/wishlist/toggle` | `user.routes.ts` | `UserController.toggleWishlist` | `UserService.toggleWishlist` | Yes | Any | `{ productId }` | None | None | `{ success, data: { inWishlist } }` | None | Wishlist upsert/delete |
| **GET** | `/api/v1/user/orders` | `user.routes.ts` | `UserController.getOrders` | `UserService.getOrders` | Yes | Any | None | None | None | `{ success, data: { orders } }` | None | Order findMany |
| **GET** | `/api/v1/user/orders/:id` | `user.routes.ts` | `UserController.getOrderById` | `UserService.getOrderById` | Yes | Any | None | None | `id` | `{ success, data: { order } }` | None | Order findFirst |
| **POST** | `/api/v1/user/orders` | `user.routes.ts` | `UserController.createOrder` | `UserService.createOrder` | Yes | Any | `{ addressId?, shippingAddress?, items, paymentMethod?, couponCode? }` | None | None | `{ success, data: { order } }` | None | Address create, Inventory decrement, Order create, Payment create |
| **POST** | `/api/v1/user/orders/:id/cancel` | `user.routes.ts` | `UserController.cancelOrder` | `UserService.cancelOrder` | Yes | Any | `{ reason? }` | None | `id` | `{ success, data: { order } }` | Razorpay Refund API | Inventory increment, Order update, Payment update, SmsService dispatch |
| **GET** | `/api/v1/user/addresses` | `user.routes.ts` | `UserController.getAddresses` | `UserService.getAddresses` | Yes | Any | None | None | None | `{ success, data: { addresses } }` | None | Address findMany |
| **POST** | `/api/v1/user/addresses` | `user.routes.ts` | `UserController.createAddress` | `UserService.createAddress` | Yes | Any | Address creation payload | None | None | `{ success, data: { address } }` | None | Address create |
| **PUT** | `/api/v1/user/addresses/:id` | `user.routes.ts` | `UserController.updateAddress` | `UserService.updateAddress` | Yes | Any | Address update payload | None | `id` | `{ success, data: { address } }` | None | Address update |
| **DELETE**| `/api/v1/user/addresses/:id` | `user.routes.ts` | `UserController.deleteAddress` | `UserService.deleteAddress` | Yes | Any | None | None | `id` | `{ success, message }` | None | Address soft delete |
| **PATCH**| `/api/v1/user/addresses/:id/default` | `user.routes.ts` | `UserController.setDefaultAddress` | `UserService.setDefaultAddress` | Yes | Any | None | None | `id` | `{ success, data: { address } }` | None | Address updateMany |
| **GET** | `/api/v1/health` | `app.ts` | Inline handler | None | No | Any | None | None | None | `{ success, message, database, smsGateway }` | None | Prisma `$queryRaw SELECT 1` |

---

# 3. Frontend API Call Inventory

| Frontend File | Function / Hook | HTTP Method | API Endpoint | Trigger | Request Data | Expected Response | Error Handling | Loading State | Redirect |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `services/payment.service.ts` | `createRazorpayOrder` | POST | `/api/create-order` | Order placement button | `{ orderId, amount, currency, notes }` | `{ success, order_id, amount, key_id }` | Rejects with error message | Handled in caller component | None |
| `services/payment.service.ts` | `verifyPaymentSignature` | POST | `/api/verify-payment` | Razorpay modal `handler` callback | `{ razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId }` | `{ success, verified, order_id }` | Rejects with error message | Handled in caller component | Redirect to success on verify |
| `services/payment.service.ts` | `getOrderStatus` | GET | `/api/order-status/:id` | Fallback query | None | `{ success, order_id, payments }` | Rejects with error message | Caller managed | None |
| `services/account.service.ts` | `getProfile` | GET | `/user/profile` | Profile mount / user sync | None | `{ user }` | Throws error | Component state | None |
| `services/account.service.ts` | `updateProfile` | PUT | `/user/profile` | Profile form save | Profile update fields | `{ profile }` | Throws error | Component state | None |
| `services/account.service.ts` | `getOrders` | GET | `/user/orders` | Orders page mount | None | `{ orders }` | Throws error | Component state | None |
| `services/account.service.ts` | `getOrderById` | GET | `/user/orders/:id` | Order details mount | None | `{ order }` | Throws error | Component state | None |
| `services/account.service.ts` | `cancelOrder` | POST | `/user/orders/:id/cancel` | Cancel order modal confirm | `{ reason }` | `{ order }` | Throws error | Component state | None |
| `services/account.service.ts` | `getAddresses` | GET | `/user/addresses` | Address list mount | None | `{ addresses }` | Throws error | Component state | None |
| `services/account.service.ts` | `createAddress` | POST | `/user/addresses` | New address save | Address fields | `{ address }` | Throws error | Component state | None |
| `services/account.service.ts` | `updateAddress` | PUT | `/user/addresses/:id` | Edit address save | Address fields | `{ address }` | Throws error | Component state | None |
| `services/account.service.ts` | `deleteAddress` | DELETE | `/user/addresses/:id` | Delete address click | None | None | Throws error | None | None |
| `services/account.service.ts` | `setDefaultAddress`| PATCH | `/user/addresses/:id/default`| Set default click | None | `{ address }` | Throws error | None | None |
| `services/account.service.ts` | `createOrder` | POST | `/user/orders` | Place order click | `{ addressId, items, paymentMethod }` | `{ order }` | Throws error | Component state | Success page |
| `services/account.service.ts` | `getWishlist` | GET | `/user/wishlist` | Wishlist mount | None | `{ items }` | Returns empty array | Component state | None |
| `services/account.service.ts` | `addToWishlist` | POST | `/user/wishlist` | Heart button click | `{ productId }` | Wishlist item | Throws error | None | None |
| `services/account.service.ts` | `removeFromWishlist` | DELETE | `/user/wishlist/:productId` | Heart button click | None | None | Throws error | None | None |
| `services/account.service.ts` | `toggleWishlist` | POST | `/user/wishlist/toggle` | Heart button click | `{ productId }` | `{ inWishlist }` | Throws error | None | None |
| `services/admin.service.ts` | `getDashboardOverview` | GET | `/admin/dashboard` | Dashboard mount & 30s poll | None | `AdminDashboardData` | Throws error | React Query `isLoading` | None |
| `services/admin.service.ts` | `listProducts` | GET | `/cms/products` | Admin products table mount | None | `{ products, total }` | Throws error | React Query `isLoading` | None |
| `services/admin.service.ts` | `getProduct` | GET | `/cms/products/:id` | Edit product mount | None | `{ product }` | Throws error | React Query `isLoading` | None |
| `services/admin.service.ts` | `deleteProduct` | DELETE | `/cms/products/:id` | Delete product click | None | None | Throws error | None | None |
| `services/admin.service.ts` | `createProduct` | POST | `/cms/products` | Create product submit | Product payload | `{ product }` | Throws error | Component state | Back to products |
| `services/admin.service.ts` | `updateProduct` | PATCH | `/cms/products/:id` | Edit product submit | Product payload | `{ product }` | Throws error | Component state | Back to products |
| `services/admin.service.ts` | `uploadImage` | POST | `/cms/upload` | Product image file select | `FormData` ('image') | `{ url }` | Throws error | Component state | None |
| `services/admin.service.ts` | `listCategories` | GET | `/cms/categories` | Categories table mount | None | `{ categories }` | Throws error | React Query `isLoading` | None |
| `services/admin.service.ts` | `createCategory` | POST | `/cms/categories` | Category modal save | Category payload | `{ category }` | Throws error | Component state | None |
| `services/admin.service.ts` | `updateCategory` | PATCH | `/cms/categories/:id` | Category modal edit save | Category payload | `{ category }` | Throws error | Component state | None |
| `services/admin.service.ts` | `deleteCategory` | DELETE | `/cms/categories/:id` | Category delete click | None | None | Throws error | None | None |
| `services/admin.service.ts` | `listOrders` | GET | `/admin/orders` | Admin orders table mount | Query params | `{ orders, total }` | Throws error | React Query `isLoading` | None |
| `services/admin.service.ts` | `updateOrderStatus` | PATCH | `/admin/orders/:id/status` | Status dropdown select | `{ status }` | `{ order }` | Throws error | None | None |
| `services/admin.service.ts` | `listCoupons` | GET | `/admin/coupons` | Coupons table mount | None | `{ coupons }` | Throws error | React Query `isLoading` | None |
| `services/admin.service.ts` | `createCoupon` | POST | `/admin/coupons` | Coupon modal save | Coupon payload | `{ coupon }` | Throws error | Component state | None |
| `services/admin.service.ts` | `toggleCoupon` | PATCH | `/admin/coupons/:id/toggle` | Active switch toggle | None | `{ coupon }` | Throws error | None | None |
| `services/admin.service.ts` | `deleteCoupon` | DELETE | `/admin/coupons/:id` | Coupon delete click | None | None | Throws error | None | None |
| `services/admin.service.ts` | `listPincodes` | GET | `/shipping/pincodes` | Pincodes table mount | None | `{ pincodes }` | Throws error | React Query `isLoading` | None |
| `services/admin.service.ts` | `createPincode` | POST | `/admin/pincodes` | Pincode modal save | Pincode payload | `{ pincode }` | Throws error | Component state | None |
| `services/admin.service.ts` | `updatePincode` | PATCH | `/admin/pincodes/:pincode`| Pincode modal edit save | Pincode payload | `{ pincode }` | Throws error | None | None |
| `services/admin.service.ts` | `deletePincode` | DELETE | `/admin/pincodes/:pincode`| Pincode delete click | None | None | Throws error | None | None |
| `components/ui/PincodeChecker/index.tsx`| `checkPincode` | GET | `/api/v1/shipping/pincode/:code` | 6-digit pincode input | None | `{ data: { serviceable, city... } }` | Client fallback to regex | Spinner `loading` | None |
| `app/checkout/page.tsx` | `lookupPincode` | GET | `/api/pincode/:code` | Checkout pincode input | None | `{ available, city, state... }` | Shows error message | Spinner `loading` | None |
| `app/checkout/page.tsx` | `handleSendCheckoutOtp`| POST | `/auth/otp/send` | Guest checkout phone enter | `{ phone, purpose: 'CHECKOUT' }` | `{ success, resendAfterSeconds }` | Toast error | Spinner `isOtpSending` | None |
| `app/checkout/page.tsx` | `handleVerifyCheckoutOtp`| POST| `/auth/otp/verify` | Guest checkout OTP submit | `{ phone, otp, purpose, name }` | `{ success, data: { accessToken, user } }` | Toast error | Spinner `isVerifyingOtp` | Step payment |
| `app/track-order/page.tsx` | `handleSendOtp` | POST | `/auth/otp/send` | Guest order track phone | `{ phone, purpose: 'ORDER_TRACKING' }`| `{ success, resendAfterSeconds }` | Toast error | Spinner `isOtpSending` | None |
| `app/track-order/page.tsx` | `handleVerifyOtpAndTrack`| POST| `/user/orders/track-by-otp` | Guest order track OTP submit | `{ phone, otp }` | `{ success, data: { orders, user, accessToken } }` | Toast error | Spinner `isSearching` | Shows orders |
| `app/login/page.tsx` | `handleEmailPasswordLogin`| POST| `/auth/login` | Login form submit | `{ email, password }` | `{ success, data: { accessToken, user } }` | Shows error & shake | Spinner `isLoading` | Redirect destination |
| `app/login/page.tsx` | `handleSendOtp` | POST | `/auth/otp/send` | Mobile login submit | `{ phone, purpose: 'LOGIN' }` | `{ success, resendAfterSeconds }` | Shows error & shake | Spinner `isLoading` | Step 2 |
| `app/login/page.tsx` | `handleVerifyOtp` | POST | `/auth/otp/verify` | OTP boxes complete | `{ phone, otp, purpose: 'LOGIN' }` | `{ success, data: { accessToken, user } }` | Shows error & shake | Spinner `isLoading` | Redirect destination |
| `app/register/page.tsx` | `handleRegister` | POST | `/auth/register` | Register form submit | `{ firstName, lastName, email, password, phone }` | `{ success, data: { user } }` | Shows error & shake | Spinner `isLoading` | Auto-login |
| `app/register/page.tsx` | `handleRegister` (Auto-login)| POST| `/auth/login` | Follows successful register | `{ email, password }` | `{ success, data: { accessToken, user } }` | Shows error | Spinner `isLoading` | `/account` |
| `app/admin/login/page.tsx` | `onSubmit` | POST | `/api/auth/admin/login` | Admin login submit | `{ email, password, csrfToken }` | `{ success, accessToken, user }` | Lockout counter & toast | Spinner `loading` | `/admin` |
| `app/admin/forgot-password/page.tsx`| `onSubmit` | POST | `/api/auth/admin/forgot-password` | Admin forgot pass submit | `{ email }` | `{ success, message }` | Toast error | Spinner `loading` | None |
| `app/admin/reset-password/page.tsx` | `onSubmit` | POST | `/api/auth/admin/reset-password` | Admin reset pass submit | `{ token, password }` | `{ success, message }` | Toast error | Spinner `loading` | `/admin/login` |
| `app/admin/layout.tsx` | `handleLogout` | POST | `/api/auth/admin/logout` | Logout button click | None | None | Logged to console | None | `/admin/login` |
| `components/ui/OTPModal/index.tsx` | `sendOtp` | SIMULATED | None (Bypassed) | Modal submit | None | None | None | Timeout | Fake toast |
| `components/ui/AuthCheckoutModal/index.tsx`| `sendOtp` | SIMULATED | None (Bypassed) | Modal submit | None | None | None | Timeout | Fake toast |

---

# 4. Frontend ↔ Backend Contract Validation

### Contract Mismatches & Gaps

| Endpoint / Operation | Frontend Contract | Backend Contract | Mismatch Description | Exact Root Cause | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Order Line Items Unit Price** | Passes `{ productId, productName, price: item.product.price, quantity }` | `createOrder(data)` in `user.service.ts`: `const unitPrice = item.price !== undefined ? Number(item.price) : Number(variant.price);` | **Critical Security Flaw**: Backend calculates order totals using client-submitted `item.price` instead of verifying catalog database prices. | Developer permitted client-supplied price override to support ad-hoc testing, enabling live price tampering. | **P0 (Critical)** |
| **Order Placement Missing Variant ID** | Passes `productId`, `productName`, `price`, `quantity` | Requires `variantId` for foreign key linking in `order_items` | Mismatch in data representation. Backend works around this by searching for the first available variant: `variant = await prisma.productVariant.findFirst({ where: { productId } })`. | Frontend cart stores product-level data rather than variant SKUs, causing arbitrary variant selection if multi-variant items exist. | **P1 (High)** |
| **Pincode Lookup Route Split** | `checkout/page.tsx` calls `/api/pincode/:code` | `backend/src/routes/shipping.routes.ts` serves `/api/v1/shipping/pincode/:pincode` | Route divergence. Checkout hits a mock Next.js route handler (`/api/pincode/[pincode]`), completely ignoring the live database `pincodes` table. | Incomplete migration from prototype mock routes to backend REST API. | **P1 (High)** |
| **Razorpay Webhook Stream Verification** | Razorpay sends raw JSON with `X-Razorpay-Signature` HMAC-SHA256 header | `backend/src/app.ts` parses body with `express.json()` before webhook route; `payment.controller.ts` passes `JSON.stringify(req.body)` to `PaymentService.handleWebhook` | **Webhook Verification Failure**: Re-stringified JSON does not match byte-for-byte with the original signed payload due to whitespace and key formatting differences. | Missing `verify` hook in `express.json({ verify: (req, res, buf) => { req.rawBody = buf; } })`. | **P0 (Critical)** |
| **Admin Dashboard Super Admin Token Forge** | `frontend/src/app/api/v1/admin/dashboard/route.ts` calls backend `/admin/dashboard` | Backend requires valid JWT with `role === "ADMIN"` | **Security Backdoor**: If request lacks a token, Next.js route handler signs a Super Admin token using fallback secret `'dev-secret-key...'` and retrieves live analytics. | Fallback debugging logic was left in production route handler. | **P0 (Critical)** |
| **Admin Login Bypass** | `frontend/src/app/api/auth/admin/login/route.ts` | Backend `/api/v1/auth/login` | **Security Backdoor**: If Express backend is unreachable or returns non-200, route allows hardcoded credentials (`admin@yathu.com` / `admin123`). | Mock fallback credentials left active in production code. | **P0 (Critical)** |
| **Admin Password Reset Desynchronization** | Calls `/api/auth/admin/reset-password` | No corresponding backend endpoint | Fake Operation: Next.js route logs token to console and returns `success: true`. User password in database is never updated. | Mock implementation never wired to Prisma user update. | **P1 (High)** |
| **Profile Mobile Number Update Desynchronization** | Profile change calls `updateProfile({ phone: newMobile })` | `UserService.updateProfile` only updates `UserProfile.phone`, NOT `User.phone` | Identity Desynchronization: User table retains the old phone number. Subsequent OTP logins using the new phone number will fail or create a duplicate customer account. | Backend service updates `UserProfile` table instead of updating parent `User` record transactionally. | **P1 (High)** |
| **Coupon Validation Disconnect** | `cartStore.ts` checks local strings: `ORGANIC10`, `FRESH20`, `YATHUFREE` | Backend has full `coupons` table in Prisma and `/api/v1/admin/coupons` CRUD | Data Disconnect: Coupons created or toggled by admin in the backend database are never fetched or recognized by the frontend cart. | Frontend cart logic is completely disconnected from backend database. | **P2 (Medium)** |
| **Cart Storage Disconnect** | Frontend stores cart in client `localStorage` (`yathu-cart-storage`) | Backend has `Cart` model in Prisma schema | Unused DB Table: Backend Cart table is never populated or queried. Cart does not sync across devices or survive cache clears. | Cart API routes were never created in backend. | **P2 (Medium)** |
| **Dual ApiClient Inconsistency** | `@/services/api-client.ts` targets `NEXT_PUBLIC_API_URL` directly; `@/lib/apiClient.ts` targets Next.js relative origin and handles 401 refresh | Backend REST API | Pathing & Authorization Inconsistency: Calling `/cms/products` works on `@/services/api-client` but fails on `@/lib/apiClient` (which expects `/api/v1/cms/products`). | Two parallel API clients written with differing base URL behaviors. | **P1 (High)** |

---

# 5. Route & Navigation Audit

| Frontend Route | Component | Access | Authentication | API Dependency | Expected Redirect | Actual Redirect | Problem / Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Public | None | `/api/v1/cms/products`, `/api/v1/cms/categories` | None | None | OK |
| `/shop` | `app/shop/page.tsx` | Public | None | `/api/v1/cms/products`, `/api/v1/cms/categories` | None | None | OK (Falls back to mock data if API down) |
| `/shop/[slug]` | `app/shop/[slug]/page.tsx` | Public | None | `/api/v1/cms/products/:slug` | `/404` if not found | `notFound()` | OK (Falls back to name slugify lookup) |
| `/cart` | `app/cart/page.tsx` | Public | None | None (Local Zustand) | `/checkout` on button click | Navigates to `/checkout` | OK |
| `/checkout` | `app/checkout/page.tsx` | Public / Hybrid | Requires verified OTP or session | `/api/pincode/:code`, `/auth/otp/send`, `/auth/otp/verify`, `/user/orders`, `/api/create-order`, `/api/verify-payment` | `/checkout/success?orderId=...` | Navigates to `/checkout/success` | Uses mock pincode endpoint `/api/pincode/:code` instead of `/api/v1/shipping/pincode/:code` |
| `/checkout/success`| `app/checkout/success/page.tsx`| Public | None | None (URL query `orderId`) | None | None | OK |
| `/checkout/failed` | `app/checkout/failed/page.tsx` | Public | None | None (URL query `orderId`, `reason`) | None | None | OK |
| `/checkout/pending`| `app/checkout/pending/page.tsx`| Public | None | None (Dummy timer) | `/checkout/success?orderId=...` | Automatically redirects after 6s | **Critical Glitch**: Timer unconditionally redirects to success without verifying payment status |
| `/track-order` | `app/track-order/page.tsx` | Public | Optional (Guest OTP) | `/auth/otp/send`, `/user/orders/track-by-otp`, `/user/orders` | None | None | OK (Authenticates and loads orders) |
| `/login` | `app/login/page.tsx` | Guest Only | Redirects if logged in | `/auth/login`, `/auth/otp/send`, `/auth/otp/verify` | Destination or `/` | Redirects to `/admin` if admin, else destination | Stale token check cleans up dead sessions |
| `/register` | `app/register/page.tsx` | Guest Only | Redirects if logged in | `/auth/register`, `/auth/login` | `/account` | Redirects to `/account` | OK |
| `/account` | `app/account/page.tsx` | Protected | `access_token` cookie | `/user/profile`, `/user/orders`, `/user/addresses` | `/login?redirect=/account` if unauthenticated | Middleware redirects to `/login` | OK |
| `/account/orders` | `app/account/orders/page.tsx` | Protected | `access_token` cookie | `/user/orders`, `/user/orders/:id/cancel` | `/login?redirect=...` | Middleware redirects to `/login` | OK |
| `/account/addresses`| `app/account/addresses/page.tsx`| Protected | `access_token` cookie | `/user/addresses`, `POST/PUT/DELETE` | `/login?redirect=...` | Middleware redirects to `/login` | OK |
| `/account/profile`| `app/account/profile/page.tsx` | Protected | `access_token` cookie | `/user/profile` | `/login?redirect=...` | Middleware redirects to `/login` | Change mobile OTP runs fake client-side verification |
| `/account/wishlist`| `app/account/wishlist/page.tsx`| Protected | `access_token` cookie | `/user/wishlist` | `/login?redirect=...` | Middleware redirects to `/login` | OK |
| `/admin` | `app/admin/page.tsx` | Admin Only | `access_token` or `admin_logged_in` | `/admin/dashboard` | `/admin/login` | Middleware & layout redirect to `/admin/login` | **Security Flaw**: Layout trusts `localStorage.admin_logged_in === 'true'` |
| `/admin/dashboard`| `app/admin/dashboard/page.tsx` | Admin Only | Redirect | None | `/admin` | Redirects to `/admin` | OK (Alias redirect) |
| `/admin/products` | `app/admin/products/page.tsx` | Admin Only | Admin role | `/cms/products`, `DELETE` | `/admin/login` | Layout guard | OK |
| `/admin/categories`| `app/admin/categories/page.tsx`| Admin Only | Admin role | `/cms/categories`, `POST/PATCH/DELETE` | `/admin/login` | Layout guard | OK |
| `/admin/orders` | `app/admin/orders/page.tsx` | Admin Only | Admin role | `/admin/orders`, `PATCH status` | `/admin/login` | Layout guard | OK |
| `/admin/coupons` | `app/admin/coupons/page.tsx` | Admin Only | Admin role | `/admin/coupons`, `POST/PATCH/DELETE` | `/admin/login` | Layout guard | OK |
| `/admin/settings/pincodes` | `app/admin/settings/pincodes/page.tsx` | Admin Only | Admin role | `/shipping/pincodes`, `/admin/pincodes` | `/admin/login` | Layout guard | OK |
| `/admin/login` | `app/admin/login/page.tsx` | Admin Guest | Redirects if admin | `/api/auth/admin/login` | `/admin` | Redirects to `/admin` | OK |
| `/admin/forgot-password`| `app/admin/forgot-password/page.tsx` | Admin Guest | None | `/api/auth/admin/forgot-password` | None | None | Mock link only |
| `/admin/reset-password` | `app/admin/reset-password/page.tsx` | Admin Guest | None | `/api/auth/admin/reset-password` | `/admin/login` | None | Mock success, password never changed |
| `/faq` & `/faqs` | `app/faq/page.tsx` | Public | None | None | None | None | OK (`/faqs` re-exports `/faq`) |
| `/privacy` & `/privacy-policy` | `app/privacy-policy/page.tsx` | Public | None | None | None | None | OK (`/privacy` re-exports `/privacy-policy`) |
| `/terms` & `/terms-conditions` | `app/terms-conditions/page.tsx` | Public | None | None | None | None | OK (`/terms` re-exports `/terms-conditions`) |

---

# 6. Major Business Flows Audit

```
Flow 1: User Registration
UI (register/page.tsx) ──> apiClient.post('/auth/register') ──> Backend Route (auth.routes.ts)
  ──> validateRequest(registerSchema) ──> AuthController.register ──> AuthService.registerUser
  ──> Prisma User.create & UserProfile.create ──> 201 Response ──> apiClient.post('/auth/login')
  ──> Token generation ──> Write cookie & localStorage ──> Redirect to /account
```
* **Failure Analysis**: If auto-login fails after registration, user remains on register page with error toast, but user account is already created in DB. Subsequent attempt throws 409 Conflict.

```
Flow 2: Customer / Mobile OTP Login
UI (login/page.tsx) ──> Step 1: Input Mobile ──> apiClient.post('/auth/otp/send')
  ──> Backend Route ──> OtpController.sendOtp ──> Rate Limit (10/15min) ──> Check 30s flood
  ──> Fast2SMS Quick Route (q) ──> DB OtpVerification create ──> Step 2: Input 6 digits
  ──> apiClient.post('/auth/otp/verify') ──> OtpController.verifyOtp ──> Bcrypt compare
  ──> Provision User & Profile if new ──> Link existing past orders ──> Generate JWT tokens
  ──> Set refreshToken cookie & return accessToken ──> Login Zustand Store ──> Redirect
```
* **Failure Analysis**: Fully robust on backend. However, frontend `OTPModal` and `AuthCheckoutModal` contain a hardcoded bypass checking `otp === '123456'` without calling backend.

```
Flow 3: Product Catalog & Details
UI (shop/page.tsx) ──> apiClient.get('/api/v1/cms/products') ──> Backend Route ──> optionalAuth
  ──> CmsController.listProducts ──> CmsService.listProducts ──> DB Product.findMany with variants & inventory
  ──> Frontend mapProductToFrontend ──> Render Grid ──> Click Product
  ──> Navigate /shop/[slug] ──> apiClient.get('/api/v1/cms/products/:slug') ──> Render Details
```
* **Failure Analysis**: Robust fallback to static mock products if backend database is offline or empty.

---

# 7. Cart & Checkout Audit

```
Flow: Add to Cart ──> Cart State (Zustand localStorage) ──> Navigate /checkout
  ──> Step 1: Address Input ──> Lookup Pincode (/api/pincode/:code)
  ──> If Guest: Send & Verify OTP (/auth/otp/send & verify) ──> Set session
  ──> Step 2: Payment Method Select (COD or Razorpay)
  ──> Place Order Click ──> accountService.createOrder ──> Backend /api/v1/user/orders
  ──> If COD: Order marked CONFIRMED ──> Inventory Decrement ──> Clear Cart ──> Redirect /checkout/success
  ──> If Razorpay: Order marked PENDING_PAYMENT ──> Inventory Decrement ──> paymentService.createRazorpayOrder
  ──> Launch Razorpay Modal ──> Customer Authorizes ──> Modal onSuccess ──> paymentService.verifyPaymentSignature
  ──> Backend HMAC Verification ──> Order marked PAYMENT_VERIFIED ──> SMS/Email dispatched ──> Clear Cart ──> Redirect /checkout/success
```

### Critical Findings in Cart & Checkout
1. **Price Tampering**: `backend/src/services/user.service.ts` line 633: `const unitPrice = item.price !== undefined ? Number(item.price) : Number(variant.price);`. A malicious client can modify checkout request payloads to pass `price: 1` and complete orders for ₹1.
2. **Negative Inventory Stock**: `tx.inventory.updateMany({ data: { availableQuantity: { decrement: item.quantity } } })` does not verify that `availableQuantity >= item.quantity`. High concurrent demand will drive inventory into negative numbers.
3. **Abandoned Payment Stock Leak**: Inventory is decremented immediately when order is created in `PENDING_PAYMENT` status. If the customer closes the Razorpay modal or payment fails, the reserved inventory is never replenished.
4. **Mock Pincode Disconnect**: Checkout calls Next.js `/api/pincode/${code}` rather than backend `/api/v1/shipping/pincode/${code}`, causing pincodes added to the database by admins to be rejected as unserviceable.

---

# 8. Razorpay Integration Audit

### Complete Payment Lifecycle

```
Customer clicks "Pay Now"
       │
       ▼
1. POST /api/v1/user/orders (Creates order record, status = PENDING_PAYMENT)
       │
       ▼
2. POST /api/create-order (Backend calls Razorpay Orders API with order amount in paise)
       │
       ▼
3. openRazorpayCheckout() (Dynamic CDN checkout.js script loader opens checkout modal)
       │
       ├── Case A: Customer Dismisses Modal ──> onDismiss() sets isProcessingPayment=false (No verify call)
       ├── Case B: Payment Declines at Bank ──> onFailure() displays decline reason (No verify call)
       └── Case C: Payment Approved ──> modal handler receives:
           • razorpay_payment_id
           • razorpay_order_id
           • razorpay_signature
                   │
                   ▼
4. POST /api/verify-payment (Sent to backend server)
       │
       ▼
5. Backend Constant-Time HMAC-SHA256 Verification:
   crypto.timingSafeEqual(crypto.createHmac('sha256', keySecret).update(order_id + '|' + payment_id).digest(), signature)
       │
       ├── Mismatch: Payment marked FAILED, throws 400 Bad Request
       └── Valid Match:
           • Idempotency Check: if already SUCCESSFUL, return idempotent 200
           • Atomic Transaction: Payment status = SUCCESSFUL, Order status = PAYMENT_VERIFIED
           • Notification: Asynchronously dispatches Payment Confirmed SMS & Email
                   │
                   ▼
6. Frontend clears cart & redirects to /checkout/success?orderId=ORD-...
```

### Razorpay Integration Findings
* **Backend Signature Verification**: Server-side verification strictly uses `crypto.timingSafeEqual` with HMAC-SHA256 over `${orderId}|${paymentId}` and validates against `RAZORPAY_KEY_SECRET`. Payment success is never trusted from client reports alone.
* **Webhook Signature Flaw**: `PaymentController.handleWebhook` calculates signature against `(req as any).rawBody || JSON.stringify(req.body)`. Because `app.ts` does not preserve `rawBody` during body-parser execution, signature verification will fail for webhook calls where JSON formatting differs from Razorpay's exact wire bytes.
* **Currency & Units**: Correctly validated as 3-letter ISO code (INR) and converted to subunits (paise) with `Math.round(amount * 100) >= 100`.
* **Refund Integration**: `PaymentService.refundPayment` connects to Razorpay Refunds API and updates payment record to `REFUNDED` upon order cancellation.

---

# 9. SMS Integration Audit

### Architecture & Service Pattern
The backend SMS integration utilizes Fast2SMS Quick Route (`q`) and OTP Route with single-segment GSM-7 character guarantees:
* **Cost Efficiency**: `enforceSingleSegmentLimit` ensures all transactional SMS templates are strictly limited to English GSM-7 characters under 160 characters (1 segment = ₹5 cost).
* **Provider Fallback**: If Quick Route (`q`) fails, the service automatically falls back to Route `otp`.
* **Non-Blocking Delivery**: SMS notification failures are caught and logged without aborting or rolling back parent database transactions. For example, if an order is created but SMS dispatch fails, the order still succeeds.

### Critical SMS Vulnerabilities & Gaps
1. **Hardcoded API Key (Phase 16 Finding)**:
   * **Location**: `backend/src/services/sms.service.ts`, lines 36-37
   * **Issue**: A live production Fast2SMS API key is hardcoded as `DEFAULT_FAST2SMS_KEY` in source code.
2. **Frontend OTP Mocking**:
   * **Location**: `frontend/src/components/ui/OTPModal/index.tsx` (lines 77-82) and `AuthCheckoutModal/index.tsx` (line 60)
   * **Issue**: Frontend modals simulate SMS dispatch and accept hardcoded code `123456`.
3. **Profile Change Mobile Simulation**:
   * **Location**: `frontend/src/app/account/profile/page.tsx` (lines 194-206)
   * **Issue**: Mobile number updates generate a random Math string in React state and toast it to the screen without sending any real SMS or validating on the server.

---

# 10. Error-Handling Audit

| Location | API / Operation | Failure Scenario | Current Handling | Expected Handling | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend/src/app/checkout/pending/page.tsx` | Payment Polling | Payment failed or pending | Dummy progress bar hits 100% and redirects to success | Poll `/api/order-status/:id` and redirect to `/checkout/failed` if unpaid | **P0 (Critical)** |
| `backend/src/controllers/payment.controller.ts` | Webhook verification | Invalid JSON serialization | 400 Bad Request returned to Razorpay webhook | Parse original raw buffer | **P0 (Critical)** |
| `frontend/src/app/account/profile/page.tsx` | Mobile change | Failed DB update | Toast error, but Zustand store already mutated | Revert store state on failure | **P2 (Medium)** |
| `frontend/src/components/ui/PincodeChecker/index.tsx`| Check pincode | Backend unreachable (500/timeout) | Falls back to hardcoded South Indian postal prefixes | Show retry button or network notice | **P2 (Medium)** |
| `frontend/src/services/api-client.ts` | Server 502/503 | Server returns HTML error page | Catches parse error and returns generic `success: false` | Display structured service outage banner | **P2 (Medium)** |
| `backend/src/services/user.service.ts` | Create order | Empty cart submitted | Throws `ApiError.badRequest("Cannot place order with an empty cart.")` | Standard 400 with message | Handled correctly |
| `backend/src/services/user.service.ts` | Cancel order | Non-existent or already cancelled order | Throws `ApiError.notFound` or `ApiError.badRequest` | Standard 404/400 | Handled correctly |

---

# 11. HTTP Status Code Audit

* `200 OK`: Correctly used across GET endpoints and successful updates (e.g. `/api/v1/auth/login`, `/api/v1/cms/products`).
* `201 Created`: Correctly applied for resource creations (e.g. `POST /api/v1/auth/register`, `POST /api/v1/cms/products`, `POST /api/v1/cms/categories`).
* `204 No Content`: Correctly handled in `api-client.ts` for DELETE operations.
* `400 Bad Request`: Used for Zod validation failures, OTP mismatches, and signature mismatches.
* `401 Unauthorized`: Emitted by `requireAuth` and JWT verification failures.
* `403 Forbidden`: Emitted by `requireRole` when a customer tries to access admin endpoints.
* `404 Not Found`: Emitted when products, categories, or orders do not exist.
* `409 Conflict`: Emitted when attempting to register an existing email.
* `429 Too Many Requests`: Emitted by `apiLimiter`, `authLimiter` (30/15m), and `otpLimiter` (10/15m).
* `500 Internal Server Error`: Centralized via `errorMiddleware` which hides stack traces in production.

---

# 12. UI / UX Glitch Audit

1. **Loading Spinner Premature Termination**: In `frontend/src/app/checkout/page.tsx`, if the Razorpay script fails to load, `setIsProcessingPayment(false)` runs and a toast displays, but the order in the database remains stuck in `PENDING_PAYMENT`.
2. **False Success in Pending Screen**: `/checkout/pending` displays an animated clock and fake progress increments. After 6 seconds, `toast.success("Payment verified!")` fires and routes to `/checkout/success` regardless of actual payment state.
3. **Checkout Double-Click Prevention**: Handled via `disabled={isProcessingPayment}` on primary action buttons in `checkout/page.tsx`.
4. **Empty Cart States**: Handled across `cart/page.tsx` and `checkout/page.tsx` with dedicated empty state vectors and "Continue Shopping" links.

---

# 13. Redirect Logic Audit

1. **Admin Login Stale Redirect**: In `frontend/src/app/admin/login/page.tsx`, successful authentication triggers `window.location.href = redirectUrl;`. If `redirectUrl` was `/account`, the admin is redirected to the customer portal, which Next.js middleware then intercepts and redirects back to `/admin`.
2. **Checkout Success on Aborted Payment**: If a user navigates directly to `/checkout/pending`, they are automatically routed to `/checkout/success` with whatever `orderId` is present in the URL query string.
3. **Authentication Redirection Loop Protection**: Handled properly in `frontend/src/middleware.ts` by checking `decoded.exp * 1000 > Date.now()` before redirection.

---

# 14. Async & Race Condition Audit

1. **Inventory Decrement Concurrency**: In `backend/src/services/user.service.ts` lines 661-668, `tx.inventory.updateMany` uses Prisma's `decrement` operator within a transaction. However, Prisma does not place row-level locks (`SELECT FOR UPDATE`), meaning concurrent transactions for the last remaining stock item will both succeed, creating oversold negative stock.
2. **Double Token Refresh Race**: In `frontend/src/lib/apiClient.ts` lines 89-139, token refresh concurrency is protected using `this.isRefreshing` flag and a subscriber queue (`this.refreshSubscribers`).
3. **Cart Hydration Flicker**: Handled properly in `frontend/src/app/checkout/page.tsx` via `hasMounted` state guard.

---

# 15. Database & Business Logic Audit

1. **Price Manipulation**: Critical vulnerability in `backend/src/services/user.service.ts` allowing client-supplied prices.
2. **Unvalidated Negative Stock**: Missing inventory floor constraint (`availableQuantity - quantity >= 0`).
3. **User Profile vs User Phone Desynchronization**: Updates to user phone numbers through profile endpoints only update the `user_profiles` table, leaving `users.phone` stale.
4. **Coupon Disconnection**: Database coupons table is ignored by frontend cart calculations.

---

# 16. Security Audit

> [!CAUTION]
> In accordance with security audit protocols, raw secret credentials are NOT exposed below.

### Disclosed Security Findings

#### 1. Hardcoded SMS Provider API Key
* **File**: [sms.service.ts](file:///e:/Personal%20Projects/ecommerce-production/backend/src/services/sms.service.ts#L36-L37)
* **Line**: 36-37
* **Type**: Fast2SMS Production API Key
* **Recommended Remediation**: Revoke the exposed key immediately in Fast2SMS console. Remove the fallback constant and require `process.env.FAST2SMS_API_KEY`.

#### 2. Hardcoded Admin Authentication Credentials
* **File**: [route.ts](file:///e:/Personal%20Projects/ecommerce-production/frontend/src/app/api/auth/admin/login/route.ts#L78-L82)
* **Line**: 78-82
* **Type**: Hardcoded Email & Plaintext Password Credentials
* **Recommended Remediation**: Remove mock credential checks. Require all authentication to validate against the database via Express `/api/v1/auth/login`.

#### 3. Hardcoded JWT Development Secret Fallbacks
* **File**: [route.ts](file:///e:/Personal%20Projects/ecommerce-production/frontend/src/app/api/auth/admin/login/route.ts#L17), [route.ts](file:///e:/Personal%20Projects/ecommerce-production/frontend/src/app/api/v1/admin/dashboard/route.ts#L14), [auth.ts](file:///e:/Personal%20Projects/ecommerce-production/frontend/src/lib/auth.ts#L84)
* **Line**: 17, 14, 84
* **Type**: Static Shared HMAC-SHA256 Signing Secret
* **Recommended Remediation**: Remove development fallback strings. Fail fast if `process.env.JWT_SECRET` is unset.

#### 4. Unauthenticated Super Admin Token Generation Backdoor
* **File**: [route.ts](file:///e:/Personal%20Projects/ecommerce-production/frontend/src/app/api/v1/admin/dashboard/route.ts#L13-L28)
* **Line**: 13-28
* **Type**: Administrative Authorization Bypass
* **Recommended Remediation**: Delete lines 13-28. Forward only valid customer/admin tokens.

#### 5. LocalStorage Admin Privilege Escalation
* **File**: [layout.tsx](file:///e:/Personal%20Projects/ecommerce-production/frontend/src/app/admin/layout.tsx#L64-L77)
* **Line**: 64-77
* **Type**: Client-Side Authorization Bypass
* **Recommended Remediation**: Validate authorization exclusively via verified JWT cookie payload or API check.

---

# 17. Dead Code & Logic Gap Audit

1. **Unused Prisma Cart Model**: Table `cart` defined in `schema.prisma` is never queried or mutated by backend routes.
2. **Mock Next.js API Routes**:
   * `frontend/src/app/api/auth/send-otp/route.ts` (Mocked with `123456`)
   * `frontend/src/app/api/auth/verify-otp/route.ts` (Mocked with `123456`)
   * `frontend/src/app/api/auth/admin/forgot-password/route.ts` (Mock link output)
   * `frontend/src/app/api/auth/admin/reset-password/route.ts` (Fake success, no DB update)
   * `frontend/src/app/api/pincode/[pincode]/route.ts` (Mock rules, ignores DB)
3. **Dual Client Duplication**: Parallel existence of `@/services/api-client.ts` and `@/lib/apiClient.ts` with differing URL prefixing behaviors.

---

# 18. End-to-End Trace Matrix

| Flow | Frontend | API Client | Backend Route | Service | DB Operation | External API | Success Path | Failure Path | Redirect | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Registration** | `register/page.tsx` | `@/services/api-client` | `POST /api/v1/auth/register` | `AuthService.registerUser` | User, UserProfile create | None | 201 Created | 409 Conflict | Auto-login -> `/account` | Functional |
| **Email Login** | `login/page.tsx` | `@/services/api-client` | `POST /api/v1/auth/login` | `AuthService.loginUser` | User findUnique | None | 200 OK + JWT | 401 Unauthorized | Destination or `/` | Functional |
| **Mobile OTP Login** | `login/page.tsx` | `@/services/api-client` | `POST /api/v1/auth/otp/send` & `verify` | `OtpController`, `SmsService` | OtpVerification, User upsert | Fast2SMS | 200 OK + JWT | 400 Bad Request | Destination or `/` | Functional |
| **Catalog Listing** | `shop/page.tsx` | `@/lib/apiClient` | `GET /api/v1/cms/products` | `CmsService.listProducts` | Product findMany | None | 200 OK + Products | Mock fallback | None | Functional |
| **Product Details** | `shop/[slug]/page.tsx` | `@/lib/apiClient` | `GET /api/v1/cms/products/:slug`| `CmsService.getProductBySlug` | Product findUnique | None | 200 OK + Product | 404 / Mock lookup | None | Functional |
| **Pincode Checker** | `PincodeChecker/index.tsx`| Direct `fetch` | `GET /api/v1/shipping/pincode/:code` | `ShippingService.checkPincode` | Pincode findUnique | None | 200 OK + Serviceable | Regex fallback | None | Functional |
| **Checkout Pincode**| `checkout/page.tsx` | Direct `fetch` | `GET /api/pincode/:code` (Mock) | Next.js Route Handler | None | None | 200 OK (Hardcoded) | "Not serviceable" | None | **Defective (Bypasses DB)** |
| **Order Placement**| `checkout/page.tsx` | `@/services/api-client` | `POST /api/v1/user/orders` | `UserService.createOrder` | Inventory decrement, Order create | None | 200 OK + Order | 400 Bad Request | `/checkout/success` | **Vulnerable to Price Tampering** |
| **Razorpay Payment**| `checkout/page.tsx` | `@/services/payment.service`| `POST /api/create-order` & `POST /api/verify-payment` | `PaymentService` | Payment create/update, Order status | Razorpay Orders API | 200 OK + Verified | 400 Mismatch | `/checkout/success` | Functional |
| **Payment Webhook** | External Razorpay Hook | None | `POST /api/webhook` | `PaymentService.handleWebhook` | Payment updateMany | Razorpay | 200 OK | 400 Bad Request | None | **Defective (rawBody Issue)** |
| **Order Tracking** | `track-order/page.tsx` | `@/services/api-client` | `POST /api/v1/user/orders/track-by-otp` | `UserService.trackOrdersByOtp`| Order findMany | Fast2SMS | 200 OK + Orders | 400 Expired OTP | Shows Timeline | Functional |
| **Address CRUD** | `account/addresses/page.tsx`| `@/services/account.service`| `/api/v1/user/addresses` | `UserService` | Address CRUD | None | 200 OK | 400 Limit/Error | None | Functional |
| **Admin Overview** | `admin/page.tsx` | `@/services/admin.service` | `GET /api/v1/admin/dashboard` | `AdminService.getDashboardOverview`| Aggregations | None | 200 OK + KPIs | 401/403 Error | None | Functional |

---

# 19. Root Cause Analysis (Detailed Issue Reports)

### Issue 1: Server-Side Price Tampering Vulnerability
* **Location**: `backend/src/services/user.service.ts`, line 633
* **Expected**: The backend must calculate order line-item costs strictly by querying the catalog `ProductVariant` record (`variant.discountPrice || variant.price`).
* **Actual**: Backend code explicitly checks: `const unitPrice = item.price !== undefined ? Number(item.price) : Number(variant.price);`.
* **Root Cause**: Developer allowed client price override for ad-hoc debugging without restricting it to testing environments.
* **Impact**: Critical financial exploit. An attacker can craft a payload setting `price: 1` and purchase any catalog product for ₹1.
* **Reproduction**: Send `POST /api/v1/user/orders` with body `{ items: [{ productId: "valid-id", price: 1, quantity: 1 }] }`. Inspect returned order total: grand total is ₹1 + shipping.
* **Recommended Fix**: Remove `item.price` entirely. Query verified variant pricing from database.
* **Priority**: **P0 — Critical**

### Issue 2: Hardcoded Production Fast2SMS API Key
* **Location**: `backend/src/services/sms.service.ts`, lines 36-37
* **Expected**: API keys must be loaded exclusively from environment variables (`process.env.FAST2SMS_API_KEY`).
* **Actual**: A production key string is assigned to `DEFAULT_FAST2SMS_KEY` in source code.
* **Root Cause**: Key was hardcoded as a fallback during local testing and committed to the repository.
* **Impact**: Key exposure risks account exhaustion and unauthorized SMS dispatch.
* **Reproduction**: View `sms.service.ts` line 36.
* **Recommended Remediation**: Revoke the key in Fast2SMS portal. Remove constant from source code.
* **Priority**: **P0 — Critical**

### Issue 3: Hardcoded Admin Credentials Fallback
* **Location**: `frontend/src/app/api/auth/admin/login/route.ts`, lines 78-82
* **Expected**: Admin authentication must validate solely against the Express backend database.
* **Actual**: Route permits plaintext credentials `admin@yathu.com` / `admin123` and `admin@yathuarokiyagam.com` / `Password123`.
* **Root Cause**: Mock credentials fallback left in place.
* **Impact**: Unauthorized administrative access if backend connection experiences downtime.
* **Reproduction**: Stop Express backend. Send `POST /api/auth/admin/login` with email `admin@yathu.com` and password `admin123`. Returns 200 OK with admin token.
* **Recommended Fix**: Delete fallback block. Return 503 or 401 if backend authentication fails.
* **Priority**: **P0 — Critical**

### Issue 4: Super Admin JWT Token Auto-Forge
* **Location**: `frontend/src/app/api/v1/admin/dashboard/route.ts`, lines 13-28
* **Expected**: Unauthenticated requests to `/api/v1/admin/dashboard` must return 401 Unauthorized.
* **Actual**: If the `Authorization` header is missing, the route signs a Super Admin token with fallback secret `'dev-secret-key...'` and forwards it to the backend.
* **Root Cause**: Debugging shortcut was left in the route handler.
* **Impact**: Total administrative data exposure. Anyone can view dashboard KPIs without logging in.
* **Reproduction**: Run `curl http://localhost:3000/api/v1/admin/dashboard` with no headers. Returns full analytics.
* **Recommended Fix**: Remove fallback signing block. Forward incoming `Authorization` header or reject with 401.
* **Priority**: **P0 — Critical**

### Issue 5: Razorpay Webhook Signature Mismatch
* **Location**: `backend/src/app.ts` (line 64) and `backend/src/controllers/payment.controller.ts` (line 119)
* **Expected**: Webhook HMAC-SHA256 signature must be verified against the exact raw bytes received from Razorpay.
* **Actual**: `app.ts` parses request stream via `express.json()` without saving `req.rawBody`. `payment.controller.ts` passes `JSON.stringify(req.body)`, which differs in whitespace and key serialization from the wire payload.
* **Root Cause**: Missing `verify` callback in `express.json()`.
* **Impact**: Real Razorpay webhook calls will fail signature validation, preventing automated order confirmation when users close their browser after paying.
* **Reproduction**: Trigger Razorpay test webhook. Observe 400 Bad Request: "Invalid webhook signature".
* **Recommended Fix**: Update `app.ts`:
  ```ts
  app.use(express.json({
    limit: "5mb",
    verify: (req: any, res, buf) => { req.rawBody = buf; }
  }));
  ```
* **Priority**: **P0 — Critical**

### Issue 6: Unconditional Redirection to Success on Pending Checkout
* **Location**: `frontend/src/app/checkout/pending/page.tsx`, lines 63-71
* **Expected**: The pending page must poll the order status from `/api/order-status/:id` and only redirect to `/checkout/success` if status is `PAYMENT_VERIFIED` or `CONFIRMED`.
* **Actual**: A `setInterval` timer increments a counter to 100% over 6 seconds and unconditionally redirects to `/checkout/success`.
* **Root Cause**: Frontend prototype animation was not hooked up to backend order query.
* **Impact**: Failed or abandoned payments appear successful to the customer.
* **Reproduction**: Navigate to `/checkout/pending?orderId=DUMMY`. Wait 6 seconds. Automatically navigates to `/checkout/success?orderId=DUMMY`.
* **Recommended Fix**: Query `paymentService.getOrderStatus(orderId)` on interval. Redirect to `/checkout/failed` if unpaid after timeout.
* **Priority**: **P0 — Critical**

### Issue 7: Client-Side LocalStorage Admin Privilege Escalation
* **Location**: `frontend/src/app/admin/layout.tsx`, lines 64-77
* **Expected**: Access to `/admin/*` views must require a validated JWT in cookies or state.
* **Actual**: Layout allows access if `localStorage.getItem('admin_logged_in') === 'true'`.
* **Root Cause**: Layout guard relied on an unverified localStorage flag.
* **Impact**: Bypasses client UI guards, revealing admin UI.
* **Reproduction**: In browser DevTools console on `/admin/login`, run `localStorage.setItem('admin_logged_in', 'true')` and navigate to `/admin`.
* **Recommended Fix**: Validate against `useAuthStore` role and verified token cookie.
* **Priority**: **P1 — High**

### Issue 8: Checkout Pincode Route Split & Database Disconnect
* **Location**: `frontend/src/app/checkout/page.tsx`, line 236
* **Expected**: Checkout pincode validation should query live database pincodes via `/api/v1/shipping/pincode/:code`.
* **Actual**: Calls mock route `/api/pincode/:code`.
* **Root Cause**: Prototype endpoint was never switched to production shipping API.
* **Impact**: Valid pincodes added to database by store owners are rejected during customer checkout.
* **Reproduction**: Add pincode in Admin Settings. Attempt to use it during checkout. Fails with "Not serviceable".
* **Recommended Fix**: Update checkout to call `/api/v1/shipping/pincode/${code}` and read `res.data.serviceable`.
* **Priority**: **P1 — High**

---

# 20. Issue Categories Breakdown

* **SECURITY**: Issues 1, 2, 3, 4, 7 (Price tampering, hardcoded credentials, secret fallbacks, super admin token forge, localStorage bypass)
* **PAYMENT**: Issues 5, 6 (Webhook rawBody mismatch, pending auto-redirect glitch)
* **SMS**: Phase 9 findings (Hardcoded Fast2SMS API key, frontend OTP simulation)
* **API & CONTRACT**: Issues 1, 8 (Line items price override, checkout pincode route divergence, dual apiClient divergence)
* **DATABASE & BUSINESS LOGIC**: Issue 1, Phase 15 findings (Negative stock on high concurrency, profile vs user phone desynchronization, unlinked Cart model)
* **REDIRECT & UI/UX**: Issue 6 (Pending auto-redirect, admin logout redirect cleanup)
* **DEAD CODE**: Phase 17 findings (Unused Prisma Cart table, mock reset password route)

---

# 21. Recommended Fix Order

### PHASE 1 — Critical Security & Payment Fixes (P0)
1. **Fix Server-Side Price Tampering**: Update `UserService.createOrder` to discard client-submitted line-item prices and calculate totals strictly from `variant.discountPrice || variant.price`.
2. **Remove Hardcoded Credentials & Secrets**:
   * Revoke Fast2SMS key; remove `DEFAULT_FAST2SMS_KEY` in `sms.service.ts`.
   * Delete hardcoded credentials in `api/auth/admin/login/route.ts`.
   * Remove development secret fallbacks across `lib/auth.ts` and API routes.
3. **Eliminate Super Admin Token Forge**: Remove token generation logic in `api/v1/admin/dashboard/route.ts`.
4. **Fix Razorpay Webhook Raw Body Verification**: Add `verify` callback in `backend/src/app.ts` to attach `req.rawBody = buf`.
5. **Fix Pending Checkout Auto-Redirect**: Replace timer in `app/checkout/pending/page.tsx` with real status polling.

### PHASE 2 — Backend API & Database Consistency (P1)
1. **Inventory Concurrency Guard**: Verify `availableQuantity >= item.quantity` before decrementing in `UserService.createOrder`.
2. **Profile Phone Synchronization**: Update `UserService.updateProfile` to update both `users.phone` and `user_profiles.phone` transactionally.
3. **Admin Password Reset Integration**: Implement real password hashing and update in `api/auth/admin/reset-password/route.ts`.

### PHASE 3 — Frontend API Routing & Checkout Alignment (P1)
1. **Unify Pincode Endpoint**: Update `checkout/page.tsx` to call `/api/v1/shipping/pincode/:code`.
2. **Unify API Clients**: Standardize on `@/services/api-client.ts` or align `@/lib/apiClient.ts` to use consistent base paths.
3. **Secure Admin Layout Guard**: Remove `localStorage.admin_logged_in` trust in `app/admin/layout.tsx`.

### PHASE 4 — Features & Data Linkage (P2)
1. **Connect Live Coupons**: Wire `cartStore.ts` to validate coupons against database records via `/api/v1/shipping` or `/api/v1/cms/coupons`.
2. **Clean Up Dead Code & Unused Tables**: Either wire up database `Cart` model for authenticated cross-device carts or prune the table from schema.
