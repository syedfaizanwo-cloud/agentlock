'use client';

import React from 'react';

export const MockBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 uppercase tracking-wider select-none ${className}`}
      title="This component is rendering isolated mock data because NEXT_PUBLIC_USE_MOCKS=true"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
      MOCK DATA
    </span>
  );
};
