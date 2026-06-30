"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { 
  ChevronRight, 
  Star, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Heart, 
  Share2, 
  MapPin, 
  Loader2, 
  Check,
  X,
  Truck,
  Calendar,
  AlertCircle,
  Award,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import { mockProducts } from '@/constants/mockData';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StarRating } from '@/components/ui/StarRating';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import { ProductType } from '@/types';
import { slugify, getProductBySlug } from '@/utils/slugify';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  commentTamil?: string;
  date: string;
  verified: boolean;
}

// Generate realistic mock reviews for a product
const generateMockReviews = (product: ProductType): ReviewItem[] => {
  return [
    {
      id: 'rev-1',
      name: 'Priya Krishnan',
      rating: 5,
      comment: `Absolutely fresh and high quality! You can immediately feel the difference from store-bought ones.`,
      commentTamil: `மிகவும் புதிய மற்றும் உயர்தரமானது! கடையில் வாங்கும் தயாரிப்புகளிலிருந்து வித்தியாசத்தை உடனடியாக உணர முடியும்.`,
      date: 'June 28, 2026',
      verified: true,
    },
    {
      id: 'rev-2',
      name: 'Suresh Kumar',
      rating: 4,
      comment: `Very good product. Packing was environment friendly and delivery was fast. Slightly pricey but worth the quality.`,
      commentTamil: `மிக நல்ல தயாரிப்பு. பேக்கிங் சுற்றுச்சூழல் நட்புடன் இருந்தது மற்றும் விநியோகம் வேகமாக இருந்தது. சற்று விலை அதிகம் ஆனால் தரத்திற்கு மதிப்புள்ளது.`,
      date: 'June 24, 2026',
      verified: true,
    },
    {
      id: 'rev-3',
      name: 'Anitha Raj',
      rating: 5,
      comment: `My family loved the quality. We are regular buyers now. The organic authenticity is clear.`,
      commentTamil: `எனது குடும்பத்தினர் இதன் தரத்தை விரும்பினர். நாங்கள் இப்போது வழக்கமான வாங்குபவர்களாக மாறிவிட்டோம். இதன் இயற்கை சுவை தெளிவாக தெரிகிறது.`,
      date: 'June 18, 2026',
      verified: true,
    },
  ];
};

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function ProductDetail({ params }: PageProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  // Resolve params
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      setSlug(resolved.slug);
    });
  }, [params]);

  // Retrieve Product
  const product = useMemo(() => {
    if (!slug) return null;
    return getProductBySlug(slug);
  }, [slug]);

  // Redirect to 404 if product not found after slug is resolved
  useEffect(() => {
    if (slug && !product) {
      notFound();
    }
  }, [slug, product]);

  // Loading state until slug is resolved and product is checked
  if (!slug || !product) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return <ProductDetailContent product={product} currentLang={currentLang} t={t} router={router} />;
}

interface ContentProps {
  product: ProductType;
  currentLang: string;
  t: any;
  router: any;
}

function ProductDetailContent({ product, currentLang, t, router }: ContentProps) {
  // Cart & Wishlist hooks
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  // Reference to reviews section for smooth scroll
  const reviewsRef = useRef<HTMLDivElement>(null);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'usage' | 'reviews'>('description');
  
  // Interactive Size/Weight options
  const sizeOptions = useMemo(() => {
    if (product.unit.toLowerCase().includes('kg') || product.unit.toLowerCase().includes('g')) {
      return ['250g', '500g', '1kg'];
    }
    if (product.unit.toLowerCase().includes('l') || product.unit.toLowerCase().includes('ml')) {
      return ['250ml', '500ml', '1L'];
    }
    if (product.unit.toLowerCase().includes('item') || product.unit.toLowerCase().includes('pc')) {
      return ['6 items', '12 items'];
    }
    return [product.unit];
  }, [product]);
  const [selectedSize, setSelectedSize] = useState(product.unit);

  // Calculate price modifier based on selected size
  const sizePriceModifier = useMemo(() => {
    if (selectedSize === product.unit) return 1;
    if (selectedSize === '250g' || selectedSize === '250ml') return 0.3;
    if (selectedSize === '500g' || selectedSize === '500ml') return 0.55;
    if (selectedSize === '1kg' || selectedSize === '1L') return 1.0;
    if (selectedSize === '6 items') return 1.0;
    if (selectedSize === '12 items') return 1.8;
    return 1;
  }, [selectedSize, product.unit]);

  const activePrice = Math.round(product.price * sizePriceModifier);
  const originalPrice = Math.round(activePrice * 1.25);
  const discountPercent = 20;

  // Pincode Validator States
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'typing' | 'loading' | 'success' | 'failed' | 'error'>('idle');
  const [pincodeResult, setPincodeResult] = useState<{ available: boolean; estimatedDays?: number; city?: string } | null>(null);

  // Reviews States
  const [reviews, setReviews] = useState<ReviewItem[]>(() => generateMockReviews(product));
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | null>(null);
  
  // Write a Review Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load last checked pincode from sessionStorage
  useEffect(() => {
    const savedPincode = sessionStorage.getItem('lastCheckedPincode');
    if (savedPincode && /^\d{6}$/.test(savedPincode)) {
      setPincode(savedPincode);
      validatePincode(savedPincode);
    }
  }, []);

  // Auto-validate pincode when length is 6
  useEffect(() => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      validatePincode(pincode);
    } else if (pincode.length > 0 && pincode.length < 6) {
      setPincodeStatus('typing');
    } else if (pincode.length === 0) {
      setPincodeStatus('idle');
    }
  }, [pincode]);

  const validatePincode = async (code: string) => {
    setPincodeStatus('loading');
    try {
      const res = await fetch(`/api/pincode/${code}`);
      if (res.ok) {
        const data = await res.json();
        setPincodeResult(data);
        if (data.available) {
          setPincodeStatus('success');
          sessionStorage.setItem('lastCheckedPincode', code);
        } else {
          setPincodeStatus('failed');
        }
      } else {
        setPincodeStatus('failed');
      }
    } catch (e) {
      setPincodeStatus('error');
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Digits only
    if (val.length <= 6) {
      setPincode(val);
    }
  };

  const handleAddToCart = () => {
    const modifiedProduct = {
      ...product,
      price: activePrice,
      unit: selectedSize
    };
    addItem(modifiedProduct, quantity);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    toast.cart(`${displayName} (${quantity})`);
  };

  const handleBuyNow = () => {
    const modifiedProduct = {
      ...product,
      price: activePrice,
      unit: selectedSize
    };
    addItem(modifiedProduct, quantity);
    router.push('/cart');
  };

  const handleWishlistToggle = () => {
    const wasWishlisted = hasItem(product.id);
    toggleItem(product);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
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

  const handleShareProduct = () => {
    const url = window.location.href;
    const title = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    if (navigator.share) {
      navigator.share({
        title,
        text: `Check out this organic product: ${title}`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success(currentLang === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
    }
  };

  // Reviews Computations
  const reviewsFiltered = useMemo(() => {
    if (reviewRatingFilter === null) return reviews;
    return reviews.filter(r => r.rating === reviewRatingFilter);
  }, [reviews, reviewRatingFilter]);

  const ratingSummary = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;
    reviews.forEach(r => {
      counts[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
      totalScore += r.rating;
    });
    const average = reviews.length > 0 ? (totalScore / reviews.length).toFixed(1) : '0.0';
    return { counts, average, total: reviews.length };
  }, [reviews]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      toast.warning(currentLang === 'ta' ? 'அனைத்து விவரங்களையும் நிரப்பவும்' : 'Please fill all fields');
      return;
    }
    setIsSubmittingReview(true);
    setTimeout(() => {
      const newRev: ReviewItem = {
        id: `rev-${Date.now()}`,
        name: newReviewName,
        rating: newReviewRating,
        comment: newReviewComment,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        verified: true
      };
      setReviews(prev => [newRev, ...prev]);
      setIsSubmittingReview(false);
      setIsReviewModalOpen(false);
      setNewReviewName('');
      setNewReviewComment('');
      setNewReviewRating(5);
      toast.success(t('product.review_success', 'Thank you! Your review has been submitted.'));
    }, 800);
  };

  const scrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Related products (4 of the same category, excluding current product)
  const relatedProducts = useMemo(() => {
    return mockProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
  const displayDesc = currentLang === 'ta' && product.descriptionTamil ? product.descriptionTamil : product.description;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 transition-colors duration-normal">
      {/* Breadcrumb Header */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center flex-wrap gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-primary-500 transition-colors">
              {t('shop.breadcrumb_shop', 'Shop')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/shop?category=${slugify(product.category)}`} className="hover:text-primary-500 transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none max-w-[200px] truncate">
              {displayName}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-4 sm:p-8 shadow-sm">
          
          {/* Left Column: Image Gallery (Grid layout for responsive) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Interactive Zoomable Image */}
            <div className="relative aspect-square w-full rounded-feature border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 overflow-hidden flex items-center justify-center group">
              <Zoom>
                <img
                  src={product.images[activeImageIndex] || '/placeholder.png'}
                  alt={displayName}
                  className="object-cover w-full h-full cursor-zoom-in transition-transform duration-normal hover:scale-102"
                />
              </Zoom>

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isOrganic && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-primary-500 px-3 py-1 rounded-badge shadow-md">
                    <Leaf className="w-4 h-4" />
                    {t('badge.organic', '100% Organic')}
                  </span>
                )}
                {product.isLabTested && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#0284C7] px-3 py-1 rounded-badge shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                    {t('trust.lab_tested', 'Lab Tested')}
                  </span>
                )}
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <span className="text-white text-base font-bold uppercase tracking-widest bg-error px-5 py-2.5 rounded-badge shadow-lg">
                    {t('badge.sold-out', 'Sold Out')}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails strip below */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 aspect-square rounded-card overflow-hidden border-2 bg-neutral-50 dark:bg-neutral-850 flex-shrink-0 cursor-pointer transition-all ${
                      activeImageIndex === idx
                        ? 'border-primary-500 shadow-md ring-2 ring-primary-500/15'
                        : 'border-neutral-200 dark:border-neutral-750 hover:border-neutral-400'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${idx}`} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specifications & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Category Pill */}
              <Link
                href={`/shop?category=${slugify(product.category)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest bg-primary-500/10 px-3 py-1 rounded-badge hover:bg-primary-500/20 transition-colors"
              >
                {product.category}
              </Link>

              {/* Title & Share */}
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
                  {displayName}
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareProduct}
                    className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 cursor-pointer transition-colors"
                    title={t('product.share', 'Share Product')}
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2.5 rounded-full border cursor-pointer transition-colors ${
                      hasItem(product.id)
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-500'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                    title={hasItem(product.id) ? t('product.wishlist_remove', 'Remove') : t('product.wishlist_add', 'Add')}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${hasItem(product.id) && 'fill-current'}`} />
                  </button>
                </div>
              </div>

              {/* Reviews rating clicker */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-secondary-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-250 dark:text-neutral-750'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={scrollToReviews}
                  className="text-xs sm:text-sm font-semibold text-primary-500 hover:underline hover:text-primary-400 transition-colors"
                >
                  {reviews.length}{' '}
                  {reviews.length === 1 
                    ? t('product.reviews_count', 'review') 
                    : t('product.reviews_count_plural', 'reviews')}
                </button>
              </div>

              {/* Price display */}
              <div className="flex flex-col gap-0.5 bg-neutral-50 dark:bg-neutral-850/60 p-4 rounded-feature border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-xs text-neutral-600 line-through">
                    ₹{originalPrice}
                  </span>
                  <span className="text-3xl font-black text-[#2D6A4F] dark:text-[#52B788] tracking-tight">
                    ₹{activePrice}
                  </span>
                  <span className="text-[10px] font-bold text-white bg-error px-2 py-0.5 rounded-badge uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-500 uppercase tracking-wider">
                  {t('product.taxes_inclusive', 'Inclusive of all taxes')}
                </span>
              </div>

              {/* Weight Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                  {t('product.uom', 'Select Size')}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedSize(opt)}
                      className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-badge transition-colors border cursor-pointer ${
                        selectedSize === opt
                          ? 'bg-primary-500 text-white border-primary-500 shadow-md ring-2 ring-primary-500/10'
                          : 'bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-700 text-neutral-850 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pincode Validator */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-feature p-4 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <span>{t('pincode.title', 'Check Delivery Availability')}</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={handlePincodeChange}
                    placeholder={t('pincode.placeholder', 'Enter 6-digit Pincode')}
                    className="flex-1 text-sm font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button
                    variant="primary"
                    onClick={() => validatePincode(pincode)}
                    disabled={pincode.length !== 6 || pincodeStatus === 'loading'}
                    className="text-xs font-bold min-w-[80px]"
                    leftIcon={pincodeStatus === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                  >
                    {pincodeStatus === 'loading' ? t('pincode.checking', 'Checking') : t('pincode.check', 'Check')}
                  </Button>
                </div>

                {/* Status messages */}
                <AnimatePresence mode="wait">
                  {pincodeStatus === 'success' && pincodeResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs space-y-1.5 pt-1"
                    >
                      <div className="flex items-center gap-1.5 text-success font-semibold">
                        <Check className="w-4 h-4" />
                        <span>{t('pincode.available', { pincode })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-400 font-medium pl-5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        <span>{t('pincode.expected', { days: pincodeResult.estimatedDays })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-750 dark:text-neutral-450 font-bold pl-5">
                        <Truck className="w-3.5 h-3.5 text-primary-500" />
                        <span>{t('pincode.free_info', 'Free Delivery (order ₹499+)')}</span>
                      </div>
                    </motion.div>
                  )}

                  {pincodeStatus === 'failed' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-error font-semibold flex items-center gap-1.5 pt-1 animate-shake"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('pincode.failed', 'Sorry, we do not deliver to this area yet')}</span>
                    </motion.div>
                  )}

                  {pincodeStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-error font-semibold flex items-center gap-1.5 pt-1 animate-shake"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('pincode.error', 'Something went wrong, please try again')}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quantity selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 py-2">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest select-none">
                    {t('product.quantity', 'Quantity')}:
                  </span>
                  <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-card bg-neutral-50 dark:bg-neutral-850">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2.5 hover:text-primary-500 text-neutral-650 dark:text-neutral-450 transition-colors focus:outline-none cursor-pointer min-w-[40px] flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold px-3 text-neutral-850 dark:text-white select-none w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="p-2.5 hover:text-primary-500 text-neutral-650 dark:text-neutral-450 transition-colors focus:outline-none cursor-pointer min-w-[40px] flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Cart Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Button
                  variant="cta"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 font-bold text-base bg-gradient-to-r from-primary-500 to-primary-700 text-white"
                  leftIcon={<ShoppingBag className="w-5 h-5" />}
                >
                  {t('product.add_to_cart', 'Add to Cart')}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 font-bold text-base border-neutral-200 dark:border-neutral-850 text-neutral-850 dark:text-white"
                >
                  {t('product.buy_now', 'Buy Now')}
                </Button>
              </div>

            </div>

            {/* Trust Badges Section */}
            <div className="grid grid-cols-3 gap-2.5 pt-8 mt-8 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex flex-col items-center justify-center p-3 rounded-card bg-neutral-50 dark:bg-neutral-850/40 text-center">
                <Award className="w-6 h-6 text-primary-500 mb-1" />
                <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider line-clamp-1">
                  {t('product.trust_badge_organic', '100% Organic')}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-card bg-neutral-50 dark:bg-neutral-850/40 text-center">
                <ShieldCheck className="w-6 h-6 text-primary-500 mb-1" />
                <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider line-clamp-1">
                  {t('product.trust_badge_tested', 'Lab Tested')}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-card bg-neutral-50 dark:bg-neutral-850/40 text-center">
                <Leaf className="w-6 h-6 text-primary-500 mb-1" />
                <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider line-clamp-1">
                  {t('product.trust_badge_farm', 'Direct Farm')}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Tab Description / Specification / Usage / Reviews Section */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature mt-12 p-4 sm:p-8 shadow-sm">
          
          {/* Tab Headers */}
          <div className="flex border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto pb-px">
            {(['description', 'nutrition', 'usage', 'reviews'] as const).map(tab => {
              const label = 
                tab === 'description' ? t('product.description', 'Description') :
                tab === 'nutrition' ? t('product.nutrition', 'Nutrition') :
                tab === 'usage' ? t('product.how_to_use', 'How to Use') :
                t('product.reviews', 'Reviews');
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative px-6 py-4 font-bold text-sm tracking-wide uppercase transition-colors whitespace-nowrap cursor-pointer focus:outline-none"
                >
                  <span className={activeTab === tab ? 'text-primary-500' : 'text-neutral-600 dark:text-neutral-400'}>
                    {label}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="pt-8">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4 text-sm sm:text-base text-neutral-650 dark:text-neutral-300 leading-relaxed max-w-4xl"
                >
                  <p className="font-semibold text-lg text-neutral-900 dark:text-white">
                    {displayName} - {product.category}
                  </p>
                  <p>{displayDesc}</p>
                  <p>
                    {currentLang === 'ta'
                      ? 'எங்கள் பொருட்கள் அனைத்தும் தூய்மையான இயற்கை உரம் கொண்டு உற்பத்தி செய்யப்படுகின்றன. ரசாயனங்கள் மற்றும் செயற்கை சேர்க்கைகள் இல்லாதவை. நேரடியாக விளை நிலங்களிலிருந்து உங்களை வந்தடைகிறது.'
                      : 'Our organic selection is cultivated with organic methods, keeping soil fertility intact. Rich in essential minerals and vitamins, this is the finest choice for your family\'s dietary requirements.'}
                  </p>
                </motion.div>
              )}

              {activeTab === 'nutrition' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="max-w-xl"
                >
                  <div className="border border-neutral-100 dark:border-neutral-800 rounded-feature overflow-hidden shadow-inner">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-neutral-50 dark:bg-neutral-850 font-bold text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        <tr>
                          <th className="px-6 py-3">{currentLang === 'ta' ? 'ஊட்டச்சத்து' : 'Nutrient'}</th>
                          <th className="px-6 py-3">{currentLang === 'ta' ? 'அளவு (100g)' : 'Amount per 100g'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-semibold text-neutral-800 dark:text-neutral-300">
                        <tr>
                          <td className="px-6 py-3">{currentLang === 'ta' ? 'ஆற்றல் (Energy)' : 'Energy'}</td>
                          <td className="px-6 py-3">35 kcal</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-3">{currentLang === 'ta' ? 'கார்போஹைட்ரேட்' : 'Carbohydrate'}</td>
                          <td className="px-6 py-3">8.2 g</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-3">{currentLang === 'ta' ? 'புரதம்' : 'Protein'}</td>
                          <td className="px-6 py-3">1.2 g</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-3">{currentLang === 'ta' ? 'கொழுப்பு' : 'Fat'}</td>
                          <td className="px-6 py-3">0.2 g</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-3">{currentLang === 'ta' ? 'நார்ச்சத்து' : 'Dietary Fiber'}</td>
                          <td className="px-6 py-3">1.5 g</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-3">{currentLang === 'ta' ? 'வைட்டமின் சி' : 'Vitamin C'}</td>
                          <td className="px-6 py-3">14% DV</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'usage' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4 text-sm text-neutral-650 dark:text-neutral-300 leading-relaxed max-w-4xl"
                >
                  <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    {currentLang === 'ta' ? 'பயன்பாட்டு முறைகள்:' : 'Storage & Usage Rules:'}
                  </h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{currentLang === 'ta' ? 'குளிர்ந்த மற்றும் உலர்ந்த இடத்தில் வைக்கவும்.' : 'Keep in a cool, dry place away from direct sunlight.'}</li>
                    <li>{currentLang === 'ta' ? 'பயன்படுத்துவதற்கு முன் சுத்தமான நீரில் கழுவவும்.' : 'Rinse thoroughly under running water before cooking or consumption.'}</li>
                    <li>{currentLang === 'ta' ? 'தயாரிப்பின் தரத்தை நீடிக்க காற்று புகாத கொள்கலனில் சேமிக்கவும்.' : 'For maximum shelf-life, transfer spices/honey to airtight containers.'}</li>
                    <li>{currentLang === 'ta' ? '100% இயற்கை பொருள் என்பதால் நிறம் அல்லது அளவில் சிறு வேறுபாடுகள் இருக்கலாம்.' : 'As a naturally grown organic product, minor variance in size/color may happen.'}</li>
                  </ul>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  ref={reviewsRef}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-8"
                >
                  {/* Reviews Summary Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-neutral-50 dark:bg-neutral-850/40 p-6 rounded-feature border border-neutral-100 dark:border-neutral-800">
                    
                    {/* Score column */}
                    <div className="md:col-span-4 text-center space-y-1">
                      <h4 className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">
                        {t('product.review_summary', 'Rating Summary')}
                      </h4>
                      <div className="text-5xl font-black text-neutral-905 dark:text-white">
                        {ratingSummary.average}
                      </div>
                      <div className="flex justify-center text-secondary-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(Number(ratingSummary.average)) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold block">
                        Based on {ratingSummary.total} reviews
                      </span>
                    </div>

                    {/* Bar chart column */}
                    <div className="md:col-span-5 space-y-2">
                      {[5, 4, 3, 2, 1].map(stars => {
                        const count = ratingSummary.counts[stars as 1 | 2 | 3 | 4 | 5] || 0;
                        const percentage = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-3 text-xs sm:text-sm">
                            <button
                              onClick={() => setReviewRatingFilter(reviewRatingFilter === stars ? null : stars)}
                              className={`flex items-center gap-0.5 w-12 font-bold cursor-pointer transition-colors ${
                                reviewRatingFilter === stars ? 'text-primary-500' : 'text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              <span>{stars}</span>
                              <Star className="w-3.5 h-3.5 fill-current text-secondary-400" />
                            </button>
                            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percentage}%` }}
                                className="h-full bg-primary-500 rounded-full transition-all duration-normal"
                              />
                            </div>
                            <span className="w-8 text-right font-bold text-neutral-600 dark:text-neutral-400">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action column */}
                    <div className="md:col-span-3 text-center md:text-right">
                      <Button
                        variant="primary"
                        onClick={() => setIsReviewModalOpen(true)}
                        className="font-bold text-sm"
                      >
                        {t('product.write_review', 'Write a Review')}
                      </Button>
                    </div>

                  </div>

                  {/* Reviews List and Filter Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                        {reviewRatingFilter 
                          ? `${reviewRatingFilter} Star Reviews (${reviewsFiltered.length})` 
                          : `All Reviews (${reviews.length})`}
                      </h4>
                      {reviewRatingFilter !== null && (
                        <button
                          onClick={() => setReviewRatingFilter(null)}
                          className="text-xs font-semibold text-primary-500 hover:underline"
                        >
                          Clear Filter
                        </button>
                      )}
                    </div>

                    {reviewsFiltered.length === 0 ? (
                      <div className="text-center py-10 text-neutral-600">
                        No reviews found for this rating filter.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {reviewsFiltered.map(rev => (
                          <div key={rev.id} className="py-6 first:pt-0 last:pb-0 flex flex-col gap-2 font-sans">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                                  {rev.name}
                                </span>
                                {rev.verified && (
                                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-badge">
                                    {t('testimonials.verified', 'Verified Buyer')}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-neutral-600 dark:text-neutral-500 font-medium">
                                {rev.date}
                              </span>
                            </div>

                            <div className="flex text-secondary-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-neutral-200 dark:text-neutral-800'}`}
                                />
                              ))}
                            </div>

                            <p className="text-sm text-neutral-650 dark:text-neutral-300 leading-relaxed mt-1">
                              {currentLang === 'ta' && rev.commentTamil ? rev.commentTamil : rev.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 dark:text-white">
                {t('product.related_products', 'Related Products')}
              </h2>
              <div className="h-1 w-12 bg-primary-500 rounded-full" />
            </div>

            {/* Grid display with horizontal scroll snap on mobile */}
            <div className="flex gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-x-visible scroll-smooth scrollbar-thin">
              {relatedProducts.map(p => (
                <div key={p.id} className="w-[280px] sm:w-[320px] lg:w-auto flex-shrink-0 flex">
                  <ProductCard
                    product={p}
                    onAddToCart={(item) => {
                      addItem(item);
                      const displayName = currentLang === 'ta' && item.nameTamil ? item.nameTamil : item.name;
                      toast.cart(displayName);
                    }}
                    onWishlistToggle={(item) => {
                      const wasWishlisted = hasItem(item.id);
                      toggleItem(item);
                      const displayName = currentLang === 'ta' && item.nameTamil ? item.nameTamil : item.name;
                      if (!wasWishlisted) {
                        toast.success(currentLang === 'ta' ? `${displayName} விருப்பப்பட்டியலில் சேர்க்கப்பட்டது!` : `${displayName} added to wishlist!`);
                      } else {
                        toast.info(currentLang === 'ta' ? `${displayName} விருப்பப்பட்டியலில் இருந்து நீக்கப்பட்டது` : `${displayName} removed from wishlist`);
                      }
                    }}
                    isWishlisted={hasItem(p.id)}
                    onClick={() => router.push(`/shop/${slugify(p.name)}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Write a Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        size="md"
        title={t('product.write_review', 'Write a Review')}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-5 py-2 font-sans">
          
          {/* Star selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
              {t('product.review_stars', 'Select Rating')}:
            </label>
            <div className="flex gap-1.5 text-secondary-400">
              {[1, 2, 3, 4, 5].map(stars => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setNewReviewRating(stars)}
                  className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                  aria-label={`Select ${stars} Stars`}
                >
                  <Star className={`w-7 h-7 ${stars <= newReviewRating ? 'fill-current' : 'text-neutral-250 dark:text-neutral-750'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
              {t('product.review_name', 'Your Name')}:
            </label>
            <input
              type="text"
              required
              value={newReviewName}
              onChange={(e) => setNewReviewName(e.target.value)}
              placeholder="e.g. Priyan K."
              className="w-full text-sm font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Comment textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
              {t('product.review_comment', 'Comment')}:
            </label>
            <textarea
              required
              rows={4}
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              placeholder="Share your thoughts about this organic product..."
              className="w-full text-sm font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingReview}
              leftIcon={isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isSubmittingReview ? 'Submitting...' : t('product.review_submit', 'Submit')}
            </Button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
