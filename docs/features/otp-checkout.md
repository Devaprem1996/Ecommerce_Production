# OTP-BASED FAST CHECKOUT

## Reference
Inspired by: twobrothersindiashop.com & ueirorganic.com

## Goal
Allow customers to checkout without password.
Just mobile number + OTP = logged in and ready to order.

## Flow
1. User clicks "Proceed to Checkout"
2. If not logged in → Show OTP modal
3. Enter mobile number (+91 prefix)
4. Click "Send OTP"
5. OTP sent via SMS (6 digits)
6. Enter OTP in 6 boxes (auto-focus next)
7. Verify → User logged in
8. Continue to address → payment → confirmation

## UI Design

### Step 1: Mobile Input
```
┌─────────────────────────────────────┐
│ ⚡ Quick Checkout                   │
│ No password needed!                 │
│                                     │
│ Your Mobile Number:                 │
│ ┌──────┬───────────────────────┐    │
│ │ +91  │ Enter mobile number   │    │
│ └──────┴───────────────────────┘    │
│                                     │
│ [Send OTP →]                        │
│                                     │
│ Already have account? [Login]       │
└─────────────────────────────────────┘
```

### Step 2: OTP Input
```
┌─────────────────────────────────────┐
│ 📱 OTP Sent to +91-XXXXX7890        │
│ Check your SMS                      │
│                                     │
│ [] [] [] [] [] []                   │
│ 1  2  3  4  5  6                    │
│                                     │
│ ⏱️ Resend OTP in 30s                 │
│                                     │
│ [Verify & Continue →]               │
│                                     │
│ [← Change Number]                   │
└─────────────────────────────────────┘
```

## OTP Box Behavior
- 6 individual input boxes
- Auto-focus NEXT box on digit entry
- Auto-focus PREVIOUS box on backspace
- Auto-submit when all 6 filled
- Numeric keyboard on mobile
- Paste support (paste 6 digits → fills all boxes)

## Timer
- 30 second countdown before resend
- "Resend OTP" active after 30s
- Max 3 resend attempts

## Animations
- Modal: scale + fade in
- OTP boxes: each box bounces when filled
- Success: green checkmark animation
- Error: shake all boxes + red border

## Error States
- Invalid OTP: "Wrong OTP. X attempts remaining"
- Expired OTP: "OTP expired. Please resend"
- Max attempts: "Too many attempts. Try after 10 minutes"
- Network error: "Something went wrong. Please try again"

## Mobile Optimized
- Bottom sheet (slides up from bottom) on mobile
- Full screen on very small screens
- Large OTP boxes (48x48px minimum)
- Numeric keyboard auto-trigger
