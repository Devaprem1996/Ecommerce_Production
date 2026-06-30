"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustBar } from '@/components/home/TrustBar';
import { CategorySection } from '@/components/home/CategorySection';
import { BestSellers } from '@/components/home/BestSellers';
import { PromoBanner } from '@/components/home/PromoBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Testimonials } from '@/components/home/Testimonials';
import { BlogPreview } from '@/components/home/BlogPreview';
import { Newsletter } from '@/components/home/Newsletter';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import { ProductType } from '@/types';
import { Leaf, ShieldCheck, Heart, ShoppingBag, Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import 'aos/dist/aos.css';

export default function Home() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Stores
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  // Quick View State
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Initialize AOS client-side
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
    });
  }, []);

  const openQuickView = (product: ProductType) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const closeQuickView = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    for (let i = 0; i < quantity; i++) {
      addItem(selectedProduct);
    }
    const displayName = currentLang === 'ta' && selectedProduct.nameTamil ? selectedProduct.nameTamil : selectedProduct.name;
    toast.cart(`${displayName} (${quantity})`);
    closeQuickView();
  };

  const handleWishlistToggle = () => {
    if (!selectedProduct) return;
    const wasWishlisted = hasItem(selectedProduct.id);
    toggleItem(selectedProduct);
    const displayName = currentLang === 'ta' && selectedProduct.nameTamil ? selectedProduct.nameTamil : selectedProduct.name;
    if (!wasWishlisted) {
      toast.success(
        currentLang === 'ta' 
          ? `${displayName} விருப்பப்பட்டியலில் சேர்க்கப்பட்டது!` 
          : `${displayName} added to wishlist!`
      );
    } else {
      toast.info(
        currentLang === 'ta' 
          ? `${displayName} விருப்பப்பட்டியலில் இருந்து நீக்கப்பட்டது` 
          : `${displayName} removed from wishlist`
      );
    }
  };

  const displayProductName = selectedProduct
    ? (currentLang === 'ta' && selectedProduct.nameTamil ? selectedProduct.nameTamil : selectedProduct.name)
    : '';

  const displayProductDesc = selectedProduct
    ? (currentLang === 'ta' && selectedProduct.descriptionTamil ? selectedProduct.descriptionTamil : selectedProduct.description)
    : '';

  return (
    <div className="flex flex-col flex-1 w-full bg-white dark:bg-neutral-950 font-sans transition-colors duration-normal">
      {/* 1. HeroBanner Carousel */}
      <HeroBanner />

      {/* 2. TrustBar Icons */}
      <TrustBar />

      {/* 3. CategorySection Grid */}
      <CategorySection />

      {/* 4. BestSellers Grid */}
      <BestSellers onQuickView={openQuickView} />

      {/* 5. PromoBanner Parallax */}
      <PromoBanner />

      {/* 6. NewArrivals Swipeable Carousel / Grid */}
      <NewArrivals onQuickView={openQuickView} />

      {/* 7. WhyChooseUs USPS & Stats */}
      <WhyChooseUs />

      {/* 8. Testimonials Review Slider */}
      <Testimonials />

      {/* 9. BlogPreview Articles */}
      <BlogPreview />

      {/* 10. Newsletter Form */}
      <Newsletter />

      {/* Central Product Quick View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeQuickView}
        size="lg"
        title={t('quick_view.title', 'Quick View')}
      >
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            {/* Left Column: Image with badging */}
            <div className="relative w-full aspect-square rounded-feature overflow-hidden border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
              <Image
                src={selectedProduct.images[0]}
                alt={displayProductName}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {selectedProduct.isOrganic && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-primary-500/90 backdrop-blur-sm px-2.5 py-1 rounded-badge shadow-sm">
                    <Leaf className="w-3.5 h-3.5" />
                    {currentLang === 'ta' ? 'இயற்கை' : 'Organic'}
                  </span>
                )}
                {selectedProduct.isLabTested && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#0284C7]/90 backdrop-blur-sm px-2.5 py-1 rounded-badge shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {currentLang === 'ta' ? 'ஆய்வக சோதனை' : 'Lab Tested'}
                  </span>
                )}
              </div>

              {selectedProduct.stock === 0 && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-15">
                  <span className="text-white text-sm font-bold uppercase tracking-widest bg-error/90 px-4 py-2 rounded-badge shadow-lg animate-pulse">
                    {currentLang === 'ta' ? 'விற்றுத்தீர்ந்தது' : 'Sold Out'}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Specifications and Actions */}
            <div className="flex flex-col justify-between font-sans">
              <div className="flex flex-col gap-3">
                {/* Category & Status */}
                <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">
                  {selectedProduct.category}
                </span>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
                  {displayProductName}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <StarRating rating={selectedProduct.rating} size="sm" />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                    ({selectedProduct.reviewsCount} {t('quick_view.reviews', 'reviews')})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                    ₹{selectedProduct.price}
                  </span>
                  <span className="text-sm font-semibold text-neutral-650 dark:text-neutral-400">
                    / {selectedProduct.unit}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

                {/* Description */}
                <p className="text-sm text-neutral-650 dark:text-neutral-400 leading-relaxed">
                  {displayProductDesc}
                </p>
              </div>

              {/* Quantity Selector & Add To Cart Button */}
              <div className="flex flex-col gap-4 mt-6">
                {selectedProduct.stock > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {currentLang === 'ta' ? 'அளவு:' : 'Quantity:'}
                    </span>
                    <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-card bg-neutral-50 dark:bg-neutral-800">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2 hover:text-primary-500 text-neutral-600 dark:text-neutral-400 transition-colors focus:outline-none cursor-pointer min-w-[36px] flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold px-3 text-neutral-900 dark:text-white select-none w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                        className="p-2 hover:text-primary-500 text-neutral-600 dark:text-neutral-400 transition-colors focus:outline-none cursor-pointer min-w-[36px] flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="cta"
                    size="lg"
                    disabled={selectedProduct.stock === 0}
                    onClick={handleAddToCart}
                    className="flex-1 font-bold text-base"
                    leftIcon={<ShoppingBag className="w-5 h-5" />}
                  >
                    {t('quick_view.add_to_cart', 'Add to Cart')}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={handleWishlistToggle}
                    className={clsx(
                      "border border-neutral-200 dark:border-neutral-800 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/45 rounded-card",
                      hasItem(selectedProduct.id) ? "text-[#E63946] hover:text-[#E63946]/95" : "text-neutral-600 hover:text-primary-500"
                    )}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={clsx("w-5 h-5", hasItem(selectedProduct.id) && "fill-current")} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
