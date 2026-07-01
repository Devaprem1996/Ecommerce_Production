# AUTHENTICATION & AUTHORIZATION OVERVIEW

## Two Types of Users

┌─────────────────────────────────────────────────┐
│  USER TYPES                                     │
│                                                 │
│  1. CUSTOMER (Public User)                      │
│     - Browse products (no login needed)         │
│     - Add to cart (no login needed)             │
│     - Checkout → OTP login required             │
│     - View orders → login required              │
│     - Write reviews → login required            │
│                                                 │
│  2. ADMIN (Private User)                        │
│     - Separate login page                       │
│     - Email + Password (no OTP)                 │
│     - Access only /admin/* routes               │
│     - Cannot access customer routes as admin    │
└─────────────────────────────────────────────────┘

## Authentication Methods

┌─────────────────────────────────────────────────┐
│  METHOD 1: OTP Login (Primary — For Customers)  │
│  - Mobile number + OTP via SMS                  │
│  - No password needed                           │
│  - Fast, frictionless                           │
│  - Used at: Checkout, Login page                │
│                                                 │
│  METHOD 2: Email + Password (For Admin Only)    │
│  - Admin email + password                       │
│  - Separate /admin/login page                   │
│  - 2FA optional (future)                        │
│                                                 │
│  METHOD 3: Google OAuth (Optional — Customer)   │
│  - "Sign in with Google" button                 │
│  - Quick account creation                       │
│  - Future enhancement                           │
└─────────────────────────────────────────────────┘

## Auth Flow Summary

CUSTOMER FLOW:
Browse → Add Cart → Checkout
  → NOT LOGGED IN? → OTP Modal
  → Enter Mobile → Get OTP → Verify
  → Auto Create Account if New User
  → Continue Checkout

ADMIN FLOW:
Visit /admin → Redirect to /admin/login
  → Enter Email + Password
  → Verify Credentials
  → Set Admin Session
  → Redirect to /admin/dashboard

## Token Strategy
- Customer : JWT (Access Token 15min + Refresh Token 7 days)
- Admin    : JWT (Access Token 15min + Refresh Token 1 day)
- Storage  : httpOnly cookies (secure, not localStorage)
- CSRF     : CSRF token for all mutations

## Session Rules
- Customer token expires → Silent refresh via refresh token
- Refresh token expires → Redirect to login
- Admin token expires → Redirect to /admin/login
- Multiple devices → Allow (no single session limit for customer)
- Admin → Single session only (logout other devices)
