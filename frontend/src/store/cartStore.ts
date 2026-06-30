import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType, ProductType } from '@/types';

interface CartState {
  items: CartItemType[];
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addItem: (product: ProductType, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isMiniCartOpen: false,
      
      openMiniCart: () => set({ isMiniCartOpen: true }),
      closeMiniCart: () => set({ isMiniCartOpen: false }),

      addItem: (product, quantity = 1) =>
        set((state) => {
          // Unique item key based on product ID AND selected size/unit (variant support)
          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.product.unit === product.unit
          );

          let newItems = [...state.items];

          if (existingItemIndex > -1) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + quantity,
            };
          } else {
            newItems.push({ product, quantity });
          }

          // Open the mini cart automatically upon item addition
          return {
            items: newItems,
            isMiniCartOpen: true,
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'aether-cart-storage', // Key name in localStorage
      partialize: (state) => ({ items: state.items }), // Persist only items, not UI state (isMiniCartOpen)
    }
  )
);
