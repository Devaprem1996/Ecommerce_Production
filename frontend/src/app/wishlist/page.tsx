"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Star,
  Share2, 
  Copy,
  ChevronRight,
  Plus,
  Compass
} from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCartStore } from "@/store/cartStore";
import { mockProducts } from "@/constants/mockData";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

export default function StandaloneWishlistPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 animate-spin text-primary-500 rounded-full border-4 border-neutral-250 border-t-primary-500" />
      </div>
    }>
      <StandaloneWishlistContent />
    </React.Suspense>
  );
}

function StandaloneWishlistContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { items: myItems, toggleItem } = useWishlist();
  const addItem = useCartStore((state) => state.addItem);
  const openMiniCart = useCartStore((state) => state.openMiniCart);

  // States
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [isSharedView, setIsSharedView] = useState(false);

  // Check if viewing a shared wishlist link
  const shareParam = searchParams?.get("share");

  useEffect(() => {
    if (shareParam) {
      setIsSharedView(true);
      // Parse product IDs from comma-separated string
      const ids = shareParam.split(",");
      const foundProducts = ids
        .map(id => mockProducts.find(p => p.id === id))
        .filter((p): p is any => !!p);
      setSharedItems(foundProducts);
    } else {
      setIsSharedView(false);
      setSharedItems([]);
    }
  }, [shareParam]);

  // Actions for own wishlist
  const handleMoveToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    toggleItem(product);
    toast.success(`${product.name} moved to Cart!`);
    openMiniCart();
  };

  const handleRemove = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleItem(product);
    toast.success(`${product.name} removed from Wishlist.`);
  };

  const handleAddAllToCart = () => {
    const listToMigrate = isSharedView ? sharedItems : myItems;
    if (listToMigrate.length === 0) return;

    let count = 0;
    listToMigrate.forEach((product) => {
      addItem(product, 1);
      if (!isSharedView) {
        toggleItem(product); // Remove from own wishlist
      }
      count++;
    });

    toast.success(`Moved ${count} items to Cart!`);
    openMiniCart();
  };

  const handleShareWishlist = () => {
    if (myItems.length === 0) {
      toast.warning("Your wishlist is empty. Add items first to share.");
      return;
    }
    
    // Generate simple share link containing product IDs
    const ids = myItems.map(item => item.id).join(",");
    const shareUrl = `${window.location.origin}/wishlist?share=${ids}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success("Shareable link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link. Please copy it manually.");
      });
  };

  const handleImportShared = () => {
    if (sharedItems.length === 0) return;
    
    let count = 0;
    sharedItems.forEach((product) => {
      // If it doesn't exist in my wishlist, add it
      const alreadyHas = myItems.some(item => item.id === product.id);
      if (!alreadyHas) {
        toggleItem(product);
        count++;
      }
    });

    toast.success(`Imported ${count} items to your Wishlist!`);
    router.push("/wishlist"); // Clear the share parameter to show their own wishlist
  };

  const activeItems = isSharedView ? sharedItems : myItems;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 transition-colors duration-normal">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-650 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t("shop.breadcrumb_home", "Home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none">
              {isSharedView ? "Shared Favorites" : "Wishlist"}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Block */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
              {isSharedView ? "Shared Favorites" : "My Wishlist"}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1 font-semibold select-none">
              {isSharedView 
                ? "A friend has shared their top organic choices with you!"
                : "Manage and share your favorite direct-to-farm selections."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeItems.length > 0 && (
              <Button 
                variant="secondary" 
                onClick={handleAddAllToCart}
                className="font-bold text-xs py-2.5"
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                Add All to Cart
              </Button>
            )}

            {isSharedView ? (
              <Button 
                variant="primary" 
                onClick={handleImportShared}
                className="font-bold text-xs py-2.5"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Copy to My Wishlist
              </Button>
            ) : (
              myItems.length > 0 && (
                <Button 
                  variant="primary" 
                  onClick={handleShareWishlist}
                  className="font-bold text-xs py-2.5"
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  Share Wishlist
                </Button>
              )
            )}
          </div>
        </div>

        {/* Product Grid */}
        {activeItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 px-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature space-y-5 select-none shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-500/5 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/10">
              <Heart className="w-7 h-7 text-red-400 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {isSharedView ? "Shared List is Empty" : "Your Wishlist is Empty!"}
              </h3>
              <p className="text-xs text-neutral-505 dark:text-neutral-450 max-w-xs mx-auto leading-relaxed">
                {isSharedView
                  ? "This shared link does not contain any valid organic products."
                  : "Explore our freshly picked organic offerings and save items here."}
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <Button variant="primary" className="font-bold text-xs px-6 py-2.5">
                Explore Farm Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {activeItems.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col w-full bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-4 overflow-hidden transition-shadow hover:shadow-md font-sans"
                >
                  {/* Remove Button Overlay (only on personal view) */}
                  {!isSharedView && (
                    <button
                      onClick={(e) => handleRemove(product, e)}
                      className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 dark:bg-neutral-850/90 text-neutral-500 hover:text-red-500 shadow border border-neutral-100 dark:border-neutral-700/50 cursor-pointer transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Product Image */}
                  <Link href={`/shop/${product.id}`} className="block relative w-full aspect-square bg-neutral-100 dark:bg-neutral-850 rounded-card overflow-hidden mb-3">
                    <img
                      src={product.images[0] || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.isOrganic && (
                      <span className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 text-[9px] font-bold rounded bg-green-500/10 text-green-600 border border-green-500/20 uppercase tracking-wide select-none">
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

                      {/* Add to Cart CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(product, 1);
                          if (!isSharedView) {
                            toggleItem(product);
                          }
                          toast.success(`${product.name} added to Cart!`);
                          openMiniCart();
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer transition-colors shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isSharedView ? "Add to Cart" : "Move to Cart"}</span>
                      </button>
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
