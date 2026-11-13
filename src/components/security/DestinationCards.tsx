'use client';

import React, { useState } from 'react';
import { Destination, DestinationCheckResponse, DlpFinding, EgressBlockedEvent } from '@/types/api';
import { Globe, ShieldAlert, ShieldCheck, AlertCircle, ArrowUpRight, Search, Lock, Zap } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';
import { apiClient } from '@/lib/api-client';

interface DestinationCardsProps {
  destinations: Destination[];
  dlpFindings: DlpFinding[];
  blockedEvents: EgressBlockedEvent[];
  onAddDestination?: (dest: Partial<Destination>) => Promise<void>;
}

export const DestinationCards: React.FC<DestinationCardsProps> = ({
  destinations,
  dlpFindings,
  blockedEvents,
  onAddDestination,
}) => {
  const [testUrl, setTestUrl] = useState('http://169.254.169.254/latest/meta-data/');
  const [testPayload, setTestPayload] = useState('Authorization: Bearer token_live_83910');
  const [isTesting, setIsTesting] = useState(false);
  const [checkResult, setCheckResult] = useState<DestinationCheckResponse | null>(null);

  const handleTestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setIsTesting(true);
    try {
      const res = await apiClient.checkDestination({
        url: testUrl.trim(),
        payload_sample: testPayload.trim(),
      });
      setCheckResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#E6CBA8]" />
            <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight">
              Default-Deny Egress Boundaries & SSRF Defense
            </h3>
          </div>
          <p className="text-xs text-[#8A8A8A] font-sans mt-0.5">
            Strict perimeter enforcement. Outbound traffic is blocked by default, DNS is resolved server-side against SSRF subnets, and payloads are filtered via inline DLP.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8]">
            <Lock className="w-3.5 h-3.5" />
            DEFAULT-DENY EGRESS
          </span>
        </div>
      </div>

      {/* Interactive SSRF & Allowlist Pre-Flight Inspector */}
      <div className="p-5 rounded-2xl bg-[#151515] border border-[#2A2A2A] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E6CBA8]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Interactive Egress Route Inspector (Dry-Run SSRF & DLP Check)
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#8A8A8A]">POST /api/security/destinations/check</span>
        </div>

        <form onSubmit={handleTestUrl} className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6 space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8A8A8A]">Destination URL</label>
            <input
              type="text"
              required
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="e.g. http://169.254.169.254/latest/meta-data/"
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#2A2A2A] text-white text-xs font-mono focus:outline-none focus:border-[#E6CBA8]"
            />
          </div>

          <div className="lg:col-span-4 space-y-1">
            <label className="text-[10px] font-mono uppercase text-[#8A8A8A]">Simulated Outbound Buffer (DLP Test)</label>
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              placeholder="e.g. SSN: 000-12-3456 or AKIA..."
              className="w-full px-3 py-2 rounded-xl bg-[#0D0D0D] border border-[#2A2A2A] text-white text-xs font-mono focus:outline-none focus:border-[#E6CBA8]"
            />
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isTesting}
              className="w-full py-2 px-3 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] font-mono text-xs font-bold hover:bg-[#F7E7CE] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(230,203,168,0.2)]"
            >
              {isTesting ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Inspect</span>
            </button>
          </div>
        </form>

        {/* Inspection Verdict Result Box */}
        {checkResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono space-y-2 animate-in fade-in duration-200 ${
              checkResult.verdict === 'BLOCK'
                ? 'bg-[rgba(192,80,77,0.12)] border-[#C0504D] text-[#C0504D]'
                : checkResult.verdict === 'ALLOW'
                ? 'bg-[rgba(230,203,168,0.12)] border-[#B89B72] text-[#E6CBA8]'
                : 'bg-[#1E1E1E] border-[#3D3D3D] text-[#BDBDBD]'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-2">
                {checkResult.verdict === 'BLOCK' ? (
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                )}
                <span>Verdict: {checkResult.verdict}</span>
              </span>
              <span className="text-[11px] font-normal text-white">
                Resolved IP: <code className="bg-black/50 px-1.5 py-0.5 rounded">{checkResult.resolved_ip}</code>
              </span>
            </div>

            <ul className="space-y-1 text-[11px] text-white/90 list-disc list-inside">
              {checkResult.findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Grid: Egress Allowlist Destinations + Live DLP Intercepts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Destination Rules Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#8A8A8A] font-bold">
              Active Destination Allowlist Rules
            </span>
            <span className="text-[11px] font-mono text-[#5C5C5C]">
              {destinations.length} Rules Enforced
            </span>
          </div>

          <div className="space-y-2">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="p-3.5 rounded-xl bg-[#151515] border border-[#2A2A2A] hover:border-[#3D3D3D] transition-colors flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white truncate">{dest.host_or_cidr}</span>
                    <CopyButton text={dest.host_or_cidr} iconOnly className="p-0.5 bg-transparent border-0" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#8A8A8A]">
                    <span className="uppercase">{dest.scope}</span>
                    <span>•</span>
                    <span>{dest.requires_tls ? 'TLS 1.3 Pinning' : 'Plaintext Blocked'}</span>
                    <span>•</span>
                    <span>{dest.rate_limit_rpm} RPM</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {dest.status === 'allowed' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[rgba(230,203,168,0.15)] text-[#E6CBA8] border border-[#B89B72]/40 font-bold">
                      ALLOWLISTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[rgba(192,80,77,0.15)] text-[#C0504D] border border-[#C0504D]/40 font-bold">
                      BLOCKED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Live DLP & SSRF Incident Feed */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono uppercase text-[#8A8A8A] font-bold">
            Live Outbound DLP Intercepts
          </span>

          <div className="space-y-2.5">
            {dlpFindings.map((finding) => (
              <div
                key={finding.id}
                className="p-3.5 rounded-xl bg-[#151515] border border-[#2A2A2A] space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{finding.agent_name}</span>
                  <span className="text-[10px] text-[#8A8A8A]">{finding.timestamp}</span>
                </div>
                <p className="text-[11px] text-[#BDBDBD] font-sans leading-relaxed">
                  {finding.snippet}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#5C5C5C] pt-1">
                  <span>Dest: {finding.destination}</span>
                  <span className={finding.redacted ? 'text-[#E6CBA8]' : 'text-[#C0504D]'}>
                    {finding.redacted ? 'Auto-Redacted' : 'Blocked at Egress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
