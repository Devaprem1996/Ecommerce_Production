"use client";

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { useCanvasCapability, CanvasTier } from '@/hooks/useCanvasCapability';

interface LazyCanvasWrapperProps {
  /** The Three.js canvas component — only rendered on high/medium tiers */
  children: ReactNode;
  /** CSS-only fallback for mobile / low-power devices */
  fallback?: ReactNode;
  /** Extra className for the outer container */
  className?: string;
  /** Intersection threshold before activating (0–1) */
  threshold?: number;
  /** Render settings override per tier */
  tierOverride?: CanvasTier;
}

/**
 * Wraps any Three.js canvas component with:
 * 1. Device-tier detection (mobile → CSS fallback)
 * 2. IntersectionObserver lazy-load (only mount when in viewport)
 * 3. Visibility pause (unmount canvas when scrolled away to free GPU)
 */
export const LazyCanvasWrapper: React.FC<LazyCanvasWrapperProps> = ({
  children,
  fallback,
  className = '',
  threshold = 0.15,
}) => {
  const { tier, ready } = useCanvasCapability();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // On mobile/none tiers, skip observer — we never mount the 3D canvas
    if (tier === 'low' || tier === 'none') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin: '100px 0px' } // start loading slightly before in view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [tier, threshold]);

  // Not ready yet — show nothing or fallback
  if (!ready) {
    return (
      <div ref={containerRef} className={className} aria-hidden="true">
        {fallback || null}
      </div>
    );
  }

  // Mobile or no WebGL / reduced motion → show CSS fallback
  if (tier === 'low' || tier === 'none') {
    return (
      <div ref={containerRef} className={className} aria-hidden="true">
        {fallback || null}
      </div>
    );
  }

  // Desktop high/medium → lazy-mount Three.js only when visible
  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {isVisible ? children : (fallback || null)}
    </div>
  );
};
