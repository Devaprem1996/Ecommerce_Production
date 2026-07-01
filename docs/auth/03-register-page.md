# CUSTOMER REGISTRATION PAGE

## URL
/register

## Design Philosophy
KEEP IT MINIMAL — Only ask what is absolutely needed.
More fields = More friction = Less signups.

## Required Fields ONLY
1. Mobile Number (Primary ID)
2. Full Name
3. Email (optional — for order receipts)
OTP verifies the mobile — no password needed!

## Page Design

### Step 1: Mobile Verification
┌─────────────────────────────────────────────────┐
│ [LOGO]                                          │
│                                                 │
│   Create Your Account                           │
│   Join thousands of happy customers 🌿          │
│                                                 │
│   Step 1 of 2  ●──○                            │
│                                                 │
│   Mobile Number *                               │
│   ┌──────┬──────────────────────────────────┐   │
│   │ +91  │  Enter your mobile number        │   │
│   └──────┴──────────────────────────────────┘   │
│                                                 │
│   [Get OTP →]                                  │
│                                                 │
│   ──── OR ────                                 │
│   [G] Sign up with Google                      │
│                                                 │
│   Already have account? [Login]                │
└─────────────────────────────────────────────────┘

### Step 2: OTP + Profile Details
┌─────────────────────────────────────────────────┐
│ [LOGO]                                          │
│                                                 │
│   Step 2 of 2  ●──●                            │
│                                                 │
│   Verify OTP                                    │
│   Sent to +91 98765-43210                       │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐              │
│   │  │ │  │ │  │ │  │ │  │ │  │              │
│   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘              │
│   ⏱️ Resend in 30s                              │
│                                                 │
│   ─────────────────────────────────            │
│                                                 │
│   Your Name *                                   │
│   [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]            │
│                                                 │
│   Email Address (optional)                      │
│   [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]            │
│   📧 For order confirmations & receipts         │
│                                                 │
│   Preferred Language:                           │
│   (●) English  ( ) தமிழ்                       │
│                                                 │
│   ☐ I agree to Terms & Conditions              │
│   ☐ I want offers & updates on WhatsApp        │
│                                                 │
│   [Create Account & Continue →]                │
└─────────────────────────────────────────────────┘

## Validation Rules
| Field   | Rule                              | Error Message              |
|---------|-----------------------------------|----------------------------|
| Mobile  | 10 digits, starts with 6-9        | Invalid mobile number       |
| Name    | Min 2 chars, max 50, letters only | Enter your full name        |
| Email   | Valid email format (if provided)  | Enter a valid email address |
| Terms   | Must be checked                   | Please accept terms         |

## After Registration
- Auto login (no need to login again)
- Redirect to /account OR original destination
- Welcome toast: "Welcome to [Brand]! 🎉"
- Welcome email sent (if email provided)
- WhatsApp welcome message (if opted in)

## Smart Behavior
- If mobile already registered → 
  Show: "This number is already registered. Login instead?"
  Button: [Login with this number]
- OTP same flow as login
- New user detected → Show profile form after OTP verify
