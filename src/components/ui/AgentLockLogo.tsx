'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

interface AgentLockLogoProps {
  animated?: boolean;
  className?: string;
}

export const AgentLockLogo: React.FC<AgentLockLogoProps> = ({
  animated = true,
  className = '',
}) => {
  const prefersReduced = useReducedMotion();
  const shouldAnimate = animated && !prefersReduced;

  return (
    <Link
      href="/"
      aria-label="AgentLock"
      className={`inline-flex items-center gap-3.5 sm:gap-4 text-cream group focus:outline-none focus:ring-2 focus:ring-coral rounded-2xl p-1.5 transition-transform hover:scale-[1.02] ${className}`}
    >
      {/* Coral shield mark: 56px on desktop (lg), 44px on mobile */}
      <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-coral text-navy-950 flex items-center justify-center shrink-0 shadow-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 lg:w-8 lg:h-8 text-navy-950"
          aria-hidden="true"
        >
          {/* Animated shield stroke: draws in over 700ms */}
          <motion.path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.7,
              ease: 'easeOut',
            }}
          />
          {/* Shield fill: fades in after stroke draws */}
          <motion.path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="currentColor"
            initial={shouldAnimate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{
              delay: shouldAnimate ? 0.6 : 0,
              duration: 0.25,
              ease: 'easeOut',
            }}
          />
        </svg>
      </div>

      {/* Wordmark: fades in after stroke draws */}
      <motion.span
        initial={shouldAnimate ? { opacity: 0, x: -8 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          delay: shouldAnimate ? 0.7 : 0,
          duration: 0.35,
          ease: 'easeOut',
        }}
        className="font-sans font-bold text-2xl lg:text-3xl tracking-tight text-cream"
      >
        AgentLock
      </motion.span>
    </Link>
  );
};
