'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Agent, AttackCategory, Scan } from '../../types/api';
import { api } from '../../lib/api-client';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  Database,
  Lock,
  Brain,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface SecurityScanSectionProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
  onScanCompleted: (scan: Scan) => void;
  activeScan: Scan | null;
  setActiveScan: (scan: Scan | null) => void;
}

const CATEGORIES: { id: AttackCategory; label: string; desc: string; icon: any }[] = [
  {
    id: 'prompt_injection',
    label: 'Prompt Injection',
    desc: 'Direct & indirect instruction overrides, jailbreak delimiter tests',
    icon: Terminal,
  },
  {
    id: 'data_leakage',
    label: 'Data Leakage',
    desc: 'System prompt extraction, credentials and PII exfiltration checks',
    icon: Database,
  },
  {
    id: 'tool_abuse',
    label: 'Tool Abuse',
    desc: 'Unauthorized parameter tampering and unvalidated function calls',
    icon: Lock,
  },
  {
    id: 'memory_poisoning',
    label: 'Memory Poisoning',
    desc: 'Cross-session memory contamination and state manipulation',
    icon: Brain,
  },
];

export const SecurityScanSection: React.FC<SecurityScanSectionProps> = ({
  agents = [],
  selectedAgent,
  onSelectAgent,
  onScanCompleted,
  activeScan,
  setActiveScan,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<AttackCategory[]>([
    'prompt_injection',
    'data_leakage',
    'tool_abuse',
    'memory_poisoning',
  ]);
  const [hasAuthConsent, setHasAuthConsent] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const shouldReduceMotion = useReducedMotion();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollBackoffRef = useRef(1500);

  const toggleCategory = (cat: AttackCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Start scan handler
  const handleStartScan = async () => {
    if (!selectedAgent) {
      setScanError('Please select a target agent to scan');
      return;
    }
    if (selectedCategories.length === 0) {
      setScanError('Please select at least one attack category');
      return;
    }
    if (!hasAuthConsent) {
      setScanError('You must confirm ownership or testing authorization');
      return;
    }

    setScanError(null);
    setIsStarting(true);
    setJustCompleted(false);

    try {
      const initiated = await api.startScan({
        agent_id: selectedAgent.id,
        categories: selectedCategories,
      });
      setActiveScan(initiated);
    } catch (err: any) {
      setScanError(err?.response?.data?.message || err?.message || 'Failed to initiate scan');
    } finally {
      setIsStarting(false);
    }
  };

  // Poll active scan every ~1.5s
  useEffect(() => {
    if (!activeScan || activeScan.status !== 'running') {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const poll = async () => {
      // Pause polling when tab is hidden
      if (document.hidden) return;

      try {
        const updated = await api.getScan(activeScan.id);
        setActiveScan(updated);
        pollBackoffRef.current = 1500; // Reset backoff on success

        if (updated.status === 'completed' || updated.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          if (updated.status === 'completed') {
            setJustCompleted(true);
            onScanCompleted(updated);
          }
        }
      } catch (err) {
        // Backoff on errors
        pollBackoffRef.current = Math.min(pollBackoffRef.current * 1.5, 6000);
      }
    };

    pollIntervalRef.current = setInterval(poll, pollBackoffRef.current);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [activeScan, setActiveScan, onScanCompleted]);

  const isScanning = activeScan !== null && activeScan.status === 'running';

  return (
    <div className="space-y-8 relative">
      {/* Scanner Control & Staging Grid */}
      <div className={`p-6 sm:p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[8px_8px_16px_#030714,-8px_-8px_16px_#12234A] space-y-6 transition-all duration-300 ${
        isScanning ? 'ring-2 ring-[#FF6F59]/50' : ''
      }`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#12234A]">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-sans text-[#F5EDDC] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF6F59]" />
              Adversarial Security Evaluation
            </h3>
            <p className="text-xs text-[#C8C0AC] font-sans">
              Configure attack vectors and execute multi-pass penetration tests against target agent.
            </p>
          </div>

          {isScanning && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>TEST RUNNING</span>
            </div>
          )}
        </div>

        {/* Step 1: Select Target Agent */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC]">
            1. Select Target Agent <span className="text-[#FF6F59]">*</span>
          </label>
          {agents.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#060D1F] border border-[#12234A] text-xs font-mono text-[#C8C0AC] flex items-center justify-between">
              <span>No agents registered yet. Please register an agent first.</span>
              <a href="#agents" className="text-[#FF6F59] hover:underline font-bold">
                Go to Agent Management &rarr;
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {agents.map((agent) => {
                const isSelected = selectedAgent?.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    disabled={isScanning}
                    onClick={() => onSelectAgent(agent)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#12234A] border-[#FF6F59] shadow-[inset_2px_2px_4px_#030714]'
                        : 'bg-[#060D1F] border-[#12234A] hover:border-[#12234A]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#F5EDDC] truncate">
                        {agent.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6F59]" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-[#C8C0AC]/70 truncate mt-1">
                      {agent.target_url}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Select Attack Categories */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC]">
            2. Adversarial Test Categories ({selectedCategories.length}/4 selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => !isScanning && toggleCategory(cat.id)}
                  className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-[#060D1F] border-[#FF6F59]/70 shadow-[inset_2px_2px_4px_#030714]'
                      : 'bg-[#060D1F] border-[#12234A] opacity-60 hover:opacity-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isScanning}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded border-[#12234A] bg-[#0A1633] text-[#FF6F59] focus:ring-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-[#FF6F59]' : 'text-[#C8C0AC]'}`} />
                      <span className="text-xs font-mono font-bold text-[#F5EDDC]">
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-[#C8C0AC] leading-snug">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authorization Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAuthConsent}
              disabled={isScanning}
              onChange={(e) => setHasAuthConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#12234A] bg-[#060D1F] text-[#FF6F59] focus:ring-2 focus:ring-[#FF6F59]"
            />
            <span className="text-xs font-sans text-[#F5EDDC] leading-relaxed">
              I certify that I am authorized to conduct controlled red teaming tests against this AI agent endpoint.
            </span>
          </label>
        </div>

        {scanError && (
          <div className="p-3 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-xs font-mono text-[#E11D48]">
            {scanError}
          </div>
        )}

        {/* Action Button: Pull-back anticipation then launch */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#C8C0AC]/70">
            {isScanning ? 'Scan in progress' : 'Ready to evaluate'}
          </div>

          <motion.button
            type="button"
            disabled={isScanning || isStarting || !hasAuthConsent || !selectedAgent}
            onClick={handleStartScan}
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#FF6F59] text-[#060D1F] font-bold text-xs font-mono uppercase tracking-wider shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] hover:bg-[#E85A44] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Start Red Team Scan</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Live Scan Staging Progress Panel */}
      {activeScan && (
        <div
          className={`p-6 sm:p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[8px_8px_16px_#030714,-8px_-8px_16px_#12234A] space-y-6 relative transition-all ${
            justCompleted ? 'ring-2 ring-[#34D399]' : ''
          }`}
        >
          {/* One coral completion ring on scan completion per spec */}
          {justCompleted && !shouldReduceMotion && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-0 rounded-2xl border-2 border-[#FF6F59] pointer-events-none"
            />
          )}

          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC]">
                  Execution Monitor // Scan ID:
                </span>
                <span className="text-xs font-mono font-bold text-[#FF6F59]">
                  {activeScan.id}
                </span>
              </div>
              <div className="text-sm font-bold text-[#F5EDDC]">
                {activeScan.agent_name || activeScan.agent_id}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeScan.status === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SCAN COMPLETE
                </span>
              ) : activeScan.status === 'failed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/40">
                  <ShieldAlert className="w-3.5 h-3.5" /> FAILED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/40">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> LIVE EVALUATION
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar / Indeterminate State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#C8C0AC]">
                {activeScan.status_message || (isScanning ? 'Executing test suites...' : 'Scan finished')}
              </span>
              <span className="font-bold text-[#FF6F59]">
                {typeof activeScan.progress === 'number'
                  ? `${activeScan.progress}%`
                  : isScanning
                  ? 'In Progress'
                  : '100%'}
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#060D1F] border border-[#12234A] overflow-hidden relative">
              {typeof activeScan.progress === 'number' ? (
                <div
                  className="h-full bg-[#FF6F59] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(activeScan.progress, 100)}%` }}
                />
              ) : isScanning ? (
                /* Indeterminate pulse indicator */
                <div className="h-full w-1/3 bg-[#FF6F59] rounded-full animate-pulse" />
              ) : (
                <div className="h-full w-full bg-[#34D399] rounded-full" />
              )}
            </div>
          </div>

          {/* Footer Action when Complete */}
          {activeScan.status === 'completed' && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#12234A]">
              <div className="text-xs font-mono text-[#C8C0AC]">
                Found{' '}
                <strong className="text-[#FF6F59]">
                  {activeScan.vulnerabilities_found ?? 0}
                </strong>{' '}
                actionable vulnerability findings.
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="#results"
                  onClick={() => {
                    const el = document.getElementById('results');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2 rounded-xl bg-[#FF6F59] text-[#060D1F] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#E85A44] transition-all flex items-center gap-2"
                >
                  <span>Inspect Findings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
