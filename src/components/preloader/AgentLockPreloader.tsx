'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AgentLockLogoReveal } from './AgentLockLogoReveal';
import { FuturisticLoadingBar } from './FuturisticLoadingBar';

interface AgentLockPreloaderProps {
  /** Optional override for minimum display duration in ms */
  minDurationMs?: number;
  /** Maximum fallback timeout in ms */
  maxTimeoutMs?: number;
  /** Callback fired when transition completes and website is revealed */
  onComplete?: () => void;
}

export const AgentLockPreloader: React.FC<AgentLockPreloaderProps> = ({
  minDurationMs = 2000,
  maxTimeoutMs = 3500,
  onComplete,
}) => {
  const prefersReduced = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if session has already seen the intro or if force-requested via query param
    const searchParams = new URLSearchParams(window.location.search);
    const forceReplay =
      searchParams.get('intro') === '1' || searchParams.get('replay') === '1';
    const alreadySeen = sessionStorage.getItem('agentlock_intro_seen');

    if (alreadySeen && !forceReplay) {
      setIsCompleted(true);
      return;
    }

    // New session: lock body scroll and show preloader
    setIsVisible(true);
    document.body.style.overflow = 'hidden';

    // If user prefers reduced motion, exit very quickly
    if (prefersReduced) {
      const quickTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          document.body.style.overflow = '';
          sessionStorage.setItem('agentlock_intro_seen', 'true');
          setIsCompleted(true);
          onComplete?.();
        }, 300);
      }, 500);
      return () => clearTimeout(quickTimer);
    }

    // Full cinematic intro timing
    let didExit = false;

    const startExit = () => {
      if (didExit) return;
      didExit = true;
      setIsExiting(true);

      // Trigger smooth emergence transition on underlying website
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('agentlock:reveal'));
      }

      setTimeout(() => {
        document.body.style.overflow = '';
        sessionStorage.setItem('agentlock_intro_seen', 'true');
        setIsCompleted(true);
        onComplete?.();

        // Restore hash navigation if user landed with a hash like #scan
        if (window.location.hash) {
          const target = document.querySelector(window.location.hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 800); // 800ms exit transition
    };

    // Primary exit timer
    const exitTimer = setTimeout(startExit, minDurationMs);

    // Safety fallback timeout (never stay stuck)
    const fallbackTimer = setTimeout(startExit, maxTimeoutMs);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(fallbackTimer);
      document.body.style.overflow = '';
    };
  }, [minDurationMs, maxTimeoutMs, prefersReduced, onComplete]);

  if (isCompleted || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isCompleted && (
        <motion.div
          key="agentlock-preloader-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#080F28] select-none pointer-events-auto"
          style={{
            willChange: 'opacity',
          }}
          aria-label="AgentLock Initialization"
          role="dialog"
          aria-modal="true"
        >
          {/* Subtle Ambient Radial Backlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(255,104,91,0.08)_0%,transparent_60%)] pointer-events-none" />

          {/* Centered Presentation Lockup */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={
              isExiting
                ? { scale: 0.95, opacity: 0 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 flex flex-col items-center gap-9 px-6"
          >
            {/* Phase 1 & 2: Logo and Brand Reveal */}
            <AgentLockLogoReveal />

            {/* Futuristic Loading Indicator */}
            <FuturisticLoadingBar />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
