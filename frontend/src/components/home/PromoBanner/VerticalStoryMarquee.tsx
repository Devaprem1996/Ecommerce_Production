"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Star, CheckCircle, Leaf } from 'lucide-react';

interface Story {
  id: string;
  nameEn: string;
  nameTa: string;
  roleEn: string;
  roleTa: string;
  locationEn: string;
  locationTa: string;
  quoteEn: string;
  quoteTa: string;
  productEn: string;
  productTa: string;
  rating: number;
  image: string;
}

const storiesCol1: Story[] = [
  {
    id: 's1',
    nameEn: 'Meenakshi Sundaram',
    nameTa: 'மீனாட்சி சுந்தரம்',
    roleEn: 'Home Chef & Mother',
    roleTa: 'இல்லத்தரசி',
    locationEn: 'Chennai, TN',
    locationTa: 'சென்னை',
    quoteEn: "Switching to Yathu Arokiyagam's wood-pressed oils brought back the authentic village aroma to our kitchen. Zero bloating, pure energy.",
    quoteTa: "யாத்து ஆரோக்கியகத்தின் மரச்செக்கு நல்லெண்ணெய்க்கு மாறிய பிறகு எங்கள் வீட்டு சமையலில் அசல் கிராமத்து மணம் வீசுகிறது. தூய ஆற்றல்.",
    productEn: 'Wood-Pressed Sesame Oil',
    productTa: 'மரச்செக்கு நல்லெண்ணெய்',
    rating: 5,
    image: '/images/customer-meenakshi.jpg',
  },
  {
    id: 's2',
    nameEn: 'Dr. K. Raghavan',
    nameTa: 'டாக்டர் கே. ராகவன்',
    roleEn: 'Ayurvedic Physician',
    roleTa: 'ஆயுர்வேத மருத்துவர்',
    locationEn: 'Coimbatore, TN',
    locationTa: 'கோயம்புத்தூர்',
    quoteEn: 'Their unpolished Karuppu Kavuni rice and millet noodles have become our weekly family ritual. Honest quality you can truly feel and taste.',
    quoteTa: 'இவர்களின் கருப்புக் கவுனி அரிசியும் சிறுதானிய நூடுல்ஸும் எங்கள் உணவில் நிரந்தரமாகிவிட்டது. கலப்படமில்லாத உண்மைத்தன்மை.',
    productEn: 'Heritage Karuppu Kavuni',
    productTa: 'பாரம்பரிய கருப்பு கவுனி',
    rating: 5,
    image: '/images/customer-raghavan.jpg',
  },
  {
    id: 's3',
    nameEn: 'Ananya & Karthik',
    nameTa: 'அனன்யா & கார்த்திக்',
    roleEn: 'Conscious Parents',
    roleTa: 'பெற்றோர்கள்',
    locationEn: 'Bengaluru, KA',
    locationTa: 'பெங்களூரு',
    quoteEn: 'Replaced refined white sugar with their raw wild honey and palm jaggery. The kids adore the natural earthy sweetness!',
    quoteTa: 'வெள்ளை சர்க்கரைக்கு பதில் தூய காட்டுத்தேன் மற்றும் பனைவெல்லம் பயன்படுத்துகிறோம். குழந்தைகள் சுறுசுறுப்பாக இருக்கிறார்கள்!',
    productEn: 'Raw Wild Mountain Honey',
    productTa: 'தூய காட்டுத் தேன்',
    rating: 5,
    image: '/images/customer-meenakshi.jpg',
  },
];

const storiesCol2: Story[] = [
  {
    id: 's4',
    nameEn: 'Rajeshwari Ammal',
    nameTa: 'ராஜேஸ்வரி அம்மாள்',
    roleEn: 'Traditional Homemaker',
    roleTa: 'பாரம்பரிய சமையல் கலைஞர்',
    locationEn: 'Madurai, TN',
    locationTa: 'மதுரை',
    quoteEn: "Reminds me of my mother's cooking 50 years ago. Authentic stone-ground unadulterated purity delivered right to our door.",
    quoteTa: '50 ஆண்டுகளுக்கு முன் என் தாய் தயாரித்த அதே தூய மரச்செக்கு எண்ணெய் சுவை. கலப்படமற்ற அசல் தரம்.',
    productEn: 'Wood-Pressed Coconut Oil',
    productTa: 'மரச்செக்கு தேங்காய் எண்ணெய்',
    rating: 5,
    image: '/images/customer-raghavan.jpg',
  },
  {
    id: 's5',
    nameEn: 'Priya & Suresh',
    nameTa: 'பிரியா & சுரேஷ்',
    roleEn: 'Fitness & Yoga Instructors',
    roleTa: 'யோகா பயிற்சியாளர்கள்',
    locationEn: 'Tiruchirappalli, TN',
    locationTa: 'திருச்சிராப்பள்ளி',
    quoteEn: 'The native millets are clean, pesticide-free, and high in fiber. A vital staple for our daily endurance and gut health.',
    quoteTa: 'நாட்டுச் சிறுதானியங்கள் சுத்தமாகவும், நார்சத்து நிறைந்ததாகவும் உள்ளன. எங்கள் அன்றாட ஆரோக்கியத்திற்கு மிகவும் ஏற்றது.',
    productEn: 'Unpolished Foxtail Millet',
    productTa: 'தீட்டப்படாத தினை',
    rating: 5,
    image: '/images/customer-meenakshi.jpg',
  },
  {
    id: 's6',
    nameEn: 'S. Muthukumar',
    nameTa: 'எஸ். முத்துக்குமார்',
    roleEn: 'Natural Farming Advocate',
    roleTa: 'இயற்கை விவசாய ஆர்வலர்',
    locationEn: 'Salem, TN',
    locationTa: 'சேலம்',
    quoteEn: 'Direct farmer sourcing and cold extraction without chemicals. Truly proud to support Yathu Arokiyagam.',
    quoteTa: 'விவசாயிகளிடமிருந்து நேரடியாக பெற்று ரசாயனம் இல்லாமல் தயாரிக்கும் தரம். பெருமிதம் கொள்கிறேன்.',
    productEn: 'Pure Desi A2 Cow Ghee',
    productTa: 'நாட்டுப் பசு A2 நெய்',
    rating: 5,
    image: '/images/customer-raghavan.jpg',
  },
];

const StoryCard: React.FC<{ story: Story; currentLang: string }> = ({
  story,
  currentLang,
}) => {
  const name = currentLang === 'ta' ? story.nameTa : story.nameEn;
  const role = currentLang === 'ta' ? story.roleTa : story.roleEn;
  const location = currentLang === 'ta' ? story.locationTa : story.locationEn;
  const quote = currentLang === 'ta' ? story.quoteTa : story.quoteEn;
  const product = currentLang === 'ta' ? story.productTa : story.productEn;

  return (
    <div className="group rounded-2xl lg:rounded-3xl bg-white/95 dark:bg-neutral-900/95 border border-[#F2E8DC] dark:border-neutral-800 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/60 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between mb-4 backdrop-blur-md">
      {/* Top Customer Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-amber-500/70 shrink-0 shadow-xs">
            <Image
              src={story.image}
              alt={name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                {name}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {role} • {location}
            </span>
          </div>
        </div>

        {/* 5-Star Rating */}
        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-current" />
          ))}
        </div>
      </div>

      {/* Quote */}
      <p className="text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed italic line-clamp-3 mb-3">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Product Tag */}
      <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-[10px] sm:text-[11px] font-semibold text-amber-900 dark:text-amber-300">
        <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>{product}</span>
      </div>
    </div>
  );
};

export const VerticalStoryMarquee: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  // Quadruple for infinite continuous loop
  const listCol1 = [...storiesCol1, ...storiesCol1, ...storiesCol1, ...storiesCol1];
  const listCol2 = [...storiesCol2, ...storiesCol2, ...storiesCol2, ...storiesCol2];

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] overflow-hidden vertical-marquee-mask select-none">
      {/* 2-Column Vertical Scrolling Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 h-full">
        {/* Column 1: Scrolls Upwards */}
        <div className="overflow-hidden h-full">
          <div className="animate-marquee-vertical flex flex-col">
            {listCol1.map((story, idx) => (
              <StoryCard
                key={`c1-${story.id}-${idx}`}
                story={story}
                currentLang={currentLang}
              />
            ))}
          </div>
        </div>

        {/* Column 2: Scrolls Upwards at alternate speed (Hidden on extra-small mobile, visible on sm+) */}
        <div className="hidden sm:block overflow-hidden h-full">
          <div className="animate-marquee-vertical-slow flex flex-col">
            {listCol2.map((story, idx) => (
              <StoryCard
                key={`c2-${story.id}-${idx}`}
                story={story}
                currentLang={currentLang}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
