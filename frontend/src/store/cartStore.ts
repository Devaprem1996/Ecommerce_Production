import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType, ProductType } from '@/types';
import { apiClient } from '@/services/api-client';

export interface CartCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
}

interface CartState {
  items: CartItemType[];
  isMiniCartOpen: boolean;
  appliedCoupon: CartCoupon | string | null;
  discountAmount: number;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addItem: (product: ProductType, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  applyCoupon: (code: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const calculateDiscount = (items: CartItemType[], coupon: CartCoupon | string | null): number => {
  if (!coupon) return 0;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (typeof coupon === 'object') {
    if (subtotal < (coupon.minOrderValue || 0)) return 0;

    if (coupon.discountType === 'PERCENTAGE') {
      const rawDiscount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && coupon.maxDiscount > 0) {
        return Math.min(rawDiscount, coupon.maxDiscount);
      }
      return rawDiscount;
    }
    // FIXED_AMOUNT
    return Math.min(coupon.discountValue, subtotal);
  }

  // Fallbacks for seed coupons
  if (coupon === 'WELCOME10') {
    if (subtotal < 299) return 0;
    return Math.min(Math.round(subtotal * 0.1), 100);
  }
  if (coupon === 'YATHU100') {
    if (subtotal < 799) return 0;
    return Math.min(100, subtotal);
  }
  return 0;
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
          const maxStock = typeof product.stock === 'number' && product.stock >= 0 ? product.stock : 999;
          if (maxStock <= 0) {
            // Cannot add out-of-stock item
            return state;
          }

          const existingItemIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.product.unit === product.unit
          );

          let newItems = [...state.items];

          if (existingItemIndex > -1) {
            const currentQty = newItems[existingItemIndex].quantity;
            const updatedQty = Math.min(currentQty + quantity, maxStock);
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: updatedQty,
            };
          } else {
            const initialQty = Math.min(Math.max(1, quantity), maxStock);
            newItems.push({ product, quantity: initialQty });
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
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.product.id !== productId);
            const discount = calculateDiscount(newItems, state.appliedCoupon);
            return {
              items: newItems,
              discountAmount: discount,
            };
          }

          const newItems = state.items.map((item) => {
            if (item.product.id !== productId) return item;
            const maxStock = typeof item.product.stock === 'number' && item.product.stock >= 0 ? item.product.stock : 999;
            return { ...item, quantity: Math.min(quantity, maxStock) };
          });
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

      applyCoupon: async (code: string, phone?: string) => {
        const cleanedCode = code.toUpperCase().trim();
        if (!cleanedCode) {
          return { success: false, message: 'Please enter a coupon code.' };
        }
        const subtotal = get().getTotal();

        try {
          const res = await apiClient.post<{
            valid: boolean;
            coupon: {
              id: string;
              code: string;
              discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
              discountValue: number;
              minOrderValue: number;
              maxDiscount: number | null;
            };
            discountAmount: number;
            newTotal: number;
            message: string;
          }>('/coupons/validate', {
            code: cleanedCode,
            subtotal,
            phone,
          });

          if (res.success && res.data?.valid) {
            const { coupon, discountAmount, message } = res.data;
            const couponData: CartCoupon = {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: Number(coupon.discountValue),
              minOrderValue: Number(coupon.minOrderValue),
              maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
            };
            // Strictly enforce single coupon at a time by replacing any prior coupon
            set({
              appliedCoupon: couponData,
              discountAmount,
            });
            return {
              success: true,
              message: message || `Coupon "${coupon.code}" applied! You save ₹${discountAmount}.`,
            };
          }

          return {
            success: false,
            message: res.message || 'Invalid coupon code.',
          };
        } catch (err: any) {
          const errorMsg =
            err?.message ||
            err?.response?.data?.message ||
            'Unable to validate coupon code. Please try again.';
          return { success: false, message: errorMsg };
        }
      },

      removeCoupon: () => {
        set({ appliedCoupon: null, discountAmount: 0 });
      },
    }),
    {
      name: 'yathu-cart-storage',
      partialize: (state) => ({ 
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        discountAmount: state.discountAmount
      }),
    }
  )
);

// Cross-tab synchronization: keep cart synchronized in real-time across multiple open tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'yathu-cart-storage') {
      useCartStore.persist.rehydrate();
    }
  });
}

