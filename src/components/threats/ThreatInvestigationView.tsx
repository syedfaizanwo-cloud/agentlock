'use client';

import React from 'react';
import { Finding, SeverityLevel } from '../../types/api';
import { FindingStepDiagram } from '../results/FindingStepDiagram';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ThreatInvestigationViewProps {
  finding: Finding | null;
  onClose?: () => void;
}

export const ThreatInvestigationView: React.FC<ThreatInvestigationViewProps> = ({
  finding,
  onClose,
}) => {
  if (!finding) {
    return (
      <div className="p-8 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-cream-muted mx-auto" />
        <div className="text-xs font-mono text-cream">No finding selected</div>
        <p className="text-xs text-cream-muted">
          Select a finding to inspect the adversarial payload, evidence, and remediation.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-critical/15 text-severity-critical border border-severity-critical/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-high/15 text-severity-high border border-severity-high/30">
            <AlertTriangle className="w-3.5 h-3.5" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-medium/15 text-severity-medium border border-severity-medium/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-low/15 text-severity-low border border-severity-low/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-navy-850 text-cream-muted border border-[#1A2E5A]">
            <Info className="w-3.5 h-3.5" /> Info
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2E5A]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            {getSeverityBadge(finding.severity as SeverityLevel)}
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-navy-850 border border-[#1A2E5A] text-cream-soft">
              {finding.category.replace('_', ' ')}
            </span>
            <span className="text-xs font-mono text-cream-muted">
              ID: {finding.id}
            </span>
          </div>
          <h3 className="text-lg font-bold font-sans text-cream mt-1">
            {finding.title}
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] hover:border-coral text-cream-soft hover:text-cream text-xs font-mono transition-colors"
          >
            Back to list
          </button>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <h4 className="text-xs font-mono text-cream-muted">Description</h4>
        <p className="text-xs text-cream font-sans leading-relaxed">
          {finding.description}
        </p>
      </div>

      {/* 3-Step Adversarial Execution Flow & Remediation Checklist */}
      <FindingStepDiagram finding={finding} />
    </div>
  );
};
