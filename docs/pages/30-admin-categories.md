# ADMIN — CATEGORY MANAGEMENT PAGE

## URL: /admin/categories

## Purpose
Allow administrators to define, organize, and edit product categories and subcategories. This hierarchy controls the main shop navigation filters and catalog organization.

## Page Layout
A side-by-side layout is recommended for desktop screen space efficiency:
- **Left Column (40% width)**: Add / Edit Category Form.
- **Right Column (60% width)**: Interactive Category tree list showing hierarchy, item counts, and status indicators.

┌─────────────────────────────────────────────────────────┐
│  Categories                                             │
│                                                         │
│  ┌────────────────────────┐  ┌────────────────────────┐ │
│  │ Add New Category       │  │ Category Tree List     │ │
│  │                        │  │                        │ │
│  │ Name (English) *       │  │ 📂 Grains & Cereals (24)│ │
│  │ [                    ] │  │    └─ 📄 Rice & Millets│ │
│  │                        │  │ 📂 Cold Pressed Oils(8)│ │
│  │ Name (Tamil)           │  │ 📂 Organic Spices (15) │ │
│  │ [                    ] │  │    └─ 📄 Powder Spices │ │
│  │                        │  │                        │ │
│  │ Parent Category        │  │ Actions:               │ │
│  │ [ None (Main)        ▾]│  │ Edit ✏️ | Delete 🗑️      │ │
│  │                        │  │                        │ │
│  │ [Save Category]        │  │                        │ │
│  └────────────────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

## Form Fields

1. **Category Name (English)***: Primary label.
2. **Category Name (Tamil)**: Bilingual representation.
3. **URL Slug***: Auto-generated from English name (e.g. `grains-cereals`), editable, validated for URL-safety and uniqueness.
4. **Description**: Short bio summarizing category contents.
5. **Parent Category**: Dropdown list of existing main categories. If selected, this category acts as a subcategory.
6. **Category Image / Banner**: Drag-and-drop file upload (max 1MB).
7. **Display Order**: Integer sorting value for ordering in menus.
8. **Status**: [Active / Inactive] toggle.

## Delete Rules
- Categories with linked products cannot be deleted unless the admin re-assigns those products to a different category first.
- Deleting a parent category presents a modal asking whether to delete all subcategories or migrate them to a different parent.
