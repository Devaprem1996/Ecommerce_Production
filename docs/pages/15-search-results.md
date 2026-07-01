# SEARCH RESULTS PAGE

## URL: /search?q=[query]

## Trigger Points
- User types in navbar search bar → hits Enter
- User clicks search suggestion
- User clicks search icon on mobile

## Page Layout

### SEARCH HEADER
┌─────────────────────────────────────────────────┐
│  Search results for "organic rice"              │
│  Showing 24 results                             │
│                                                 │
│  [━━━━━━━━━━ organic rice ━━━━━━━━━] [🔍]      │
│  (Pre-filled with current query, editable)      │
└─────────────────────────────────────────────────┘

### SEARCH SUGGESTIONS (if misspelled)
┌─────────────────────────────────────────────────┐
│  Did you mean: "organic rice" ?                 │
│  Showing results for "organic rice" instead.   │
└─────────────────────────────────────────────────┘

### RESULTS LAYOUT
- Same as Product Listing Page (02-product-listing.md)
- Left: Filters (Category / Price / Rating)
- Right: Product grid
- Sort dropdown
- Grid/List toggle

### STATES

STATE 1 — HAS RESULTS:
- Product grid (same ProductCard component)
- Filter sidebar
- Sort + result count
- Pagination

STATE 2 — NO RESULTS:
┌─────────────────────────────────────────────────┐
│                                                 │
│         [🔍 Illustration — unDraw]              │
│                                                 │
│   No results for "xyz product"                 │
│                                                 │
│   Try:                                          │
│   • Check your spelling                         │
│   • Use fewer or different keywords             │
│   • Browse our categories instead              │
│                                                 │
│   [Browse All Products]  [Go to Home]          │
│                                                 │
│   ─── You might like ───                     │
│   [Popular Product Cards — 4 shown]            │
│                                                 │
└─────────────────────────────────────────────────┘

STATE 3 — LOADING:
- Skeleton loaders for product cards
- Shimmer animation

## Search Bar Behavior (Navbar)

### Desktop Search Expansion
- Click search icon → bar expands (width: 0 → 400px)
- Overlay darkens background
- Recent searches dropdown appears
- Typing shows live suggestions

### Suggestion Dropdown
┌─────────────────────────────────────────────────┐
│  🕐 Recent Searches                            │
│  • organic rice                                │
│  • cold pressed oil                            │
│  ─────────────────────────────────────         │
│  💡 Suggestions for "org"                      │
│  🔍 organic rice         → [in Products]       │
│  🔍 organic honey        → [in Products]       │
│  🔍 organic spices       → [in Products]       │
│  📂 Organic Category     → [in Categories]     │
│  ─────────────────────────────────────         │
│  🔥 Popular Searches                           │
│  cold pressed oil | jaggery | red rice         │
└─────────────────────────────────────────────────┘

### Keyboard Navigation in Search
- Arrow Up/Down: navigate suggestions
- Enter: go to suggestion or search
- Escape: close search
- Tab: close search

## URL Structure
/search?q=organic+rice
/search?q=organic+rice&category=grains
/search?q=organic+rice&sort=price-low
/search?q=organic+rice&page=2

## Performance
- Debounce search input: 300ms
- Minimum 2 characters to trigger suggestions
- Cache recent searches in localStorage (max 5)
- API: GET /api/search?q=[query]&filters=[filters]
