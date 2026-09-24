"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Award, ArrowRight, CheckCircle2, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CertificationBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <section className="w-full py-12 sm:py-16 bg-[#F8F9FA] dark:bg-neutral-950 font-sans transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dark High-Contrast Feature Callout Card */}
        <div 
          data-aos="fade-up"
          className="relative w-full rounded-3xl bg-[#0B1B15] border border-emerald-500/20 shadow-2xl p-8 sm:p-12 lg:p-14 overflow-hidden"
        >
          {/* Botanical Lab Purity Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/certification-banner.png"
              alt="NABL Laboratory Purity Testing"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center opacity-25 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B15] via-[#0D241C]/90 to-[#0A1A14]/80" />
          </div>

          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
            
            {/* Left Column: Transparency Copy & CTA */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentLang === 'ta' ? 'ஆய்வக சான்றளிக்கப்பட்ட தூய்மை' : 'NABL Certified Purity'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight mb-4">
                {currentLang === 'ta' ? (
                  <>
                    100% ஆய்வக பரிசோதனை.{' '}
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      கலப்படமற்ற உத்தரவாதம்.
                    </span>
                  </>
                ) : (
                  <>
                    100% Lab Tested.{' '}
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      Zero Preservatives.
                    </span>
                  </>
                )}
              </h2>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl mb-6 font-medium">
                {currentLang === 'ta'
                  ? 'ஒவ்வொரு தயாரிப்பும் ஈரப்பதம், அமிலத்தன்மை மற்றும் பூச்சிக்கொல்லிகள் இல்லாதது என கடுமையான ஆய்வக பரிசோதனைகளுக்கு உட்படுத்தப்படுகிறது.'
                  : 'Every single batch of our wood-pressed cooking oils and native grains undergoes strict laboratory quality checks. We publish batch lab reports for 100% transparency.'}
              </p>

              {/* Trust Badges Checkmarks */}
              <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 text-xs sm:text-sm font-semibold text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{currentLang === 'ta' ? 'அஃப்லாடாக்சின் இல்லை' : 'Zero Aflatoxins'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{currentLang === 'ta' ? 'மினரல் ஆயில் இல்லை' : 'No Mineral Oil'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{currentLang === 'ta' ? 'FSSAI அங்கீகாரம்' : 'FSSAI Certified'}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-normal cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{currentLang === 'ta' ? 'ஆய்வக அறிக்கையை காண்க' : 'View Sample Lab Report'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Right Column: 3D Angled Floating Certificate Preview */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-white p-4 shadow-2xl border-4 border-white/20 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-xl border border-dashed border-amber-300 bg-amber-50/40 p-4 flex flex-col justify-between text-neutral-800">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-900">Certificate of Analysis</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">PASSED</span>
                  </div>

                  <div className="my-2 space-y-1 text-left">
                    <span className="text-xs font-bold text-neutral-900 block">Product: Pure Cold Pressed Groundnut Oil</span>
                    <span className="text-[11px] text-neutral-600 block">Batch: YA-GNO-2026-B8</span>
                    <span className="text-[11px] text-neutral-600 block">Acid Value: 0.28 (Standard: &lt; 0.50)</span>
                    <span className="text-[11px] text-neutral-600 block">Peroxide Value: 1.1 meq/kg (Standard: &lt; 10)</span>
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-[10px] font-semibold text-neutral-500">
                    <span>NABL Accredited Testing</span>
                    <span className="text-emerald-700 font-bold">100% PURE</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Lab Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {currentLang === 'ta' ? 'ஆய்வக சான்றிதழ் விவரங்கள்' : 'Batch Quality Certificate'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 space-y-2">
                <p><strong>Testing Standard:</strong> FSSAI &amp; AGMARK Wood-Pressed Edible Oil Protocol</p>
                <p><strong>Moisture Content:</strong> 0.08% (Max allowable: 0.25%)</p>
                <p><strong>Free Fatty Acids:</strong> 0.32% (Zero rancidity)</p>
                <p><strong>Hexane / Solvent Residues:</strong> Nil (Non-detectable)</p>
                <p><strong>Aflatoxins (B1, B2, G1, G2):</strong> Zero / Pass</p>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mt-3">
                  ✓ Certified 100% pure cold-pressed natural food free from adulteration.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer"
                >
                  {currentLang === 'ta' ? 'மூடுக' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
