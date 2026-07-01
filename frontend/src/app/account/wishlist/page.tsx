"use client";

import React from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/formatPrice';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Star,
  Eye,
  TrendingUp,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const { items, toggleItem } = useWishlist();
  const addItem = useCartStore((state) => state.addItem);
  const openMiniCart = useCartStore((state) => state.openMiniCart);

  // Action: Move to Cart
  const handleMoveToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // 1. Add to Cart
    addItem(product, 1);
    // 2. Remove from Wishlist
    toggleItem(product);
    // 3. Open Cart & Notify
    toast.success(`${product.name} moved to Cart!`);
    openMiniCart();
  };

  // Action: Remove
  const handleRemove = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product);
    toast.success(`${product.name} removed from Wishlist.`);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="text-xl font-heading font-black text-neutral-900 dark:text-white">
          My Wishlist
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
          Your saved organic favorites.
        </p>
      </div>

      {/* Product Grid */}
      {items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature space-y-4 select-none">
          <div className="w-14 h-14 bg-neutral-200/50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-450 mx-auto">
            <Heart className="w-6 h-6 text-red-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Your Wishlist is Empty</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-450 max-w-xs mx-auto">
              Save items you love to build a customized wishlist cart.
            </p>
          </div>
          <Link href="/shop" className="inline-block pt-2">
            <button className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-card border-none cursor-pointer">
              Explore Products
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col w-full bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-4 overflow-hidden transition-shadow hover:shadow-md font-sans"
              >
                {/* Trash/Remove Button Overlay */}
                <button
                  onClick={(e) => handleRemove(product, e)}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 dark:bg-neutral-850/90 text-neutral-500 hover:text-red-500 shadow border border-neutral-100 dark:border-neutral-700/50 cursor-pointer transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Product Image */}
                <Link href={`/shop/${product.id}`} className="block relative w-full aspect-square bg-neutral-100 dark:bg-neutral-850 rounded-card overflow-hidden mb-3">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.isOrganic && (
                    <span className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 text-[9px] font-bold rounded bg-success/15 text-success border border-success/20 uppercase tracking-wide select-none">
                      Organic
                    </span>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-505 dark:text-neutral-450 uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
                      {product.name}
                    </h4>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-neutral-900 dark:text-white">
                        {product.rating}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        ({product.reviewsCount})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                    {/* Price */}
                    <div className="flex items-baseline space-x-1">
                      <span className="text-sm font-black text-primary-700 dark:text-primary-400">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        / {product.unit}
                      </span>
                    </div>

                    {/* Move to Cart CTA */}
                    <button
                      onClick={(e) => handleMoveToCart(product, e)}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer transition-colors shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
