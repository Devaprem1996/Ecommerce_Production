# AUTHORIZATION — ROLES & PERMISSIONS

## Roles

| Role          | Description                    |
|--------------|--------------------------------|
| GUEST        | Not logged in                  |
| CUSTOMER     | Logged in customer             |
| ADMIN        | Full admin access              |
| SUPER_ADMIN  | Can manage other admins        |

## Permission Matrix

### Customer Facing Routes
| Route                   | GUEST | CUSTOMER | ADMIN |
|------------------------|-------|----------|-------|
| /                      | ✅    | ✅       | ✅    |
| /shop/*                | ✅    | ✅       | ✅    |
| /product/*             | ✅    | ✅       | ✅    |
| /blog/*                | ✅    | ✅       | ✅    |
| /about, /contact, /faq | ✅    | ✅       | ✅    |
| /cart                  | ✅    | ✅       | ✅    |
| /checkout              | ❌*   | ✅       | ❌    |
| /account/*             | ❌    | ✅       | ❌    |
| /track-order           | ✅    | ✅       | ✅    |
| /login, /register      | ✅    | REDIRECT | ❌    |
| /admin/*               | ❌    | ❌       | ✅    |
| /admin/login           | ❌    | ❌       | ✅    |

* GUEST on checkout → Trigger OTP login modal

### Admin Routes
| Route                      | ADMIN | SUPER_ADMIN |
|---------------------------|-------|-------------|
| /admin/dashboard           | ✅    | ✅          |
| /admin/products/*          | ✅    | ✅          |
| /admin/categories/*        | ✅    | ✅          |
| /admin/orders/*            | ✅    | ✅          |
| /admin/customers/*         | ✅    | ✅          |
| /admin/content/*           | ✅    | ✅          |
| /admin/coupons/*           | ✅    | ✅          |
| /admin/reports/*           | ✅    | ✅          |
| /admin/settings/*          | ❌    | ✅          |
| /admin/manage-admins/*     | ❌    | ✅          |

## Route Protection Implementation

### Customer Routes (Next.js Middleware)
```javascript
// middleware.ts
// If accessing /account/* and no customer token → 
//   redirect to /login?redirect=[current path]

// If accessing /checkout and no token →
//   Do NOT redirect, let page handle OTP modal

// If CUSTOMER tries to access /admin/* →
//   redirect to /

// If already logged in and visits /login or /register →
//   redirect to /account
```

### Admin Routes (Next.js Middleware)
```javascript
// If accessing /admin/* (except /admin/login) and no admin token →
//   redirect to /admin/login

// If accessing /admin/login with valid admin token →
//   redirect to /admin/dashboard

// If ADMIN tries to access /account/* →
//   redirect to /admin/dashboard
```

### API Authorization
All API routes must check:
* **Public APIs**: No token needed (products, categories, blogs)
* **Customer APIs**: Valid customer JWT required
* **Admin APIs**: Valid admin JWT + admin role required
* **Super Admin APIs**: Valid JWT + super_admin role required

Always return:
* **401**: Not authenticated (no token)
* **403**: Not authorized (wrong role)
* **200**: Success
