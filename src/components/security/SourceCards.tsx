'use client';

import React, { useState } from 'react';
import { Source, SourceTrustLevel } from '@/types/api';
import { Shield, ShieldAlert, ShieldCheck, Plus, CheckCircle, AlertTriangle, Filter, Lock } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';

interface SourceCardsProps {
  sources: Source[];
  onAddSource?: (source: Partial<Source>) => Promise<void>;
}

export const SourceCards: React.FC<SourceCardsProps> = ({ sources, onAddSource }) => {
  const [filterTrust, setFilterTrust] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<Source['type']>('user_prompt');
  const [newSourceTrust, setNewSourceTrust] = useState<SourceTrustLevel>('verified');
  const [newSourceAllowlist, setNewSourceAllowlist] = useState('');

  const filtered = sources.filter((s) => {
    if (filterTrust === 'all') return true;
    return s.trust_level === filterTrust;
  });

  const getTrustBadge = (trust: SourceTrustLevel) => {
    switch (trust) {
      case 'trusted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            TRUSTED
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#1E1E1E] text-white border border-[#3D3D3D]">
            <CheckCircle className="w-3.5 h-3.5 text-[#E6CBA8]" />
            VERIFIED
          </span>
        );
      case 'untrusted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-[rgba(192,80,77,0.15)] text-[#C0504D] border border-[#C0504D]/40">
            <ShieldAlert className="w-3.5 h-3.5" />
            UNTRUSTED (ESCALATED)
          </span>
        );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !onAddSource) return;

    await onAddSource({
      name: newSourceName.trim(),
      type: newSourceType,
      trust_level: newSourceTrust,
      allowlist: newSourceAllowlist
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setNewSourceName('');
    setNewSourceAllowlist('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#E6CBA8]" />
            <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight">
              Inbound Source Registry & Trust Boundaries
            </h3>
          </div>
          <p className="text-xs text-[#8A8A8A] font-sans mt-0.5">
            Every input vector is tagged with cryptographic provenance. Untrusted sources are stripped of directives to prevent indirect prompt injection.
          </p>
        </div>

        {/* Filter & Add Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#151515] p-1 rounded-xl border border-[#2A2A2A] text-xs font-mono">
            {['all', 'trusted', 'verified', 'untrusted'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterTrust(lvl)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  filterTrust === lvl
                    ? 'bg-[#1E1E1E] text-[#E6CBA8] font-bold'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] font-mono text-xs font-bold hover:bg-[#F7E7CE] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Source</span>
          </button>
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((src) => (
          <div
            key={src.id}
            className="p-5 rounded-2xl bg-[#151515] border border-[#2A2A2A] hover:border-[#3D3D3D] transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1E1E1E] text-[#8A8A8A] border border-[#2A2A2A]">
                  {src.type.replace('_', ' ')}
                </span>
                {getTrustBadge(src.trust_level)}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-sans">{src.name}</h4>
                <p className="text-xs text-[#8A8A8A] font-sans mt-1 line-clamp-2">
                  {src.description}
                </p>
              </div>

              {/* Allowlist chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-[#5C5C5C]">
                  Allowed Origin Boundaries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {src.allowlist.map((al, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0D0D0D] border border-[#2A2A2A] text-[11px] font-mono text-[#BDBDBD]"
                    >
                      <span className="truncate max-w-[140px]">{al}</span>
                      <CopyButton text={al} iconOnly className="p-0.5 bg-transparent border-0" />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingestion & Protection Vitals */}
            <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-[11px] font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#5C5C5C] uppercase">Payloads Ingested</span>
                <div className="text-white font-bold">{src.total_ingested.toLocaleString()}</div>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[10px] text-[#5C5C5C] uppercase">Blocked Injections</span>
                <div className={src.blocked_attempts > 0 ? 'text-[#C0504D] font-bold' : 'text-[#8A8A8A]'}>
                  {src.blocked_attempts}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-sans">
              Register New Inbound Source Channel
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[#8A8A8A]">Source Channel Name</label>
                <input
                  type="text"
                  required
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Jira Issue Webhook Consumer"
                  className="w-full px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#E6CBA8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#8A8A8A]">Channel Type</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#E6CBA8]"
                  >
                    <option value="user_prompt">User Prompt</option>
                    <option value="web_rag">Web RAG</option>
                    <option value="uploaded_file">Uploaded File</option>
                    <option value="email">Email / Webhook</option>
                    <option value="tool_output">Tool Output</option>
                    <option value="agent_mesh">Agent Mesh</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[#8A8A8A]">Trust Classification</label>
                  <select
                    value={newSourceTrust}
                    onChange={(e) => setNewSourceTrust(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#E6CBA8]"
                  >
                    <option value="trusted">Trusted</option>
                    <option value="verified">Verified</option>
                    <option value="untrusted">Untrusted</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#8A8A8A]">Allowed CIDRs / Hostnames (comma separated)</label>
                <input
                  type="text"
                  value={newSourceAllowlist}
                  onChange={(e) => setNewSourceAllowlist(e.target.value)}
                  placeholder="e.g. jira.internal, 10.200.5.0/24"
                  className="w-full px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#E6CBA8]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-[#8A8A8A] hover:text-white bg-[#151515] border border-[#2A2A2A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] font-bold hover:bg-[#F7E7CE]"
                >
                  Register Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
