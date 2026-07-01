# TRACK ORDER PAGE

## URL: /track-order

## Access Points
- Navigation menu link
- Order confirmation page
- Account → Orders → Track button
- Email/SMS order links

## Page Design

### INPUT SECTION (for guests)
┌─────────────────────────────────────────────────┐
│                                                 │
│  📦 Track Your Order                           │
│  Enter your order details below                │
│                                                 │
│  Order ID *                                    │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]        │
│  (Example: ORD-2025-00123)                     │
│                                                 │
│  Mobile Number *                               │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]        │
│  (Number used while ordering)                  │
│                                                 │
│  [Track My Order 🔍]                           │
│                                                 │
│  ── Already have an account? ──               │
│  [Login to see all your orders]                │
│                                                 │
└─────────────────────────────────────────────────┘

### TRACKING RESULT (after valid entry)
┌─────────────────────────────────────────────────┐
│  Order #ORD-2025-00123                         │
│  Placed on: 12 Jan 2025                        │
│  Expected delivery: 15 Jan 2025                │
│                                                 │
│  ── ORDER STATUS TIMELINE ──                   │
│                                                 │
│  ✅ Order Placed          12 Jan, 10:30 AM     │
│  |  Your order was received                    │
│  |                                             │
│  ✅ Order Confirmed       12 Jan, 11:00 AM     │
│  |  Payment confirmed, preparing your order   │
│  |                                             │
│  ✅ Packed & Ready        13 Jan, 02:00 PM     │
│  |  Your items are packed                      │
│  |                                             │
│  🔵 Shipped               14 Jan, 09:00 AM     │
│  |  📦 Courier: Delhivery                      │
│  |  Tracking: DEL-9876543210                   │
│  |  [Track on Courier Site →]                  │
│  |                                             │
│  ○ Out for Delivery       Expected: 15 Jan     │
│  |                                             │
│  ○ Delivered                                   │
│                                                 │
│  ── ITEMS IN THIS ORDER ──                     │
│  [Product Image] Organic Red Rice 1kg — ₹299  │
│  [Product Image] Cold Pressed Oil 500ml — ₹399 │
│                                                 │
│  ── DELIVERY ADDRESS ──                        │
│  John D, 123 Anna Nagar, Chennai - 600040      │
│                                                 │
│  [Download Invoice 📄]  [Need Help? 💬]        │
│                                                 │
└─────────────────────────────────────────────────┘

## Status Types & Colors
| Status           | Color      | Icon |
|-----------------|------------|------|
| Order Placed    | Green ✅   | 📋   |
| Confirmed       | Green ✅   | ✅   |
| Packed          | Green ✅   | 📦   |
| Shipped         | Blue 🔵    | 🚚   |
| Out for Delivery| Orange 🟠  | 🛵   |
| Delivered       | Green ✅   | 🏠   |
| Cancelled       | Red ❌     | ❌   |
| Returned        | Purple 🟣  | ↩️   |

## Timeline Animation
- Completed steps: solid green line connecting dots
- Current step: pulsing blue dot animation
- Future steps: dashed gray line
- Reveal animation: steps fade in top to bottom

## Error States
- Invalid Order ID: "No order found with this ID"
- Wrong mobile: "Mobile number doesn't match this order"
- Network error: "Unable to fetch. Please try again"

## Logged-in User
- Skip the input form entirely
- Show all orders with status
- Dropdown to select specific order to track
