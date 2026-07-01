# COUPON / DISCOUNT SYSTEM

## Where Coupon Code is Entered
1. Cart page (coupon input field)
2. Checkout page (order summary section)
3. Both sync the same applied coupon

## UI Component

### Coupon Input
┌─────────────────────────────────────────────────┐
│  Have a coupon code?                            │
│  ┌───────────────────────────┬───────────────┐  │
│  │ Enter coupon code         │  [Apply]      │  │
│  └───────────────────────────┴───────────────┘  │
│                                                 │
│  ✅ FRESH20 applied! You save ₹99               │
│  ❌ Invalid coupon code. Please check.          │
│  ❌ Minimum order ₹499 required for this code.  │
│  ❌ This coupon has expired.                    │
│  ❌ You've already used this coupon.            │
└─────────────────────────────────────────────────┘

## Applied Coupon Display (in Order Summary)
  Subtotal        : ₹997
  Coupon (FRESH20): -₹199     ← Show code name + amount saved
  Delivery        : FREE
  ─────────────────────────
  Total           : ₹798
  [Remove coupon ✕]            ← Remove option

## Coupon Validation Rules
1. Check if code exists
2. Check if code is active
3. Check expiry date
4. Check minimum order value
5. Check usage limit (total)
6. Check usage limit (per user — needs login)
7. Check if first order only (if flag set)
8. Check applicable categories/products
9. Apply discount and return updated price

## Auto-Apply Coupon
- If coupon in URL: /cart?coupon=FRESH20
- Auto-apply on page load
- Show: "Coupon FRESH20 applied automatically!"
- Seen in: Email campaigns, social media links

## Coupon Display on Site
- Homepage banner coupon code (highlighted)
- Product page: "Use code ORGANIC10 for 10% off"
- Checkout: Coupon field always visible
- NOT: Auto-apply without user knowledge (show it)
