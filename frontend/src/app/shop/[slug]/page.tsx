"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import gsap from 'gsap';
import { 
  ChevronRight, 
  Star, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Loader2, 
  Check, 
  ShieldCheck, 
  Leaf, 
  Award, 
  Truck, 
  Clock, 
  ChevronDown,
  Quote,
  Sparkles,
  HelpCircle,
  PackageCheck
} from 'lucide-react';
import { mockProducts } from '@/constants/mockData';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PincodeChecker } from '@/components/ui/PincodeChecker';
import { StickyMobileBottomBar } from '@/components/ui/StickyMobileBottomBar';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import { ProductType, ProductVariantType } from '@/types';
import { slugify } from '@/utils/slugify';
import apiClient from '@/lib/apiClient';
import { mapProductToFrontend } from '@/utils/apiMapper';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  commentTamil?: string;
  date: string;
  verified: boolean;
}

// Generate realistic verified customer reviews for this product
const generateMockReviews = (product: ProductType): ReviewItem[] => {
  return [
    {
      id: 'rev-1',
      name: 'Priya Krishnan',
      rating: 5,
      comment: `The aroma and purity of this ${product.name} are truly unmatched. You can immediately feel the traditional quality difference compared to store-bought alternatives!`,
      commentTamil: `இந்த தயாரிப்பின் நறுமணமும் தூய்மையும் ஈடு இணையற்றது. வழக்கமான கடைகளில் வாங்குவதை விட பாரம்பரிய தரத்தை உடனடியாக உணர முடிகிறது!`,
      date: 'June 28, 2026',
      verified: true,
    },
    {
      id: 'rev-2',
      name: 'Suresh Kumar',
      rating: 5,
      comment: `Exceptional packaging with 100% biodegradable materials. Delivered in under 24 hours. The authentic South Indian taste is remarkable.`,
      commentTamil: `சுற்றுச்சூழல் நட்பு பேக்கேஜிங் மற்றும் மிக விரைவான டெலிவரி. அசல் தென்னிந்திய பாரம்பரிய சுவை மிகவும் அருமை.`,
      date: 'June 24, 2026',
      verified: true,
    },
    {
      id: 'rev-3',
      name: 'Anitha Raj',
      rating: 4,
      comment: `Having QR-verified lab test certificates gives me total peace of mind for our kids. My entire family loves the freshness.`,
      commentTamil: `ஆய்வக சோதனை சான்றிதழ்கள் இருப்பது குழந்தைகளுக்கு கொடுக்கும் போது மன அமைதியைத் தருகிறது. என் குடும்பத்தினர் அனைவரும் விரும்புகின்றனர்.`,
      date: 'June 18, 2026',
      verified: true,
    },
    {
      id: 'rev-4',
      name: 'Karthik Subramanian',
      rating: 5,
      comment: `Pure, unadulterated, and honestly sourced. We have switched our entire daily cooking to Yathu Arokiyagam. Highly recommended!`,
      commentTamil: `முற்றிலும் தூய்மையானது, எந்தவித கலப்படமும் இல்லாதது. எங்கள் வீட்டு சமையல் முழுவதையும் யாத்து ஆரோக்கியகத்திற்கு மாற்றிவிட்டோம்!`,
      date: 'June 12, 2026',
      verified: true,
    },
  ];
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetail({ params }: PageProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  // Resolve params
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    params.then((resolved) => {
      setSlug(resolved.slug);
    });
  }, [params]);

  // Fetch products from API (fallback to mock data) so real DB products resolve
  const [dbProducts, setDbProducts] = useState<ProductType[]>([]);
  const [singleProduct, setSingleProduct] = useState<ProductType | null>(null);
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    // Fetch the single product directly by slug first for exact variants
    apiClient.get(`/api/v1/cms/products/${slug}`)
      .then((res) => {
        const raw = res?.data?.product || res?.data?.data?.product;
        if (raw) {
          setSingleProduct(mapProductToFrontend(raw));
        }
      })
      .catch(() => {
        // Silently fallback to catalog list
      });

    apiClient.get('/api/v1/cms/products', { params: { limit: '100' } })
      .then((res) => {
        if (res?.data?.products && Array.isArray(res.data.products)) {
          setDbProducts(res.data.products.map(mapProductToFrontend));
        } else {
          setDbProducts(mockProducts);
        }
      })
      .catch(() => {
        setDbProducts(mockProducts);
      })
      .finally(() => {
        setIsProductsLoaded(true);
      });
  }, [slug]);

  // Retrieve Product
  const product = useMemo(() => {
    if (!slug) return null;
    if (singleProduct) return singleProduct;
    const source = dbProducts.length > 0 ? dbProducts : mockProducts;
    return source.find((p) => slugify(p.name) === slug);
  }, [slug, singleProduct, dbProducts]);

  // Redirect to 404 if product not found after slug is resolved
  useEffect(() => {
    if (slug && isProductsLoaded && !product) {
      notFound();
    }
  }, [slug, isProductsLoaded, product]);

  // Loading state until slug is resolved and product is checked
  if (!slug || !isProductsLoaded || !product) {
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

  // References
  const reviewsSectionRef = useRef<HTMLDivElement>(null);
  const addToCartBtnRef = useRef<HTMLButtonElement>(null);
  const buyNowBtnRef = useRef<HTMLButtonElement>(null);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('highlights');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Variants list: prioritize real variants if present, otherwise create fallback variant from product
  const variants: ProductVariantType[] = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [
      {
        id: 'default',
        name: product.unit || 'Standard Pack',
        price: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        sku: `YA-${product.id.slice(-6).toUpperCase()}`,
      },
    ];
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantType>(() => {
    return variants[0];
  });

  // Keep selected variant in sync if variants change
  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [variants]);

  const activePrice = selectedVariant.price;
  const originalPrice = selectedVariant.originalPrice;
  const activeStock = selectedVariant.stock;
  const activeUnit = selectedVariant.name;
  const activeSku = selectedVariant.sku || `YA-${product.id.slice(-6).toUpperCase()}`;

  const discountPercent = useMemo(() => {
    if (originalPrice && originalPrice > activePrice) {
      return Math.round(((originalPrice - activePrice) / originalPrice) * 100);
    }
    return 0;
  }, [originalPrice, activePrice]);

  // Reviews States
  const [reviews, setReviews] = useState<ReviewItem[]>(() => generateMockReviews(product));
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | null>(null);

  // Write a Review Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // GSAP Magnetic button effect
  useEffect(() => {
    const btns = [addToCartBtnRef.current, buyNowBtnRef.current].filter(Boolean) as HTMLButtonElement[];
    const cleanupFns: Array<() => void> = [];

    btns.forEach((btn) => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.25, ease: 'power2.out' });
      };

      const handleMouseLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      };

      btn.addEventListener('mousemove', handleMouseMove);
      btn.addEventListener('mouseleave', handleMouseLeave);
      cleanupFns.push(() => {
        btn.removeEventListener('mousemove', handleMouseMove);
        btn.removeEventListener('mouseleave', handleMouseLeave);
        gsap.killTweensOf(btn);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  const handleAddToCart = () => {
    if (activeStock <= 0) return;
    const modifiedProduct: ProductType = {
      ...product,
      id: selectedVariant.id !== 'default' ? `${product.id}__var__${selectedVariant.id}` : product.id,
      name: variants.length > 1 ? `${product.name} (${selectedVariant.name})` : product.name,
      price: activePrice,
      originalPrice: originalPrice,
      stock: activeStock,
      unit: activeUnit,
      selectedVariantId: selectedVariant.id !== 'default' ? selectedVariant.id : undefined,
    };
    addItem(modifiedProduct, quantity);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    const variantLabel = variants.length > 1 ? ` - ${selectedVariant.name}` : '';
    toast.cart(`${displayName}${variantLabel} (${quantity})`);
  };

  const handleBuyNow = () => {
    if (activeStock <= 0) return;
    const modifiedProduct: ProductType = {
      ...product,
      id: selectedVariant.id !== 'default' ? `${product.id}__var__${selectedVariant.id}` : product.id,
      name: variants.length > 1 ? `${product.name} (${selectedVariant.name})` : product.name,
      price: activePrice,
      originalPrice: originalPrice,
      stock: activeStock,
      unit: activeUnit,
      selectedVariantId: selectedVariant.id !== 'default' ? selectedVariant.id : undefined,
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
        text: `Explore 100% authentic organic ${title} from Yathu Arokiyagam`,
        url,
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
    const average = reviews.length > 0 ? (totalScore / reviews.length).toFixed(1) : '4.8';
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
        verified: true,
      };
      setReviews(prev => [newRev, ...prev]);
      setIsSubmittingReview(false);
      setIsReviewModalOpen(false);
      setNewReviewName('');
      setNewReviewComment('');
      setNewReviewRating(5);
      toast.success(t('product.review_success', 'Thank you! Your review has been submitted.'));
    }, 600);
  };

  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Related products from the same category
  const relatedProducts = useMemo(() => {
    return mockProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
  const displayDesc = currentLang === 'ta' && product.descriptionTamil ? product.descriptionTamil : product.description;

  // Organic Product FAQs based purely on tracked product nature
  const productFaqs = [
    {
      q: currentLang === 'ta' ? 'இந்த தயாரிப்பு எவ்வாறு பாதுகாப்பாக சேமிக்கப்பட வேண்டும்?' : 'How should I store this organic product for maximum freshness?',
      a: currentLang === 'ta' 
        ? 'நேரடி சூரிய ஒளி படாத, குளிர்ந்த மற்றும் உலர்ந்த இடத்தில் காற்றுப் புகாத கொள்கலனில் சேமித்து வைக்கவும்.'
        : 'Store in an airtight container in a cool, dry place away from direct sunlight and heat to preserve natural nutrients and aroma.',
    },
    {
      q: currentLang === 'ta' ? 'இது 100% ரசாயனம் இல்லாதது மற்றும் ஆய்வகத்தில் பரிசோதிக்கப்பட்டதா?' : 'Is this product 100% chemical-free and lab-tested?',
      a: currentLang === 'ta'
        ? 'ஆம்! எங்கள் அனைத்து பொருட்களும் FSSAI தரநிலைகளின்படி NABL அங்கீகாரம் பெற்ற ஆய்வகங்களில் கடுமையான பூச்சிக்கொல்லி எச்ச பரிசோதனைக்கு உட்படுத்தப்படுகின்றன.'
        : 'Yes! Every harvest batch is rigorously tested in NABL-accredited laboratories for purity, zero pesticides, and zero synthetic preservatives.',
    },
    {
      q: currentLang === 'ta' ? 'டெலிவரி எவ்வளவு விரைவாக செய்யப்படும்?' : 'How quickly is my order dispatched and delivered?',
      a: currentLang === 'ta'
        ? 'ஆர்டர் செய்யப்பட்ட 24 மணி நேரத்திற்குள் நேரடியாக தென்னிந்திய பண்ணை கிடங்கிலிருந்து பாதுகாப்பாக அனுப்பி வைக்கப்படுகிறது.'
        : 'Orders are freshly packaged and dispatched within 24 hours directly from our South Indian collection centers in eco-friendly protective packaging.',
    },
  ];

  // Pastel accent backgrounds for the customer review cards matching Image 1
  const pastelCardStyles = [
    'bg-[#FFEBE5] dark:bg-rose-950/30 border-rose-200/70 dark:border-rose-800/40 text-neutral-850 dark:text-neutral-100 -rotate-1',
    'bg-[#FEF3C7] dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-800/40 text-neutral-850 dark:text-neutral-100 rotate-1',
    'bg-[#E0F2FE] dark:bg-sky-950/30 border-sky-200/70 dark:border-sky-800/40 text-neutral-850 dark:text-neutral-100 -rotate-0.5',
    'bg-[#EDE9FE] dark:bg-violet-950/30 border-violet-200/70 dark:border-violet-800/40 text-neutral-850 dark:text-neutral-100 rotate-1',
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0D0E] font-sans pb-24 transition-colors duration-300">
      
      {/* 1. Sleek Breadcrumb Navigation */}
      <div className="w-full bg-white dark:bg-[#0E1214] border-b border-neutral-200/70 dark:border-neutral-800/80 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center flex-wrap gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link href="/shop" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('shop.breadcrumb_shop', 'Shop')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link 
              href={`/shop?category=${slugify(product.category)}`} 
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-primary-600 dark:text-primary-400 truncate max-w-[200px]">
              {displayName}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Main Product Showcase Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 rounded-[28px] p-5 sm:p-8 lg:p-10 shadow-xs">
          
          {/* Left Column: Product Gallery (Matching Image 1 & Image 2) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Main Interactive Zoomable Image Card */}
            <div className="relative aspect-square w-full rounded-[24px] border border-neutral-200/70 dark:border-neutral-800 bg-[#F4F4F2] dark:bg-[#161B1E] overflow-hidden flex items-center justify-center group shadow-xs">
              <Zoom>
                <motion.img
                  key={activeImageIndex}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  src={product.images[activeImageIndex] || '/images/placeholder.svg'}
                  alt={displayName}
                  className="object-contain w-full h-full p-4 sm:p-6 cursor-zoom-in transition-transform duration-300 group-hover:scale-103"
                />
              </Zoom>

              {/* Status Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                {product.isOrganic && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-primary-600/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>{t('badge.organic', '100% Organic')}</span>
                  </span>
                )}
                {product.isLabTested && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-[#0284C7]/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('trust.lab_tested', 'Lab Tested')}</span>
                  </span>
                )}
              </div>

              {/* Sold Out Banner */}
              {activeStock === 0 && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex items-center justify-center z-15">
                  <span className="text-white text-sm sm:text-base font-bold uppercase tracking-widest bg-red-600 px-6 py-2.5 rounded-full shadow-xl">
                    {t('badge.sold-out', 'Sold Out')}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Multi-Image Selector) */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 aspect-square rounded-[16px] overflow-hidden border-2 bg-[#F4F4F2] dark:bg-[#161B1E] flex-shrink-0 cursor-pointer transition-all duration-200 ${
                      activeImageIndex === idx
                        ? 'border-primary-600 dark:border-primary-400 ring-2 ring-primary-500/20 scale-102 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="object-contain w-full h-full p-1.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Guaranteed Quality Micro-Bar */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-neutral-50 dark:bg-[#14181B] border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Dispatch within 24h</span>
              </span>
              <span className="h-3 w-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="flex items-center gap-1.5 font-medium">
                <PackageCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>100% Eco Packaging</span>
              </span>
              <span className="h-3 w-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Zero Preservatives</span>
              </span>
            </div>

          </div>

          {/* Right Column: Title, Specs, Options, Actions (Matching Image 1 & Image 2) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="space-y-5">
              
              {/* Category & SKU Line */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Link
                  href={`/shop?category=${slugify(product.category)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest bg-primary-50 dark:bg-primary-950/60 px-3 py-1 rounded-full border border-primary-200/60 dark:border-primary-800/60 hover:bg-primary-100 transition-colors"
                >
                  {product.category}
                </Link>
                <span className="text-[11px] font-mono font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  SKU: {activeSku}
                </span>
              </div>

              {/* Title & Action Buttons */}
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white leading-[1.15] tracking-tight">
                  {displayName}
                </h1>
                
                {/* Wishlist & Share Pills */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleShareProduct}
                    className="p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                    title={t('product.share', 'Share Product')}
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                      hasItem(product.id)
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-500'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                    title={hasItem(product.id) ? t('product.wishlist_remove', 'Remove') : t('product.wishlist_add', 'Add')}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${hasItem(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Rating Clicker & In-Stock Status */}
              <div className="flex items-center flex-wrap gap-3">
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 underline-offset-4 group-hover:underline transition-colors">
                    {product.rating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </button>

                <span className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />

                {activeStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {activeStock <= 5 ? `Only ${activeStock} left in stock` : 'In Stock • Ready to Dispatch'}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    Currently Unavailable
                  </span>
                )}
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#161B1E] border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-3xl sm:text-4xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                  ₹{activePrice}
                </span>
                {originalPrice && originalPrice > activePrice && (
                  <span className="text-base text-neutral-400 line-through font-medium">
                    ₹{originalPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-extrabold text-white bg-red-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
                <span className="text-xs font-semibold text-neutral-500 ml-auto">
                  / {activeUnit} • Inclusive of all taxes
                </span>
              </div>

              {/* Variant / Pack Size Selector (Matching Image 1's pill buttons) */}
              {variants.length > 1 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">
                      {t('product.uom', 'Select Pack Size')}:
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                      Selected: <strong className="text-neutral-900 dark:text-white">{selectedVariant.name}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {variants.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      const isOutOfStock = v.stock === 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }}
                          className={`flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                              : isOutOfStock
                              ? 'bg-neutral-100 dark:bg-neutral-850 text-neutral-400 border-neutral-200 dark:border-neutral-800 opacity-60 line-through cursor-not-allowed'
                              : 'bg-white dark:bg-[#161B1E] border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <span>{v.name}</span>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-white/20 dark:bg-black/10 text-white dark:text-neutral-900'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}>
                            ₹{v.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Real-time Delivery Pincode Checker */}
              <div className="pt-1">
                <PincodeChecker className="w-full" />
              </div>

              {/* Quantity Stepper & CTA Buttons (Matching Image 1 & Image 2) */}
              <div className="space-y-4 pt-2">
                {activeStock > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">
                      {t('product.quantity', 'Quantity')}:
                    </span>
                    <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-[#161B1E] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer min-w-[40px] flex items-center justify-center focus:outline-none"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold px-3 text-neutral-900 dark:text-white select-none w-9 text-center font-mono">
                        {String(quantity).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(activeStock, q + 1))}
                        className="p-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer min-w-[40px] flex items-center justify-center focus:outline-none"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                {activeStock > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      ref={addToCartBtnRef}
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-neutral-950 bg-[#FACC15] hover:bg-[#EAB308] active:scale-98 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('product.add_to_cart', 'Add to Cart')} — ₹{activePrice * quantity}</span>
                    </button>
                    <button
                      ref={buyNowBtnRef}
                      type="button"
                      onClick={handleBuyNow}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-primary-600 hover:bg-primary-700 active:scale-98 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span>{t('product.buy_now', 'Buy Now')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 rounded-xl font-bold text-base bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                  >
                    {t('badge.sold-out', 'Sold Out')}
                  </button>
                )}
              </div>

              {/* Secure Payment Methods Trust Row (Matching Image 2) */}
              <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Guaranteed Safe & Secure Checkout
                </span>
                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">UPI</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">RUPAY</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">CARDS</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">COD</span>
                </div>
              </div>

              {/* Expandable Accordions for Details (Matching Image 2) */}
              <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800 border-t border-neutral-200/70 dark:border-neutral-800 pt-2">
                
                {/* Accordion 1: Product Highlights */}
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === 'highlights' ? null : 'highlights')}
                    className="w-full py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                  >
                    <span>Product Highlights</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openAccordion === 'highlights' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordion === 'highlights' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pb-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2"
                      >
                        <p>{displayDesc}</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Category: <strong>{product.category}</strong></li>
                          <li>100% Traditional wood-pressed / natural processing</li>
                          <li>No chemical refining, bleaching, or deodorizing</li>
                          <li>Pack size: {activeUnit}</li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 2: Storage & Care Instructions */}
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === 'storage' ? null : 'storage')}
                    className="w-full py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                  >
                    <span>Storage & Care Instructions</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openAccordion === 'storage' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordion === 'storage' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pb-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed"
                      >
                        <p>Keep in a cool, dry place away from direct sunlight. To ensure maximum shelf-life and preserve pure aromas, store in an airtight glass or stainless-steel container after opening.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 3: Shipping & Delivery Guarantee */}
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                    className="w-full py-3.5 flex items-center justify-between text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                  >
                    <span>Shipping & Delivery Guarantee</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openAccordion === 'shipping' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pb-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-1.5"
                      >
                        <p>✓ Dispatched within 24 hours of ordering.</p>
                        <p>✓ 100% biodegradable, protective transit packaging to eliminate transit breakage.</p>
                        <p>✓ Easy replacement or refund guarantee in case of any damage.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. Checkered Patterned Divider (Exact Reference Element from Image 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-14 sm:my-16">
        <div 
          className="w-full h-5 sm:h-6 rounded-md opacity-90 border border-neutral-300 dark:border-neutral-700 bg-[repeating-linear-gradient(45deg,#111827_0px,#111827_10px,#F3F4F6_10px,#F3F4F6_20px)] dark:bg-[repeating-linear-gradient(45deg,#F3F4F6_0px,#F3F4F6_10px,#111827_10px,#111827_20px)]"
          aria-hidden="true"
        />
      </div>

      {/* 4. Customer Reviews Section (Recreating "WHAT OUR CUSTOMERS SAY" from Image 1) */}
      <div ref={reviewsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Rating Dashboard */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-neutral-900 dark:text-white uppercase tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
              Verified experiences and ratings from real organic wellness enthusiasts.
            </p>
          </div>

          {/* Rating Summary + Share Thought Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            {/* Big Score Breakdown */}
            <div className="flex items-center gap-4">
              <div className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white leading-none">
                {ratingSummary.average}
                <span className="text-xl sm:text-2xl text-neutral-400 font-semibold">/5</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-neutral-500">
                  Based on {reviews.length} reviews
                </span>
              </div>
            </div>

            {/* Share Thought CTA Card (Matching Image 1's "Share your sweet thought") */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161B1E] border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col items-center text-center max-w-xs">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-1">
                Share your honest thought
              </span>
              <p className="text-[11px] text-neutral-500 leading-tight mb-3">
                Your feedback helps our organic farmers continue crafting the purest harvests!
              </p>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Write a Review
              </button>
            </div>

          </div>
        </div>

        {/* Rating Breakdown Progress Bars (Clickable to Filter) */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 py-4 border-y border-neutral-200/70 dark:border-neutral-800">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingSummary.counts[stars as 1 | 2 | 3 | 4 | 5] || 0;
            const percentage = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;
            const isSelected = reviewRatingFilter === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setReviewRatingFilter(isSelected ? null : stars)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40'
                    : 'border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-[#121618] hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                    {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>
                  <span className="text-neutral-500">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-300"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Pastel Floating Review Cards Grid (Exact Style from Image 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {reviewsFiltered.map((rev, idx) => {
            const cardStyle = pastelCardStyles[idx % pastelCardStyles.length];
            return (
              <motion.div
                key={rev.id}
                whileHover={{ y: -6, rotate: 0, transition: { duration: 0.25 } }}
                className={`p-6 rounded-[24px] border shadow-xs flex flex-col justify-between transition-transform duration-300 ${cardStyle}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Quote className="w-6 h-6 opacity-40 fill-current" />
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'opacity-30'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-medium leading-relaxed italic line-clamp-4">
                    &ldquo;{currentLang === 'ta' && rev.commentTamil ? rev.commentTamil : rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">
                      {rev.name}
                    </span>
                    <span className="text-[10px] opacity-75 mt-0.5">
                      {rev.date}
                    </span>
                  </div>

                  {rev.verified && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/40 text-emerald-700 dark:text-emerald-300">
                      Verified
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Reviews Button */}
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FACC15] hover:bg-[#EAB308] text-neutral-900 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            {showAllReviews ? 'Collapse Reviews' : 'View All Reviews'}
          </button>
        </div>

        {/* Extended Review List (When expanded) */}
        {showAllReviews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-[#121618] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            {reviewsFiltered.map(r => (
              <div key={r.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{r.name}</span>
                  <span className="text-xs text-neutral-400">{r.date}</span>
                </div>
                <div className="flex text-amber-400 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-neutral-300'}`} />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">{r.comment}</p>
              </div>
            ))}
          </motion.div>
        )}

      </div>

      {/* 5. Product FAQ Accordion Section (Recreating Image 1's FAQ section) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white uppercase tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-medium">
            Everything you need to know about our organic harvest sourcing and storage.
          </p>
        </div>

        <div className="space-y-3">
          {productFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121618] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm uppercase tracking-wider text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-transform ${openFaq === idx ? 'rotate-180 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Popular / Related Products Section (Recreating Image 1's "POPULAR SWEETS" grid) */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white uppercase tracking-tight">
              {t('product.related_products', 'Popular Organic Harvests')}
            </h2>
            <div className="h-1 w-16 bg-primary-600 rounded-full mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={(item) => {
                  addItem(item);
                  const dName = currentLang === 'ta' && item.nameTamil ? item.nameTamil : item.name;
                  toast.cart(dName);
                }}
                onWishlistToggle={(item) => {
                  const wasWishlisted = hasItem(item.id);
                  toggleItem(item);
                  const dName = currentLang === 'ta' && item.nameTamil ? item.nameTamil : item.name;
                  if (!wasWishlisted) {
                    toast.success(currentLang === 'ta' ? `${dName} விருப்பப்பட்டியலில் சேர்க்கப்பட்டது!` : `${dName} added to wishlist!`);
                  } else {
                    toast.info(currentLang === 'ta' ? `${dName} விருப்பப்பட்டியலில் இருந்து நீக்கப்பட்டது` : `${dName} removed from wishlist`);
                  }
                }}
                isWishlisted={hasItem(p.id)}
                onClick={() => router.push(`/shop/${slugify(p.name)}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 7. Write a Review Modal */}
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
            <div className="flex gap-1.5 text-amber-400">
              {[1, 2, 3, 4, 5].map(stars => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setNewReviewRating(stars)}
                  className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                  aria-label={`Select ${stars} Stars`}
                >
                  <Star className={`w-7 h-7 ${stars <= newReviewRating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`} />
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
              className="w-full text-sm font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
              placeholder="Share your experience about the purity, taste, and freshness of this organic harvest..."
              className="w-full text-sm font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
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

      {/* 8. Sticky Mobile Quick-Add & Buy Now Drawer */}
      <StickyMobileBottomBar
        product={product}
        selectedVariant={selectedVariant}
        activePrice={activePrice}
        originalPrice={originalPrice}
        activeStock={activeStock}
        displayName={displayName}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

    </div>
  );
}
