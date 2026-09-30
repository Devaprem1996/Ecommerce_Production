# Archived & Auxiliary Files Directory (`unused_files/`)

This directory houses non-runtime files, auxiliary spreadsheets, one-off generation scripts, raw guide drafts, and theme design references that are not directly required to run or build the active frontend and backend applications.

Archiving them here ensures the project root and source directories maintain a clean, uncluttered, and production-ready structure.

---

## Directory Structure

```
unused_files/
├── data_and_spreadsheets/     # Business spreadsheets, catalog extracts & RACI matrices
├── generator_scripts/         # Python utility scripts used to parse or generate spreadsheets
├── draft_guides/              # Historical drafts and background notes
├── design_references/         # Reference UI screenshots and visual inspiration assets
└── legacy_scripts/            # Deprecated shell and node utility scripts
```

---

## Subfolder Breakdown

### 1. `data_and_spreadsheets/`
Contains commercial, inventory, and requirement spreadsheets:
* **`Hostinger_Cloudinary_Costing_Matrix.xlsx` / `.csv`**: Complete 12-month cloud hosting and media storage financial model.
* **`ProductListForWebsite.xlsx`**: Master catalog of 85 initial products with bilingual names and variants.
* **`Requirements_RACI_Matrix.xlsx` / `.csv` / `Requirements_RACI_Matrix_Updated.csv`**: Project RACI matrix mapping business requirements and deliverables.
* **`Yathu_Arokiyagam_Pincodes_Setup.csv`**: Initial delivery serviceable pincode mapping dataset.
* **`Yathu_Arokiyagam_Store_Content.csv`**: Store policies, FAQ, and banner text copy dataset.
* **`parsed_products.json`**: Intermediate JSON output from `parsefull.py`. *(Note: Active seed catalog is maintained in `backend/prisma/parsed_products.json`)*.

### 2. `generator_scripts/`
Standalone Python scripts utilized during the initial setup phase:
* **`generate_costing_excel.py`**: Generates the Hostinger & Cloudinary costing spreadsheet.
* **`generate_raci_excel.py`**: Generates the RACI responsibility matrix spreadsheet.
* **`generate_content_sheets.py`**: Exports store content and pincodes into CSV format.
* **`generate_sheet.py`**: Generates product catalog collection templates.
* **`parsefull.py`**: Parses catalog data from `ProductListForWebsite.xlsx`.

### 3. `draft_guides/`
Working notes and preliminary architecture drafts:
* **`backend-cases-guide`**: High-level eCommerce backend fundamentals reference note.
* **`cost and free source guide.resolved`**: Research notes and planning context for the development activity report and zero-cost hosting tiers.

### 4. `design_references/`
* **`theme_reference_images/`**: Collection of screenshots and UI reference mockups collected for brand, color palette, and layout inspiration during the UX design phase.

### 5. `legacy_scripts/`
* **`deploy.ps1` & `deploy.sh`**: Standalone Vercel CLI deploy scripts (superseded by CI/CD workflows and `deploy/` configurations).
* **`run-test-db-direct.cjs`**: Stale test runner previously in frontend.

---

## Restoring Files
If any file in this directory needs to be referenced or executed:
- **Spreadsheets & Data**: Can be opened in Microsoft Excel, LibreOffice Calc, or Google Sheets.
- **Python Scripts**: Can be run via Python (`python script_name.py`) within their respective subfolders.
- **Active Code**: Active application code resides in `frontend/` (Next.js) and `backend/` (Express API).
