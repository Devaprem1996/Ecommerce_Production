# WISHLIST SYSTEM SPECIFICATION

## Frontend State Management (`useWishlist`)
Provides reactive toggle actions (`Heart` icon state updates) throughout the catalog listing and details grids.

### Store Actions
- `toggleWishlist(product)`: Appends product if not present, otherwise removes it.
- `hasItem(productId)`: Helper returning boolean validation.
- `removeItem(productId)`: Removes item.

## Merging & Persistence
- **Guest Storage**: Saved locally under `aether-wishlist-storage`.
- **Database Unification**: Resolves guest wishlist inputs by pushing them to `/api/wishlist/sync` upon sign-in.
- **Migration**: Moving an item to the cart automatically triggers the removal from the wishlist to prevent duplicates.
