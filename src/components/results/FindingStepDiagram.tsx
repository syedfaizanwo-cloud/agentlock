'use client';

import React, { useState } from 'react';
import { Finding } from '../../types/api';
import { CopyButton } from '../ui/CopyButton';
import {
  Terminal,
  Bot,
  ShieldAlert,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface FindingStepDiagramProps {
  finding: Finding;
}

/**
 * Masks credentials or tokens found in strings (leaves first 4 chars, masks rest).
 */
export function maskSensitiveEvidence(text: string): string {
  if (!text) return '';
  return text.replace(
    /(sk-[a-zA-Z0-9]{4})[a-zA-Z0-9]{12,}/g,
    '$1****************'
  ).replace(
    /(Bearer\s+[a-zA-Z0-9_.]{4})[a-zA-Z0-9_.-]{12,}/gi,
    '$1****************'
  ).replace(
    /(api[_-]?key[\s:=]+["']?[a-zA-Z0-9]{4})[a-zA-Z0-9]{10,}["']?/gi,
    '$1****************'
  );
}

export const FindingStepDiagram: React.FC<FindingStepDiagramProps> = ({ finding }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Parse remediation paragraph into checklist items if semicolon/newline/bullet separated
  const checklistItems = React.useMemo(() => {
    if (!finding.remediation) return [];
    const lines = finding.remediation
      .split(/(?:\r?\n|;|\d+\.|\*|-)\s*/)
      .map((l) => l.trim())
      .filter((l) => l.length > 5);
    return lines.length > 0 ? lines : [finding.remediation];
  }, [finding.remediation]);

  const toggleCheck = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const maskedEvidence = maskSensitiveEvidence(finding.evidence);

  return (
    <div className="space-y-6">
      {/* 3-Step Adversarial Execution Flow Diagram */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-cream-muted uppercase tracking-wider">
          Attack Execution Path
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1: Injected Adversarial Payload */}
          <div className="p-4 rounded-xl bg-navy-950 border border-[#1A2E5A] space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-coral">
                  <Terminal className="w-3.5 h-3.5" /> 01. Injected Prompt
                </span>
                <CopyButton text={finding.attack_prompt} label="Copy payload" />
              </div>
              <p className="text-xs font-mono text-cream/90 bg-navy-900 p-2.5 rounded-lg border border-[#1A2E5A]/60 break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
                {finding.attack_prompt}
              </p>
            </div>
            <div className="text-[10px] font-mono text-cream-muted pt-2 border-t border-[#1A2E5A]/40 flex items-center justify-between">
              <span>Vector: {finding.category}</span>
              <ArrowRight className="w-3 h-3 text-cream-muted hidden md:inline" />
            </div>
          </div>

          {/* Step 2: Agent Response & Vulnerability Action */}
          <div className="p-4 rounded-xl bg-navy-950 border border-[#1A2E5A] space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-cream">
                  <Bot className="w-3.5 h-3.5 text-severity-medium" /> 02. Agent Execution
                </span>
                <CopyButton text={maskedEvidence} label="Copy response" />
              </div>
              <p className="text-xs font-mono text-cream-soft bg-navy-900 p-2.5 rounded-lg border border-[#1A2E5A]/60 break-words whitespace-pre-wrap max-h-48 overflow-y-auto">
                {maskedEvidence || 'Agent complied with unauthorized payload instructions.'}
              </p>
            </div>
            <div className="text-[10px] font-mono text-cream-muted pt-2 border-t border-[#1A2E5A]/40 flex items-center justify-between">
              <span>Status: Confirmed Breach</span>
              <ArrowRight className="w-3 h-3 text-cream-muted hidden md:inline" />
            </div>
          </div>

          {/* Step 3: Verified Exploit Evidence & Consequence */}
          <div className="p-4 rounded-xl bg-navy-950 border border-severity-critical/30 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-severity-critical">
                  <ShieldAlert className="w-3.5 h-3.5" /> 03. Impact & Leak
                </span>
                <CopyButton text={finding.impact} label="Copy impact" />
              </div>
              <p className="text-xs font-sans text-cream/90 bg-navy-900 p-2.5 rounded-lg border border-[#1A2E5A]/60 break-words leading-relaxed max-h-48 overflow-y-auto">
                {finding.impact || finding.description}
              </p>
            </div>
            <div className="text-[10px] font-mono text-severity-critical pt-2 border-t border-[#1A2E5A]/40">
              Severity: {finding.severity.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Remediation Action Checklist */}
      <div className="p-5 rounded-xl bg-navy-950 border border-[#1A2E5A] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-severity-low" />
            <h4 className="text-xs font-mono font-bold text-cream uppercase tracking-wider">
              Remediation Action Checklist
            </h4>
          </div>
          <span className="text-[11px] font-mono text-cream-muted">
            {Object.values(completedSteps).filter(Boolean).length} / {checklistItems.length} applied
          </span>
        </div>

        <div className="space-y-2">
          {checklistItems.map((step, idx) => {
            const isDone = Boolean(completedSteps[idx]);
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-3 rounded-lg border cursor-pointer select-none transition-colors flex items-start gap-3 ${
                  isDone
                    ? 'bg-navy-900 border-severity-low/40 text-cream-muted line-through'
                    : 'bg-navy-900/60 border-[#1A2E5A] hover:border-coral/50 text-cream'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 shrink-0 focus:outline-none"
                  aria-label={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-severity-low" />
                  ) : (
                    <Square className="w-4 h-4 text-cream-muted" />
                  )}
                </button>
                <span className="text-xs font-sans leading-relaxed">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
