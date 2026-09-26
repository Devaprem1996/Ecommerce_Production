"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductType } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import apiClient from '@/lib/apiClient';
import { mapProductToFrontend } from '@/utils/apiMapper';
import { ProductShowcaseCard } from '../ProductShowcaseCard';

interface NewArrivalsProps {
  onQuickView: (product: ProductType) => void;
}

// Rich fallback products for New Arrivals
const fallbackNewArrivals: ProductType[] = [
  {
    id: 'new-prod-murukku',
    name: 'Artisanal Achu Murukku',
    nameTamil: 'பாரம்பரிய அச்சு முறுக்கு',
    description: 'Crisp, delicate traditional rosette cookies made with organic rice flour and coconut milk.',
    descriptionTamil: 'தேங்காய்ப்பால் மற்றும் பாரம்பரிய பச்சரிசி மாவில் சுடப்பட்ட சுவையான அச்சு முறுக்கு.',
    price: 175,
    originalPrice: 220,
    images: ['/images/prod-achu-murukku.jpg'],
    category: 'Traditional Snacks',
    stock: 35,
    rating: 4.9,
    reviewsCount: 112,
    isOrganic: true,
    isLabTested: true,
    unit: '200g Pack',
  },
  {
    id: 'new-prod-ginger',
    name: 'Handmade Ginger Candy Chews',
    nameTamil: 'இயற்கை இஞ்சி மரப்பா',
    description: 'Slow-cooked native ginger infused with pure country jaggery. Soothing digestion booster.',
    descriptionTamil: 'நாட்டு இஞ்சி மற்றும் தூய நாட்டுச் சர்க்கரையில் செய்யப்பட்ட பாரம்பரிய இஞ்சி மரப்பா.',
    price: 140,
    originalPrice: 180,
    images: ['/images/prod-ginger-candy.jpg'],
    category: 'Healthy Snacks',
    stock: 40,
    rating: 4.8,
    reviewsCount: 94,
    isOrganic: true,
    isLabTested: true,
    unit: '150g Glass Jar',
  },
  {
    id: 'new-prod-groundnuts',
    name: 'Slow-Roasted Native Groundnuts',
    nameTamil: 'வறுத்த நாட்டு நிலக்கடலை',
    description: 'Heirloom Sirumani groundnuts, sand-roasted to crunchy golden perfection with pink rock salt.',
    descriptionTamil: 'பாரம்பரிய மணல் வறுவல் முறையில் வறுத்த சுவையான சிறுமணி நாட்டு நிலக்கடலை.',
    price: 190,
    originalPrice: 240,
    images: ['/images/prod-roasted-groundnuts.jpg'],
    category: 'Healthy Snacks',
    stock: 50,
    rating: 5.0,
    reviewsCount: 140,
    isOrganic: true,
    isLabTested: true,
    unit: '250g Pack',
  },
  {
    id: 'new-prod-seedai',
    name: 'Traditional Sesame Seedai',
    nameTamil: 'கைவினை எள் சீடை',
    description: 'Golden crunchy bite-sized festive savory snack prepared with roasted sesame and cold-pressed oil.',
    descriptionTamil: 'மரச்செக்கு நல்லெண்ணெய் மற்றும் எள்ளில் சுடப்பட்ட பாரம்பரிய மொறுமொறு சீடை.',
    price: 165,
    originalPrice: 210,
    images: ['/images/prod-sesame-seedai.jpg'],
    category: 'Traditional Snacks',
    stock: 30,
    rating: 4.9,
    reviewsCount: 88,
    isOrganic: true,
    isLabTested: true,
    unit: '200g Pack',
  },
  {
    id: 'new-prod-noodles',
    name: 'Heritage Kodo Millet Noodles',
    nameTamil: 'பாரம்பரிய வரகு நூடுல்ஸ்',
    description: 'Zero maida, sun-dried noodles crafted from stone-ground kodo millet grains with natural seasoning.',
    descriptionTamil: 'மைதா இல்லாத, தூய வரகு அரிசியில் செய்யப்பட்ட சத்தான இயற்கை நூடுல்ஸ்.',
    price: 149,
    originalPrice: 199,
    images: ['/images/category-noodles.png'],
    category: 'Millet Noodles',
    stock: 45,
    rating: 4.8,
    reviewsCount: 120,
    isOrganic: true,
    isLabTested: true,
    unit: '180g Pack',
  },
  {
    id: 'new-prod-millets',
    name: 'Unpolished Foxtail Millet',
    nameTamil: 'தீட்டப்படாத தினை அரிசி',
    description: 'High-fiber heirloom foxtail millets, rich in copper and magnesium. Direct from sustainable tribal farms.',
    descriptionTamil: 'இயற்கை முறையில் விளைவிக்கப்பட்ட சத்து நிறைந்த தீட்டப்படாத தினை அரிசி.',
    price: 160,
    originalPrice: 210,
    images: ['/images/category-millets.png'],
    category: 'Millets & Grains',
    stock: 38,
    rating: 4.9,
    reviewsCount: 76,
    isOrganic: true,
    isLabTested: true,
    unit: '500g Eco Pouch',
  },
];

export const NewArrivals: React.FC<NewArrivalsProps> = ({ onQuickView }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    apiClient
      .get('/api/v1/cms/products?limit=8&sortBy=createdAt&sortOrder=desc')
      .then((res) => {
        if (
          res?.data?.products &&
          Array.isArray(res.data.products) &&
          res.data.products.length > 0
        ) {
          const mapped = res.data.products.map(mapProductToFrontend);
          setProducts(mapped);
        } else {
          setProducts(fallbackNewArrivals);
        }
      })
      .catch((err) => {
        console.warn(
          'Backend new arrivals unavailable, using fallback:',
          err?.message || err
        );
        setProducts(fallbackNewArrivals);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAddToCart = (product: ProductType) => {
    addItem(product, 1);
    const displayName =
      currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    toast.cart(displayName);
  };

  const handleWishlistToggle = (product: ProductType) => {
    const wasWishlisted = hasItem(product.id);
    toggleItem(product);
    const displayName =
      currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
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

  const sectionTitle =
    currentLang === 'ta' ? 'புதிய தயாரிப்புகள்' : 'NEW ARRIVAL PRODUCT';
  const sectionSubtitle =
    currentLang === 'ta'
      ? 'வடிவமும், செயல்பாடும் மற்றும் உத்வேகமும் இணைந்த புதிய தேர்வுகள்'
      : 'Hand-picked to blend form, function, and inspiration';

  return (
    <section
      id="new-arrivals"
      className="w-full py-12 lg:py-16 bg-white dark:bg-neutral-950 font-sans transition-colors duration-normal"
    >
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black uppercase tracking-tight text-neutral-900 dark:text-white leading-tight">
              {sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-normal">
              {sectionSubtitle}
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous new arrivals"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next new arrivals"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Carousel Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-[22px] bg-[#F1F1F3] dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 p-4 sm:p-5 flex flex-col justify-between h-[360px] animate-pulse"
              >
                <div className="w-full aspect-square rounded-2xl bg-neutral-200 dark:bg-neutral-800 mb-4" />
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden w-full" ref={emblaRef}>
            <div className="flex gap-5 sm:gap-6 py-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-[0_0_80%] sm:flex-[0_0_46%] md:flex-[0_0_31%] lg:flex-[0_0_calc(25%-18px)] min-w-0"
                >
                  <ProductShowcaseCard
                    product={product}
                    badgeText="New Arrival"
                    badgeTamilText="புதிய வரவு"
                    onQuickView={onQuickView}
                    onAddToCart={handleAddToCart}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={hasItem(product.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
