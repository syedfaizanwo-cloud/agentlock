'use client';

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface OpeningLoaderProps {
  onComplete: () => void;
}

export const OpeningLoader: React.FC<OpeningLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsDone(true);
      onComplete();
      return;
    }

    // Step 1: Smooth progress 0 to 100% over ~1.6s
    const startTime = Date.now();
    const duration = 1600; // 1.6s total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        // Step 2: Fade out loader over 400ms
        setIsFadingOut(true);
        setTimeout(() => {
          setIsDone(true);
          onComplete();
        }, 450);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Initializing AgentLock 2.0 security mesh"
      className={`fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center p-6 transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm w-full space-y-6 text-center">
        {/* AgentLock shield logo mark */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#E6CBA8] text-[#0A0A0A] flex items-center justify-center shadow-[0_0_30px_rgba(230,203,168,0.4)] animate-pulse">
            <Shield className="w-8 h-8 fill-current" />
          </div>
          {/* Subtle spinning accent ring */}
          <div className="absolute -inset-2 rounded-3xl border border-[#E6CBA8]/30 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <div className="font-sans font-bold text-lg text-white tracking-tight">
            AgentLock <span className="text-[#E6CBA8]">2.0</span>
          </div>
          <div className="font-mono text-xs text-[#8A8A8A] tracking-wider">
            Initializing AgentLock 2.0…
          </div>
        </div>

        {/* Thin Gold Progress Line (0 to 100%) */}
        <div className="w-full space-y-2">
          <div className="w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#2A2A2A]">
            <div
              className="h-full bg-gradient-to-r from-[#B89B72] via-[#E6CBA8] to-[#F7E7CE] transition-all duration-75 ease-out shadow-[0_0_10px_#E6CBA8]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#5C5C5C]">
            <span>SecOps Mesh Check</span>
            <span className="text-[#E6CBA8] font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
