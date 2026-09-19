import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductType } from '@/types';
import { accountService } from '@/services/account.service';
import { useAuthStore } from '@/store/auth-store';

interface WishlistState {
  items: ProductType[];
  isLoading: boolean;
  toggleItem: (product: ProductType) => void;
  hasItem: (productId: string) => boolean;
  syncWithDb: () => Promise<void>;
  setItems: (items: ProductType[]) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      setItems: (items) => set({ items }),
      toggleItem: (product) => {
        const state = get();
        const exists = state.items.some((item) => item.id === product.id);
        const nextItems = exists
          ? state.items.filter((item) => item.id !== product.id)
          : [...state.items, product];

        set({ items: nextItems });

        // If user is authenticated, sync mutation with live Neon PostgreSQL database
        const isAuth =
          typeof window !== 'undefined' &&
          (Boolean(localStorage.getItem('access_token')) ||
           Boolean((window as any).__accessToken) ||
           document.cookie.includes('access_token=') ||
           useAuthStore.getState().isLoggedIn);

        if (isAuth) {
          accountService.toggleWishlist(product.id).catch((err) => {
            console.error('Failed to sync wishlist change with database:', err);
          });
        }
      },
      hasItem: (productId) => get().items.some((item) => item.id === productId),
      syncWithDb: async () => {
        const isAuth =
          typeof window !== 'undefined' &&
          (Boolean(localStorage.getItem('access_token')) ||
           Boolean((window as any).__accessToken) ||
           document.cookie.includes('access_token=') ||
           useAuthStore.getState().isLoggedIn);

        if (!isAuth) {
          return;
        }

        try {
          set({ isLoading: true });
          const dbItems = await accountService.getWishlist();
          if (Array.isArray(dbItems)) {
            // Map DB wishlist items into ProductType format
            const mapped: ProductType[] = dbItems.map((dbItem: any) => ({
              id: dbItem.id || dbItem.productId,
              name: dbItem.name || dbItem.nameEn,
              nameTamil: dbItem.nameTa,
              description: dbItem.description || '',
              descriptionTamil: dbItem.descriptionTa,
              price: dbItem.price || dbItem.basePrice || 0,
              images: [dbItem.image || dbItem.thumbnailUrl || '/images/placeholder.png'],
              category: dbItem.category || 'General',
              stock: dbItem.stockQuantity ?? 10,
              rating: 5,
              reviewsCount: 0,
              isOrganic: true,
              isLabTested: true,
              unit: dbItem.unit || 'pack',
            }));

            // Sync with local store
            set({ items: mapped, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          console.error('Failed to sync wishlist from database:', err);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'yathu-wishlist-storage',
    }
  )
);
