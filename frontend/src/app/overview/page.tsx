"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Leaf, 
  Users, 
  Building2, 
  Calendar, 
  Search, 
  ShoppingCart, 
  Package, 
  Truck, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/Button";

function CountUp({ end, duration = 1500, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const startTime = performance.now();

    const updateCount = (now: number) => {
      if (!active) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress * (2 - progress); // Ease out quad
      const current = Math.floor(easeProgress * end);
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
    return () => {
      active = false;
    };
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function OverviewPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  // Testimonial quotes
  const testimonials = [
    {
      quote: currentLang === "ta" ? "“ஏத்தர் ஆர்கானிக் தயாரிப்புகளின் தரம் மிகவும் அற்புதம். உண்மையான பண்ணை சுவை!”" : "“The quality of Aether Organic products is outstanding. Authentic farm-fresh taste!”",
      author: currentLang === "ta" ? "கார்த்திக் ஆர்." : "Karthik R.",
      role: currentLang === "ta" ? "சரிபார்க்கப்பட்ட வாங்குபவர்" : "Verified Buyer",
      stars: 5
    },
    {
      quote: currentLang === "ta" ? "“இரசாயனமற்ற மற்றும் முற்றிலும் தூய்மையான தயாரிப்புகள். என் குடும்ப ஆரோக்கியத்திற்கு ஏற்றது.”" : "“Chemical-free and absolutely pure. Perfect for my family's wellness journey.”",
      author: currentLang === "ta" ? "மீனாட்சி எஸ்." : "Meenakshi S.",
      role: currentLang === "ta" ? "சரிபார்க்கப்பட்ட வாங்குபவர்" : "Verified Buyer",
      stars: 5
    },
    {
      quote: currentLang === "ta" ? "“விரைவான டெலிவரி மற்றும் தரமான பேக்கேஜிங். QR குறியீடு மூலம் லேப் ரிப்போர்ட்டைப் பார்க்க முடிகிறது.”" : "“Fast delivery and high-quality packaging. Love transparency with the QR lab reports!”",
      author: currentLang === "ta" ? "அருண் குமார்" : "Arun Kumar",
      role: currentLang === "ta" ? "சரிபார்க்கப்பட்ட வாங்குபவர்" : "Verified Buyer",
      stars: 5
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-0 transition-colors duration-normal">
      
      {/* 1. Page Hero */}
      <div className="w-full bg-gradient-to-br from-primary-800 to-primary-600 dark:from-primary-950 dark:to-primary-800 text-white py-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center h-[40vh] min-h-[300px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white/90">
            {t("overview.title", "What We're All About")}
          </span>
          <h1 className="text-3.5xl sm:text-5xl font-black font-heading text-white mt-4 tracking-tight leading-tight">
            {t("overview.title", "What We're All About")}
          </h1>
          <p className="text-sm sm:text-lg text-primary-100 font-medium max-w-2xl mx-auto mt-4 leading-relaxed">
            {t("overview.subtitle", "Connecting you directly with organic farms for healthy living.")}
          </p>
        </motion.div>
      </div>

      {/* 2. Brand Snapshot (Stats Section) */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            {/* Stat 1 */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-1"
            >
              <div className="text-3.5xl sm:text-5xl font-black font-heading text-primary-600 dark:text-primary-400">
                <CountUp end={500} suffix="+" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest">
                {t("overview.stats.products", "Products")}
              </p>
            </motion.div>

            {/* Stat 2 */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-1"
            >
              <div className="text-3.5xl sm:text-5xl font-black font-heading text-primary-600 dark:text-primary-400">
                <CountUp end={10000} suffix="+" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest">
                {t("overview.stats.customers", "Customers")}
              </p>
            </motion.div>

            {/* Stat 3 */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-1"
            >
              <div className="text-3.5xl sm:text-5xl font-black font-heading text-primary-600 dark:text-primary-400">
                <CountUp end={50} suffix="+" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest">
                {t("overview.stats.farmers", "Farmers")}
              </p>
            </motion.div>

            {/* Stat 4 */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-1"
            >
              <div className="text-3.5xl sm:text-5xl font-black font-heading text-primary-600 dark:text-primary-400">
                <CountUp end={5} />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-widest">
                {t("overview.stats.years", "Years")}
              </p>
            </motion.div>

          </div>
        </div>
      </div>

      {/* 3. Our Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-primary-100 dark:bg-primary-950/30 rounded-full flex items-center justify-center p-8">
              <Leaf className="w-32 h-32 text-primary-600 dark:text-primary-400 animate-pulse" />
              <div className="absolute top-4 left-4 w-6 h-6 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute bottom-8 right-8 w-4 h-4 bg-primary-500 rounded-full" />
            </div>
          </motion.div>

          {/* Right Text */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {t("overview.mission_title", "Our Organic Mission")}
            </span>
            <h2 className="text-2.5xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
              {currentLang === "ta" ? (
                <>இயற்கை உணவை <span className="text-primary-600 dark:text-primary-400">அனைவருக்கும்</span> கொண்டு சேர்க்கிறோம்</>
              ) : (
                <>Bringing <span className="text-primary-600 dark:text-primary-400">pure nutrition</span> directly to your table</>
              )}
            </h2>
            <p className="text-neutral-650 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
              {t("overview.mission_body", "We believe that healthy food should not be a luxury. By bypassing middlemen, we deliver certified organic and 100% lab-tested fresh farm products straight to your kitchen table. Our farming practices nurture the land and support rural agrarian livelihoods.")}
            </p>
            <div className="flex gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-white">
                <CheckCircle className="w-4.5 h-4.5 text-primary-500" />
                <span>Certified Organic</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-white">
                <CheckCircle className="w-4.5 h-4.5 text-primary-500" />
                <span>Zero Pesticides</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* 4. What We Offer (Categories) */}
      <div className="bg-white dark:bg-neutral-900 border-y border-neutral-100 dark:border-neutral-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white">
              {t("overview.what_we_offer", "What We Offer")}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-semibold uppercase tracking-wider mt-2">
              Explore Our Natural Harvest
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Category Card 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 border border-neutral-100 dark:border-neutral-800 rounded-feature bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="text-3xl">🌾</div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {currentLang === "ta" ? "தானியங்கள் & தினை" : "Grains & Millets"}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Traditional heritage rice varieties and high-fiber organic millets.
                </p>
              </div>
              <Link href="/shop?category=grains" className="inline-flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline mt-6">
                Browse Category <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Category Card 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 border border-neutral-100 dark:border-neutral-800 rounded-feature bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="text-3xl">🌶️</div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {currentLang === "ta" ? "தூய நறுமணப் பொருட்கள்" : "Pure Spices"}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Unadulterated native spices packed with essential oils and aroma.
                </p>
              </div>
              <Link href="/shop?category=spices" className="inline-flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline mt-6">
                Browse Category <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Category Card 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 border border-neutral-100 dark:border-neutral-800 rounded-feature bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="text-3xl">🫒</div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {currentLang === "ta" ? "மரச்செக்கு எண்ணெய்" : "Cold Pressed Oils"}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Slow-extracted seed oils without chemical refining or heat.
                </p>
              </div>
              <Link href="/shop?category=oils" className="inline-flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline mt-6">
                Browse Category <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Category Card 4 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 border border-neutral-100 dark:border-neutral-800 rounded-feature bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="text-3xl">🍯</div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {currentLang === "ta" ? "இயற்கை இனிப்புகள்" : "Natural Sweeteners"}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Raw wild forest honey, organic jaggery, and unrefined palm sugar.
                </p>
              </div>
              <Link href="/shop?category=sweeteners" className="inline-flex items-center gap-1 text-xs font-bold text-primary-500 hover:underline mt-6">
                Browse Category <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

      {/* 5. How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white">
            {t("overview.how_it_works", "How It Works")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-505 font-semibold uppercase tracking-wider mt-2">
            Seamless Farm to Kitchen Connection
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Horizontal dotted connector on desktop */}
          <div className="hidden md:block absolute left-12 right-12 top-10 h-0.5 border-t border-dashed border-neutral-250 dark:border-neutral-700 z-0" />

          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center relative z-10 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary-500 flex items-center justify-center shadow-md">
              <Search className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
              {t("overview.steps.step1", "Browse Products")}
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed max-w-[180px]">
              {t("overview.steps.step1_desc", "Explore our chemical-free seasonal selection.")}
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center relative z-10 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary-500 flex items-center justify-center shadow-md">
              <ShoppingCart className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
              {t("overview.steps.step2", "Add to Cart")}
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed max-w-[180px]">
              {t("overview.steps.step2_desc", "Select sizes and review your basket.")}
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center relative z-10 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary-500 flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
              {t("overview.steps.step3", "We Pack Fresh")}
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed max-w-[180px]">
              {t("overview.steps.step3_desc", "Insulated eco-friendly zero-waste packaging.")}
            </p>
          </motion.div>

          {/* Step 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center relative z-10 space-y-3"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary-500 flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6 text-primary-500" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
              {t("overview.steps.step4", "Delivered to You")}
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed max-w-[180px]">
              {t("overview.steps.step4_desc", "Safely delivered directly to your doorstep.")}
            </p>
          </motion.div>

        </div>
      </div>

      {/* 6. Our Values */}
      <div className="bg-neutral-100 dark:bg-neutral-900 border-y border-neutral-200/50 dark:border-neutral-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white">
              {t("overview.our_values", "Our Core Values")}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-semibold uppercase tracking-wider mt-2">
              Our Uncompromising Standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Value Card 1 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800/80 rounded-feature shadow-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                {t("overview.values.v1_title", "100% Organic")}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("overview.values.v1_desc", "Certified organic crops without toxic pesticides.")}
              </p>
            </motion.div>

            {/* Value Card 2 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800/80 rounded-feature shadow-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                {t("overview.values.v2_title", "Direct Farmers")}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("overview.values.v2_desc", "Empowering 50+ local growers with fair trade.")}
              </p>
            </motion.div>

            {/* Value Card 3 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 bg-white dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800/80 rounded-feature shadow-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                {t("overview.values.v3_title", "Lab Tested")}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("overview.values.v3_desc", "Every single batch is tested for purity.")}
              </p>
            </motion.div>

          </div>
        </div>
      </div>

      {/* 7. Mini Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white">
            {t("overview.reviews_title", "Customer Reviews")}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-semibold uppercase tracking-wider mt-2">
            Shared Experiences From Our Community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-yellow-500">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 stroke-none" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-350 italic leading-relaxed">
                  {t.quote}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <p className="font-bold text-xs text-neutral-900 dark:text-white">
                  {t.author}
                </p>
                <p className="text-[10px] text-neutral-500 font-semibold">
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/reviews" className="text-xs font-black text-primary-500 hover:text-primary-400 hover:underline uppercase tracking-wider">
            {t("overview.read_all_reviews", "Read All Reviews →")}
          </Link>
        </div>
      </div>

      {/* 8. CTA Section */}
      <div className="w-full bg-gradient-to-r from-primary-700 to-primary-650 dark:from-primary-950 dark:to-primary-850 text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4.5xl font-black font-heading text-white tracking-tight">
            {t("overview.ready_cta", "Ready to Eat Healthier?")}
          </h2>
          <p className="text-xs sm:text-sm text-primary-100 max-w-md mx-auto leading-relaxed">
            Order fresh, unadulterated, direct-farm organic foods shipped straight to your doorstep today.
          </p>
          <div className="pt-2">
            <Button
              variant="cta"
              size="lg"
              onClick={() => router.push("/shop")}
              className="bg-white hover:bg-neutral-100 text-primary-700 font-bold px-8 shadow-md"
              rightIcon={<ArrowRight className="w-4.5 h-4.5 text-primary-600" />}
            >
              {currentLang === "ta" ? "வாங்குங்கள் →" : "Shop Now"}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
