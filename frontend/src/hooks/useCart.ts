import { useCartStore } from '@/store/cartStore';

// Re-export the store hook to maintain backward compatibility with existing components.
export const useCart = useCartStore;
