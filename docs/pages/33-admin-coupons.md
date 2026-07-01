# ADMIN — COUPON MANAGEMENT

## URL: /admin/coupons

## Coupon List Page
┌─────────────────────────────────────────────────────────┐
│  Coupons                              [+ Create Coupon] │
│                                                         │
│  ┌────────────┬──────────┬────────┬────────┬──────────┐ │
│  │ Code       │ Type     │ Value  │ Used   │ Status   │ │
│  ├────────────┼──────────┼────────┼────────┼──────────┤ │
│  │ FRESH20    │ Percent  │ 20%    │ 45/100 │ ✅ Active│ │
│  │ FLAT50     │ Fixed    │ ₹50    │ 23/∞   │ ✅ Active│ │
│  │ WELCOME10  │ Percent  │ 10%    │ 200/200│ ❌ Expired│ │
│  └────────────┴──────────┴────────┴────────┴──────────┘ │
└─────────────────────────────────────────────────────────┘

## Create / Edit Coupon Form

BASIC DETAILS:
  Coupon Code *         (auto-generate or manual)
  Description           (internal note)
  Discount Type *:
    ○ Percentage (e.g., 20% off)
    ○ Fixed Amount (e.g., ₹50 off)
    ○ Free Delivery (waive delivery charge)
  Discount Value *      (e.g., 20 for 20% or 50 for ₹50)
  Maximum Discount Cap  (e.g., max ₹200 off for % coupons)

CONDITIONS:
  Minimum Order Value   (e.g., valid on orders ₹499+)
  Valid From Date *
  Valid Until Date *
  Usage Limit Total     (e.g., first 100 uses only, blank = unlimited)
  Usage Limit Per User  (e.g., 1 use per customer)
  First Order Only:     [Yes / No]
  Applicable Categories (all or select specific)
  Applicable Products   (all or select specific)

STATUS:
  Active / Inactive toggle

## Coupon Stats
- Per coupon: Total uses | Revenue generated | Avg order value
- On list page: show usage fraction (45/100)
