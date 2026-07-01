# ADMIN LOGIN PAGE

## URL
/admin/login

## IMPORTANT RULES
- Completely SEPARATE from customer login
- NO OTP — Email + Password only
- NO "Sign up" option (admin accounts created manually)
- NO link from customer pages
- Brute force protection (max 5 attempts → 15 min lockout)
- Rate limiting on API

## Page Design
┌─────────────────────────────────────────────────┐
│                                                 │
│         [LOGO — small, centered top]            │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │   🔐 Admin Portal                        │  │
│  │   Authorized Personnel Only              │  │
│  │                                           │  │
│  │   Email Address                          │  │
│  │   [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]  │  │
│  │                                           │  │
│  │   Password                               │  │
│  │   [━━━━━━━━━━━━━━━━━━━━━━━━] [👁️]       │  │
│  │                                           │  │
│  │   ☐ Remember me (this device)            │  │
│  │                                           │  │
│  │   [Login to Dashboard →]                 │  │
│  │                                           │  │
│  │   [Forgot Password?]                     │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│   🔒 Secured Connection                        │
│   © 2025 [Brand Name] — Admin Portal           │
└─────────────────────────────────────────────────┘

## Security Features
- Password field: toggle show/hide
- Remember me: 1 day session (not 7 days like customer)
- Failed attempts counter visible: "2 of 5 attempts used"
- After 5 fails: "Account locked for 15 minutes"
- IP logging for all admin logins
- Session timeout: 4 hours of inactivity

## Validations
| Field    | Rule               | Error                            |
|----------|--------------------|----------------------------------|
| Email    | Valid format       | Enter a valid email address      |
| Password | Min 8 chars        | Password is required             |
| Both     | Wrong credentials  | Invalid email or password        |
| Locked   | Too many attempts  | Account locked. Try after 15 min |

## After Successful Login
- Redirect to /admin/dashboard
- Show: "Welcome back, [Admin Name]!" toast
- Log login event (timestamp + IP)

## Forgot Password (Admin)
URL: /admin/forgot-password
- Enter registered admin email
- Receive reset link via email (valid 1 hour)
- Reset link → /admin/reset-password?token=xxx
- Set new password (min 8 chars, 1 uppercase, 1 number)
- Success → redirect to /admin/login

## Design Notes
- Simpler, more serious design than customer pages
- Dark/professional feel
- No decorative elements
- Security-first appearance builds trust
