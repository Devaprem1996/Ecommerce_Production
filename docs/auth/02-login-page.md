# CUSTOMER LOGIN PAGE

## URL
/login

## When Does User Land Here?
1. Clicks "Login" in navbar
2. Clicks "My Account" when not logged in
3. Tries to access /account/* when not logged in
4. Clicks "Login" in mobile menu
5. After checkout → "Login to track orders"

## Page Design

### Layout
┌─────────────────────────────────────────────────┐
│ [LOGO — centered]                               │
│                                                 │
│ ┌─────────────────────────────────────────┐     │
│ │                                         │     │
│ │   Welcome Back! 👋                      │     │
│ │   Login to your account                 │     │
│ │                                         │     │
│ │   ════ Login with OTP ════             │     │
│ │                                         │     │
│ │   Mobile Number                         │     │
│ │   ┌──────┬──────────────────────────┐   │     │
│ │   │ +91  │  Enter mobile number     │   │     │
│ │   └──────┴──────────────────────────┘   │     │
│ │                                         │     │
│ │   [Send OTP →]                         │     │
│ │                                         │     │
│ │   ──────── OR ────────                 │     │
│ │                                         │     │
│ │   [G] Continue with Google             │     │
│ │                                         │     │
│ │   ─────────────────────────────────    │     │
│ │   New here? [Create Account]           │     │
│ │                                         │     │
│ └─────────────────────────────────────────┘     │
│                                                 │
│ [← Back to Home]                               │
└─────────────────────────────────────────────────┘

### After Send OTP → OTP Verification Screen
┌─────────────────────────────────────────────────┐
│ [LOGO — centered]                               │
│                                                 │
│ ┌─────────────────────────────────────────┐     │
│ │                                         │     │
│ │   📱 OTP Sent!                          │     │
│ │   We sent a 6-digit code to            │     │
│ │   +91 98765-43210  [Change]            │     │
│ │                                         │     │
│ │   Enter OTP:                            │     │
│ │   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐      │     │
│ │   │  │ │  │ │  │ │  │ │  │ │  │      │     │
│ │   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘      │     │
│ │                                         │     │
│ │   ⏱️ Resend OTP in 28s                  │     │
│ │                                         │     │
│ │   [Verify & Login →]                   │     │
│ │                                         │     │
│ └─────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘

## States & Validations
PHONE INPUT:
  - Only numbers allowed
  - Exactly 10 digits (after +91)
  - Real-time: show ✅ when valid, ❌ when invalid format
  - Error: "Please enter a valid 10-digit mobile number"

OTP INPUT:
  - 6 individual boxes
  - Auto focus next box on digit entry
  - Auto focus previous on backspace
  - Auto submit on last digit filled
  - Paste support (paste 6 digits at once)
  - Numeric keyboard on mobile

TIMER:
  - 30 second countdown
  - Resend active after 30s
  - Max 3 resend attempts
  - After max: "Too many attempts. Try after 10 minutes."

## Error Messages
| Situation             | Message                              |
|----------------------|--------------------------------------|
| Invalid phone        | Enter a valid 10-digit mobile number |
| Wrong OTP            | Incorrect OTP. 2 attempts remaining  |
| Expired OTP          | OTP expired. Please request a new one|
| Max attempts         | Too many attempts. Try after 10 min  |
| Network error        | Connection failed. Please try again  |
| Server error         | Something went wrong. Please try again|

## After Successful Login
- New User → Redirect to /account/setup (name entry)
  OR just redirect to /account (with prompt to complete profile)
- Returning User → Redirect to:
  * Original page they were trying to access
  * OR /account (if came directly to /login)
  * OR /checkout (if came from checkout flow)

## Animations
- Page: fade up entry (400ms)
- Card: white card with shadow, scale in (300ms)
- OTP boxes: bounce when filled
- Error: shake animation
- Success: green flash → redirect with fade out
- Button loading: spinner
