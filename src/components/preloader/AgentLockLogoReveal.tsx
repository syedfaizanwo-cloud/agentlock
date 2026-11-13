'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Shield } from 'lucide-react';

interface AgentLockLogoRevealProps {
  isReady?: boolean;
}

export const AgentLockLogoReveal: React.FC<AgentLockLogoRevealProps> = () => {
  const prefersReduced = useReducedMotion();

  // Timing constants (ms aligned with requirements)
  const containerEase = [0.16, 1, 0.3, 1] as const; // Custom spring-like cubic bezier
  const smoothEase = [0.25, 0.1, 0.25, 1] as const;

  return (
    <div className="flex items-center gap-3.5 sm:gap-5 select-none">
      {/* 1. Coral Rounded-Square Logo Container */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { scale: 0.65, opacity: 0 }}
        animate={prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={{
          duration: prefersReduced ? 0.2 : 0.55,
          ease: containerEase,
        }}
        className="relative"
      >
        {/* Subtle Ambient Coral Glow Aura */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute -inset-2 sm:-inset-3 bg-[#FF685B]/30 rounded-2xl sm:rounded-3xl blur-xl pointer-events-none"
        />

        {/* Coral Container with Crisp Rounded Corners & Neumorphic Edge */}
        <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[22px] bg-[#FF685B] flex items-center justify-center shadow-[0_4px_24px_rgba(255,104,91,0.4),0_8px_32px_rgba(3,7,20,0.8)] border border-[#FF8A7A]/30">
          {/* 2. Shield Icon with Smooth Pop */}
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
            animate={prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{
              delay: prefersReduced ? 0.1 : 0.25,
              duration: prefersReduced ? 0.2 : 0.38,
              ease: containerEase,
            }}
            className="text-[#080F28]"
          >
            <Shield className="w-7 h-7 sm:w-10 sm:h-10 fill-current stroke-[#080F28] stroke-1" />
          </motion.div>
        </div>
      </motion.div>

      {/* 3. Brand Text: "AgentLock" Horizontal Reveal */}
      <div className="overflow-hidden py-1">
        <motion.div
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, x: -20, clipPath: 'inset(0 100% 0 0)' }
          }
          animate={
            prefersReduced
              ? { opacity: 1 }
              : { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }
          }
          transition={{
            delay: prefersReduced ? 0.2 : 0.45,
            duration: prefersReduced ? 0.2 : 0.65,
            ease: smoothEase,
          }}
          className="flex flex-col"
        >
          <span className="font-sans font-extrabold text-3xl sm:text-5xl tracking-[-0.03em] text-[#F5F2E9] leading-none">
            AgentLock
          </span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            className="font-mono text-[9px] sm:text-[11px] tracking-[0.25em] text-[#C8C0AC] uppercase mt-1 pl-0.5"
          >
            Red Teaming Platform
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
};
