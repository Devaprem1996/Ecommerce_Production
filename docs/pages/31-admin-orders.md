# ADMIN — ORDER MANAGEMENT

## URLs
- /admin/orders              → Orders list
- /admin/orders/[orderId]    → Order detail and status management

## Order List Page
┌─────────────────────────────────────────────────────────┐
│  Orders                                  [Export Excel] │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [🔍 Search ID, Name, Mobile...] [Status ▾]        │  │
│  │ Showing 1-15 of 450 orders                        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Order ID │ Customer │ Amount   │ Payment  │ Status   │  │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤  │
│  │ AETH-123 │ John Doe │ ₹997     │ UPI      │ 🔵 Shipped│  │
│  │ AETH-124 │ Alice S. │ ₹1,450   │ COD      │ 🟡 Pending│  │
│  │ AETH-125 │ Bob M.   │ ₹590     │ UPI      │ ✅ Deliv │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────┘

### Order List Columns
- **Order ID**: Clickable link to details.
- **Customer Name**: Link to customer profile page.
- **Date & Time**: Placed timestamp.
- **Total Price**: Total items price + shipping - discounts.
- **Payment Method & Status**: e.g., "UPI - Paid" or "COD - Pending".
- **Order Status Badge**: Color coded by state.

---

## Order Detail Page (`/admin/orders/[orderId]`)

This view is divided into three sections:

### 1. ORDER SUMMARY & STATUS CONTROLLER
- Displays date, status timeline, and a dropdown menu to change status:
  * `Pending` &rarr; `Confirmed` &rarr; `Packed` &rarr; `Shipped` &rarr; `Delivered` (or `Cancelled`).
- Changing status to `Shipped` displays a popup requesting:
  * Courier Partner (e.g., Delhivery, Ecom Express).
  * Tracking Number.
- Status updates automatically trigger corresponding transactional SMS/emails to the customer.

### 2. ITEMS & BILLING breakdown
- Standard table listing product names, quantities, unit prices, and row totals.
- Financial breakdown: Subtotal, applied coupon discounts, shipping fees, tax rates, and net total.
- Invoice generation button: Opens `docs/pages/17-order-invoice.md` formatted view.

### 3. CUSTOMER & METRICS CARD
- **Shipping Address**: Formatted for label printing.
- **Contact Info**: Phone and email.
- **Internal Notes Log**: Allows staff to leave private logs (e.g. `Called customer to confirm delivery address change request`).
