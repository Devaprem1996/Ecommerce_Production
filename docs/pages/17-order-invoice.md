# ORDER INVOICE PAGE

## URL: /account/orders/[orderId]/invoice
## Also: PDF download version

## Purpose
Printable / downloadable invoice for customer orders.
Clean, professional layout optimized for print.

## Invoice Layout
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [BRAND LOGO]                    TAX INVOICE            │
│  Brand Name                                             │
│  Address Line 1                  Invoice No: INV-0123   │
│  City, State - Pincode           Date: 12 Jan 2025      │
│  Phone | Email                   Order: ORD-2025-00123  │
│  GSTIN: XX-XXXXX                                        │
│                                                         │
│  ── BILL TO ─────────────────────────────────────────── │
│  Customer Name                                          │
│  Address Line 1, Line 2                                 │
│  City, State - Pincode                                  │
│  Mobile: +91 XXXXXXXXXX                                 │
│                                                         │
│  ── ORDER ITEMS ──────────────────────────────────────  │
│  ┌────┬────────────────┬──────┬────┬────────┬────────┐  │
│  │ #  │ Product Name   │ UoM  │ Qty│  Rate  │ Amount │  │
│  ├────┼────────────────┼──────┼────┼────────┼────────┤  │
│  │ 1  │ Organic Rice   │ 1kg  │ 2  │ ₹299   │ ₹598   │  │
│  │ 2  │ Cold Pressed   │ 500g │ 1  │ ₹399   │ ₹399   │  │
│  │    │ Coconut Oil    │      │    │        │        │  │
│  ├────┴────────────────┴──────┴────┼────────┼────────┤  │
│  │                       Subtotal │        │ ₹997   │  │
│  │                       Discount │        │ -₹100  │  │
│  │               Delivery Charges │        │ FREE   │  │
│  │                    Tax (GST 5%)│        │ ₹44    │  │
│  │                          TOTAL │        │ ₹941   │  │
│  └────────────────────────────────┴────────┴────────┘  │
│                                                         │
│  Payment Method: UPI / Online Payment                   │
│  Payment Status: PAID ✅                                │
│                                                         │
│  ── TERMS ────────────────────────────────────────────  │
│  • All sales are final unless product is damaged        │
│  • For support: support@brand.com | +91-XXXXXXXX       │
│                                                         │
│  Thank you for shopping with us! 🌿                     │
│                                                         │
└─────────────────────────────────────────────────────────┘

## Actions
- [🖨️ Print] button → browser print dialog
- [📥 Download PDF] button → generates PDF
- [← Back to Order] link

## Technical Notes
- Use: react-to-print OR @react-pdf/renderer
- Print styles: separate @media print CSS
- Hide: navbar, footer, action buttons when printing
- Page size: A4
- Font: clean, print-friendly (no decorative fonts)
- Colors: minimal (black/gray for print)
