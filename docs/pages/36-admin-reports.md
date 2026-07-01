# ADMIN — REPORTS & ANALYTICS

## URL: /admin/reports

## Purpose
Enables store managers to audit sales, track inventory turn ratios, measure customer retention, calculate GST tax liability, and export operational records for accounting.

## Page Layout & Reports Sections

### 1. SALES REPORT CARD
- Columns: Date range, Total Orders, Average order size, Gross sales, Net Profit.
- Interactive filtering: Select custom calendar dates or presets (e.g. `Last Quarter`).

### 2. FINANCIAL LEDGER & GST LIABILITIES
- Itemized lists of taxes collected by tier (exempt, 5% GST, 12% GST, 18% GST).
- Breakdown:
  * Shipping fees collected vs actual courier expense.
  * Discount code offsets and promotions cost.

### 3. PRODUCT SALES LEADERBOARD
┌─────────────────────────────────────────────────────────┐
│  Top Selling Products                                   │
│                                                         │
│  ┌───────────────────────┬────────────┬──────────────┐  │
│  │ Product Name          │ Qty Sold   │ Revenue      │  │
│  ├───────────────────────┼────────────┼──────────────┤  │
│  │ Cold Pressed Oil      │ 1,240      │ ₹4,94,760    │  │
│  │ Organic Red Rice 1kg  │ 850        │ ₹2,54,150    │  │
│  │ Jaggery Powder        │ 600        │ ₹1,19,400    │  │
│  └───────────────────────┴────────────┴──────────────┘  │
└─────────────────────────────────────────────────────────┘

### 4. DATA EXPORT WIDGET
- Configurator for download queues:
  * **Dataset**: Orders | Customers | Product Catalog | Tax Logs.
  * **Date Range**: Custom picker.
  * **File Format**: `CSV` | `Microsoft Excel (XLSX)` | `PDF Report`.
  * **Button**: `[📥 Export Dataset]` (triggers asynchronous file compile & download).
