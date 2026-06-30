# PINCODE DELIVERY VALIDATOR

## Reference
Inspired by: myharvestfarms.com

## Placement
- Product Detail Page (below price, above Add to Cart)
- Checkout Page (Address step)

## UI Design
```
┌─────────────────────────────────────────┐
│ 📍 Check Delivery Availability          │
│                                         │
│ [━━━━━ Enter 6-digit Pincode ━━━━━] [Check] │
│                                         │
│ ✅ Delivery available to 600001!        │
│ 📅 Expected: 3-5 business days          │
│ 🚛 Free Delivery (order ₹499+)          │
└─────────────────────────────────────────┘
```

## States
1. DEFAULT    : Input empty, placeholder shown
2. TYPING     : 6-digit numeric only, auto-submit on 6 digits
3. LOADING    : Spinner in button, "Checking..."
4. SUCCESS    : Green ✅, delivery date, free/paid info
5. FAILED     : Red ❌, "Sorry, we don't deliver to this area yet"
6. ERROR      : "Something went wrong, please try again"

## Behavior
- Accept only 6-digit numbers
- Auto-validate when 6 digits entered (no need to click Check)
- Show Check button also (for manual trigger)
- Remember last checked pincode (sessionStorage)
- API: GET /api/pincode/:pincode
- Response: { available: true/false, estimatedDays: 3, city: "Chennai" }

## Animations
- Input: focus border glow (green)
- Button: loading spinner on check
- Result: slide down + fade in (300ms)
- Success: green pulse once
- Failed: shake animation

## Mobile
- Full width input
- Large touch targets (48px height)
- Numeric keyboard auto-opens
