'use client';

import React from 'react';

interface StickySectionLabelProps {
  activeSectionId: string;
}

const SECTION_LABELS: Record<string, string> = {
  top: 'Agent Vulnerability Scanner',
  overview: 'Platform Overview',
  analytics: 'Vulnerability Analytics',
  agents: 'Agent Inventory',
  scan: 'Security Scanning',
  results: 'Vulnerability Results',
  reports: 'Audit Reports',
  faq: 'Methodology FAQ',
};

export const StickySectionLabel: React.FC<StickySectionLabelProps> = ({
  activeSectionId,
}) => {
  const label = SECTION_LABELS[activeSectionId] || 'Agent Vulnerability Scanner';

  return (
    <div
      aria-label="Current section indicator"
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#060D1F] border border-[#12234A] shadow-[inset_2px_2px_4px_#030714] select-none"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F59]" />
      <span className="text-[11px] font-mono font-medium text-[#F5EDDC] tracking-wide">
        {label}
      </span>
      <span className="text-[10px] font-mono text-[#C8C0AC]/60 uppercase border-l border-[#12234A] pl-2">
        SCANNER
      </span>
    </div>
  );
};
