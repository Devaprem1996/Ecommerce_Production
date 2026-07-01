import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType, ProductType } from '@/types';

interface CartState {
  items: CartItemType[];
  isMiniCartOpen: boolean;
  appliedCoupon: string | null;
  discountAmount: number;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addItem: (product: ProductType, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const calculateDiscount = (items: CartItemType[], coupon: string | null): number => {
  if (!coupon) return 0;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (coupon === 'ORGANIC10') {
    return Math.round(subtotal * 0.1);
  }
  if (coupon === 'FRESH20') {
    if (subtotal < 499) return 0;
    return Math.min(Math.round(subtotal * 0.2), 150);
  }
  return 0; // AETHERFREE is handled in delivery calculations
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isMiniCartOpen: false,
      appliedCoupon: null,
      discountAmount: 0,
      
      openMiniCart: () => set({ isMiniCartOpen: true }),
      closeMiniCart: () => set({ isMiniCartOpen: false }),

      addItem: (product, quantity = 1) =>
        set((state) => {
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

          const discount = calculateDiscount(newItems, state.appliedCoupon);

          return {
            items: newItems,
            isMiniCartOpen: true,
            discountAmount: discount,
          };
        }),

      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.product.id !== productId);
          const discount = calculateDiscount(newItems, state.appliedCoupon);
          return {
            items: newItems,
            discountAmount: discount,
          };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const newItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          const discount = calculateDiscount(newItems, state.appliedCoupon);
          return {
            items: newItems,
            discountAmount: discount,
          };
        }),

      clearCart: () => set({ items: [], appliedCoupon: null, discountAmount: 0 }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      applyCoupon: (code) => {
        const cleanedCode = code.toUpperCase().trim();
        const subtotal = get().getTotal();

        if (cleanedCode === 'ORGANIC10') {
          const discount = Math.round(subtotal * 0.1);
          set({ appliedCoupon: 'ORGANIC10', discountAmount: discount });
          return { success: true, message: 'Coupon "ORGANIC10" applied! 10% Discount saved.' };
        } else if (cleanedCode === 'FRESH20') {
          if (subtotal < 499) {
            return { success: false, message: 'Minimum order ₹499 required for this code.' };
          }
          const discount = Math.min(Math.round(subtotal * 0.2), 150);
          set({ appliedCoupon: 'FRESH20', discountAmount: discount });
          return { success: true, message: `Coupon "FRESH20" applied! You save ₹${discount}.` };
        } else if (cleanedCode === 'AETHERFREE') {
          set({ appliedCoupon: 'AETHERFREE', discountAmount: 0 });
          return { success: true, message: 'Coupon "AETHERFREE" applied! Free Delivery enabled.' };
        }

        return { success: false, message: 'Invalid coupon code. Try ORGANIC10, FRESH20 or AETHERFREE' };
      },

      removeCoupon: () => {
        set({ appliedCoupon: null, discountAmount: 0 });
      },
    }),
    {
      name: 'aether-cart-storage',
      partialize: (state) => ({ 
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        discountAmount: state.discountAmount
      }),
    }
  )
);
