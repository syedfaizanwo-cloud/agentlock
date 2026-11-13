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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-critical/15 text-severity-critical border border-severity-critical/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-high/15 text-severity-high border border-severity-high/30">
            <AlertTriangle className="w-3.5 h-3.5" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-medium/15 text-severity-medium border border-severity-medium/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-low/15 text-severity-low border border-severity-low/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Low
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-navy-850 text-cream-muted border border-[#1A2E5A]">
            <Info className="w-3.5 h-3.5" /> Info
          </span>
        );
    }
  };

  if (!isOpen || !finding) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Solid Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/80"
        />

        {/* Slide-over Flat Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl h-full bg-navy-900 border-l border-[#1A2E5A] shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#1A2E5A] bg-navy-950 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {getSeverityBadge(finding.severity)}
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-navy-850 text-cream-soft border border-[#1A2E5A]">
                  {finding.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono text-cream-muted">
                  ID: {finding.id}
                </span>
              </div>
              <h2 className="text-lg font-bold font-sans text-cream leading-snug">
                {finding.title}
              </h2>
              {agentName && (
                <div className="text-xs font-mono text-cream-muted">
                  Target: <span className="text-cream font-medium">{agentName}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close detail panel"
              className="p-2 rounded-lg bg-navy-850 border border-[#1A2E5A] hover:border-coral text-cream-muted hover:text-cream transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans">
            {/* Overview */}
            <div className="p-4 rounded-lg bg-navy-950 border border-[#1A2E5A] space-y-1">
              <div className="font-mono text-xs text-cream-soft font-semibold">
                Vulnerability overview
              </div>
              <p className="text-cream leading-relaxed text-xs">
                {finding.description}
              </p>
            </div>

            {/* Impact */}
            <div className="p-4 rounded-lg bg-navy-950 border-l-2 border-severity-critical border border-[#1A2E5A] space-y-1">
              <div className="font-mono text-xs text-severity-critical font-semibold">
                Security impact
              </div>
              <p className="text-cream leading-relaxed text-xs">
                {finding.impact}
              </p>
            </div>

            {/* Attack Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-coral font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Adversarial test prompt
                </span>
                <CopyButton text={finding.attack_prompt} label="Copy payload" />
              </div>
              <div className="p-3.5 rounded-lg bg-navy-950 border border-[#1A2E5A] font-mono text-xs text-coral overflow-x-auto break-all max-h-48 overflow-y-auto">
                {finding.attack_prompt}
              </div>
            </div>

            {/* Raw Evidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-severity-low font-semibold flex items-center gap-1.5">
                  <FileSearch className="w-3.5 h-3.5" />
                  Agent response evidence
                </span>
                <CopyButton text={finding.evidence} label="Copy evidence" />
              </div>
              <div className="p-3.5 rounded-lg bg-navy-950 border border-[#1A2E5A] font-mono text-xs text-cream-soft overflow-x-auto break-all max-h-48 overflow-y-auto">
                {finding.evidence}
              </div>
            </div>

            {/* Remediation */}
            <div className="p-4 rounded-lg bg-navy-950 border-l-2 border-severity-low border border-[#1A2E5A] space-y-2">
              <div className="font-mono text-xs text-severity-low font-semibold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                Recommended remediation
              </div>
              <p className="text-cream leading-relaxed text-xs">
                {finding.remediation}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1A2E5A] bg-navy-950 flex items-center justify-between text-xs font-mono text-cream-muted">
            <span>Scan: {finding.scan_id || 'active-eval'}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-cream font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
