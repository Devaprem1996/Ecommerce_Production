# ADMIN — CUSTOMER MANAGEMENT

## URLs
- /admin/customers              → Customer directory
- /admin/customers/[customerId] → Single customer profile & orders history

## Customer List Page
┌─────────────────────────────────────────────────────────┐
│  Customers                                              │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [🔍 Search Name, Email, Phone...] [Status ▾]       │  │
│  │ Showing 1-20 of 1,240 customers                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌────────────┬─────────────┬───────────┬──────────────┐  │
│  │ Name       │ Contact     │ Orders    │ Total Spent  │  │
│  ├────────────┼─────────────┼───────────┼──────────────┤  │
│  │ John Doe   │ j@email.com │ 12 orders │ ₹12,450      │  │
│  │ Alice S.   │ a@email.com │ 3 orders  │ ₹2,900       │  │
│  │ Bob Miller │ b@email.com │ 0 orders  │ ₹0           │  │
│  └────────────┴─────────────┴───────────┴──────────────┘  │
└─────────────────────────────────────────────────────────┘

### Columns
- **Name**: Display name + profile thumbnail. Clickable to detail page.
- **Contact Details**: Email and phone number.
- **Orders Placed**: Count of completed transactions.
- **Total Revenue**: Sum total of all delivered orders.
- **Status**: `Active` (Green) or `Suspended` (Red).
- **Registration Date**: Creation timestamp.

---

## Customer Details Page (`/admin/customers/[customerId]`)

### 1. CUSTOMER BIO CARD
- Displays name, avatar, mobile number, email, and social login source (Google/Email).
- Actions: `[Suspend Customer Account]` (modal inputting reason for suspention) or `[Send Custom Notification]`.

### 2. LIFETIME VALUE (LTV) STATS
- Grid displaying:
  * Total Orders, Refund Count, Average Order Value, Joined Date.

### 3. ORDER HISTORY LOGS
- Scrollable list showing all orders placed by this user.
- Displays Order ID, Status, Date, total amount, and link to inspect details.

### 4. SAVED ADDRESS LISTS
- View of all shipping and billing addresses saved in the customer's profile.
- Useful for validating delivery issues or updating coordinates on support calls.
