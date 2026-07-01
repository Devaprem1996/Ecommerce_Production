# EMAIL TEMPLATES

## Design Rules for All Emails
- Max width: 600px (centered)
- Mobile responsive (single column on mobile)
- Brand colors: header #1B4332, CTA buttons #2D6A4F
- Font: Arial/Helvetica (email-safe fonts)
- Logo at top center
- Footer: unsubscribe link + address (legal requirement)
- Test on: Gmail, Outlook, Apple Mail, mobile

## Email List

### 1. ORDER CONFIRMATION EMAIL
Subject: "Your order #ORD-XXXX is confirmed! 🎉"
Trigger: After successful payment

Content:
  [Logo]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎉 Order Confirmed!
  Hi [Name], thank you for your order.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Order #: ORD-2025-00123
  Order Date: 12 Jan 2025
  ─────────────────────────
  ITEMS ORDERED:
  [Product Image] Organic Rice 1kg × 2 = ₹598
  [Product Image] Cold Pressed Oil × 1 = ₹399
  ─────────────────────────
  Subtotal   : ₹997
  Discount   : -₹100
  Delivery   : FREE
  TOTAL      : ₹897
  ─────────────────────────
  Payment: UPI ✅ PAID
  ─────────────────────────
  Delivering to:
  John D, 123 Anna Nagar,
  Chennai - 600040
  ─────────────────────────
  Expected Delivery: 15-17 Jan 2025
  [Track Your Order →]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Need help? Reply to this email
  or call +91-XXXXXXXXXX
  [Footer with unsubscribe]

### 2. ORDER SHIPPED EMAIL
Subject: "Your order is on its way! 🚚"
Trigger: When order status → SHIPPED

Content:
  [Logo]
  Your order #ORD-XXXX has been shipped!
  Courier: Delhivery
  Tracking: DEL-9876543210
  [Track on Courier Site →]
  [Track on Our Site →]
  Expected delivery: 15 Jan 2025

### 3. ORDER DELIVERED EMAIL
Subject: "Your order has been delivered! 📦"
Trigger: When status → DELIVERED

Content:
  Order delivered!
  Hope you love your products.
  [Rate Your Order ⭐⭐⭐⭐⭐]
  [Write a Review →]
  [Shop Again →]

### 4. OTP EMAIL (if SMS fails)
Subject: "Your OTP for [Brand] login"
Content:
  Your OTP is: 123456
  Valid for 10 minutes.
  Do not share with anyone.

### 5. WELCOME EMAIL
Subject: "Welcome to [Brand]! Here's 10% off 🌿"
Trigger: After successful registration

Content:
  Welcome, [Name]!
  You've joined [X]+ happy customers.
  Your welcome coupon: WELCOME10
  Valid for 7 days on your first order.
  [Start Shopping →]

### 6. ABANDONED CART EMAIL
Subject: "You left something behind! 🛒"
Trigger: Cart not checked out after 2 hours (if logged in)

Content:
  Hi [Name], you left items in your cart!
  [Product images + names]
  [Complete Your Order →]
  Hurry! Items may go out of stock.

### 7. PASSWORD RESET EMAIL (Admin)
Subject: "Reset your [Brand] admin password"
Content:
  Click link to reset password (valid 1 hour):
  [Reset Password →]
  If you didn't request this, ignore.

### 8. RETURN REQUEST CONFIRMATION
Subject: "Return request received #RET-XXXX"
Content:
  We received your return request.
  We'll review within 24-48 hours.
  [View Request Status →]

### 9. REFUND PROCESSED EMAIL
Subject: "Refund of ₹XXX processed ✅"
Content:
  Refund: ₹XXX to your [payment method]
  Expected: 3-5 business days
  Reference: REF-XXXXXX
