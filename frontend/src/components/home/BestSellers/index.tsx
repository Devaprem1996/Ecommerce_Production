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

interface BestSellersProps {
  onQuickView: (product: ProductType) => void;
}

// Authentic database-backed best sellers with real slugs and studio photography
const fallbackBestsellers: ProductType[] = [
  {
    id: 'prod-sesame-oil',
    slug: 'wood-pressed-sesame-oil',
    name: 'Wood Pressed Sesame Oil',
    nameTamil: 'மரச்செக்கு நல்லெண்ணெய்',
    description: 'Traditional wood-pressed golden sesame oil extracted from native heirloom sesame seeds. 100% unrefined.',
    descriptionTamil: 'வாகை மரச்செக்கில் பிழியப்பட்ட பாரம்பரிய தூய நல்லெண்ணெய்.',
    price: 449,
    originalPrice: 549,
    images: ['/images/bestseller-sesame-oil.jpg'],
    category: 'Traditional Oils',
    stock: 40,
    rating: 5.0,
    reviewsCount: 240,
    isOrganic: true,
    isLabTested: true,
    unit: '500ML',
  },
  {
    id: 'prod-wild-honey',
    slug: 'natural-wild-honey',
    name: 'Natural Wild Honey',
    nameTamil: 'சுத்தமான காட்டுத் தேன்',
    description: '100% pure raw mountain honey collected from wild deep forest hives. Naturally crystallized, enzyme-rich.',
    descriptionTamil: 'ஆழ்காட்டு மலை தேன்கூடுகளிலிருந்து சேகரிக்கப்பட்ட 100% தூய காட்டுத் தேன்.',
    price: 499,
    originalPrice: 649,
    images: ['/images/bestseller-raw-honey.jpg'],
    category: 'Natural Sweeteners & Salts',
    stock: 30,
    rating: 4.9,
    reviewsCount: 195,
    isOrganic: true,
    isLabTested: true,
    unit: '500GM',
  },
  {
    id: 'prod-groundnut-oil',
    slug: 'wood-pressed-groundnut-oil',
    name: 'Wood Pressed Groundnut Oil',
    nameTamil: 'மரச்செக்கு கடலை எண்ணெய்',
    description: 'Cold-pressed unrefined native peanut oil extracted in traditional Vaagai wood churner. Sweet aroma.',
    descriptionTamil: 'பாரம்பரிய மரச்செக்கில் பிழியப்பட்ட மணம் நிறைந்த தூய கடலை எண்ணெய்.',
    price: 399,
    originalPrice: 489,
    images: ['/images/bestseller-groundnut-oil.jpg'],
    category: 'Traditional Oils',
    stock: 35,
    rating: 5.0,
    reviewsCount: 215,
    isOrganic: true,
    isLabTested: true,
    unit: '500ML',
  },
  {
    id: 'prod-jaggery-powder',
    slug: 'sugarcane-jaggery-powder',
    name: 'Sugarcane Jaggery Powder',
    nameTamil: 'நாட்டு சர்க்கரை',
    description: 'Natural unrefined golden jaggery powder made from chemical-free organic sugarcane juice.',
    descriptionTamil: 'ரசாயனம் சேர்க்காத கரும்புச்சாற்றில் தயாரிக்கப்பட்ட ஆரோக்கிய நாட்டுச்சர்க்கரை.',
    price: 140,
    originalPrice: 180,
    images: ['/images/bestseller-jaggery-powder.jpg'],
    category: 'Natural Sweeteners & Salts',
    stock: 50,
    rating: 4.9,
    reviewsCount: 180,
    isOrganic: true,
    isLabTested: true,
    unit: '1KG',
  },
  {
    id: 'prod-palm-jaggery',
    slug: 'palm-jaggery-round',
    name: 'Palm Jaggery Round',
    nameTamil: 'பனங்கருப்பட்டி',
    description: 'Authentic traditional palm jaggery (Karupatti) cakes, rich in iron, minerals, and calcium.',
    descriptionTamil: 'பாரம்பரிய தூய உடனே சுடப்பட்ட சத்துக்கள் நிறைந்த பனங்கருப்பட்டி.',
    price: 320,
    originalPrice: 390,
    images: ['/images/bestseller-palm-jaggery.jpg'],
    category: 'Natural Sweeteners & Salts',
    stock: 28,
    rating: 5.0,
    reviewsCount: 165,
    isOrganic: true,
    isLabTested: true,
    unit: '500GM',
  },
  {
    id: 'prod-black-rice',
    slug: 'karupu-kavuni-rice-boiled',
    name: 'Karupu Kavuni Rice Boiled',
    nameTamil: 'கருப்பு கவுனி அரிசி',
    description: 'Ancient emperor black rice loaded with anthocyanin antioxidants and high fiber vitality.',
    descriptionTamil: 'ஆரோக்கியமும் நோய் எதிர்ப்பு சக்தியும் தரும் பாரம்பரிய கருப்பு கவுனி அரிசி.',
    price: 210,
    originalPrice: 260,
    images: ['/images/bestseller-karupu-kavuni.jpg'],
    category: 'Traditional Heritage Rices',
    stock: 45,
    rating: 4.9,
    reviewsCount: 142,
    isOrganic: true,
    isLabTested: true,
    unit: '1KG',
  },
];

export const BestSellers: React.FC<BestSellersProps> = ({ onQuickView }) => {
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
      .get('/api/v1/cms/products?limit=50')
      .then((res) => {
        if (
          res?.data?.products &&
          Array.isArray(res.data.products) &&
          res.data.products.length > 0
        ) {
          const mapped = res.data.products.map(mapProductToFrontend);
          // Match real best-seller slugs from DB
          const bestSellerSlugs = [
            'wood-pressed-sesame-oil',
            'natural-wild-honey',
            'wood-pressed-groundnut-oil',
            'sugarcane-jaggery-powder',
            'palm-jaggery-round',
            'karupu-kavuni-rice-boiled',
            'wood-pressed-coconut-oil',
            'seeraga-samba-fully-polished-boiled',
          ];
          const matched = bestSellerSlugs
            .map((slug) => mapped.find((p: ProductType) => p.slug === slug))
            .filter((p): p is ProductType => Boolean(p));

          if (matched.length >= 4) {
            setProducts(matched);
          } else {
            setProducts(mapped.slice(0, 8));
          }
        } else {
          setProducts(fallbackBestsellers);
        }
      })
      .catch((err) => {
        console.warn('Backend products unavailable, using authentic fallback:', err?.message || err);
        setProducts(fallbackBestsellers);
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
    currentLang === 'ta' ? 'அதிகம் விற்பனையாகும் தயாரிப்புகள்' : 'BEST SELLER';
  const sectionSubtitle =
    currentLang === 'ta'
      ? 'வாடிக்கையாளர்களால் அதிகம் விரும்பப்பட்ட சிறந்த தேர்வுகள்'
      : 'Hand-picked authentic farm essentials direct from ethical growers';

  return (
    <section
      id="best-sellers"
      className="w-full py-12 lg:py-16 bg-white dark:bg-neutral-950 font-sans transition-colors duration-normal border-t border-neutral-100/80 dark:border-neutral-800/40"
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
              aria-label="Previous best sellers"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white hover:text-neutral-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next best sellers"
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
                    badgeText="Best Seller"
                    badgeTamilText="பெஸ்ட் செல்லர்"
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
