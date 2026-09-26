"use client";

import React from 'react';

export const BrandWatermarkLoop: React.FC = () => {
  const brandPhrases = [
    'YATHU AROKIYAGAM',
    'PURE LIVING',
    'COLD PRESSED',
    'WILD MOUNTAIN HONEY',
    'SOUTH INDIAN HERITAGE',
  ];

  return (
    <div className="absolute top-[28%] left-0 right-0 overflow-hidden pointer-events-none select-none z-10 opacity-30 dark:opacity-20">
      <div className="flex w-max animate-marquee-slow whitespace-nowrap">
        {[...Array(3)].map((_, loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-12 sm:gap-20 mx-6 sm:mx-10">
            {brandPhrases.map((phrase, pIdx) => (
              <span
                key={pIdx}
                className="text-5xl sm:text-7xl lg:text-9xl font-black uppercase tracking-widest text-transparent"
                style={{
                  WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.45)',
                  fontFamily: 'var(--font-heading, sans-serif)',
                }}
              >
                {phrase}
                <span className="text-secondary-400 mx-8 opacity-70">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
