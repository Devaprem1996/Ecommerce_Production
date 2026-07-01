# ADMIN — PINCODE / DELIVERY ZONE MANAGER

## URL: /admin/settings/pincodes

## Purpose
Admin manages which pincodes are serviceable.
This feeds the Pincode Validator on the product page.

## Page Layout
┌─────────────────────────────────────────────────────────┐
│  Delivery Zones                  [+ Add Pincode(s)]    │
│                                                         │
│  [🔍 Search pincode or city...]  [State ▾] [Export]    │
│                                                         │
│  ┌──────────┬──────────┬────────────┬────────┬───────┐  │
│  │ Pincode  │ City     │ State      │ Days   │ Status│  │
│  ├──────────┼──────────┼────────────┼────────┼───────┤  │
│  │ 600001   │ Chennai  │ Tamil Nadu │ 2-3    │ ✅    │  │
│  │ 600040   │ Chennai  │ Tamil Nadu │ 2-3    │ ✅    │  │
│  │ 110001   │ Delhi    │ Delhi      │ 4-5    │ ✅    │  │
│  │ 999999   │ Remote   │ Unknown    │ 7-10   │ ❌    │  │
│  └──────────┴──────────┴────────────┴────────┴───────┘  │
│                                                         │
│  Total Active: 2,450 pincodes                          │
└─────────────────────────────────────────────────────────┘

## Add Pincodes Section
METHOD 1: Single Pincode
  Pincode * | City | State | Delivery Days | Status

METHOD 2: Bulk Upload (CSV)
  Download template CSV
  Fill and upload
  Preview before saving
  Show: X added, Y skipped (duplicates), Z errors

METHOD 3: By State/City
  Select State → Select City → Auto-add all pincodes
  Source: India Post pincode database

## Edit Pincode
- Edit delivery days
- Enable/Disable pincode
- Add delivery notes (e.g., "Cash on Delivery not available")
