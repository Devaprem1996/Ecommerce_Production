# PAYMENT GATEWAY INTEGRATION

## Recommended: Razorpay (Best for India)
## Fallback: PayU

## Payment Methods to Support
1. UPI (GPay, PhonePe, Paytm, BHIM)
2. Credit Cards (Visa, Mastercard, Amex)
3. Debit Cards
4. Net Banking (all major banks)
5. Wallets (Paytm, Mobikwik, Freecharge)
6. Cash on Delivery (COD)
7. EMI (for orders above ₹3000)

## Payment Flow

STEP 1: User clicks "Pay Now" on checkout
STEP 2: Create order via /api/payment/create-order
         Returns: { orderId, amount, currency, keyId }
STEP 3: Open Razorpay checkout modal OR redirect
STEP 4: User completes payment on Razorpay
STEP 5: Razorpay sends response to frontend
STEP 6: Verify payment via /api/payment/verify
         (Server-side signature verification)
STEP 7: Update order status to PAID
STEP 8: Redirect to /checkout/success OR /checkout/failed

## UI Components Needed

### Payment Method Selector
┌─────────────────────────────────────────────────┐
│  Select Payment Method                          │
│                                                 │
│  ● UPI                                          │
│    [━━━━━━━━━━ Enter UPI ID ━━━━━━━━━]          │
│    OR pay via QR code [Show QR]                 │
│    Quick: [GPay] [PhonePe] [Paytm]             │
│                                                 │
│  ○ Credit / Debit Card                          │
│    (Collapsed — click to expand)               │
│                                                 │
│  ○ Net Banking                                  │
│    (Collapsed — click to expand)               │
│                                                 │
│  ○ 💵 Cash on Delivery                          │
│    Extra charge: ₹29                            │
│    (Collapsed — click to expand)               │
│                                                 │
└─────────────────────────────────────────────────┘

### Card Input Form (when Credit/Debit selected)
  Card Number    : [████ ████ ████ ████] (auto-formats)
  Expiry         : [MM / YY]
  CVV            : [***] (toggle show)
  Name on Card   : [━━━━━━━━━━━━━━━━━]
  [Save card for future] checkbox

### Security Trust Elements
Always show near payment button:
  🔒 256-bit SSL Secured
  [Razorpay Logo] Powered by Razorpay
  [Visa] [Mastercard] [UPI] [RuPay] icons

## Error Handling
| Error                    | User Message                          |
|-------------------------|---------------------------------------|
| Card declined           | Card was declined. Try another card.  |
| Insufficient funds      | Insufficient funds. Try another method|
| Network timeout         | Connection timed out. Please retry.   |
| Invalid UPI ID          | Invalid UPI ID. Please check.         |
| Payment cancelled       | Payment cancelled. Try again.         |
| Verification failed     | Payment verification failed. Contact support|

## COD Rules
- Available for orders under ₹5000
- Extra charge: ₹29 (configurable in admin settings)
- Not available for all pincodes (admin can restrict)
- Show "COD available" or "COD not available" based on pincode
