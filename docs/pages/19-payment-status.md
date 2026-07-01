# PAYMENT STATUS PAGES

## Two Pages Needed

## Page 1: PAYMENT SUCCESS
## URL: /checkout/success?orderId=[id]

┌─────────────────────────────────────────────────┐
│                                                 │
│         [Lottie: Success Checkmark Animation]   │
│              (Green circle + checkmark)         │
│                                                 │
│   🎉 Order Placed Successfully!                 │
│                                                 │
│   Order #ORD-2025-00123                        │
│   Thank you, John! Your order is confirmed.    │
│                                                 │
│   ── ORDER SUMMARY ──                          │
│   Items: 3  |  Total: ₹997                    │
│   Payment: UPI  |  Status: PAID ✅             │
│                                                 │
│   ── DELIVERY INFO ──                          │
│   Delivering to: 123 Anna Nagar, Chennai       │
│   Expected: 15-17 Jan 2025 (3-5 business days)│
│                                                 │
│   ── WHAT'S NEXT? ──                           │
│   📧 Order confirmation sent to email          │
│   📱 SMS sent to +91 XXXXXX7890               │
│   🚚 Tracking info will be shared after ship  │
│                                                 │
│   [📦 Track Your Order]                        │
│   [🛍️ Continue Shopping]                       │
│   [📤 Share on WhatsApp]                       │
│                                                 │
│   ── YOU MIGHT ALSO LIKE ──                    │
│   [Product Cards — 4 related products]         │
│                                                 │
└─────────────────────────────────────────────────┘

## Page 2: PAYMENT FAILED
## URL: /checkout/failed?orderId=[id]&reason=[reason]

┌─────────────────────────────────────────────────┐
│                                                 │
│         [Lottie: Failed/Error Animation]        │
│              (Red circle + X)                   │
│                                                 │
│   😔 Payment Failed                            │
│                                                 │
│   Don't worry! Your order is saved.            │
│   Your cart items are still here.              │
│                                                 │
│   Reason: Payment was declined by bank         │
│   Order ID: ORD-2025-00123 (not confirmed)     │
│                                                 │
│   ── WHAT HAPPENED? ──                         │
│   • Insufficient funds                         │
│   • Bank declined the transaction             │
│   • Network timeout during payment            │
│                                                 │
│   ── TRY AGAIN WITH ──                         │
│   ○ Different UPI app                          │
│   ○ Debit / Credit Card                        │
│   ○ Net Banking                                │
│   ○ Cash on Delivery                           │
│                                                 │
│   [🔄 Retry Payment]        ← Primary CTA      │
│   [📞 Contact Support]      ← Secondary        │
│   [← Back to Cart]          ← Ghost button     │
│                                                 │
└─────────────────────────────────────────────────┘

## Page 3: PAYMENT PENDING
## URL: /checkout/pending?orderId=[id]

(For UPI / Bank transfer where confirmation is delayed)

┌─────────────────────────────────────────────────┐
│         [Lottie: Clock/Pending Animation]       │
│                                                 │
│   ⏳ Payment Pending                            │
│                                                 │
│   We're waiting for payment confirmation.      │
│   This usually takes 2-5 minutes.             │
│                                                 │
│   Order #ORD-2025-00123                        │
│                                                 │
│   [🔄 Check Status]  (auto-refreshes 30s)     │
│   [📞 Contact Support]                         │
│                                                 │
│   Auto-checking every 30 seconds...            │
│   [████████░░] 80%                             │
└─────────────────────────────────────────────────┘

## Behavior Rules
- Success page: confetti animation on load (subtle)
- Success page: clear cart automatically
- Failed page: do NOT clear cart
- Pending page: auto-poll /api/order/status every 30s
- All pages: prevent back-button re-submission
- Success URL: only accessible once (redirect to orders if revisited)
