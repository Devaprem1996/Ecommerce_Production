# FORGOT PASSWORD / RESET FLOW

## Note on Customer Accounts
Customers use OTP (no password), so "Forgot Password"
only applies to ADMIN accounts.

For customers who "can't login":
→ Just request a new OTP with same mobile number
→ Show on login page: "Having trouble? Request new OTP"

## Customer "Can't Login" Flow
URL: /login (same page)
If user says they have issues:
1. Verify mobile number
2. Request OTP
3. If OTP doesn't arrive → Show:
   "Didn't receive OTP?"
   Options:
   [Resend via SMS] [Get OTP on WhatsApp] [Contact Support]

## Admin Forgot Password Flow
Pages needed:
1. /admin/forgot-password
2. /admin/reset-password?token=[token]

### /admin/forgot-password
┌─────────────────────────────────────────────────┐
│  [← Back to Login]                             │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  Forgot Password?                         │  │
│  │  No worries! We'll send reset link.       │  │
│  │                                           │  │
│  │  Email Address                            │  │
│  │  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]  │  │
│  │                                           │  │
│  │  [Send Reset Link →]                     │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  SUCCESS STATE:                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  ✅ Reset link sent!                      │  │
│  │  Check your email: a***@gmail.com         │  │
│  │  Link valid for 1 hour.                   │  │
│  │                                           │  │
│  │  [← Back to Login]                       │  │
│  │  [Resend Email] (active after 60s)       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

### /admin/reset-password
┌─────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────┐  │
│  │  Create New Password                      │  │
│  │                                           │  │
│  │  New Password                             │  │
│  │  [━━━━━━━━━━━━━━━━━━━━━━━━] [👁️]        │  │
│  │  ████████░░ Strength: Good               │  │
│  │                                           │  │
│  │  Confirm Password                         │  │
│  │  [━━━━━━━━━━━━━━━━━━━━━━━━] [👁️]        │  │
│  │                                           │  │
│  │  Password must have:                      │  │
│  │  ✅ At least 8 characters                │  │
│  │  ✅ One uppercase letter                  │  │
│  │  ❌ One number                            │  │
│  │  ❌ One special character                 │  │
│  │                                           │  │
│  │  [Reset Password →]                      │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

## Password Strength Indicator
Weak    : 1-2 criteria met → Red bar (25%)
Fair    : 3 criteria met   → Orange bar (50%)
Good    : 4 criteria met   → Yellow bar (75%)
Strong  : All + length 12+ → Green bar (100%)

## Token Security
- Reset token: cryptographically random (64 chars)
- Expires: 1 hour after generation
- Single use: invalidated after use
- Old password: still works until new one is set
- If token invalid/expired → "Link expired. Request a new one."
