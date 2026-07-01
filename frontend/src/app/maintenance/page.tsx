"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wrench, Phone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Target Date parsing
  // Priority: env variable > default to 2 hours from current load
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 1 // default positive so it doesn't trigger reload instantly
  });

  useEffect(() => {
    const envEndTime = process.env.NEXT_PUBLIC_MAINTENANCE_END_TIME;
    let targetMs = 0;

    if (envEndTime) {
      targetMs = Date.parse(envEndTime);
    }
    
    // Fallback: If no env or invalid parsing, default to 2.5 hours from now
    if (isNaN(targetMs) || targetMs <= Date.now()) {
      targetMs = Date.now() + 2.5 * 60 * 60 * 1000;
    }

    setTargetTime(targetMs);
  }, []);

  useEffect(() => {
    if (!targetTime) return;

    const calculateTimeLeft = () => {
      const difference = targetTime - Date.now();
      
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { hours, minutes, seconds, totalSeconds: Math.floor(difference / 1000) };
    };

    // Set initial
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);

      // Auto-reload when timer hits zero to check if maintenance has been lifted
      if (updated.totalSeconds <= 0) {
        clearInterval(interval);
        window.location.href = "/";
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const padZero = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between items-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-normal">
      
      {/* Top Header Logo */}
      <header className="w-full flex justify-center py-4 select-none">
        <span className="text-2xl font-bold font-heading tracking-wide text-primary-700 dark:text-primary-400">
          Aether Organic<span className="text-secondary-400">.</span>
        </span>
      </header>

      {/* Main Card Wrapper */}
      <main className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-8 sm:p-10 shadow-md text-center space-y-8 my-auto">
        
        {/* Animated Spanner Icon */}
        <div className="flex justify-center select-none">
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-20 h-20 text-primary-500 bg-primary-500/5 border border-primary-500/10 rounded-full flex items-center justify-center"
            >
              <Wrench className="w-10 h-10" />
            </motion.div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-500/5 px-3.5 py-1 rounded-full border border-primary-500/10 uppercase tracking-widest inline-block select-none">
            🔧 System Sprucing
          </span>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight leading-none">
            We'll be back shortly!
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-450 leading-relaxed max-w-sm mx-auto">
            Our digital farm stand is undergoing brief maintenance to improve your shopping experience. Check back soon for fresh upgrades!
          </p>
        </div>

        {/* Countdown Grid */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block select-none">
            Expected Back In:
          </span>
          <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
            
            {/* Hours */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-card border border-neutral-150 dark:border-neutral-850">
              <span className="text-2xl font-black font-heading text-primary-600 dark:text-primary-400 block tabular-nums">
                {padZero(timeLeft.hours)}
              </span>
              <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider block mt-0.5">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-card border border-neutral-150 dark:border-neutral-850">
              <span className="text-2xl font-black font-heading text-primary-600 dark:text-primary-400 block tabular-nums">
                {padZero(timeLeft.minutes)}
              </span>
              <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider block mt-0.5">
                Mins
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-card border border-neutral-150 dark:border-neutral-850">
              <span className="text-2xl font-black font-heading text-amber-500 block tabular-nums">
                {padZero(timeLeft.seconds)}
              </span>
              <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider block mt-0.5">
                Secs
              </span>
            </div>

          </div>
        </div>

        {/* Support Hotline */}
        <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-card border border-neutral-100 dark:border-neutral-850 text-xs font-semibold text-neutral-650 dark:text-neutral-450 flex items-center justify-center gap-2 max-w-xs mx-auto leading-relaxed">
          <Phone className="w-4 h-4 text-primary-500 shrink-0" />
          <span>Urgent order queries? Call <span className="font-bold text-neutral-900 dark:text-white">+91 98765 43210</span></span>
        </div>

        {/* Social media connections */}
        <div className="space-y-3.5 pt-4 border-t border-neutral-100 dark:border-neutral-850">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block select-none">
            Stay Updated via Socials
          </span>
          <div className="flex justify-center items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-neutral-50 hover:bg-primary-500/10 hover:text-primary-500 dark:bg-neutral-950 text-neutral-500 border border-neutral-150 dark:border-neutral-850 transition-colors cursor-pointer" aria-label="Facebook">
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-neutral-50 hover:bg-primary-500/10 hover:text-primary-500 dark:bg-neutral-950 text-neutral-500 border border-neutral-150 dark:border-neutral-850 transition-colors cursor-pointer" aria-label="Instagram">
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-neutral-50 hover:bg-primary-500/10 hover:text-primary-500 dark:bg-neutral-950 text-neutral-500 border border-neutral-150 dark:border-neutral-850 transition-colors cursor-pointer" aria-label="Twitter">
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

      </main>

      {/* Bottom Footer block */}
      <footer className="w-full text-center text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-850 pt-4 select-none">
        &copy; {new Date().getFullYear()} Aether Organic. All rights reserved.
      </footer>

    </div>
  );
}
