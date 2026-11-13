'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface FuturisticLoadingBarProps {
  statusText?: string;
}

const TELEMETRY_STAGES = [
  'INITIALIZING SECURE ENVIRONMENT',
  'CALIBRATING ADVERSARIAL MATRIX',
  'VERIFYING SECURITY RUNTIME',
];

export const FuturisticLoadingBar: React.FC<FuturisticLoadingBarProps> = ({
  statusText,
}) => {
  const prefersReduced = useReducedMotion();
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % TELEMETRY_STAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, [prefersReduced]);

  const currentText = statusText || TELEMETRY_STAGES[stageIndex];

  return (
    <div className="w-full max-w-[280px] sm:max-w-[340px] flex flex-col items-center gap-3 select-none">
      {/* Track & Animated Progress Line */}
      <div className="relative w-full h-[2px] bg-[#0E1B3E] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(3,7,20,0.8)]">
        {/* Subtle coral glow track aura */}
        <div className="absolute inset-0 bg-[#FF685B]/10 rounded-full" />

        {/* Primary animated beam */}
        {prefersReduced ? (
          <div className="absolute inset-0 bg-[#FF685B] rounded-full" />
        ) : (
          <motion.div
            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-transparent via-[#FF685B] to-[#FFA494]"
            style={{ width: '45%' }}
            animate={{
              left: ['-50%', '110%'],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: [0.45, 0, 0.25, 1],
            }}
          />
        )}

        {/* High-intensity glowing lead point */}
        {!prefersReduced && (
          <motion.div
            className="absolute top-[-1px] w-[5px] h-[4px] rounded-full bg-[#FFFFFF] shadow-[0_0_8px_#FF685B,0_0_16px_#FF685B]"
            animate={{
              left: ['-20%', '105%'],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: [0.45, 0, 0.25, 1],
              delay: 0.1,
            }}
          />
        )}
      </div>

      {/* Futuristic Telemetry Status Indicator */}
      <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] tracking-[0.22em] text-[#C8C0AC] uppercase">
        <span className="relative flex h-1.5 w-1.5">
          {!prefersReduced && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF685B] opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF685B]" />
        </span>
        <span className="truncate">{currentText}</span>
      </div>
    </div>
  );
};
