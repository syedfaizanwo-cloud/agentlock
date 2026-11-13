'use client';

import React, { useState } from 'react';
import { Finding, SeverityLevel, AttackCategory } from '../../types/api';
import { CopyButton } from '../ui/CopyButton';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
} from 'lucide-react';

interface ThreatInvestigationViewProps {
  finding: Finding | null;
  onClose?: () => void;
}

export const ThreatInvestigationView: React.FC<ThreatInvestigationViewProps> = ({
  finding,
  onClose,
}) => {
  const [expandPrompt, setExpandPrompt] = useState(false);
  const [expandEvidence, setExpandEvidence] = useState(false);

  if (!finding) {
    return (
      <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-[#C8C0AC]/60 mx-auto" />
        <div className="text-xs font-mono text-[#C8C0AC]">No Finding Selected</div>
        <p className="text-xs text-[#C8C0AC]/70">
          Select a vulnerability finding to inspect the attack payload, raw evidence, and remediation.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/40">
            <ShieldAlert className="w-3.5 h-3.5" /> CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40">
            <AlertTriangle className="w-3.5 h-3.5" /> HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/40">
            <AlertTriangle className="w-3.5 h-3.5" /> MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#94A3B8]/15 text-[#94A3B8] border border-[#94A3B8]/40">
            <Info className="w-3.5 h-3.5" /> INFO
          </span>
        );
    }
  };

  const formatCategory = (cat: AttackCategory) => {
    return cat.replace('_', ' ').toUpperCase();
  };

  const PROMPT_LIMIT = 280;
  const EVIDENCE_LIMIT = 320;

  const displayPrompt =
    !expandPrompt && finding.attack_prompt.length > PROMPT_LIMIT
      ? finding.attack_prompt.slice(0, PROMPT_LIMIT) + '...'
      : finding.attack_prompt;

  const displayEvidence =
    !expandEvidence && finding.evidence.length > EVIDENCE_LIMIT
      ? finding.evidence.slice(0, EVIDENCE_LIMIT) + '...'
      : finding.evidence;

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[8px_8px_16px_#030714,-8px_-8px_16px_#12234A] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12234A]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {getSeverityBadge(finding.severity)}
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-[#060D1F] border border-[#12234A] text-[#FF6F59]">
              {formatCategory(finding.category)}
            </span>
          </div>
          <h3 className="text-lg font-bold font-sans text-[#F5EDDC] pt-1">
            {finding.title}
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#C8C0AC] hover:text-[#F5EDDC] px-3 py-1.5 rounded-lg bg-[#060D1F] border border-[#12234A]"
          >
            Close Detail
          </button>
        )}
      </div>

      {/* Description & Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC]">
            Vulnerability Description
          </h4>
          <p className="text-xs sm:text-sm font-sans text-[#F5EDDC] leading-relaxed">
            {finding.description}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC]">
            System Impact
          </h4>
          <p className="text-xs sm:text-sm font-sans text-[#FF6F59] leading-relaxed">
            {finding.impact}
          </p>
        </div>
      </div>

      {/* Inset Mono Panel 1: Attack Payload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#C8C0AC] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#FF6F59]" />
            Adversarial Attack Payload
          </span>
          <CopyButton text={finding.attack_prompt} label="Copy payload" />
        </div>
        <div className="p-4 rounded-xl bg-[#060D1F] border border-[#12234A] shadow-[inset_3px_3px_6px_#030714,inset_-3px_-3px_6px_#12234A] text-xs font-mono text-[#F5EDDC] whitespace-pre-wrap break-all leading-relaxed">
          {displayPrompt}
        </div>
        {finding.attack_prompt.length > PROMPT_LIMIT && (
          <button
            onClick={() => setExpandPrompt(!expandPrompt)}
            className="text-[11px] font-mono text-[#FF6F59] hover:underline flex items-center gap-1"
          >
            {expandPrompt ? (
              <>
                <ChevronUp className="w-3 h-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> Show full payload ({finding.attack_prompt.length} chars)
              </>
            )}
          </button>
        )}
      </div>

      {/* Inset Mono Panel 2: Raw Response Evidence */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#C8C0AC] flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-[#34D399]" />
            Agent Response Evidence (Captured)
          </span>
          <CopyButton text={finding.evidence} label="Copy evidence" />
        </div>
        <div className="p-4 rounded-xl bg-[#060D1F] border border-[#12234A] shadow-[inset_3px_3px_6px_#030714,inset_-3px_-3px_6px_#12234A] text-xs font-mono text-[#34D399] whitespace-pre-wrap break-all leading-relaxed">
          {displayEvidence}
        </div>
        {finding.evidence.length > EVIDENCE_LIMIT && (
          <button
            onClick={() => setExpandEvidence(!expandEvidence)}
            className="text-[11px] font-mono text-[#34D399] hover:underline flex items-center gap-1"
          >
            {expandEvidence ? (
              <>
                <ChevronUp className="w-3 h-3" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> Show full evidence ({finding.evidence.length} chars)
              </>
            )}
          </button>
        )}
      </div>

      {/* Remediation Guidance */}
      <div className="p-5 rounded-xl bg-[#060D1F] border border-[#12234A] space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[#34D399] font-bold">
          Recommended Remediation &amp; Mitigation
        </div>
        <p className="text-xs sm:text-sm font-sans text-[#F5EDDC] leading-relaxed">
          {finding.remediation}
        </p>
      </div>
    </div>
  );
};
