# CART SYSTEM SPECIFICATION

## Frontend State Management (`useCartStore`)
The shopping cart uses Zustand's `persist` middleware to synchronize item choices across pages, page refreshes, and tabs.

### Cart Item Schema
```typescript
interface CartItem {
  productId: string;
  quantity: number;
  variantId?: string; // Weight variants (250g, 1kg)
  price: number; // Price of the chosen variant
}
```

### Store Actions
- `addItem(product, quantity, variant)`: Increments quantity if item exists, otherwise inserts it.
- `updateQuantity(productId, quantity)`: Modifies count directly (restricted between 1 and max stock).
- `removeItem(productId)`: Deletes entry.
- `clearCart()`: Empties array, resets applied coupon state.
- `openMiniCart()` / `closeMiniCart()`: Toggles sliding slide-out overlay.

## Data Persistence & Synchronization
1. **LocalStorage**: Persisted under `aether-cart-storage`.
2. **Database Syncing**: Upon successful authentication, the local cart payload syncs to the server (`POST /api/cart/sync`) to unify user carts across multiple devices.
