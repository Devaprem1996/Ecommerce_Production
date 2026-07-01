# USER ACCOUNT PAGES (Protected)

## Protection Rule
ALL /account/* pages require login.
If not logged in → Redirect to /login?redirect=/account/[page]
After login → Return to original page automatically.

## Account Section Layout

### Sidebar Navigation (Desktop) / Tabs (Mobile)
┌──────────────┬────────────────────────────────────┐
│              │                                    │
│  👤 John D   │   MAIN CONTENT AREA                │
│  +91-98765   │                                    │
│              │                                    │
│  ─────────── │                                    │
│  📦 Orders   │                                    │
│  📍 Addresses│                                    │
│  ❤️ Wishlist │                                    │
│  ⭐ Reviews  │                                    │
│  👤 Profile  │                                    │
│  🔔 Notifs   │                                    │
│  🚪 Logout   │                                    │
│              │                                    │
└──────────────┴────────────────────────────────────┘

Mobile: Bottom tabs or dropdown menu

## Account Sub-Pages

### /account (Dashboard)
- Welcome message: "Hello, [Name]! 👋"
- Quick Stats: Total Orders | Wishlist items | Reviews written
- Recent Orders (last 3) + View All link
- Quick Links: Track Order | Saved Addresses | My Wishlist

### /account/orders
- Order list table:
  Order ID | Date | Items | Amount | Status | Actions
- Status badges:
  Pending (yellow) | Processing (blue) | Shipped (purple)
  Delivered (green) | Cancelled (red)
- Click order → Order detail page
- "Track Order" button per order
- "Reorder" button for delivered orders
- "Cancel Order" button for pending orders

### /account/orders/[orderId]
- Full order details
- Items list with images
- Shipping address
- Payment method used
- Order timeline (status steps):
  Ordered → Confirmed → Packed → Shipped → Delivered
- Tracking number + courier link
- Download Invoice button
- Return/Refund request button (if delivered)

### /account/addresses
- Saved address cards
- Max 5 saved addresses
- Each: Name, Address, City, Pincode, Mobile
- Default badge on one address
- Edit | Delete | Set as Default buttons
- Add New Address button → form slide-in

### /account/wishlist
- Product grid (same as shop page)
- ProductCard with "Move to Cart" button
- Remove from Wishlist button
- Empty state: illustration + "Start Wishlist" CTA

### /account/profile
- Current info display
- Edit form:
  Name | Email | Date of Birth | Anniversary (optional)
  Language Preference toggle (EN / தமிழ்)
- Avatar upload (crop + resize)
- Change Mobile Number (requires OTP verification)
- Save Changes button

### /account/notifications
- Toggle switches for:
  Order Updates (SMS/Email/WhatsApp)
  Offers & Promotions
  New Product Alerts
  Newsletter
- Save Preferences button

## Logout Flow
1. User clicks Logout
2. Confirmation: "Are you sure you want to logout?"
   [Cancel] [Yes, Logout]
3. Clear tokens + Zustand state
4. Redirect to /home
5. Toast: "You've been logged out successfully"
