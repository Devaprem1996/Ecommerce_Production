import { create } from 'zustand';
import { ProductType } from '@/types';

interface WishlistState {
  items: ProductType[];
  toggleItem: (product: ProductType) => void;
  hasItem: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  toggleItem: (product) =>
    set((state) => {
      const exists = state.items.some((item) => item.id === product.id);
      if (exists) {
        return { items: state.items.filter((item) => item.id !== product.id) };
      }
      return { items: [...state.items, product] };
    }),
  hasItem: (productId) => get().items.some((item) => item.id === productId),
}));
