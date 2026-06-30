"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Camera, 
  MessageSquare,
  Sparkles,
  PlusCircle,
  ThumbsUp,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { toast } from '@/components/ui/Toast';
import 'aos/dist/aos.css';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  commentTamil: string;
  date: string;
  verified: boolean;
  photo?: string;
  likes: number;
}

const initialReviews: Review[] = [
  {
    id: 'rev-101',
    name: 'Priya Krishnan',
    rating: 5,
    comment: 'The organic Ragi flour and multi-floral honey are exceptional! Packaging was great, and I got my delivery in Chennai within 2 days.',
    commentTamil: 'இயற்கை ராகி மாவு மற்றும் தேன் மிகவும் அருமையாக உள்ளன! பேக்கேஜிங் சிறப்பாக இருந்தது, மேலும் சென்னையில் 2 நாட்களுக்குள் டெலிவரி கிடைத்தது.',
    date: 'June 28, 2026',
    verified: true,
    photo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300',
    likes: 24
  },
  {
    id: 'rev-102',
    name: 'Vijay Kumar',
    rating: 5,
    comment: 'Kuthiraivali Millet Pongal has become our default weekend breakfast. Highly clean grains with zero stones or dust.',
    commentTamil: 'குதிரைவாலி தினை பொங்கல் எங்களின் வார இறுதி காலை உணவாக மாறிவிட்டது. எந்தவொரு கற்களும் அல்லது தூசியும் இல்லாத மிகச் சுத்தமான தானியங்கள்.',
    date: 'June 25, 2026',
    verified: true,
    photo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=300',
    likes: 18
  },
  {
    id: 'rev-103',
    name: 'Devi S.',
    rating: 4,
    comment: 'Excellent A2 cow ghee. The aroma is very traditional. Deducted one star just because the courier took an extra day to deliver to Madurai.',
    commentTamil: 'சிறந்த A2 நெய். மணம் மிகவும் பாரம்பரியமாக உள்ளது. மதுரைக்கு டெலிவரி செய்ய ஒரு நாள் கூடுதலாக எடுத்துக்கொண்டதால் ஒரு நட்சத்திரத்தை குறைத்துள்ளேன்.',
    date: 'June 20, 2026',
    verified: true,
    likes: 9
  },
  {
    id: 'rev-104',
    name: 'Ramesh Raj',
    rating: 5,
    comment: 'Scan QR feature on the packs is brilliant. I was able to download the lab testing report for my batch of organic turmeric. Total trust!',
    commentTamil: 'பேக்குகளில் உள்ள QR ஸ்கேன் அம்சம் அருமையானது. எனது ஆர்கானிக் மஞ்சள் தூள் தொகுப்பிற்கான ஆய்வக சோதனை அறிக்கையை என்னால் பதிவிறக்கம் செய்ய முடிந்தது.',
    date: 'June 18, 2026',
    verified: true,
    photo: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=300',
    likes: 31
  },
  {
    id: 'rev-105',
    name: 'Anjali Menon',
    rating: 3,
    comment: 'Products are high quality but slightly expensive compared to local stores. Sourcing directly from farmers is good though.',
    commentTamil: 'தயாரிப்புகள் நல்ல தரம் வாய்ந்தவை ஆனால் உள்ளூர் கடைகளை விட சற்று விலை அதிகம். ஆனால் நேரடியாக விவசாயிகளிடம் இருந்து வாங்குவது நல்லது.',
    date: 'June 10, 2026',
    verified: false,
    likes: 5
  }
];

export default function ReviewsPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // AOS
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
    });
  }, []);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [showOnlyPhotos, setShowOnlyPhotos] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const reviewsPerPage = 4;

  // Form States for Write Review
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Sourcing rating stats dynamically
  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total > 0 ? (sum / total).toFixed(1) : '0';

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const ratingKey = r.rating as 5|4|3|2|1;
      if (distribution[ratingKey] !== undefined) {
        distribution[ratingKey]++;
      }
    });

    return { total, avg, distribution };
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchStar = starFilter === null || r.rating === starFilter;
      const matchPhoto = !showOnlyPhotos || !!r.photo;
      return matchStar && matchPhoto;
    });
  }, [reviews, starFilter, showOnlyPhotos]);

  // Paginated reviews
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return filteredReviews.slice(start, start + reviewsPerPage);
  }, [filteredReviews, currentPage]);

  const handleLike = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
    toast.success('Thanks for voting!');
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newComment) {
      toast.warning('Please fill in Name and Comment.');
      return;
    }

    const newRev: Review = {
      id: 'rev-' + Math.floor(Math.random() * 10000),
      name: newName,
      rating: newRating,
      comment: newComment,
      commentTamil: newComment,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verified: true,
      likes: 0,
      photo: newPhotoUrl.trim() !== '' ? newPhotoUrl : undefined
    };

    setReviews([newRev, ...reviews]);
    toast.success('Your review has been successfully posted!');
    setWriteModalOpen(false);

    // Reset Form
    setNewName('');
    setNewRating(5);
    setNewComment('');
    setNewPhotoUrl('');
  };

  const handleStarFilterClick = (stars: number) => {
    if (starFilter === stars) {
      setStarFilter(null);
    } else {
      setStarFilter(stars);
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
            <Link href="/" className="hover:text-primary-500 transition-colors uppercase tracking-wider">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 dark:text-white uppercase tracking-wider">
              Reviews
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-2">
          <h1 className="text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            {t('reviews_page.title', 'Customer Stories & Reviews')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            {t('reviews_page.subtitle', 'See how pure organic food is transforming lives across South India.')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
        
        {/* Top Summary Block & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Rating Summary Card (4 cols) */}
          <div className="md:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="font-bold text-xs text-neutral-500 uppercase tracking-wider">Overall Rating</h3>
            <div className="space-y-1">
              <span className="text-5xl font-black text-neutral-900 dark:text-white font-heading">{stats.avg}</span>
              <span className="text-sm font-semibold text-neutral-500 block">out of 5</span>
            </div>
            <StarRating rating={parseFloat(stats.avg)} />
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-450">
              Based on {stats.total} certified reviews
            </span>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setWriteModalOpen(true)}
              className="w-full font-bold text-xs"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              {t('reviews_page.write_cta', 'Share Your Story')}
            </Button>
          </div>

          {/* Star Distribution row controls (5 cols) */}
          <div className="md:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-850 pb-2">
              Filter by Star Rating
            </h3>

            <div className="space-y-2">
              {([5, 4, 3, 2, 1] as const).map(stars => {
                const count = stats.distribution[stars] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const isSelected = starFilter === stars;

                return (
                  <div
                    key={stars}
                    onClick={() => handleStarFilterClick(stars)}
                    className={`flex items-center gap-3 text-xs cursor-pointer p-1.5 rounded-card transition-colors ${
                      isSelected
                        ? 'bg-primary-500/10 text-primary-500 font-black'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-600 dark:text-neutral-400 font-semibold'
                    }`}
                  >
                    <span className="w-12 text-right flex items-center gap-1 justify-end">
                      {stars} <Star className="w-3.5 h-3.5 fill-current" />
                    </span>
                    <div className="flex-1 h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-slow"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-neutral-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Reviews check filter (3 cols) */}
          <div className="md:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-850 pb-2">
              Refine Media
            </h3>

            <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyPhotos}
                onChange={() => { setShowOnlyPhotos(!showOnlyPhotos); setCurrentPage(1); }}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-500 focus:ring-primary-500"
              />
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-primary-500" />
                {t('reviews_page.photo_title', 'Only Photo Reviews')}
              </span>
            </label>

            {(starFilter !== null || showOnlyPhotos) && (
              <button
                onClick={() => { setStarFilter(null); setShowOnlyPhotos(false); }}
                className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline block pt-2"
              >
                Clear Active Filters ×
              </button>
            )}
          </div>

        </div>

        {/* Photo review thumbnails slider section (if showOnlyPhotos is not active, we still show a gorgeous strip of images) */}
        {!showOnlyPhotos && (
          <div className="space-y-4" data-aos="fade-up">
            <h3 className="font-black text-xs text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-primary-500" />
              <span>Customer Gallery</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {reviews.filter(r => !!r.photo).map(r => (
                <div key={r.id} className="relative rounded-card overflow-hidden h-28 bg-neutral-100 group border cursor-pointer">
                  <img src={r.photo} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-[10px] font-bold text-white leading-tight">
                    {r.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          <h3 className="font-black text-xs text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary-500" />
            <span>Customer Feedback ({filteredReviews.length})</span>
          </h3>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginatedReviews.length > 0 ? (
                paginatedReviews.map((rev) => (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6"
                  >
                    {/* User Metadata & star (4 cols) */}
                    <div className="md:col-span-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">{rev.name}</span>
                        {rev.verified && (
                          <span className="inline-flex text-success" title="Verified Buyer">
                            <CheckCircle2 className="w-4 h-4 fill-success/10" />
                          </span>
                        )}
                      </div>
                      <StarRating rating={rev.rating} />
                      <p className="text-[10px] text-neutral-500 font-semibold">{rev.date}</p>
                      {rev.verified && (
                        <span className="text-[9px] font-bold text-success uppercase tracking-widest block">
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Comment text & photo (9 cols) */}
                    <div className="md:col-span-9 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="space-y-3.5 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {currentLang === 'ta' ? rev.commentTamil : rev.comment}
                        </p>
                        
                        <button
                          onClick={() => handleLike(rev.id)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-505 hover:text-primary-500 transition-colors uppercase tracking-widest cursor-pointer select-none bg-neutral-50 dark:bg-neutral-850 px-2.5 py-1 rounded-card border"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({rev.likes})</span>
                        </button>
                      </div>

                      {rev.photo && (
                        <div className="w-24 h-24 rounded-card overflow-hidden bg-neutral-100 flex-shrink-0 border self-start">
                          <img src={rev.photo} alt="Customer upload" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-12 text-center text-neutral-500 font-bold">
                  No reviews match the selected filters.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-card font-bold text-xs flex items-center justify-center cursor-pointer transition-colors ${
                    currentPage === i + 1
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:border-neutral-350'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* WRITE A REVIEW MODAL */}
      <AnimatePresence>
        {writeModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWriteModalOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl flex flex-col overflow-hidden z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                  Write Your Review
                </h3>
                <button onClick={() => setWriteModalOpen(false)} className="text-neutral-500 hover:text-primary-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleWriteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Rating (1-5 Stars) *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(stars => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setNewRating(stars)}
                        className="text-neutral-300 hover:text-amber-450 transition-colors"
                      >
                        <Star className={`w-7 h-7 cursor-pointer ${stars <= newRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Review Comment *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Attach Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full font-bold text-xs"
                >
                  Submit Review
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
