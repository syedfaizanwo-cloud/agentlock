'use client';

import React, { useState } from 'react';
import { Agent, AgentStatus, PrivilegeTier } from '../../types/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CopyButton } from '../ui/CopyButton';
import {
  Bot,
  Lock,
  Unlock,
  Sliders,
  Search,
  Cpu,
  Zap,
} from 'lucide-react';

interface AgentManagementViewProps {
  agents: Agent[];
  onUpdateStatus: (agentId: string, status: AgentStatus) => Promise<void>;
  onInspectThreat?: (agentId: string) => void;
  onTestSimulation?: (agentId: string) => void;
}

export const AgentManagementView: React.FC<AgentManagementViewProps> = ({
  agents,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    agentId: string;
    agentName: string;
    targetStatus: AgentStatus;
  } | null>(null);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;
    const matchesTier = tierFilter === 'ALL' || agent.privilege_tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleStatusChange = async (agentId: string, newStatus: AgentStatus) => {
    setLoadingAgentId(agentId);
    try {
      await onUpdateStatus(agentId, newStatus);
    } finally {
      setLoadingAgentId(null);
    }
  };

  const getTierBadge = (tier: PrivilegeTier) => {
    switch (tier) {
      case 'L4_ADMIN_ROOT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C0504D]/10 text-[#C0504D] border border-[#C0504D]/30">
            L4: ADMIN ROOT
          </span>
        );
      case 'L3_DB_WRITE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]">
            L3: DB WRITE
          </span>
        );
      case 'L2_EXEC':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#1E1E1E] text-white border border-[#3D3D3D]">
            L2: EXEC SANDBOX
          </span>
        );
      case 'L1_READONLY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#151515] text-[#8A8A8A] border border-[#2A2A2A]">
            L1: READ-ONLY
          </span>
        );
    }
  };

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#6FAF8A]/10 text-[#6FAF8A] border border-[#6FAF8A]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FAF8A] animate-ping"></span>
            ACTIVE
          </span>
        );
      case 'quarantined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#C0504D]/10 text-[#C0504D] border border-[#C0504D]/30">
            <Lock className="w-3 h-3 text-[#C0504D]" />
            QUARANTINED
          </span>
        );
      case 'supervised':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]">
            SUPERVISED
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#151515] text-[#8A8A8A] border border-[#2A2A2A]">
            SUSPENDED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
              Agent Fleet Governance
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8]">
              {agents.length} Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1">
            Real-time authorization tiers, token throughput quotas, and emergency quarantine controls.
          </p>
        </div>

        {/* Fleet KPI Quick Bar */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#6FAF8A]">
            Active: <strong>{agents.filter((a) => a.status === 'active').length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#E6CBA8]">
            Supervised: <strong>{agents.filter((a) => a.status === 'supervised').length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#C0504D]">
            Quarantined: <strong>{agents.filter((a) => a.status === 'quarantined').length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search agents by name, model, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs font-mono text-white placeholder-[#5C5C5C] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-[#BDBDBD] focus:outline-none focus:border-[#E6CBA8]"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="quarantined">Quarantined Only</option>
            <option value="supervised">Supervised Only</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-[#BDBDBD] focus:outline-none focus:border-[#E6CBA8]"
          >
            <option value="ALL">All Privilege Tiers</option>
            <option value="L4_ADMIN_ROOT">L4: Root Admin</option>
            <option value="L3_DB_WRITE">L3: DB Write</option>
            <option value="L2_EXEC">L2: Exec Sandbox</option>
            <option value="L1_READONLY">L1: Read-Only</option>
          </select>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className={`p-5 rounded-2xl bg-[#0D0D0D] border transition-all duration-200 flex flex-col justify-between ${
              agent.status === 'quarantined'
                ? 'border-[#C0504D]/40'
                : agent.status === 'supervised'
                ? 'border-[#B89B72]/40'
                : 'border-[#2A2A2A] hover:border-[#E6CBA8]'
            }`}
          >
            <div>
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      agent.status === 'quarantined'
                        ? 'bg-[#C0504D]/10 border-[#C0504D]/40 text-[#C0504D]'
                        : 'bg-[#151515] border-[#2A2A2A] text-[#E6CBA8]'
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white leading-tight">
                      {agent.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#8A8A8A]">{agent.id}</span>
                  </div>
                </div>

                {getStatusBadge(agent.status)}
              </div>

              {/* Description */}
              <p className="text-xs text-[#BDBDBD] line-clamp-2 mb-4 leading-relaxed font-sans">
                {agent.description}
              </p>

              {/* Metadata tags */}
              <div className="space-y-2 py-3 border-y border-[#2A2A2A] text-xs font-mono">
                <div className="flex items-center justify-between text-[#8A8A8A]">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#E6CBA8]" /> Model:
                  </span>
                  <span className="text-white font-semibold">{agent.model}</span>
                </div>
                <div className="flex items-center justify-between text-[#8A8A8A]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#8A8A8A]" /> Tier:
                  </span>
                  {getTierBadge(agent.privilege_tier)}
                </div>
                <div className="flex items-center justify-between text-[#8A8A8A]">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#E6CBA8]" /> Token Rate:
                  </span>
                  <span className="text-white">{agent.token_usage_rate} tpm</span>
                </div>
                <div className="flex items-center justify-between text-[#8A8A8A]">
                  <span>Blocked Threats:</span>
                  <span className={agent.blocked_count > 0 ? 'text-[#C0504D] font-bold' : 'text-white'}>
                    {agent.blocked_count}
                  </span>
                </div>
              </div>

              {/* Allowed Tools Pills */}
              <div className="mt-3">
                <div className="text-[10px] font-mono text-[#8A8A8A] uppercase mb-1.5">
                  Authorized Tools:
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.allowed_tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 pt-3 border-t border-[#2A2A2A] flex items-center gap-2">
              {agent.status === 'quarantined' ? (
                <button
                  disabled={loadingAgentId === agent.id}
                  onClick={() =>
                    setConfirmAction({
                      agentId: agent.id,
                      agentName: agent.name,
                      targetStatus: 'supervised',
                    })
                  }
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#6FAF8A]/10 border border-[#6FAF8A]/40 text-[#6FAF8A] hover:bg-[#6FAF8A]/20 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Release to Supervised
                </button>
              ) : (
                <button
                  disabled={loadingAgentId === agent.id}
                  onClick={() =>
                    setConfirmAction({
                      agentId: agent.id,
                      agentName: agent.name,
                      targetStatus: 'quarantined',
                    })
                  }
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#C0504D]/10 border border-[#C0504D]/40 text-[#C0504D] hover:bg-[#C0504D]/20 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Quarantine Agent
                </button>
              )}

              <button
                onClick={() => setSelectedAgent(agent)}
                className="py-1.5 px-3 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] hover:text-white hover:border-[#E6CBA8] text-xs font-mono transition-colors"
                title="Inspect Details"
              >
                Inspect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-white">{selectedAgent.name}</h3>
                  <div className="text-xs font-mono text-[#E6CBA8]">{selectedAgent.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-[#8A8A8A] hover:text-white text-lg font-mono"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-[#8A8A8A] block mb-0.5">Role & Mandate:</span>
                <p className="text-[#BDBDBD] font-sans leading-relaxed">{selectedAgent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#151515] border border-[#2A2A2A]">
                <div>
                  <span className="text-[#8A8A8A] block">LLM Engine:</span>
                  <span className="text-white font-bold">{selectedAgent.model}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] block">Privilege Tier:</span>
                  {getTierBadge(selectedAgent.privilege_tier)}
                </div>
                <div>
                  <span className="text-[#8A8A8A] block">Total Invocations:</span>
                  <span className="text-white font-bold">{selectedAgent.total_actions}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] block">Violations Blocked:</span>
                  <span className="text-[#C0504D] font-bold">{selectedAgent.blocked_count}</span>
                </div>
              </div>

              <div>
                <span className="text-[#8A8A8A] block mb-1">Assigned Security Owner:</span>
                <span className="text-[#BDBDBD]">{selectedAgent.owner}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] text-xs font-mono hover:text-white hover:border-[#E6CBA8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog for Quarantine / Release */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
          title={
            confirmAction.targetStatus === 'quarantined'
              ? `Quarantine Agent: ${confirmAction.agentName}`
              : `Release Agent: ${confirmAction.agentName}`
          }
          isDestructive={confirmAction.targetStatus === 'quarantined'}
          description={
            confirmAction.targetStatus === 'quarantined'
              ? 'This will immediately revoke active runtime credentials, severed gateway proxy routes, and halt all tool executions for this agent.'
              : 'This will restore execution privileges under supervised L2 boundaries with human approval required for high-risk actions.'
          }
          confirmText={
            confirmAction.targetStatus === 'quarantined' ? 'Quarantine Agent' : 'Release to Supervised'
          }
          cancelText="Cancel"
          isLoading={loadingAgentId === confirmAction.agentId}
          onConfirm={async () => {
            await handleStatusChange(confirmAction.agentId, confirmAction.targetStatus);
            setConfirmAction(null);
          }}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};
