'use client';

import React, { useState } from 'react';
import { Agent, RegisterAgentPayload, Finding, Scan } from '../../types/api';
import { CopyButton } from '../ui/CopyButton';
import { AgentRiskRanking } from './AgentRiskRanking';
import {
  Bot,
  Plus,
  Search,
  Loader2,
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
  const [rawUrl, setRawUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');
  const [hasAuthConsent, setHasAuthConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const cleanUrl = (input: string): string => {
    let u = input.trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) {
      u = 'https://' + u;
    }
    return u.replace(/\/+$/, '');
  };

  const normalizedUrl = cleanUrl(rawUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Agent name is required');
      return;
    }
    if (!normalizedUrl) {
      setError('Target agent URL is required');
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
      target_url: normalizedUrl,
      api_key: apiKey.trim() || undefined,
      description: description.trim() || undefined,
    };

    try {
      await onRegisterAgent(payload);
      setName('');
      setRawUrl('');
      setApiKey('');
      setDescription('');
      setHasAuthConsent(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to register agent. Check the endpoint URL and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.target_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Registration Form Card */}
      <div className="p-6 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#1A2E5A]">
          <div className="w-8 h-8 rounded-lg bg-coral/10 border border-coral/30 text-coral flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-sans text-cream">Add an agent to scan</h3>
            <p className="text-xs text-cream-muted font-sans">
              Enter the HTTP endpoint of your LLM agent or tool-augmented service.
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
                placeholder="e.g. Production Support Assistant"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
              />
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cream-soft">
                Target endpoint URL <span className="text-coral">*</span>
              </label>
              <input
                type="text"
                value={rawUrl}
                onChange={(e) => setRawUrl(e.target.value)}
                placeholder="https://agent.internal/v1/chat"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
              />
              {normalizedUrl && rawUrl !== normalizedUrl && (
                <div className="text-[11px] font-mono text-coral">
                  Cleaned endpoint: {normalizedUrl}
                </div>
              )}
            </div>

            {/* Optional API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cream-soft">
                Bearer token or API key <span className="text-cream-muted">(optional)</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Passed in Authorization header"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
              />
            </div>

            {/* Optional Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cream-soft">
                Notes or model information <span className="text-cream-muted">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. GPT-4o with database tool access"
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
                  Add agent
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
              Add your first AI agent endpoint above to begin scanning.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => (
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
                    </div>
                    <div className="text-xs font-mono text-cream-soft break-all flex items-center gap-2">
                      <span>{agent.target_url}</span>
                      <CopyButton text={agent.target_url} label="Copy URL" />
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-severity-low/10 text-severity-low border border-severity-low/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-severity-low" />
                    {agent.status}
                  </span>
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
            ))}
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
