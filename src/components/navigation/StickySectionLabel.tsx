'use client';

import React from 'react';

interface StickySectionLabelProps {
  activeSectionId: string;
}

const SECTION_LABELS: Record<string, string> = {
  top: 'Scanner overview',
  overview: 'Overview and telemetry',
  analytics: 'Vulnerability analytics',
  agents: 'Target inventory',
  scan: 'Security scanning',
  results: 'Scan findings',
  reports: 'Audit reports',
  faq: 'Methodology FAQ',
};

export const StickySectionLabel: React.FC<StickySectionLabelProps> = ({
  activeSectionId,
}) => {
  const label = SECTION_LABELS[activeSectionId] || 'Scanner overview';

  return (
    <div
      aria-label="Current section indicator"
      className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-navy-900 border border-[#1A2E5A] text-xs font-mono text-cream-soft select-none"
    >
      <span>{label}</span>
    </div>
  );
};
