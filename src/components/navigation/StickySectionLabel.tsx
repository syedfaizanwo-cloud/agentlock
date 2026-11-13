'use client';

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface StickySectionLabelProps {
  activeSectionId: string;
}

const SECTION_LABELS: Record<string, string> = {
  telemetry: 'Live Telemetry',
  flow: 'Flowing Options',
  'fleet-governance': 'Fleet Governance',
  'action-monitoring': 'Action Monitoring',
  'threat-forensics': 'Threat Forensics',
  'approval-center': 'Approval Center',
  'audit-explorer': 'Audit Explorer',
  'attack-simulation': 'Attack Simulation',
  'gateway-api': 'Gateway & API',
  security: 'Source & Egress Security',
  faq: 'FAQ & Architecture',
  contact: 'Incident Dispatch',
};

export const StickySectionLabel: React.FC<StickySectionLabelProps> = ({
  activeSectionId,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Fade in after passing the hero section (> 480px)
      setIsVisible(window.scrollY > 480);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const label = SECTION_LABELS[activeSectionId] || 'Zero-Trust Mesh';

  return (
    <aside
      aria-label="Current section indicator"
      className={`fixed top-5 right-20 z-40 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D0D0D]/90 backdrop-blur-md border border-[#2A2A2A] shadow-lg transition-all duration-300 pointer-events-none ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#E6CBA8] animate-pulse" />
      <span className="text-[11px] font-mono font-medium text-white tracking-wide">
        {label}
      </span>
      <span className="text-[10px] font-mono text-[#8A8A8A] uppercase border-l border-[#2A2A2A] pl-2">
        Mesh Vitals
      </span>
    </aside>
  );
};
