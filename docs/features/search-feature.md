# SEARCH SYSTEM ARCHITECTURE

## Core Capabilities
1. **Fuzzy Search & Autocomplete**: Performs string distance algorithms to find matching organic products even with minor spelling mistakes.
2. **Category Suggestions**: Displays suggestions grouped by categories (e.g. searching "oil" suggests "Cold Pressed Oils" category alongside specific products).
3. **Recent Searches Cache**: Stores the user's last 5 search queries in local storage for quick access.
4. **URL Synchronization**: Binds all query inputs and filter selections directly to URL search params (`?q=...&category=...`).

## Technical Specifications & Performance

### Debouncing & Input Guards
- **Debounce Interval**: 300 milliseconds. Prevents redundant API requests on rapid typing.
- **Minimum Character Trigger**: 2 characters required before suggestions dropdown displays.
- **Caching**: Client-side memory cache stores suggestion payloads keyed by queries for 5 minutes.

### Database Query Matches (Backend)
```sql
SELECT * FROM products 
WHERE status = 'live' 
AND (
  name_en ILIKE '%query%' OR 
  name_ta ILIKE '%query%' OR 
  sku ILIKE '%query%' OR 
  tags @> ARRAY['query']
)
ORDER BY (name_en ILIKE 'query%') DESC, rating DESC;
```
*(Prioritizes prefix matches and highly rated products).*
