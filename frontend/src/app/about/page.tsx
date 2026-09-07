"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  ShieldCheck, 
  Users, 
  Map, 
  ChevronRight, 
  Award, 
  CheckCircle,
  Clock,
  Heart,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import 'aos/dist/aos.css';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
    });
  }, []);

  const teamMembers = [
    {
      name: 'Ganesh Prabhu',
      nameTamil: 'கணேஷ் பிரபு',
      role: 'Co-Founder & Organic Farmer',
      roleTamil: 'இணை நிறுவனர் & இயற்கை விவசாயி',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      bio: 'Pioneering direct-farm sourcing in Tamil Nadu to secure chemical-free nutrition.',
      bioTamil: 'இரசாயனமற்ற ஊட்டச்சத்தைப் பெற தமிழ்நாட்டில் நேரடி பண்ணை கொள்முதல் முறையை முன்னெடுப்பவர்.'
    },
    {
      name: 'Dr. Abirami Selvam',
      nameTamil: 'டாக்டர் அபிராமி செல்வம்',
      role: 'Head of Nutrition & Quality Assurance',
      roleTamil: 'ஊட்டச்சத்து & தரக் கட்டுப்பாட்டுத் தலைவர்',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=300',
      bio: 'Enforcing strict lab testing protocols to guarantee zero-residue food batches.',
      bioTamil: 'உணவுத் தொகுப்புகளில் நச்சு எச்சங்கள் இல்லை என்பதை உறுதி செய்ய ஆய்வக சோதனை நெறிமுறைகளை வழிநடத்துபவர்.'
    },
    {
      name: 'Ramanathan K.',
      nameTamil: 'இராமநாதன் கே.',
      role: 'Chief of Farm Relations & Sourcing',
      roleTamil: 'பண்ணை உறவுகள் & கொள்முதல் தலைவர்',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      bio: 'Working on-ground with 50+ local organic farmers for crop rotations and fair trade.',
      bioTamil: 'பயிர் சுழற்சி மற்றும் நியாயமான வர்த்தகத்திற்காக 50-க்கும் மேற்பட்ட உள்ளூர் விவசாயிகளுடன் களப்பணி ஆற்றுபவர்.'
    }
  ];

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
              {t('about.title', 'About Us')}
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary-300/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest"
          >
            <Leaf className="w-3.5 h-3.5 text-primary-300" />
            <span>Yathu Arokiyagam Story</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3.5xl sm:text-5xl font-black font-heading tracking-tight leading-tight"
          >
            {t('about.title', 'About Us')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-neutral-100 max-w-xl mx-auto font-medium leading-relaxed"
          >
            {t('about.subtitle', 'A dedicated store for those who choose a healthy lifestyle')}
          </motion.p>
        </div>
      </div>

      {/* Brand Story & Mission */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6" data-aos="fade-right">
          <div className="inline-block bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            {t('about.our_story', 'Our Story')}
          </div>
          <h2 className="text-2.5xl sm:text-3.5xl font-black font-heading text-neutral-900 dark:text-white leading-tight">
            {t('about.story_title', 'The Soil That Shaped Us: The Story of Yathu Arokiyagam')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-semibold">
            {t('about.our_story_desc', 'It all began with a simple, quiet patch of earth and a clear vision: to practice Natural Farming. Today, Yathu Arokiyagam is a dedicated sanctuary for everyone choosing a conscious, healthy lifestyle.')}
          </p>
          <div className="border-l-4 border-primary-500 pl-4 py-1 italic text-xs font-bold text-neutral-500 dark:text-neutral-450 leading-relaxed">
            "We choose transparency over marketing buzzwords — zero adulteration, zero preservatives, and zero industrial shortcuts."
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm space-y-6" data-aos="fade-left">
          <div className="inline-block bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            {t('about.mission', 'Our Mission')}
          </div>
          <h2 className="text-2.5xl font-black font-heading text-neutral-900 dark:text-white leading-tight">
            {t('about.mission_title', 'Our Mission')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-semibold">
            {t('about.mission_desc', 'Our mission is to bridge the gap between ancient agricultural wisdom and modern lifestyle needs by offering honest, unadulterated, and preservative-free food, while sustaining a transparent ecosystem that honors the health of both the consumer and the soil')}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-350">Zero Adulteration</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-350">Zero Preservatives</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-350">Honest Farming</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-350">Healthy Soil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/50 border-y border-neutral-100 dark:border-neutral-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
              Core Principles
            </span>
            <h2 className="text-2.5xl sm:text-3.5xl font-black font-heading text-neutral-900 dark:text-white leading-tight">
              {t('about.values_title', 'Our Core Values')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Value 1: Heritage */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4 hover:translate-y-[-8px] hover:shadow-md transition-all duration-normal" data-aos="fade-up">
              <div className="w-12 h-12 rounded-feature bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-neutral-900 dark:text-white leading-tight">
                {t('about.value_heritage', 'Healing Through Heritage')}
              </h3>
              <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed font-semibold">
                {t('about.value_heritage_desc', 'By bringing back native millets, heirloom rices, and unrefined sweeteners, we treat your kitchen as the primary pharmacy.')}
              </p>
            </div>

            {/* Value 2: Wisdom */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4 hover:translate-y-[-8px] hover:shadow-md transition-all duration-normal" data-aos="fade-up" data-aos-delay="100">
              <div className="w-12 h-12 rounded-feature bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-neutral-900 dark:text-white leading-tight">
                {t('about.value_wisdom', 'The Wisdom of Our Grandparents')}
              </h3>
              <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed font-semibold">
                {t('about.value_wisdom_desc', 'We carefully curate traditional ingredients that protected our ancestors for generations, making it effortless for your family to return to a natural baseline of health.')}
              </p>
            </div>

            {/* Value 3: DNA */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4 hover:translate-y-[-8px] hover:shadow-md transition-all duration-normal" data-aos="fade-up" data-aos-delay="200">
              <div className="w-12 h-12 rounded-feature bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-neutral-900 dark:text-white leading-tight">
                {t('about.value_dna', 'Rooted in Our DNA')}
              </h3>
              <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed font-semibold">
                {t('about.value_dna_desc', 'We offer native superfoods that sync perfectly with your system to build lasting immunity and natural strength.')}
              </p>
            </div>

            {/* Value 4: Vitality */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4 hover:translate-y-[-8px] hover:shadow-md transition-all duration-normal" data-aos="fade-up" data-aos-delay="300">
              <div className="w-12 h-12 rounded-feature bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-neutral-900 dark:text-white leading-tight">
                {t('about.value_vitality', 'Time-Tested Vitality')}
              </h3>
              <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed font-semibold">
                {t('about.value_vitality_desc', 'We revive indigenous grains, wood-pressed oils, and ancestral health secrets to help your family live a life of vibrant, natural energy.')}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Timeline Journey */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
            Milestones
          </span>
          <h2 className="text-2.5xl sm:text-3.5xl font-black font-heading text-neutral-900 dark:text-white leading-tight">
            {t('about.timeline_title', 'Our Journey')}
          </h2>
        </div>

        <div className="relative border-l-2 border-primary-500/35 max-w-3xl mx-auto pl-6 sm:pl-8 space-y-10">
          
          {/* Milestone 2020 */}
          <div className="relative" data-aos="fade-up">
            <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full bg-primary-500 border-4 border-white dark:border-neutral-950 flex items-center justify-center shadow" />
            <h3 className="font-bold text-lg text-primary-500">2020</h3>
            <p className="text-xs font-bold text-neutral-805 dark:text-neutral-200 mt-1 leading-relaxed">
              {t('about.timeline_2020', 'The Foundation (Our Roots): Successfully transitioned our private land into a 100% Natural Farming ecosystem.')}
            </p>
          </div>

          {/* Milestone 2022 */}
          <div className="relative" data-aos="fade-up">
            <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full bg-primary-500 border-4 border-white dark:border-neutral-950 flex items-center justify-center shadow" />
            <h3 className="font-bold text-lg text-primary-500">2022</h3>
            <p className="text-xs font-bold text-neutral-805 dark:text-neutral-200 mt-1 leading-relaxed">
              {t('about.timeline_2022', 'Community & Procurement: United with a close-knit circle of trusted, traditional local farmers.')}
            </p>
          </div>

          {/* Milestone 2024 */}
          <div className="relative" data-aos="fade-up">
            <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full bg-primary-500 border-4 border-white dark:border-neutral-950 flex items-center justify-center shadow" />
            <h3 className="font-bold text-lg text-primary-500">2024</h3>
            <p className="text-xs font-bold text-neutral-805 dark:text-neutral-200 mt-1 leading-relaxed">
              {t('about.timeline_2024', 'The Retail Launch: Launched the dedicated Yathu Arokiyagam flagship store.')}
            </p>
          </div>

          {/* Milestone 2026 */}
          <div className="relative" data-aos="fade-up">
            <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full bg-primary-500 border-4 border-white dark:border-neutral-950 flex items-center justify-center shadow-md animate-pulse" />
            <h3 className="font-bold text-lg text-primary-500">2026</h3>
            <p className="text-xs font-bold text-neutral-805 dark:text-neutral-200 mt-1 leading-relaxed">
              {t('about.timeline_2026', 'Serving 50,000+ organic customers with home delivery')}
            </p>
          </div>

        </div>
      </div>

      {/* Team Cards */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/50 border-y border-neutral-100 dark:border-neutral-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
              Our People
            </span>
            <h2 className="text-2.5xl sm:text-3.5xl font-black font-heading text-neutral-900 dark:text-white leading-tight">
              {t('about.team_title', 'Meet Our Team')}
            </h2>
            <p className="text-xs text-neutral-550 dark:text-neutral-450 leading-relaxed font-semibold">
              {t('about.team_desc', 'The dedicated people behind Yathu Arokiyagam working to bring healthy, traditional food to your family.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={member.name}
                className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature overflow-hidden shadow-sm hover:translate-y-[-8px] hover:shadow-lg transition-all duration-normal"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="h-64 relative overflow-hidden bg-neutral-105">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-slow"
                  />
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-bold text-base text-neutral-905 dark:text-white">
                    {currentLang === 'ta' ? member.nameTamil : member.name}
                  </h3>
                  <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                    {currentLang === 'ta' ? member.roleTamil : member.role}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed font-medium pt-1">
                    {currentLang === 'ta' ? member.bioTamil : member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
        <h2 className="text-xl font-black font-heading text-neutral-900 dark:text-white uppercase tracking-wider">
          {t('about.certs_title', 'Our Certifications')}
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-10 opacity-70 dark:opacity-85">
          <div className="flex flex-col items-center gap-1.5">
            <Award className="w-10 h-10 text-primary-500" />
            <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              NPOP Organic
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="w-10 h-10 text-primary-500" />
            <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              FSSAI Certified
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <CheckCircle className="w-10 h-10 text-primary-500" />
            <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              SGS Lab Tested
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Leaf className="w-10 h-10 text-primary-500" />
            <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Participatory Guarantee
            </span>
          </div>
        </div>
      </div>

      {/* CTA To Shop */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-feature p-8 sm:p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-2.5xl sm:text-3.5xl font-black font-heading leading-tight tracking-tight">
              {t('about.cta_title', 'Ready to experience pure nutrition?')}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-100 leading-relaxed font-semibold">
              Join our collective of families making the transition to honest, unadulterated traditional rices, millets, wood-pressed oils, and natural sweeteners.
            </p>
            <div className="pt-2">
              <Link href="/shop">
                <Button
                  variant="cta"
                  size="lg"
                  className="font-bold text-xs bg-white text-primary-700 hover:bg-neutral-100 py-3.5 px-6 rounded-card border-none shadow-md"
                >
                  {t('about.cta_button', 'Shop Organic Now')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
