'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface SectionInsightProps {
  text: string;
  badge?: string;
  className?: string;
}

export const SectionInsight: React.FC<SectionInsightProps> = ({
  text,
  badge = 'VERIFIED INSIGHT',
  className = '',
}) => {
  if (!text) return null;

  return (
    <div
      className={`my-3 p-3 sm:px-4 sm:py-3 rounded-xl bg-[#0A1633] border border-[#12234A] text-xs font-sans text-[#C8C0AC] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shadow-[4px_4px_8px_#030714] transition-all ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#FF6F59]" />
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FF6F59]/10 border border-[#FF6F59]/30 text-[#FF6F59] flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#FF6F59]" />
          <span>{badge}</span>
        </span>
      </div>
      <p className="text-xs sm:text-sm text-[#F5EDDC] font-medium leading-relaxed font-sans m-0">
        {text}
      </p>
    </div>
  );
};
