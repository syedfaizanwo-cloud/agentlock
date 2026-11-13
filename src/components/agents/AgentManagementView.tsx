'use client';

import React, { useState } from 'react';
import { Agent, RegisterAgentPayload } from '../../types/api';
import { CopyButton } from '../ui/CopyButton';
import { PasswordToggle } from '../ui/PasswordToggle';
import {
  Bot,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface AgentManagementViewProps {
  agents: Agent[];
  onRegisterAgent: (payload: RegisterAgentPayload) => Promise<void>;
  onSelectAgentForScan?: (agent: Agent) => void;
  isLoading?: boolean;
}

export const AgentManagementView: React.FC<AgentManagementViewProps> = ({
  agents = [],
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

  // Normalise input: trim, add https:// if missing protocol, strip trailing slash
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
    try {
      await onRegisterAgent({
        name: name.trim(),
        target_url: normalizedUrl,
        api_key: apiKey.trim() || undefined,
        description: description.trim() || undefined,
      });
      // Reset form
      setName('');
      setRawUrl('');
      setApiKey('');
      setDescription('');
      setHasAuthConsent(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to register agent');
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
      {/* Registration Form Card with Glassmorphism */}
      <div className="p-6 sm:p-8 rounded-2xl glass-panel space-y-6 relative overflow-hidden group">
        {/* Soft Ambient Radial Backlight */}
        <div className="absolute top-0 right-0 w-72 h-40 bg-[#FF6F59]/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08] relative z-10">
          <div className="w-8 h-8 rounded-xl bg-[#FF6F59]/10 border border-[#FF6F59]/30 text-[#FF6F59] flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-sans text-[#F5EDDC]">Register Target Agent</h3>
            <p className="text-xs text-[#C8C0AC] font-sans">
              Connect an autonomous agent endpoint for controlled vulnerability testing.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#C8C0AC]">
                Agent Name <span className="text-[#FF6F59]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production Support Assistant"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] placeholder-[#C8C0AC]/40 focus:outline-none"
              />
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#C8C0AC]">
                Target Endpoint URL <span className="text-[#FF6F59]">*</span>
              </label>
              <input
                type="text"
                value={rawUrl}
                onChange={(e) => setRawUrl(e.target.value)}
                placeholder="https://agent.internal.domain/v1/chat"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] placeholder-[#C8C0AC]/40 focus:outline-none"
              />
              {normalizedUrl && rawUrl !== normalizedUrl && (
                <div className="text-[11px] font-mono text-[#FF6F59]/80">
                  Cleaned endpoint: {normalizedUrl}
                </div>
              )}
            </div>

            {/* Optional API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#C8C0AC]">
                Bearer Token / API Key <span className="text-[#C8C0AC]/60">(optional, encrypted)</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Bearer token or authorization key"
                  disabled={isSubmitting}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] placeholder-[#C8C0AC]/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Optional Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#C8C0AC]">
                System Role / Notes <span className="text-[#C8C0AC]/60">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="RAG-enabled support bot with SQL execution tool"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] placeholder-[#C8C0AC]/40 focus:outline-none"
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
                className="mt-1 w-4 h-4 rounded border-white/20 bg-[#060D1F] text-[#FF6F59] focus:ring-2 focus:ring-[#FF6F59]"
              />
              <span className="text-xs font-sans text-[#F5EDDC] leading-relaxed">
                I own this agent or have explicit authorization to perform adversarial security testing against this endpoint.
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-xs font-mono text-[#E11D48]">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !hasAuthConsent}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6F59] text-[#060D1F] font-bold text-xs font-mono uppercase tracking-wider shadow-[0_4px_16px_rgba(255,111,89,0.35)] hover:bg-[#E85A44] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  Register Agent
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
            <h3 className="text-base font-bold font-sans text-[#F5EDDC]">Agent Inventory</h3>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-[#0A1633] border border-[#12234A] text-[#FF6F59]">
              {agents.length}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#C8C0AC]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] placeholder-[#C8C0AC]/40 focus:outline-none"
            />
          </div>
        </div>

        {agents.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel text-center space-y-2">
            <div className="text-xs font-mono text-[#C8C0AC]">No registered agents found</div>
            <p className="text-xs text-[#C8C0AC]/70">
              Register an agent endpoint above to enable red team vulnerability scans.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="p-5 rounded-2xl glass-card glass-card-hover space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#FF6F59]" />
                      <span className="font-sans font-bold text-sm text-[#F5EDDC]">
                        {agent.name}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#C8C0AC] break-all flex items-center gap-2">
                      <span>{agent.target_url}</span>
                      <CopyButton text={agent.target_url} label="Copy URL" />
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                {agent.description && (
                  <p className="text-xs font-sans text-[#C8C0AC]/80">
                    {agent.description}
                  </p>
                )}

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#C8C0AC]">
                  <span>
                    Added: {new Date(agent.created_at).toLocaleDateString()}
                  </span>
                  {onSelectAgentForScan && (
                    <a
                      href="#scan"
                      onClick={() => onSelectAgentForScan(agent)}
                      className="px-3 py-1 rounded-lg bg-[#FF6F59]/10 border border-[#FF6F59]/30 text-[#FF6F59] hover:bg-[#FF6F59] hover:text-[#060D1F] transition-all"
                    >
                      Scan Agent &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
