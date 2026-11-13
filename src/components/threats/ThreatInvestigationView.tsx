'use client';

import React, { useState } from 'react';
import { ThreatDetails } from '../../types/api';
import {
  ShieldAlert,
  FileSearch,
  CheckCircle,
  Copy,
  Lock,
  Terminal,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface ThreatInvestigationViewProps {
  threat: ThreatDetails | null;
  allIncidents: { id: string; agent_name: string; rule: string; time: string; severity: string }[];
  onSelectIncident: (id: string) => void;
  onQuarantineAgent: (agentId: string) => Promise<void>;
}

export const ThreatInvestigationView: React.FC<ThreatInvestigationViewProps> = ({
  threat,
  allIncidents,
  onSelectIncident,
  onQuarantineAgent,
}) => {
  const [copied, setCopied] = useState(false);
  const [mitigationApplied, setMitigationApplied] = useState(false);
  const [isQuarantining, setIsQuarantining] = useState(false);

  const handleCopyPayload = () => {
    if (threat) {
      navigator.clipboard.writeText(threat.payload_preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyMitigation = () => {
    setMitigationApplied(true);
  };

  const handleQuarantine = async () => {
    if (!threat) return;
    setIsQuarantining(true);
    try {
      await onQuarantineAgent(threat.agent_id);
    } finally {
      setIsQuarantining(false);
    }
  };

  if (!threat) {
    return (
      <div className="py-20 text-center rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] p-8 space-y-3">
        <ShieldAlert className="w-12 h-12 text-[#8A8A8A] mx-auto" />
        <h3 className="text-base font-mono font-bold text-white">No Threat Incident Selected</h3>
        <p className="text-xs text-[#8A8A8A] max-w-md mx-auto">
          Select an incident from the security events feed or pick one below to review forensic analysis and MITRE mappings.
        </p>
        <div className="flex flex-wrap gap-2 justify-center pt-4">
          {allIncidents.map((inc) => (
            <button
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-[#BDBDBD] hover:border-[#E6CBA8] hover:text-white"
            >
              {inc.id} - {inc.agent_name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
              Threat Forensics & MITRE Analysis
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#C0504D]/15 border border-[#C0504D]/40 text-[#C0504D] font-bold">
              {threat.incident_id}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1">
            Deep-packet inspection, vector taxonomy, and deterministic policy rule mitigation.
          </p>
        </div>

        {/* Incident Selector Pill */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {allIncidents.slice(0, 4).map((inc) => (
            <button
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors border ${
                threat.incident_id.includes(inc.id.toUpperCase())
                  ? 'bg-[#C0504D]/15 border-[#C0504D]/50 text-[#C0504D]'
                  : 'bg-[#151515] border-[#2A2A2A] text-[#8A8A8A] hover:text-white'
              }`}
            >
              {inc.id}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Threat Banner */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#C0504D]/15 text-[#C0504D] border border-[#C0504D]/40">
                POLICY VIOLATION BLOCKED
              </span>
              <span className="text-xs font-mono text-[#8A8A8A]">
                Timestamp: {new Date(threat.timestamp).toLocaleString()}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-mono font-bold text-white">
              {threat.rule_triggered}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#BDBDBD] pt-1">
              <div>
                Agent: <strong className="text-white">{threat.agent_name}</strong>
              </div>
              <span className="text-[#3D3D3D]">|</span>
              <div>
                Vector: <strong className="text-[#C0504D]">{threat.detection_vector}</strong>
              </div>
              <span className="text-[#3D3D3D]">|</span>
              <div>
                MITRE Technique: <strong className="text-[#E6CBA8]">{threat.mitre_technique_id}</strong>
              </div>
            </div>
          </div>

          {/* Risk Score Dial Card */}
          <div className="flex items-center gap-4 bg-[#151515] border border-[#2A2A2A] p-4 rounded-xl flex-shrink-0">
            <div className="text-center">
              <div className="text-3xl font-mono font-black text-[#C0504D]">
                {threat.risk_score}
                <span className="text-sm text-[#8A8A8A] font-normal">/100</span>
              </div>
              <div className="text-[10px] font-mono text-[#8A8A8A] uppercase mt-0.5">
                Composite Risk Index
              </div>
            </div>
            <div className="h-10 w-px bg-[#2A2A2A]" />
            <div className="text-left font-mono text-xs space-y-1">
              <div className="text-[#8A8A8A]">
                Severity: <span className="text-[#C0504D] font-bold uppercase">{threat.severity}</span>
              </div>
              <div className="text-[#8A8A8A]">
                Enforcement: <span className="text-[#6FAF8A] font-semibold">Deterministic Intercept</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Grid: Explanation & Payloads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Analysis & Mitigation */}
        <div className="space-y-6">
          {/* Detailed Forensic Explanation */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-3">
            <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase tracking-wider">
              <FileSearch className="w-4 h-4 text-[#E6CBA8]" />
              Runtime Heuristic Analysis
            </div>
            <p className="text-xs sm:text-sm text-[#BDBDBD] leading-relaxed font-sans">
              {threat.explanation}
            </p>
          </div>

          {/* Recommended Mitigations & Action Center */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-white uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#6FAF8A]" />
                Prescribed Defense Mitigations
              </div>
              {mitigationApplied && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#6FAF8A] bg-[#6FAF8A]/10 px-2 py-0.5 rounded border border-[#6FAF8A]/30">
                  <CheckCircle className="w-3 h-3" /> Policy Active
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[#151515] border border-[#2A2A2A] text-xs text-[#BDBDBD] font-sans leading-relaxed">
              {threat.recommended_mitigation}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              <button
                onClick={handleQuarantine}
                disabled={isQuarantining}
                className="px-3.5 py-2 rounded-lg bg-[#C0504D]/10 border border-[#C0504D]/40 text-[#C0504D] hover:bg-[#C0504D]/20 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                {isQuarantining ? 'Quarantining...' : `Quarantine ${threat.agent_name}`}
              </button>

              <button
                onClick={handleApplyMitigation}
                className="px-3.5 py-2 rounded-lg bg-[#E6CBA8] text-[#0A0A0A] hover:bg-[#F7E7CE] transition-all flex items-center gap-1.5 font-semibold"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Apply Zero-Egress Rule
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Code & Prompt Artifacts */}
        <div className="space-y-6">
          {/* Raw Ingress Prompt */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#BDBDBD]">
                Agent Ingress Context / Prompt
              </span>
              <span className="text-[10px] font-mono text-[#8A8A8A]">RAW TELEMETRY</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-[#050505] border border-[#2A2A2A] text-[#BDBDBD] font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-44">
              {threat.raw_prompt}
            </pre>
          </div>

          {/* Intercepted Dangerous Payload */}
          <div className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C0504D] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#C0504D]" /> Intercepted Malicious Payload
              </span>
              <button
                onClick={handleCopyPayload}
                className="text-[11px] font-mono text-[#E6CBA8] hover:text-[#F7E7CE] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-[#6FAF8A]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-[#050505] border border-[#2A2A2A] text-[#BDBDBD] font-mono text-xs overflow-x-auto whitespace-pre-wrap">
              {threat.payload_preview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
