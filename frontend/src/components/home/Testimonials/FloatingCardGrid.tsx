"use client";

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { TestimonialItem } from '@/constants/testimonials';
import { TestimonialCanvas } from './TestimonialCanvas';

interface FloatingCardGridProps {
  currentTestimonial: TestimonialItem;
  direction: number;
  activeIndex: number;
}

export const FloatingCardGrid: React.FC<FloatingCardGridProps> = ({
  currentTestimonial,
  activeIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeAvatarRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Tilt on Mouse Move using GSAP
  useEffect(() => {
    const container = containerRef.current;
    const avatar = activeAvatarRef.current;
    if (!container || !avatar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(avatar, {
        x: x * 14,
        y: y * 14,
        rotateY: x * 12,
        rotateX: -y * 12,
        duration: 0.45,
        ease: 'power2.out',
        transformPerspective: 900,
        transformOrigin: 'center center',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(avatar, {
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(avatar);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] flex items-center justify-center select-none overflow-visible"
    >
      {/* 1. Three.js Real-Time 3D Beveled Glass Refraction Canvas */}
      <TestimonialCanvas activeIndex={activeIndex} />

      {/* 2. Soft Edge Radial Vignette Fade */}
      <div className="absolute -inset-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_45%,var(--bg-fade,#FAFAF9)_82%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,var(--bg-fade,#0C0E10)_82%)] z-10" />

      {/* 3. Centerpiece: The Elevated Active Avatar Card */}
      <div
        ref={activeAvatarRef}
        className="relative z-20 left-[-20px] sm:left-[-35px] lg:left-[-45px] top-[-5px] sm:top-[-10px] will-change-transform"
      >
        {/* Intense Radiant Blue Backlight Glow (Matching Reference Image) */}
        <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-blue-600/50 via-sky-500/40 to-blue-500/25 rounded-[28px] blur-2xl sm:blur-3xl -z-10 pointer-events-none opacity-95 transition-opacity duration-500" />
        
        {/* Soft Bevel Ambient Drop Shadow */}
        <div className="absolute inset-0 rounded-[22px] sm:rounded-[24px] shadow-[0_25px_60px_-12px_rgba(59,130,246,0.65),0_12px_28px_-6px_rgba(30,58,138,0.3)] pointer-events-none" />

        {/* Card Frame & Photo */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56 rounded-[22px] sm:rounded-[24px] overflow-hidden bg-neutral-950 border border-neutral-700/60 dark:border-neutral-600/70 shadow-2xl flex items-center justify-center">
          
          {/* Framer Motion Crossfade & Settle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full"
            >
              {currentTestimonial.avatar ? (
                <Image
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                  fill
                  sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 224px"
                  priority
                  className="object-cover object-center filter contrast-[1.05] brightness-95"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-neutral-900 to-neutral-800 flex items-center justify-center text-4xl font-extrabold text-white">
                  {currentTestimonial.initial}
                </div>
              )}

              {/* Subtle dark vignette overlay matching reference's dark studio look */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-neutral-950/20 pointer-events-none" />
              
              {/* Subtle blue rim light glow inside card */}
              <div className="absolute inset-0 ring-1 ring-inset ring-sky-400/30 pointer-events-none rounded-[22px] sm:rounded-[24px]" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
