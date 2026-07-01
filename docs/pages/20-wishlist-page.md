# WISHLIST PAGE (STANDALONE)

## URL: /wishlist

## Purpose
Provide a standalone, responsive page where guest or authenticated users can manage, view, and share their saved products. It bridges temporary shopping intentions with the primary cart/checkout funnel.

## Page Layout

### 1. WISHLIST HEADER
┌─────────────────────────────────────────────────┐
│  My Wishlist (5 items)            [🔗 Share link]│
│                                                 │
│  Keep track of your favorite organic products.  │
└─────────────────────────────────────────────────┘

### 2. WISHLIST GRID
- 2 columns mobile / 3 columns tablet / 4 columns desktop
- Render product cards using `WishlistItemCard` components.
- Each Card contains:
  * Product thumbnail and discount tag (e.g. `20% Off`).
  * Close/Remove button (top right cross icon `✕`).
  * Product Title, Unit (e.g., `1 kg`), and Pricing (current price + slashed original price).
  * In-Stock or Out-of-Stock status badge.
  * Primary Button: `[🛒 Add to Cart]` (disabled if out of stock).

### 3. WISHLIST STATES

STATE 1 — HAS ITEMS:
- Grid layout with smooth deletion animations (framer-motion fade/scale out).
- Primary "Add All to Cart" action in the header to bulk-migrate products.
- Share modal popup displaying a copyable unique link (e.g., `/wishlist?share=ush-88319a`).

STATE 2 — EMPTY WISHLIST:
┌─────────────────────────────────────────────────┐
│                                                 │
│         [❤️ Icon / Illustration — unDraw]         │
│                                                 │
│        Your Wishlist is Empty!                  │
│   Explore our organic items and save them here. │
│                                                 │
│              [🛍️ Explore Shop]                   │
│                                                 │
└─────────────────────────────────────────────────┘

STATE 3 — LOADING:
- Shimmer skeleton grid for wishlist items.

## Sharing Mechanics
- Clicking "Share Link" generates a secure hashed query parameter: `/wishlist?share=HASH`.
- When another user opens `/wishlist?share=HASH`, they see a read-only list of the shared products:
  * Heading: "[Name]'s Shared Favorites"
  * CTA: `[Copy All to My Wishlist]` or `[Add Selected to Cart]`.

## Sync & Session Management
- **Guests**: Wishlist is stored in local storage (`aether-wishlist-storage`).
- **Authenticated Users**: On login, items from local storage merge automatically with the user's database-backed wishlist.
- **Cart Migration**: Adding to cart from the wishlist automatically triggers a remove event from the wishlist store, maintaining a clean workspace.
