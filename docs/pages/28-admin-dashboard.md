# ADMIN DASHBOARD PAGE

## URL: /admin / /admin/dashboard

## Purpose
Provide the store administrator with a high-level operational overview of sales metrics, pending orders, recent actions, customer activity, and inventory warnings.

## Page Layout

### 1. SUMMARY STAT CARDS (Grid Layout)
- 4 metrics displayed with percentage change indicator (current month vs previous month):
  ┌──────────────────────┐ ┌──────────────────────┐
  │  Gross Revenue       │ │  Total Orders        │
  │  ₹2,45,670 (+12.4%)  │ │  1,240 (+8.2%)       │
  └──────────────────────┘ └──────────────────────┘
  ┌──────────────────────┐ ┌──────────────────────┐
  │  Average Order Value │ │  Active Customers    │
  │  ₹890 (-2.1%)        │ │  845 (+15.6%)        │
  └──────────────────────┘ └──────────────────────┘

### 2. SALES PERFORMANCE CHART (Interactive)
- Line/Bar chart mapping revenue & order count over time.
- Time range filters: Last 24 Hours | Last 7 Days | Last 30 Days | Year to Date.
- Component recommendation: Recharts / Chart.js.

### 3. RECENT ORDERS GRID
- Shows the 5 latest orders placed with columns:
  * Order ID, Customer Name, Date, Amount, Payment Method, Status Badge.
  * Clickable link on each row routing to the Order Details page (`/admin/orders/[id]`).

### 4. INVENTORY & CONTENT SIDEBAR
- **Low Stock Alerts**: Lists products where inventory falls below their preset low-stock threshold (highlighted in red/orange warnings).
- **Pending Approvals**: Number of reviews waiting for moderator approval, and pending return requests.

## Access Rules
- Role required: Admin or Super Admin.
- If unauthorized, redirect to `/admin/login` and preserve the redirect query parameter.
- Global components (Navbar, Announcement Bar, Footer) are completely hidden on this page.
