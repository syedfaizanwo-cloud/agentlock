'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Agent, AttackCategory, Scan } from '../../types/api';
import { api } from '../../lib/api-client';
import { ScanProgressVisualizer } from './ScanProgressVisualizer';
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
    desc: 'Direct and indirect instruction overrides, jailbreak delimiter tests',
    icon: Terminal,
  },
  {
    id: 'data_leakage',
    label: 'Data Leakage',
    desc: 'System prompt extraction, credentials, and sensitive data leakage checks',
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

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollBackoffRef = useRef(1500);

  const toggleCategory = (cat: AttackCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Optimistic Scan Launch
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

    // Optimistically queue the scan
    const optimisticScan: Scan = {
      id: `scan-pending-${Date.now()}`,
      agent_id: selectedAgent.id,
      agent_name: selectedAgent.name,
      status: 'running',
      categories: selectedCategories,
      progress: 5,
      status_message: 'Queued: connecting to target agent...',
      started_at: new Date().toISOString(),
    };
    setActiveScan(optimisticScan);

    try {
      const initiated = await api.startScan({
        agent_id: selectedAgent.id,
        categories: selectedCategories,
      });
      setActiveScan(initiated);
    } catch (err: any) {
      setActiveScan(null);
      setScanError(
        err?.message || 'Scan failed: the agent URL did not respond. Check the URL and try again.'
      );
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
      if (document.hidden) return;

      try {
        const updated = await api.getScan(activeScan.id);
        setActiveScan(updated);
        pollBackoffRef.current = 1500;

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
      } catch {
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
    <div className="space-y-8">
      {/* Scanner Control & Staging */}
      <div className={`p-6 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6 ${
        isScanning ? 'border-coral' : ''
      }`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2E5A]">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-sans text-cream flex items-center gap-2">
              <Zap className="w-4 h-4 text-coral" />
              Configure security scan
            </h3>
            <p className="text-xs text-cream-muted font-sans">
              Select an agent and adversarial test suites to evaluate.
            </p>
          </div>

          {isScanning && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-medium bg-coral/10 text-coral border border-coral/30">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Scan in progress</span>
            </div>
          )}
        </div>

        {/* Step 1: Select Target Agent */}
        <div className="space-y-3">
          <label className="text-xs font-mono text-cream-soft">
            1. Select target agent <span className="text-coral">*</span>
          </label>
          {agents.length === 0 ? (
            <div className="p-4 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream-soft flex items-center justify-between">
              <span>No agents registered yet. Please add an agent first.</span>
              <a href="#agents" className="text-coral hover:underline font-bold">
                Add an agent
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
                    className={`p-3.5 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-coral/10 border-coral text-cream'
                        : 'bg-navy-950 border-[#1A2E5A] hover:border-coral/50 text-cream-soft'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold truncate">
                        {agent.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-coral" />
                      )}
                    </div>
                    <div className="text-xs font-mono text-cream-muted truncate mt-1">
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
          <label className="text-xs font-mono text-cream-soft">
            2. Adversarial test suites ({selectedCategories.length}/4 selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => !isScanning && toggleCategory(cat.id)}
                  className={`p-4 rounded-lg border cursor-pointer select-none transition-colors flex items-start gap-3 ${
                    isChecked
                      ? 'bg-coral/10 border-coral text-cream'
                      : 'bg-navy-950 border-[#1A2E5A] text-cream-muted hover:border-coral/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isScanning}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded border-[#1A2E5A] bg-navy-950 text-coral focus:ring-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-coral' : 'text-cream-muted'}`} />
                      <span className="text-xs font-mono font-bold text-cream">
                        {cat.label}
                      </span>
                    </div>
                    <p className="text-xs font-sans text-cream-muted leading-relaxed">
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
              className="mt-0.5 w-4 h-4 rounded border-[#1A2E5A] bg-navy-950 text-coral focus:ring-2 focus:ring-coral"
            />
            <span className="text-xs font-sans text-cream-soft leading-relaxed">
              I certify that I am authorized to conduct controlled red teaming tests against this AI agent endpoint.
            </span>
          </label>
        </div>

        {scanError && (
          <div className="p-3 rounded-lg bg-severity-critical/10 border border-severity-critical/30 text-xs font-mono text-severity-critical">
            {scanError}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-xs font-mono text-cream-muted">
            {isScanning ? 'Scan in progress' : 'Ready to evaluate'}
          </div>

          <button
            type="button"
            disabled={isScanning || isStarting || !hasAuthConsent || !selectedAgent}
            onClick={handleStartScan}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-coral text-navy-950 font-bold text-xs tracking-wide hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-coral"
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
                <span>Start scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Scan Staging Progress Visualizer */}
      {activeScan && (
        <div className="space-y-4">
          <ScanProgressVisualizer scan={activeScan} />
          {activeScan.status === 'completed' && (
            <div className="p-4 rounded-xl bg-navy-900 border border-severity-low/40 flex items-center justify-between">
              <span className="text-xs font-mono text-severity-low">
                Scan concluded: {activeScan.vulnerabilities_found ?? 0} vulnerabilities detected.
              </span>
              <a
                href="#results"
                className="px-4 py-2 rounded-lg bg-coral text-navy-950 font-bold text-xs hover:bg-coral-hover transition-colors"
              >
                View scan findings
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
