"use client";

import React, { useState } from 'react';
import '@/lib/i18n'; // Initialize i18n configuration
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Modal } from '@/components/ui/Modal';
import { ProductCard } from '@/components/ui/ProductCard';
import { toast } from '@/components/ui/Toast';
import { ProductType } from '@/types';
import { Globe, Heart, ShoppingBag, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export default function GalleryPage() {
  const { t, i18n } = useTranslation();
  const [currentRating, setCurrentRating] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
    toast.info(i18n.language === 'en' ? 'Language switched to English' : 'மொழி தமிழிற்கு மாற்றப்பட்டது');
  };

  const triggerLoading = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  const handleTestInput = (val: string) => {
    setInputValue(val);
    if (val.length > 0 && val.length < 5) {
      setInputError('Must be at least 5 characters');
    } else {
      setInputError('');
    }
  };

  // Mock Products
  const mockProduct1: ProductType = {
    id: 'prod-1',
    name: 'Wild Forest Organic Honey',
    nameTamil: 'காட்டு ஆர்கானிக் தேன்',
    description: 'Raw, unfiltered forest honey harvested sustainably from natural beehives.',
    descriptionTamil: 'இயற்கை தேன்கூடுகளிலிருந்து பெறப்பட்ட வடிகட்டப்படாத சுத்தமான தேன்.',
    price: 450,
    images: ['/honey-placeholder.jpg'], // Using a mock image, we will generate or use a placeholder
    category: 'Groceries',
    stock: 12,
    rating: 4.8,
    reviewsCount: 128,
    isOrganic: true,
    isLabTested: true,
    unit: '500g',
  };

  const mockProduct2: ProductType = {
    id: 'prod-2',
    name: 'Pure Cow Ghee',
    nameTamil: 'சுத்தமான பசு நெய்',
    description: 'Traditional A2 cow ghee made using the ancient Bilona method.',
    descriptionTamil: 'பண்டைய பிலோனா முறையில் தயாரிக்கப்பட்ட பாரம்பரிய ஏ2 பசு நெய்.',
    price: 650,
    images: ['/ghee-placeholder.jpg'],
    category: 'Dairy',
    stock: 0, // Sold out
    rating: 4.9,
    reviewsCount: 342,
    isOrganic: true,
    isLabTested: true,
    unit: '1L',
  };

  // Pre-generate some nice images for mock products using default tools or simple colorful boxes since we don't have images yet
  // We can override images with generic high-quality pics or use standard placeholders. For design, we'll put clean CSS colors/gradients if next/image errors out, but to ensure next/image loads correctly, we'll use a valid public domain unsplash image or placeholder.
  const honeyImage = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80';
  const gheeImage = 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=400&q=80';

  mockProduct1.images = [honeyImage];
  mockProduct2.images = [gheeImage];

  const handleAddToCart = (prod: ProductType) => {
    toast.cart(currentLang === 'ta' && prod.nameTamil ? prod.nameTamil : prod.name, {
      description: `Price: ₹${prod.price}`,
    });
  };

  const currentLang = i18n.language;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-8 font-sans transition-colors duration-normal">
      {/* Header bar */}
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary-500 font-bold">Design System</span>
          <h1 className="text-3xl font-bold font-heading text-primary-700 dark:text-primary-400 mt-1">Component Gallery</h1>
        </div>

        <Button variant="cta" onClick={toggleLanguage} leftIcon={<Globe className="w-4 h-4" />}>
          {currentLang === 'en' ? 'தமிழ்' : 'English'}
        </Button>
      </header>

      <main className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Section 1: Buttons */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            1. Button Component
          </h2>
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Variants</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="cta">CTA Gradient Button</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Sizes (Min height 44px on md+)</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button size="sm">Small (sm)</Button>
                <Button size="md">Medium (md)</Button>
                <Button size="lg">Large (lg)</Button>
                <Button size="xl">Extra Large (xl)</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">States & Interactions</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <Button isLoading={btnLoading} onClick={triggerLoading}>
                  {btnLoading ? 'Loading' : 'Click to Load'}
                </Button>
                <Button disabled>Disabled Button</Button>
                <Button leftIcon={<ShoppingBag className="w-5 h-5" />}>Left Icon</Button>
                <Button rightIcon={<Heart className="w-5 h-5 fill-current" />}>Right Icon</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Input */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            2. Input Component (Floating Labels & Error Shake)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <Input
              label="Full Name (Interactive Validation)"
              value={inputValue}
              onChange={(e) => handleTestInput(e.target.value)}
              error={inputError}
              success={inputValue.length >= 5}
            />
            <Input label="Email Address" type="email" placeholder="example@domain.com" />
            <Input label="Password Field" type="password" />
            <Input label="Phone Number" type="tel" success />
          </div>
        </section>

        {/* Section 3: Badges */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            3. Badge Component
          </h2>
          <div className="flex flex-wrap gap-4">
            <Badge variant="hot" />
            <Badge variant="new" />
            <Badge variant="discount" />
            <Badge variant="sold-out" />
            <Badge variant="organic" />
            <Badge variant="organic" label="Custom Label" />
          </div>
        </section>

        {/* Section 4: StarRating */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            4. StarRating Component
          </h2>
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Sizes & Display Modes</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs font-mono">Small (sm):</span>
                  <StarRating rating={4.3} size="sm" />
                  <span className="text-xs text-neutral-600">(4.3 Rating)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs font-mono">Medium (md):</span>
                  <StarRating rating={4.5} size="md" />
                  <span className="text-xs text-neutral-600">(4.5 Rating)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 text-xs font-mono">Large (lg):</span>
                  <StarRating rating={4.8} size="lg" />
                  <span className="text-xs text-neutral-600">(4.8 Rating)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Interactive Mode (Gold Wash Hover)</h3>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={currentRating}
                  interactive
                  onChange={setCurrentRating}
                  size="lg"
                />
                <span className="text-sm font-semibold">Rated: {currentRating} / 5</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Skeleton Loader */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            5. Skeleton Loader
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Text / Line loaders</h3>
              <div className="flex flex-col gap-2">
                <SkeletonLoader variant="text" className="w-full" />
                <SkeletonLoader variant="text" className="w-5/6" />
                <SkeletonLoader variant="text" className="w-2/3" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Image / Square loader</h3>
              <SkeletonLoader variant="image" className="w-32 rounded-feature" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Full Card Loader</h3>
              <SkeletonLoader variant="card" />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">Table Row Loader</h3>
            <SkeletonLoader variant="table-row" />
          </div>
        </section>

        {/* Section 6: Modal */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            6. Modal Component (Backdrop Blur & Esc Key)
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              onClick={() => {
                setModalSize('sm');
                setIsModalOpen(true);
              }}
            >
              Open Small Modal
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setModalSize('md');
                setIsModalOpen(true);
              }}
            >
              Open Medium Modal
            </Button>
            <Button
              variant="ghost"
              className="border border-primary-500"
              onClick={() => {
                setModalSize('lg');
                setIsModalOpen(true);
              }}
            >
              Open Large Modal
            </Button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size={modalSize}
            title={`${modalSize.toUpperCase()} Modal Title`}
          >
            <div className="flex flex-col gap-4">
              <p>This is a premium Modal component with backdrop blur overlay and spring transitions.</p>
              <p>It supports Esc key closing, backdrop click closing, and handles scroll locking automatically on body elements.</p>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Section 7: Product Card */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            7. ProductCard Component (Image Zoom, Hover Lift, Wishlist Bounce)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ProductCard
              product={mockProduct1}
              isWishlisted={isWishlisted}
              onWishlistToggle={() => {
                setIsWishlisted(!isWishlisted);
                toast.success(!isWishlisted ? 'Added to Wishlist' : 'Removed from Wishlist');
              }}
              onAddToCart={handleAddToCart}
              onQuickView={(prod) => {
                setModalSize('md');
                setIsModalOpen(true);
              }}
            />
            <ProductCard
              product={mockProduct2}
              onAddToCart={handleAddToCart}
              onQuickView={(prod) => {
                setModalSize('md');
                setIsModalOpen(true);
              }}
            />
          </div>
        </section>

        {/* Section 8: Toasts */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm mb-16">
          <h2 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            8. Toast Notifications (using Sonner)
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-success text-white hover:bg-success/90"
              onClick={() => toast.success('Order Placed Successfully!', { description: 'Your order ID is #12940' })}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Trigger Success Toast
            </Button>
            <Button
              className="bg-error text-white hover:bg-error/90"
              onClick={() => toast.error('Payment Failed!', { description: 'Please check your card details and try again.' })}
              leftIcon={<AlertCircle className="w-4 h-4" />}
            >
              Trigger Error Toast
            </Button>
            <Button
              className="bg-warning text-neutral-950 hover:bg-warning/90"
              onClick={() => toast.warning('Low Stock Alert', { description: 'Only 3 items remaining for this product!' })}
              leftIcon={<AlertTriangle className="w-4 h-4" />}
            >
              Trigger Warning Toast
            </Button>
            <Button
              className="bg-info text-white hover:bg-info/90"
              onClick={() => toast.info('Delivery Information', { description: 'Free delivery applies on order values above ₹499.' })}
              leftIcon={<Info className="w-4 h-4" />}
            >
              Trigger Info Toast
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
