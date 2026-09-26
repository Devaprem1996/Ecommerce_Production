"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleData {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  image?: string;
}

interface FlyingCartContextType {
  triggerFly: (startX: number, startY: number, image?: string) => void;
}

const FlyingCartContext = createContext<FlyingCartContextType>({
  triggerFly: () => {},
});

export const useFlyingCart = () => useContext(FlyingCartContext);

export const FlyingCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  const triggerFly = useCallback((startX: number, startY: number, image?: string) => {
    // Find header cart button position or fallback to top right
    const cartEl = document.getElementById('header-cart-btn');
    let targetX = window.innerWidth - 60;
    let targetY = 30;

    if (cartEl) {
      const rect = cartEl.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const newParticle: ParticleData = {
      id: Date.now() + Math.random(),
      startX,
      startY,
      targetX,
      targetY,
      image,
    };

    setParticles((prev) => [...prev, newParticle]);

    // Animate cart button bounce on arrival
    setTimeout(() => {
      if (cartEl) {
        cartEl.classList.add('scale-125', 'transition-transform', 'duration-200');
        setTimeout(() => {
          cartEl.classList.remove('scale-125');
        }, 250);
      }
    }, 650);

    // Clean up particle
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 900);
  }, []);

  return (
    <FlyingCartContext.Provider value={{ triggerFly }}>
      {children}
      {/* Particle Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: p.startX - 18,
                y: p.startY - 18,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: [p.startX - 18, (p.startX + p.targetX) / 2 - 40, p.targetX - 12],
                y: [p.startY - 18, Math.min(p.startY, p.targetY) - 80, p.targetY - 12],
                scale: [1, 1.25, 0.35],
                opacity: [1, 1, 0.2],
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute w-9 h-9 rounded-full bg-emerald-700 shadow-xl border-2 border-white flex items-center justify-center overflow-hidden"
            >
              {p.image ? (
                <img src={p.image} alt="Cart item" className="w-full h-full object-cover" />
              ) : (
                <span className="w-3 h-3 rounded-full bg-amber-400" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyingCartContext.Provider>
  );
};
