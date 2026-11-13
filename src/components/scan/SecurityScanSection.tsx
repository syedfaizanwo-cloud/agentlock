'use client';

import React, { useState } from 'react';
import { Agent, AttackCategory, Scan, ALL_ATTACK_CATEGORIES, ATTACK_CATEGORY_LABELS } from '../../types/api';
import { api } from '../../lib/api-client';
import { ScanProgressVisualizer } from './ScanProgressVisualizer';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Terminal,
  Database,
  Lock,
  Brain,
  Key,
  CheckSquare,
  Network,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SecurityScanSectionProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
  onScanCompleted: (scan: Scan) => void;
  activeScan: Scan | null;
  setActiveScan: (scan: Scan | null) => void;
}

const CATEGORY_ICONS: Record<AttackCategory, React.ElementType> = {
  prompt_injection: Terminal,
  indirect_prompt_injection: Terminal,
  data_leakage: Database,
  tool_abuse: Lock,
  memory_poisoning: Brain,
  identity_privilege_abuse: Key,
  human_approval_bypass: CheckSquare,
  inter_agent_spoofing: Network,
};

const CATEGORY_DESCS: Record<AttackCategory, string> = {
  prompt_injection: 'Direct instruction override and delimiter hijack attacks',
  indirect_prompt_injection: 'Third-party injection via external retrieved contexts',
  data_leakage: 'System prompt exfiltration and secret extraction probes',
  tool_abuse: 'Unauthorized parameter tampering and command execution',
  memory_poisoning: 'Cross-session memory contamination and state alteration',
  identity_privilege_abuse: 'Privilege escalation and unauthorized identity assumption',
  human_approval_bypass: 'Circumvention of manual verification and oversight gates',
  inter_agent_spoofing: 'Adversarial message forging in agent-to-agent meshes',
};

export const SecurityScanSection: React.FC<SecurityScanSectionProps> = ({
  agents = [],
  selectedAgent,
  onSelectAgent,
  onScanCompleted,
  activeScan,
  setActiveScan,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<AttackCategory[]>([
    ...ALL_ATTACK_CATEGORIES,
  ]);
  const [hasAuthConsent, setHasAuthConsent] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const toggleCategory = (cat: AttackCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAll = () => {
    setSelectedCategories([...ALL_ATTACK_CATEGORIES]);
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
  };

  // Synchronous scan execution against FastAPI backend
  const handleStartScan = async () => {
    if (!selectedAgent) {
      setScanError('Please select an agent target to scan');
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

    try {
      const initiated = await api.startScan({
        agent_id: selectedAgent.id,
        attack_categories: selectedCategories,
      });
      setActiveScan(initiated);
      onScanCompleted(initiated);
    } catch (err: any) {
      setScanError(
        err?.message || 'Scan execution failed. Verify the backend connection and try again.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2E5A]">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-coral" />
              <h3 className="text-lg font-bold font-sans text-cream">
                Automated Red Teaming Execution
              </h3>
            </div>
            <p className="text-xs text-cream-muted mt-1 font-sans">
              Launch synchronous adversarial security evaluations against autonomous agent targets.
            </p>
          </div>

          {selectedAgent && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono">
              <span className="text-cream-muted">Target:</span>
              <span className="text-cream font-bold">{selectedAgent.name}</span>
              <span className="text-coral">#{selectedAgent.id}</span>
            </div>
          )}
        </div>

        {/* Step 1: Select Target Agent */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-cream-soft uppercase tracking-wider font-bold">
              1. Select Target Agent <span className="text-coral">*</span>
            </label>
            <span className="text-xs font-mono text-cream-muted">
              {agents.length} available
            </span>
          </div>

          {agents.length === 0 ? (
            <div className="p-4 rounded-lg bg-navy-950 border border-[#1A2E5A] text-center space-y-2">
              <p className="text-xs text-cream-muted font-sans">
                No agents registered yet. Please add an agent in the Agent Inventory section first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => {
                const isSelected = selectedAgent?.id === agent.id;
                const isVulnerable = agent.agent_type === 'vulnerable_mock';
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => onSelectAgent(agent)}
                    disabled={isStarting}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-navy-850 border-coral ring-1 ring-coral shadow-lg'
                        : 'bg-navy-950 border-[#1A2E5A] hover:border-coral/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold font-sans text-cream truncate">
                        {agent.name}
                      </span>
                      <span className="text-[11px] font-mono text-cream-muted">
                        #{agent.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
                          isVulnerable
                            ? 'bg-severity-critical/10 text-severity-critical border-severity-critical/30'
                            : 'bg-severity-low/10 text-severity-low border-severity-low/30'
                        }`}
                      >
                        {isVulnerable ? (
                          <>
                            <ShieldAlert className="w-3 h-3" />
                            vulnerable_mock
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3" />
                            protected_mock
                          </>
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-cream-muted">
                        {agent.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Choose Attack Vectors (Eight Canonical Categories) */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-cream-soft uppercase tracking-wider font-bold">
                2. Select Adversarial Test Suites <span className="text-coral">*</span>
              </label>
              <span className="text-xs font-mono text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30">
                {selectedCategories.length}/{ALL_ATTACK_CATEGORIES.length} Selected
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={isStarting}
                className="text-cream-muted hover:text-coral transition-colors"
              >
                Select All
              </button>
              <span className="text-[#1A2E5A]">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isStarting}
                className="text-cream-muted hover:text-coral transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_ATTACK_CATEGORIES.map((catId) => {
              const Icon = CATEGORY_ICONS[catId] || Terminal;
              const isChecked = selectedCategories.includes(catId);
              return (
                <div
                  key={catId}
                  onClick={() => !isStarting && toggleCategory(catId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all select-none space-y-2 ${
                    isChecked
                      ? 'bg-navy-850 border-coral/80 shadow-md'
                      : 'bg-navy-950 border-[#1A2E5A] opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-cream font-sans font-bold text-xs">
                      <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-coral' : 'text-cream-muted'}`} />
                      <span>{ATTACK_CATEGORY_LABELS[catId]}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 rounded border-[#1A2E5A] bg-navy-950 text-coral focus:ring-coral pointer-events-none mt-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-cream-muted font-sans leading-tight">
                    {CATEGORY_DESCS[catId]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authorization Consent */}
        <div className="pt-2 border-t border-[#1A2E5A]">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAuthConsent}
              onChange={(e) => setHasAuthConsent(e.target.checked)}
              disabled={isStarting}
              className="mt-0.5 w-4 h-4 rounded border-[#1A2E5A] bg-navy-950 text-coral focus:ring-2 focus:ring-coral"
            />
            <span className="text-xs font-sans text-cream-soft leading-relaxed">
              I authorize AgentLock to execute adversarial security evaluation tests against this target agent.
            </span>
          </label>
        </div>

        {/* Error Display */}
        {scanError && (
          <div className="p-4 rounded-xl bg-severity-critical/10 border border-severity-critical/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-severity-critical">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{scanError}</span>
            </div>
            <button
              type="button"
              onClick={handleStartScan}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-severity-critical text-white font-bold hover:bg-severity-critical/90 self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Retry Scan
            </button>
          </div>
        )}

        {/* Active Execution Banner */}
        {isStarting && (
          <div className="p-4 rounded-xl bg-navy-950 border border-coral/50 flex items-center gap-3 text-xs font-mono text-coral animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>
              Executing eight adversarial security tests against agent #{selectedAgent?.id}... Running prompt injection, tool abuse, and data leakage simulations.
            </span>
          </div>
        )}

        {/* Launch Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleStartScan}
            disabled={isStarting || !selectedAgent || selectedCategories.length === 0 || !hasAuthConsent}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-coral text-navy-950 font-bold text-xs tracking-wider uppercase hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-coral"
          >
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing Scan...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Run Security Scan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visualizer for Active or Just Completed Scan */}
      {activeScan && (
        <ScanProgressVisualizer
          scan={activeScan}
        />
      )}
    </div>
  );
};
