'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface SectionInsightProps {
  text: string;
  badge?: string;
  className?: string;
}

export const SectionInsight: React.FC<SectionInsightProps> = ({
  text,
  badge = 'PLAIN-ENGLISH INSIGHT',
  className = '',
}) => {
  return (
    <div
      className={`my-3 p-3 sm:px-4 sm:py-3 rounded-xl bg-[#0D0D0D] border-none text-xs font-sans text-[#BDBDBD] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-all ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#E6CBA8] animate-pulse shadow-[0_0_8px_#E6CBA8]" />
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[rgba(230,203,168,0.12)] text-[#E6CBA8] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#E6CBA8]" />
          <span>{badge}</span>
        </span>
      </div>
      <p className="text-xs sm:text-sm text-white font-medium leading-relaxed font-sans m-0">
        {text}
      </p>
    </div>
  );
};
