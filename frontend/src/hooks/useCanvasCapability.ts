"use client";

import { useState, useEffect } from 'react';

export type CanvasTier = 'high' | 'medium' | 'low' | 'none';

export interface CanvasCapability {
  /** Device rendering tier */
  tier: CanvasTier;
  /** True on phones/tablets or touch-primary devices */
  isMobile: boolean;
  /** True when device has limited memory or CPU cores */
  isLowPower: boolean;
  /** True when user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** True when WebGL2 or WebGL1 is available */
  webglSupported: boolean;
  /** True once detection is complete */
  ready: boolean;
}

/**
 * Detects device capability and returns a rendering tier.
 *
 * Tier decision matrix:
 *   high   → Desktop + high power → Full Three.js, lazy on scroll
 *   medium → Desktop + low power  → Three.js at 0.5 pixelRatio, 30fps cap
 *   low    → Mobile (all)          → CSS-only ambient fallback
 *   none   → Reduced motion / no WebGL → No animation at all
 */
export function useCanvasCapability(): CanvasCapability {
  const [capability, setCapability] = useState<CanvasCapability>({
    tier: 'low', // default to safe until detection runs
    isMobile: true,
    isLowPower: false,
    prefersReducedMotion: false,
    webglSupported: false,
    ready: false,
  });

  useEffect(() => {
    // --- Reduced motion ---
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // --- Touch / Mobile detection ---
    const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.innerWidth < 768;
    const isMobile = isTouchPrimary || isNarrow;

    // --- Low power detection ---
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };
    const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4;
    const lowCores =
      typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4;
    const isLowPower = lowMemory || lowCores;

    // --- WebGL support ---
    let webglSupported = false;
    try {
      const testCanvas = document.createElement('canvas');
      webglSupported = !!(
        testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
      );
    } catch {
      webglSupported = false;
    }

    // --- Tier decision ---
    let tier: CanvasTier;
    if (prefersReducedMotion || !webglSupported) {
      tier = 'none';
    } else if (isMobile) {
      tier = 'low'; // CSS fallback for all mobile
    } else if (isLowPower) {
      tier = 'medium'; // degraded Three.js
    } else {
      tier = 'high'; // full Three.js
    }

    setCapability({
      tier,
      isMobile,
      isLowPower,
      prefersReducedMotion,
      webglSupported,
      ready: true,
    });
  }, []);

  return capability;
}
