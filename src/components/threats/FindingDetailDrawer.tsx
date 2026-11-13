'use client';

import React, { useEffect } from 'react';
import { Finding, SeverityLevel } from '../../types/api';
import { CopyButton } from '../ui/CopyButton';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Terminal,
  FileCode,
  FileSearch,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FindingDetailDrawerProps {
  finding: Finding | null;
  agentName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({
  finding,
  agentName,
  isOpen,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF3158]/20 text-[#FF3158] border border-[#FF3158]/40 shadow-[0_0_12px_rgba(255,49,88,0.25)]">
            <ShieldAlert className="w-3.5 h-3.5" /> CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/40 shadow-[0_0_12px_rgba(255,159,10,0.25)]">
            <AlertTriangle className="w-3.5 h-3.5" /> HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FFD43B]/20 text-[#FFD43B] border border-[#FFD43B]/40 shadow-[0_0_12px_rgba(255,212,59,0.25)]">
            <AlertTriangle className="w-3.5 h-3.5" /> MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#32D6A0]/20 text-[#32D6A0] border border-[#32D6A0]/40">
            <ShieldCheck className="w-3.5 h-3.5" /> LOW
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-[#C8C0AC] border border-white/20">
            <Info className="w-3.5 h-3.5" /> INFO
          </span>
        );
    }
  };

  if (!isOpen || !finding) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Translucent Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#030714]/75 backdrop-blur-sm"
        />

        {/* Slide-over Glass Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl h-full bg-[#080F28]/90 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(3,7,20,0.9)] flex flex-col z-10 overflow-hidden"
        >
          {/* Ambient Glow Accent */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF6F59]/[0.05] rounded-full blur-3xl pointer-events-none" />

          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 bg-[#060D1F]/60 flex items-start justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {getSeverityBadge(finding.severity)}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/30">
                  {finding.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs font-mono text-[#C8C0AC]">
                  ID: {finding.id}
                </span>
              </div>
              <h2 className="text-lg font-bold font-sans text-[#F5EDDC] leading-snug">
                {finding.title}
              </h2>
              {agentName && (
                <div className="text-xs font-mono text-[#C8C0AC]/80">
                  Target Agent: <span className="text-[#F5EDDC] font-bold">{agentName}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close detail panel"
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#FF6F59] text-[#C8C0AC] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 text-xs font-sans">
            {/* Description */}
            <div className="p-4 rounded-xl glass-well space-y-1.5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#C8C0AC] font-bold">
                Vulnerability Overview
              </div>
              <p className="text-[#F5EDDC] leading-relaxed text-xs">
                {finding.description}
              </p>
            </div>

            {/* Impact */}
            <div className="p-4 rounded-xl glass-well space-y-1.5 border-l-2 border-[#FF3158]">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#FF3158] font-bold">
                Security Impact & Exploitability
              </div>
              <p className="text-[#F5EDDC] leading-relaxed text-xs">
                {finding.impact}
              </p>
            </div>

            {/* Adversarial Attack Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#FF6F59] font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Adversarial Attack Payload
                </span>
                <CopyButton text={finding.attack_prompt} label="Copy Payload" />
              </div>
              <div className="p-3.5 rounded-xl bg-[#060D1F]/90 border border-white/10 font-mono text-xs text-[#FF6F59] overflow-x-auto break-all max-h-48 overflow-y-auto">
                {finding.attack_prompt}
              </div>
            </div>

            {/* Raw Agent Response / Evidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#34D399] font-bold flex items-center gap-1.5">
                  <FileSearch className="w-3.5 h-3.5" />
                  Raw Agent Evidence
                </span>
                <CopyButton text={finding.evidence} label="Copy Evidence" />
              </div>
              <div className="p-3.5 rounded-xl bg-[#060D1F]/90 border border-white/10 font-mono text-xs text-[#C8C0AC] overflow-x-auto break-all max-h-48 overflow-y-auto">
                {finding.evidence}
              </div>
            </div>

            {/* Actionable Remediation Guidance */}
            <div className="p-4 rounded-xl glass-panel space-y-2 border-l-2 border-[#32D6A0]">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#32D6A0] font-bold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                Actionable Remediation Guidance
              </div>
              <p className="text-[#F5EDDC] leading-relaxed text-xs">
                {finding.remediation}
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10 bg-[#060D1F]/60 flex items-center justify-between text-[11px] font-mono text-[#C8C0AC] relative z-10">
            <span>Scan Ref: {finding.scan_id || 'active-eval'}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-[#F5EDDC] font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
