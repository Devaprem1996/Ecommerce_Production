# CUSTOMER REVIEWS PAGE

## URL: /reviews

## Purpose
Build trust by displaying all verified customer reviews, ratings breakdown, and testimonial entries. Encourages new visitors to buy and allows existing customers to leave feedback.

## Page Layout

### 1. RATINGS OVERVIEW CARD
┌────────────────────────────────────────────────────────┐
│  4.8 ★★★★★  (Based on 1,240 reviews)                  │
│                                                        │
│  5 Star  [████████████████████░░░░░] (82%)             │
│  4 Star  [███░░░░░░░░░░░░░░░░░░░░░░] (12%)             │
│  3 Star  [█░░░░░░░░░░░░░░░░░░░░░░░░] (4%)              │
│  2 Star  [░░░░░░░░░░░░░░░░░░░░░░░░░] (1%)              │
│  1 Star  [░░░░░░░░░░░░░░░░░░░░░░░░░] (1%)              │
│                                                        │
│  [★ Write A Review]                                    │
└────────────────────────────────────────────────────────┘

### 2. FILTERS & SORT BAR
- Tabs: All Reviews | Verified Purchases | Reviews with Photos.
- Dropdown: Sort by (Recent | Highest Rating | Lowest Rating | Most Helpful).

### 3. REVIEWS GRID / LIST
- Each review card displays:
  * Rating stars (1 to 5, Primary Green).
  * Reviewer Name with a green badge: `[✓ Verified Buyer]`.
  * Review Date (e.g. `12 Jan 2025`).
  * Review title and full text description.
  * Customer uploaded photos (grid of expandable thumbnails).
  * Product reference link: "Review for: Cold Pressed Coconut Oil".
  * Helpful Counter: `Was this review helpful? [Yes (24)] [No (2)]`.

### 4. SUBMIT A REVIEW DRAWER / MODAL
- Form Fields:
  * Star Rating selection (hover animation).
  * Review Title (max 100 chars).
  * Review Text (textarea, min 20 chars).
  * Product Selection dropdown (if opened globally).
  * Photo uploader (drag & drop, max 3 photos).
  * Nickname / Display Name.
  * Email (not published).

## Sync & Moderation Rules
- All new reviews are marked as `pending_moderation` by default.
- Approved status displays on the `/reviews` list and corresponding `/shop/product-id` pages.
- Verified badges are automatically added if the email matches a delivered purchase of that product.
