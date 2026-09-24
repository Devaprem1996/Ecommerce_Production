"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { 
  Sparkles, 
  Check, 
  X, 
  Flame, 
  ShieldCheck, 
  Heart, 
  ArrowRight, 
  SlidersHorizontal, 
  Layers, 
  Droplets, 
  AlertTriangle, 
  Award,
  Zap
} from 'lucide-react';
import clsx from 'clsx';

interface ComparisonFeature {
  id: string;
  categoryEn: string;
  categoryTa: string;
  pureEn: {
    title: string;
    description: string;
    metric: string;
  };
  pureTa: {
    title: string;
    description: string;
    metric: string;
  };
  refinedEn: {
    title: string;
    description: string;
    metric: string;
  };
  refinedTa: {
    title: string;
    description: string;
    metric: string;
  };
  icon: React.ElementType;
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    id: 'extraction',
    categoryEn: 'Extraction Method',
    categoryTa: 'பிழிந்தெடுக்கும் முறை',
    icon: Flame,
    pureEn: {
      title: 'Traditional Vaagai Wood Press',
      description: 'Slow-turned wooden pestle operating under 40°C. Never exposed to chemical solvents or extreme heat.',
      metric: '< 40°C Cold Press',
    },
    pureTa: {
      title: 'பாரம்பரிய வாகை மரச்செக்கு',
      description: '40°C க்கும் குறைவான இயற்கை வெப்பத்தில் வாகை மரத்தில் மெதுவாக அரைத்து எடுக்கப்படுகிறது. ரசாயனங்கள் இல்லை.',
      metric: '< 40°C மரச்செக்கு',
    },
    refinedEn: {
      title: 'Hexane Chemical Solvent & Heat',
      description: 'Crushed seeds are treated with petroleum-based hexane solvent and heated up to 200°C in giant mills.',
      metric: '200°C Thermal Heat',
    },
    refinedTa: {
      title: 'ஹெக்சேன் ரசாயன பிரித்தெடுத்தல்',
      description: 'பெட்ரோலிய துணைப்பொருளான ஹெக்சேன் ரசாயனம் சேர்த்து 200°C வரை அதிக வெப்பத்தில் சூடாக்கப்படுகிறது.',
      metric: '200°C அதிக வெப்பம்',
    },
  },
  {
    id: 'color',
    categoryEn: 'Color & Molecular Purity',
    categoryTa: 'நிறம் மற்றும் தூய்மை',
    icon: Droplets,
    pureEn: {
      title: 'Natural Golden Hue with Polyphenols',
      description: 'Unfiltered, rich amber tone with natural micro-nutrients, natural wax, and plant sterols fully intact.',
      metric: '100% Unbleached',
    },
    pureTa: {
      title: 'இயற்கையான தங்க நிறம்',
      description: 'வடிகட்டப்படாத தூய பொன் நிறம். உடலுக்கு நன்மையளிக்கும் இயற்கை தாதுக்கள் அப்படியே இருக்கும்.',
      metric: '100% பிளீச்சிங் இல்லை',
    },
    refinedEn: {
      title: 'Artificially Bleached & Clarified',
      description: 'Bleached with acid-activated clay and synthetic chemicals to remove color and natural cloudiness.',
      metric: 'Artificially Bleached',
    },
    refinedTa: {
      title: 'செயற்கை பிளீச்சிங் முறை',
      description: 'அமில கலந்த களிமண் மற்றும் ரசாயனங்கள் கொண்டு செயற்கையாக நிறம் வெளுத்து எடுக்கப்படுகிறது.',
      metric: 'ரசாயன பிளீச்சிங்',
    },
  },
  {
    id: 'aroma',
    categoryEn: 'Aroma & Heritage Taste',
    categoryTa: 'மணம் மற்றும் சுவை',
    icon: Sparkles,
    pureEn: {
      title: 'Authentic Earthy & Nutty Fragrance',
      description: 'Retains the distinctive natural aroma of sun-dried Tamil Nadu native seeds. Deepens cooking flavor.',
      metric: 'Zero Additives',
    },
    pureTa: {
      title: 'மணமணக்கும் பாரம்பரிய சுவை',
      description: 'பாரம்பரிய நாட்டு விதைகளின் அசல் வாசனை மற்றும் தனித்துவமான கிராமத்து சமையல் சுவை.',
      metric: 'செயற்கை சுவையூட்டி இல்லை',
    },
    refinedEn: {
      title: 'Deodorized with High-Pressure Steam',
      description: 'Steamed under vacuum at extreme temperatures to strip away all natural smell, leaving oil lifeless.',
      metric: 'Deodorized Stripped',
    },
    refinedTa: {
      title: 'மணம் நீக்கப்பட்ட வெற்று எண்ணெய்',
      description: 'அதிக அழுத்த நீராவியில் வாசனை அனைத்தும் முழுமையாக உறிஞ்சப்பட்டு நறுமணம் அற்றதாக மாற்றப்படுகிறது.',
      metric: 'மணம் நீக்கப்பட்டது',
    },
  },
  {
    id: 'health',
    categoryEn: 'Antioxidants & Heart Health',
    categoryTa: 'இதய நலம் மற்றும் சத்துக்கள்',
    icon: Heart,
    pureEn: {
      title: 'Sesamol, Vitamin E & Good Fats (HDL)',
      description: 'Preserves bioactive Sesamol, Vitamin E, and unoxidized fatty acids that guard heart and gut health.',
      metric: 'High Natural Sesamol',
    },
    pureTa: {
      title: 'செசமால் மற்றும் வைட்டமின் E நிறைந்தது',
      description: 'இதயத்தை காக்கும் இயற்கை ஆண்டிஆக்ஸிடன்ட்கள், வைட்டமின் E மற்றும் நல்ல கொழுப்பு (HDL) நிறைந்தது.',
      metric: 'இதயத்திற்கு பாதுகாப்பானது',
    },
    refinedEn: {
      title: 'Trans-Fats & Stripped Nutrients',
      description: 'Severe heat fractures healthy fatty acids into inflammatory trans-fats; synthetic preservatives added.',
      metric: 'Oxidized Trans-Fats',
    },
    refinedTa: {
      title: 'சத்துக்கள் இழப்பு மற்றும் டிரான்ஸ்-ஃபேட்',
      description: 'அதிக வெப்பத்தால் சத்துக்கள் அழிந்து கெட்ட கொழுப்புகள் மற்றும் ரசாயன பாதுகாப்பிகள் மட்டுமே எஞ்சும்.',
      metric: 'ஆரோக்கியமற்றது',
    },
  },
];

export const PureVsRefinedComparison: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const [activeTab, setActiveTab] = useState<'cards' | 'slider'>('cards');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [activeFeatureId, setActiveFeatureId] = useState<string>('extraction');

  const selectedFeature = comparisonFeatures.find(f => f.id === activeFeatureId) || comparisonFeatures[0];

  return (
    <section className="w-full py-14 sm:py-20 bg-gradient-to-b from-amber-50/50 via-white to-emerald-50/40 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 font-sans border-y border-neutral-200/60 dark:border-neutral-800/80 transition-colors duration-normal overflow-hidden relative">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-300/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-300/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{currentLang === 'ta' ? 'தூய்மையின் அறிவியல் ஒப்பீடு' : 'The Purity Science • Cold-Pressed vs Refined'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight mb-4">
            {currentLang === 'ta' ? (
              <>
                பாரம்பரிய <span className="text-emerald-700 dark:text-emerald-400 underline decoration-amber-400 decoration-wavy decoration-2">வாகை மரச்செக்கு</span> vs தொழிற்சாலை ரீஃபைண்ட்
              </>
            ) : (
              <>
                Traditional <span className="text-emerald-700 dark:text-emerald-400 underline decoration-amber-400 decoration-wavy decoration-2">Vaagai Wood-Pressed</span> vs Industrial Refined Oil
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {currentLang === 'ta'
              ? 'உங்கள் குடும்ப ஆரோக்கியத்திற்காக, நச்சு ரசாயனங்கள் இன்றி பாரம்பரிய மரச்செக்கில் தயாரிக்கப்படும் தூய நல்லெண்ணெய், கடலை எண்ணெய் மற்றும் தேங்காய் எண்ணெயின் உண்மையான நன்மைகளை அறிந்துகொள்ளுங்கள்.'
              : 'Understand the radical difference between cold-extracted nutrient-rich oils and factory-bleached chemical solvent refined oils.'}
          </p>

          {/* View Mode Toggle Switch */}
          <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl mt-6 border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setActiveTab('cards')}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === 'cards'
                  ? "bg-white dark:bg-neutral-900 text-emerald-800 dark:text-emerald-300 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{currentLang === 'ta' ? 'ஒப்பீட்டு அட்டவணை' : 'Feature Comparison'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slider')}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === 'slider'
                  ? "bg-white dark:bg-neutral-900 text-emerald-800 dark:text-emerald-300 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{currentLang === 'ta' ? 'ஊடாடும் ஸ்லைடர்' : 'Interactive Split View'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: SIDE-BY-SIDE FEATURE COMPARISON */}
        {activeTab === 'cards' && (
          <div className="space-y-6" data-aos="fade-up">
            {/* Top comparison banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Yathu Arokiyagam Wood Pressed Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>{currentLang === 'ta' ? 'யாத்து ஆரோக்கியகம்' : 'Yathu Arokiyagam Cold-Pressed'}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-400/30 text-white border border-emerald-300/40">
                    ✓ 100% PURE
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-black mb-1">
                    {currentLang === 'ta' ? 'பாரம்பரிய மரச்செக்கு எண்ணெய்' : 'Traditional Vaagai Cold-Pressed Oil'}
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed">
                    {currentLang === 'ta'
                      ? 'நாட்டு மரச்செக்கில் மெதுவாக பிழிந்தெடுக்கப்பட்டு, சூரிய ஒளியில் பதப்படுத்தப்படும் இயற்கையான உணவு மருந்து.'
                      : 'Extracted slowly without friction heat, preserving living enzymes, antioxidants, and authentic taste.'}
                  </p>
                </div>
              </div>

              {/* Industrial Refined Oil Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-neutral-700 to-neutral-900 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-neutral-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>{currentLang === 'ta' ? 'தொழிற்சாலை ரீஃபைண்ட்' : 'Industrial Refined Oil'}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/30 text-red-200 border border-red-400/40">
                    ✕ HEAVILY PROCESSED
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-black mb-1 text-neutral-200">
                    {currentLang === 'ta' ? 'ரசாயன ரீஃபைண்ட் ஆயில்' : 'Factory Chemical Refined Oil'}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {currentLang === 'ta'
                      ? 'பெட்ரோலியக் கரைப்பான்கள், 200°C கொதிநிலை சூடு மற்றும் செயற்கை நிறநீக்கிகள் மூலம் தயாரிக்கப்படுகிறது.'
                      : 'Subjected to caustic soda, hexane solvents, and extreme temperatures, creating dangerous trans-fats.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {comparisonFeatures.map((item) => {
                const Icon = item.icon;
                const pure = currentLang === 'ta' ? item.pureTa : item.pureEn;
                const refined = currentLang === 'ta' ? item.refinedTa : item.refinedEn;
                const category = currentLang === 'ta' ? item.categoryTa : item.categoryEn;

                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                        {category}
                      </span>
                    </div>

                    {/* Side by side comparison rows inside card */}
                    <div className="space-y-4">
                      
                      {/* Pure Wood Pressed Section */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{pure.title}</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                            {pure.metric}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pl-5">
                          {pure.description}
                        </p>
                      </div>

                      {/* Refined Section */}
                      <div className="p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{refined.title}</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 shrink-0 border border-red-300 dark:border-red-800">
                            {refined.metric}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pl-5">
                          {refined.description}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE SPLIT SLIDER VIEW */}
        {activeTab === 'slider' && (
          <div className="bg-white dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 rounded-3xl p-6 sm:p-8 shadow-sm" data-aos="fade-up">
            
            {/* Feature selector tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {comparisonFeatures.map((f) => {
                const Icon = f.icon;
                const isSelected = f.id === activeFeatureId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFeatureId(f.id)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/20 scale-102"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{currentLang === 'ta' ? f.categoryTa : f.categoryEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Split Comparison Canvas */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-200 dark:border-neutral-700 min-h-[360px] sm:min-h-[400px] flex items-center justify-center select-none shadow-inner">
              
              {/* Underlying Base Image - Pure vs Refined Macro Visual */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/pure-vs-refined.png"
                  alt="Pure cold-pressed oil vs refined oil comparison"
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-cover object-center"
                />
              </div>

              {/* Left Side: Yathu Vaagai Cold Pressed */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-amber-950/75 backdrop-blur-[2px] text-white flex flex-col justify-center p-6 sm:p-10 transition-all overflow-hidden z-10"
                style={{ width: `${sliderPos}%` }}
              >
                <div className="max-w-md min-w-[280px]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-400/30">
                    <Check className="w-3.5 h-3.5" />
                    <span>{currentLang === 'ta' ? 'யாத்து மரச்செக்கு' : 'Yathu Pure Wood-Pressed'}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {currentLang === 'ta' ? selectedFeature.pureTa.title : selectedFeature.pureEn.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mb-4">
                    {currentLang === 'ta' ? selectedFeature.pureTa.description : selectedFeature.pureEn.description}
                  </p>
                  <div className="inline-block px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 text-xs font-black border border-white/20">
                    ⚡ {currentLang === 'ta' ? selectedFeature.pureTa.metric : selectedFeature.pureEn.metric}
                  </div>
                </div>
              </div>

              {/* Right Side: Industrial Refined */}
              <div 
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-neutral-950/95 via-stone-900/85 to-neutral-900/80 backdrop-blur-[3px] text-white flex flex-col justify-center p-6 sm:p-10 text-right items-end transition-all overflow-hidden z-10"
                style={{ width: `${100 - sliderPos}%` }}
              >
                <div className="max-w-md min-w-[280px]">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-[11px] font-bold uppercase tracking-wider mb-2 border border-red-400/30">
                    <X className="w-3.5 h-3.5" />
                    <span>{currentLang === 'ta' ? 'ரீஃபைண்ட் ஆயில்' : 'Industrial Refined'}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-neutral-200 mb-2">
                    {currentLang === 'ta' ? selectedFeature.refinedTa.title : selectedFeature.refinedEn.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
                    {currentLang === 'ta' ? selectedFeature.refinedTa.description : selectedFeature.refinedEn.description}
                  </p>
                  <div className="inline-block px-3 py-1.5 rounded-xl bg-black/40 text-red-300 text-xs font-black border border-red-500/30">
                    ⚠️ {currentLang === 'ta' ? selectedFeature.refinedTa.metric : selectedFeature.refinedEn.metric}
                  </div>
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div 
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl z-20"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-9 h-9 rounded-full bg-white text-emerald-800 shadow-xl flex items-center justify-center font-bold text-xs border-2 border-emerald-600">
                  ↔
                </div>
              </div>
            </div>

            {/* Slider Input Bar */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                ← {currentLang === 'ta' ? 'யாத்து மரச்செக்கு' : 'Yathu Pure Oil'}
              </span>
              <input
                type="range"
                min={15}
                max={85}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                aria-label="Comparison slider"
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-bold text-neutral-500">
                {currentLang === 'ta' ? 'தொழிற்சாலை ஆயில்' : 'Refined Oil'} →
              </span>
            </div>
          </div>
        )}

        {/* Bottom Purity Assurance & CTA Banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6" data-aos="fade-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
                {currentLang === 'ta' ? 'NABL அங்கீகரிக்கப்பட்ட ஆய்வுச் சான்றிதழ்' : 'NABL Accredited Lab Certification'}
              </div>
              <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                {currentLang === 'ta'
                  ? '0% ஹெக்சேன் ரசாயனம் • 100% இயற்கை மரச்செக்கு உத்திரவாதம்'
                  : 'Zero Hexane Residues • 100% Guaranteed Vaagai Cold-Pressed'}
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {currentLang === 'ta'
                  ? 'ஒவ்வொரு பேட்ச்சும் தரப் பரிசோதனை செய்யப்பட்டு QR குறியீடு மூலமாக முழு வெளிப்படைத்தன்மையுடன் வழங்கப்படுகிறது.'
                  : 'Every single batch is independently tested with QR-verifiable lab purity reports.'}
              </p>
            </div>
          </div>

          <Link
            href="/shop?category=wood-pressed-oils"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-102 shrink-0 cursor-pointer"
          >
            <span>{currentLang === 'ta' ? 'மரச்செக்கு எண்ணெய்களைப் பார்க்க' : 'Shop Cold-Pressed Oils'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
