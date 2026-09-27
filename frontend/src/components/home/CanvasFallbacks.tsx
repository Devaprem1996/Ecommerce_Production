"use client";

import React from 'react';

/*
 * Pre-computed deterministic particle data.
 * These static arrays ensure identical values on SSR and client,
 * preventing React hydration mismatches from Math.random().
 */

// CertificationFallback: 16 golden dust particles
const CERT_PARTICLES = [
  { w: 4.2, h: 3.8, l: 8, t: 12, r: 192, g: 45, a: 0.52, blur: 9, dur: 7.2, del: 0.4 },
  { w: 3.1, h: 2.6, l: 23, t: 78, r: 210, g: 55, a: 0.48, blur: 11, dur: 9.5, del: 2.1 },
  { w: 5.4, h: 4.9, l: 45, t: 5, r: 185, g: 38, a: 0.61, blur: 8, dur: 12.3, del: 1.0 },
  { w: 2.8, h: 3.2, l: 67, t: 34, r: 220, g: 60, a: 0.39, blur: 13, dur: 8.1, del: 3.5 },
  { w: 3.6, h: 5.1, l: 15, t: 88, r: 198, g: 42, a: 0.55, blur: 7, dur: 11.0, del: 0.8 },
  { w: 4.8, h: 2.4, l: 82, t: 22, r: 175, g: 52, a: 0.44, blur: 10, dur: 6.8, del: 4.2 },
  { w: 2.3, h: 4.5, l: 55, t: 65, r: 225, g: 48, a: 0.58, blur: 12, dur: 13.5, del: 1.7 },
  { w: 5.8, h: 3.0, l: 38, t: 91, r: 190, g: 35, a: 0.42, blur: 9, dur: 7.8, del: 2.8 },
  { w: 3.9, h: 4.7, l: 72, t: 48, r: 205, g: 58, a: 0.66, blur: 8, dur: 10.2, del: 0.2 },
  { w: 4.5, h: 2.9, l: 5, t: 55, r: 215, g: 40, a: 0.37, blur: 11, dur: 8.9, del: 3.9 },
  { w: 2.6, h: 5.5, l: 90, t: 15, r: 180, g: 62, a: 0.50, blur: 7, dur: 12.8, del: 1.3 },
  { w: 5.1, h: 3.4, l: 30, t: 72, r: 200, g: 44, a: 0.45, blur: 13, dur: 6.5, del: 4.8 },
  { w: 3.3, h: 4.1, l: 60, t: 38, r: 228, g: 50, a: 0.53, blur: 10, dur: 9.7, del: 0.6 },
  { w: 4.0, h: 2.7, l: 48, t: 82, r: 195, g: 56, a: 0.41, blur: 8, dur: 11.6, del: 2.4 },
  { w: 5.6, h: 5.2, l: 18, t: 28, r: 188, g: 37, a: 0.59, blur: 12, dur: 7.5, del: 3.2 },
  { w: 2.5, h: 3.6, l: 75, t: 95, r: 212, g: 65, a: 0.47, blur: 9, dur: 13.2, del: 1.5 },
];

// PreFooterFallback: 12 floating drops
const PREFOOTER_PARTICLES = [
  { w: 7.2, h: 10.4, l: 12, t: 72, isH: true,  a: 0.48, dur: 12.5, del: 1.2 },
  { w: 6.5, h: 8.8,  l: 45, t: 85, isH: false, a: 0.35, dur: 10.8, del: 3.4 },
  { w: 8.1, h: 11.2, l: 78, t: 68, isH: true,  a: 0.52, dur: 14.2, del: 0.5 },
  { w: 5.8, h: 9.6,  l: 28, t: 90, isH: false, a: 0.40, dur: 9.5,  del: 4.8 },
  { w: 9.2, h: 12.0, l: 62, t: 75, isH: true,  a: 0.45, dur: 11.3, del: 2.0 },
  { w: 6.8, h: 7.5,  l: 88, t: 82, isH: false, a: 0.38, dur: 13.8, del: 5.1 },
  { w: 7.6, h: 10.8, l: 35, t: 65, isH: true,  a: 0.55, dur: 8.8,  del: 1.8 },
  { w: 8.5, h: 9.2,  l: 55, t: 92, isH: false, a: 0.32, dur: 15.5, del: 3.0 },
  { w: 5.5, h: 11.5, l: 18, t: 78, isH: true,  a: 0.42, dur: 10.2, del: 4.2 },
  { w: 9.8, h: 8.0,  l: 72, t: 88, isH: false, a: 0.36, dur: 12.0, del: 0.8 },
  { w: 6.2, h: 10.0, l: 42, t: 70, isH: true,  a: 0.50, dur: 9.8,  del: 5.5 },
  { w: 7.8, h: 12.5, l: 8,  t: 85, isH: false, a: 0.42, dur: 14.8, del: 2.5 },
];

/**
 * CSS-only fallback for the TorusCanvas.
 * Renders a soft radial glow with a subtle rotating ring using CSS.
 */
export const TorusFallback: React.FC = () => (
  <div
    className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center"
    aria-hidden="true"
  >
    {/* Warm radial glow mimicking the 3D torus light */}
    <div
      className="absolute w-[70%] max-w-[420px] aspect-square rounded-full opacity-40"
      style={{
        background:
          'radial-gradient(circle, rgba(255,176,116,0.6) 0%, rgba(148,56,78,0.3) 45%, transparent 70%)',
      }}
    />
    {/* CSS ring that slowly rotates */}
    <div
      className="absolute w-[55%] max-w-[340px] aspect-square rounded-full border-[6px] border-[#94384e]/30 animate-[spin_20s_linear_infinite] opacity-60"
      style={{
        boxShadow:
          'inset 0 0 40px rgba(148,56,78,0.15), 0 0 60px rgba(255,115,59,0.1)',
      }}
    />
    <div
      className="absolute w-[48%] max-w-[300px] aspect-square rounded-full border-[3px] border-[#ff733b]/20 animate-[spin_28s_linear_infinite_reverse] opacity-40"
    />
  </div>
);

/**
 * CSS-only fallback for the TestimonialCanvas.
 * Renders glassmorphism rectangles with CSS backdrop-blur.
 */
export const TestimonialFallback: React.FC = () => (
  <div
    className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-visible"
    aria-hidden="true"
  >
    {/* Glass slab 1 — top-left */}
    <div
      className="absolute w-28 h-20 sm:w-36 sm:h-24 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg"
      style={{ top: '12%', left: '5%', transform: 'rotate(-2deg)' }}
    />
    {/* Glass slab 2 — top-right */}
    <div
      className="absolute w-36 h-24 sm:w-44 sm:h-28 rounded-2xl bg-sky-100/10 dark:bg-sky-400/5 backdrop-blur-md border border-sky-200/20 dark:border-sky-400/10 shadow-lg"
      style={{ top: '8%', right: '8%', transform: 'rotate(1deg)' }}
    />
    {/* Glass slab 3 — center-right */}
    <div
      className="absolute w-40 h-28 sm:w-48 sm:h-32 rounded-2xl bg-white/8 dark:bg-white/4 backdrop-blur-md border border-white/15 dark:border-white/8 shadow-lg animate-[float_6s_ease-in-out_infinite]"
      style={{ top: '38%', right: '3%', transform: 'rotate(-1deg)' }}
    />
    {/* Glass slab 4 — bottom-left */}
    <div
      className="absolute w-30 h-22 sm:w-36 sm:h-26 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/15 dark:border-white/8 shadow-lg"
      style={{ bottom: '15%', left: '8%', transform: 'rotate(2deg)' }}
    />
    {/* Glass slab 5 — bottom-right */}
    <div
      className="absolute w-36 h-24 sm:w-44 sm:h-28 rounded-2xl bg-sky-50/8 dark:bg-sky-400/4 backdrop-blur-md border border-sky-100/15 dark:border-sky-400/8 shadow-lg animate-[float_8s_ease-in-out_infinite_1s]"
      style={{ bottom: '8%', right: '10%', transform: 'rotate(-1.5deg)' }}
    />
  </div>
);

/**
 * CSS-only fallback for the CertificationCanvas.
 * Renders soft glowing golden dots — all values are static/deterministic.
 */
export const CertificationFallback: React.FC = () => (
  <div
    className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 overflow-hidden"
    aria-hidden="true"
  >
    {/* Warm ambient golden radial glow */}
    <div
      className="absolute inset-0 opacity-40"
      style={{
        background:
          'radial-gradient(ellipse at 50% 60%, rgba(255,215,120,0.25) 0%, transparent 60%)',
      }}
    />
    {/* Floating golden dust particles — deterministic positions */}
    <div className="absolute inset-0">
      {CERT_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-[floatUp_linear_infinite]"
          style={{
            width: `${p.w}px`,
            height: `${p.h}px`,
            left: `${p.l}%`,
            top: `${p.t}%`,
            backgroundColor: `rgba(255, ${p.r}, ${p.g}, ${p.a})`,
            boxShadow: `0 0 ${p.blur}px rgba(255, 200, 80, 0.3)`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.del}s`,
          }}
        />
      ))}
    </div>
  </div>
);

/**
 * CSS-only fallback for the PreFooterCanvas.
 * Renders subtle floating gradient dots — all values are static/deterministic.
 */
export const PreFooterFallback: React.FC = () => (
  <div
    className="absolute inset-0 w-full h-full pointer-events-none select-none z-15 overflow-hidden"
    aria-hidden="true"
  >
    {/* Golden honey ambient glow */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background:
          'radial-gradient(ellipse at 30% 40%, rgba(245,158,11,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(52,211,153,0.12) 0%, transparent 50%)',
      }}
    />
    {/* Floating drops — deterministic positions */}
    <div className="absolute inset-0">
      {PREFOOTER_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-[floatUp_linear_infinite]"
          style={{
            width: `${p.w}px`,
            height: `${p.h}px`,
            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
            left: `${p.l}%`,
            top: `${p.t}%`,
            backgroundColor: p.isH
              ? `rgba(245, 158, 11, ${p.a})`
              : `rgba(255, 255, 255, ${p.a})`,
            boxShadow: p.isH
              ? '0 0 10px rgba(245, 158, 11, 0.25)'
              : '0 0 8px rgba(255, 255, 255, 0.15)',
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.del}s`,
          }}
        />
      ))}
    </div>
  </div>
);
