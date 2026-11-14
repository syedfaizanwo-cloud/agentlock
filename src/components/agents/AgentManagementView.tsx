'use client';

import React, { useState } from 'react';
import { Agent, RegisterAgentPayload, Finding, Scan } from '../../types/api';
import { AgentRiskRanking } from './AgentRiskRanking';
import {
  Bot,
  Plus,
  Search,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AgentManagementViewProps {
  agents: Agent[];
  findings?: Finding[];
  scans?: Scan[];
  onRegisterAgent: (payload: RegisterAgentPayload) => Promise<void>;
  onSelectAgentForScan?: (agent: Agent) => void;
  isLoading?: boolean;
}

export const AgentManagementView: React.FC<AgentManagementViewProps> = ({
  agents = [],
  findings = [],
  scans = [],
  onRegisterAgent,
  onSelectAgentForScan,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [agentType, setAgentType] = useState<'vulnerable_mock' | 'protected_mock'>('vulnerable_mock');
  const [description, setDescription] = useState('');
  const [hasAuthConsent, setHasAuthConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const hasVulnerableMock = agents.some((a) => a.agent_type === 'vulnerable_mock');
  const hasProtectedMock = agents.some((a) => a.agent_type === 'protected_mock');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Agent name is required');
      return;
    }
    if (!hasAuthConsent) {
      setError('You must confirm ownership or testing authorization');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const payload: RegisterAgentPayload = {
      name: name.trim(),
      agent_type: agentType,
      description: description.trim() || undefined,
    };

    try {
      await onRegisterAgent(payload);
      setName('');
      setDescription('');
      setHasAuthConsent(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to register agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (type: 'vulnerable_mock' | 'protected_mock') => {
    setError(null);
    setIsSubmitting(true);
    const payload: RegisterAgentPayload = {
      name: type === 'vulnerable_mock' ? 'Vulnerable Mock Agent' : 'Protected Mock Agent',
      agent_type: type,
      description:
        type === 'vulnerable_mock'
          ? 'Baseline test agent vulnerable to direct injection and data leakage.'
          : 'Secured test agent with guardrail boundaries and output inspection.',
    };

    try {
      await onRegisterAgent(payload);
    } catch (err: any) {
      setError(err?.message || `Failed to create ${type} demo agent.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.agent_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.id).includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Quick Setup Banner for Demo Agents if missing */}
      {(!hasVulnerableMock || !hasProtectedMock) && (
        <div className="p-4 rounded-xl bg-navy-900 border border-coral/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-coral uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Environment Setup
            </div>
            <p className="text-xs text-cream font-sans">
              Deploy the canonical demonstration agents to test the eight-vector security engine and scan comparisons.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {!hasVulnerableMock && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickAdd('vulnerable_mock')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-severity-critical/15 text-severity-critical border border-severity-critical/30 hover:bg-severity-critical/25 disabled:opacity-50 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Add Vulnerable Mock
              </button>
            )}
            {!hasProtectedMock && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickAdd('protected_mock')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-severity-low/15 text-severity-low border border-severity-low/30 hover:bg-severity-low/25 disabled:opacity-50 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Add Protected Mock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Registration Form Card */}
      <div className="p-6 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#1A2E5A]">
          <div className="w-8 h-8 rounded-lg bg-coral/10 border border-coral/30 text-coral flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-sans text-cream">Register Agent Target</h3>
            <p className="text-xs text-cream-muted font-sans">
              Configure an agent target profile for automated red teaming evaluation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cream-soft">
                Agent name <span className="text-coral">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Customer Operations Agent"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
              />
            </div>

            {/* Agent Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cream-soft">
                Agent architecture type <span className="text-coral">*</span>
              </label>
              <select
                value={agentType}
                onChange={(e) => setAgentType(e.target.value as 'vulnerable_mock' | 'protected_mock')}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream focus:outline-none focus:border-coral"
              >
                <option value="vulnerable_mock">Vulnerable Mock (Unshielded demo architecture)</option>
                <option value="protected_mock">Protected Mock (Hardened with guardrails)</option>
              </select>
            </div>

            {/* Optional Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-mono text-cream-soft">
                Description or notes <span className="text-cream-muted">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Testing LLM agent capabilities with database read access"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
              />
            </div>
          </div>

          {/* Authorization Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAuthConsent}
                onChange={(e) => setHasAuthConsent(e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 w-4 h-4 rounded border-[#1A2E5A] bg-navy-950 text-coral focus:ring-2 focus:ring-coral"
              />
              <span className="text-xs font-sans text-cream-soft leading-relaxed">
                I own this agent or have explicit authorization to perform adversarial security testing against this endpoint.
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-severity-critical/10 border border-severity-critical/30 text-xs font-mono text-severity-critical">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !hasAuthConsent}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-coral text-navy-950 font-bold text-xs tracking-wide hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-coral"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Adding agent...
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  Register agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Agent Inventory List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-sans text-cream">Target inventory</h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-navy-850 border border-[#1A2E5A] text-coral">
              {agents.length}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-900 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
            />
          </div>
        </div>

        {agents.length === 0 ? (
          <div className="p-8 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center space-y-2">
            <div className="text-xs font-mono text-cream">No agents registered</div>
            <p className="text-xs text-cream-muted">
              Add your first AI agent target above or deploy the demo agents to begin scanning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => {
              const isVulnerable = agent.agent_type === 'vulnerable_mock';
              return (
                <div
                  key={agent.id}
                  className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] hover:border-coral/60 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-coral" />
                        <span className="font-sans font-bold text-sm text-cream">
                          {agent.name}
                        </span>
                        <span className="text-[11px] font-mono text-cream-muted">
                          #{agent.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
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
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-navy-950 text-cream-soft border border-[#1A2E5A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-severity-low" />
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {agent.description && (
                    <p className="text-xs font-sans text-cream-muted">
                      {agent.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-[#1A2E5A] flex items-center justify-between text-xs font-mono text-cream-muted">
                    <span>
                      Added: {new Date(agent.created_at).toLocaleDateString()}
                    </span>
                    {onSelectAgentForScan && (
                      <a
                        href="#scan"
                        onClick={() => onSelectAgentForScan(agent)}
                        className="px-3 py-1 rounded bg-coral/10 border border-coral/30 text-coral hover:bg-coral hover:text-navy-950 transition-colors font-medium"
                      >
                        Scan agent
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Per-Agent Adversarial Risk Ranking Visualization */}
      <AgentRiskRanking
        agents={agents}
        findings={findings}
        scans={scans}
        onSelectAgent={onSelectAgentForScan}
      />
    </div>
  );
};
