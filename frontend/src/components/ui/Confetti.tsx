"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  delay: number;
  duration: number;
}

const COLORS = [
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#f43f5e'  // rose-500
];

const SHAPES: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];

export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 80 }).map((_, idx) => {
      // Random direction and force
      const angle = Math.random() * 360;
      const distance = 80 + Math.random() * 180;
      const radian = (angle * Math.PI) / 180;
      
      const x = Math.cos(radian) * distance;
      const y = -100 - Math.random() * 300; // Explode upwards, then drift down

      return {
        id: idx,
        x,
        y,
        angle: Math.random() * 720 - 360,
        scale: 0.4 + Math.random() * 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        delay: Math.random() * 0.3,
        duration: 1.5 + Math.random() * 1.5
      };
    });

    setParticles(newParticles);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => {
        let borderRadius = '0px';
        let clipPath = 'none';

        if (p.shape === 'circle') {
          borderRadius = '50%';
        } else if (p.shape === 'triangle') {
          clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }

        return (
          <motion.div
            key={p.id}
            initial={{
              x: '50vw',
              y: '50vh',
              scale: 0,
              rotate: 0,
              opacity: 1
            }}
            animate={{
              x: `calc(50vw + ${p.x}px)`,
              y: '110vh', // Fall off screen
              scale: p.scale,
              rotate: p.angle,
              opacity: [1, 1, 0.8, 0] // Fade out at the end
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.1, 0.8, 0.3, 1] // Explode fast, fall slow
            }}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: p.color,
              borderRadius,
              clipPath,
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;
