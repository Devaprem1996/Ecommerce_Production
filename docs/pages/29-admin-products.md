# ADMIN — PRODUCT MANAGEMENT PAGES

## URLs
- /admin/products          → Product list
- /admin/products/add      → Add new product
- /admin/products/[id]     → Edit product

## Product List Page

### Layout
┌─────────────────────────────────────────────────────────┐
│  Products                          [+ Add New Product]  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [🔍 Search products...] [Category ▾] [Status ▾]│   │
│  │ Showing 1-20 of 150 products    [Export CSV]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────┬───────────┬────────┬──────┬───────┬────────┐  │
│  │ ☐   │ Product   │ Cat    │ Price│ Stock │ Status │  │
│  ├─────┼───────────┼────────┼──────┼───────┼────────┤  │
│  │ ☐   │ [img]Name │ Grains │ ₹299 │ 45    │ ✅ Live│  │
│  │ ☐   │ [img]Name │ Oils   │ ₹399 │ 0     │ ❌ OOS │  │
│  │ ☐   │ [img]Name │ Spices │ ₹199 │ 12    │ ⏸ Draft│  │
│  └─────┴───────────┴────────┴──────┴───────┴────────┘  │
│                                                         │
│  Bulk Actions: [Select Action ▾] [Apply]               │
│  Pagination: ← 1 2 3 ... 8 →                          │
└─────────────────────────────────────────────────────────┘

### Column Details
- Checkbox: bulk select
- Product: thumbnail + name + SKU
- Category: category name
- Price: sale price (show original if discounted)
- Stock: number + color (red if 0, orange if <10)
- Status: Live / Draft / Out of Stock
- Actions: Edit ✏️ | Duplicate 📋 | Delete 🗑️

### Bulk Actions
- Activate selected
- Deactivate selected
- Delete selected
- Export selected

## Add / Edit Product Form

### Form Sections (tabs or accordion)

SECTION 1: BASIC INFO
  Product Name (English) *
  Product Name (Tamil) — bilingual
  SKU (auto-generated, editable)
  Category * (dropdown — from categories)
  Sub-category (conditional dropdown)
  Status: [Live / Draft] toggle

SECTION 2: DESCRIPTION
  Short Description * (1-2 lines, for cards)
  Full Description * (rich text editor — TipTap)
  Includes: Bold, Italic, Lists, Headings, Links
  Tamil Description (optional rich text)

SECTION 3: IMAGES
  - Drag and drop image upload area
  - Multiple images (min 1, max 10)
  - Reorder by dragging
  - First image = main/thumbnail
  - Each: preview + delete button
  - Accepted: JPG, PNG, WebP
  - Max size: 2MB per image
  - Auto-compress on upload
  - Alt text field per image

SECTION 4: PRICING
  MRP (Original Price) *
  Sale Price * (if different from MRP — shows discount %)
  Cost Price (internal, not shown to customers)
  Tax Category: [None / 5% GST / 12% GST / 18% GST]
  Price Inclusive of Tax: [Yes / No] toggle

SECTION 5: VARIANTS (Weight / UoM)
  - Add multiple weight variants:
    [250g] [500g] [1kg] [2kg] [5kg]
  - Each variant has: Weight | Unit | Price | Stock
  - Add Variant button
  - Remove variant button
  - Mark default variant

SECTION 6: INVENTORY
  Stock Quantity *
  Low Stock Alert (notify when below X units)
  Allow Backorders: [Yes / No]
  SKU per variant (optional)

SECTION 7: SEO
  Meta Title (auto-fills from product name)
  Meta Description
  URL Slug (auto-generated, editable)
  Keywords / Tags

SECTION 8: ADDITIONAL
  Related Products (search + select)
  Product Tags (comma separated)
  Certifications: [Organic ☐] [Lab Tested ☐] [Non-GMO ☐]
  Shelf Life
  Storage Instructions
  Country of Origin

### Form Validation
- Required fields marked with *
- Real-time validation
- Show error summary at top on submit failure
- Auto-save draft every 30 seconds
- "Unsaved changes" warning on page leave

### Form Actions
- [Save as Draft] — saves without publishing
- [Publish Product] — saves and makes live
- [Cancel] — confirms if unsaved changes
- [Preview] — opens product page in new tab (draft view)
