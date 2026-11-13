'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface IntroTransitionProps {
  children: React.ReactNode;
}

export const IntroTransition: React.FC<IntroTransitionProps> = ({ children }) => {
  const prefersReduced = useReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Check if intro has already been seen in this session
    const searchParams = new URLSearchParams(window.location.search);
    const forceReplay =
      searchParams.get('intro') === '1' || searchParams.get('replay') === '1';
    const alreadySeen = sessionStorage.getItem('agentlock_intro_seen');

    if (alreadySeen && !forceReplay) {
      setIsRevealed(true);
      return;
    }

    // Listen for custom reveal event dispatched by AgentLockPreloader
    const handleReveal = () => setIsRevealed(true);
    window.addEventListener('agentlock:reveal', handleReveal);

    // Fallback: reveal after 2.8s in case preloader completes or unmounts
    const fallback = setTimeout(() => setIsRevealed(true), 2800);

    return () => {
      window.removeEventListener('agentlock:reveal', handleReveal);
      clearTimeout(fallback);
    };
  }, []);

  if (prefersReduced) {
    return <div className="relative z-10">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0.9, y: 12 }}
      animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0.9, y: 12 }}
      transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
};
