'use client';

import React, { useState } from 'react';
import { Heartbeat } from '@/types/api';
import { HeartPulse, ShieldAlert, RefreshCw, Power, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { apiClient } from '@/lib/api-client';

interface OfflineAgentsPanelProps {
  heartbeats: Heartbeat[];
  onRefresh?: () => Promise<void>;
  onShowToast?: (msg: string, type: 'success' | 'warning' | 'info') => void;
}

export const OfflineAgentsPanel: React.FC<OfflineAgentsPanelProps> = ({
  heartbeats,
  onRefresh,
  onShowToast,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'revoke' | 'reattest' | 'killswitch' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReattest = async (agentId: string) => {
    setIsProcessing(true);
    try {
      const res = await apiClient.reattestAgent(agentId);
      if (onShowToast) onShowToast(res.message, 'success');
      if (onRefresh) await onRefresh();
    } catch {
      if (onShowToast) onShowToast('Failed to reattest agent', 'warning');
    } finally {
      setIsProcessing(false);
      setActionType(null);
      setSelectedAgentId(null);
    }
  };

  const handleRevoke = async (agentId: string) => {
    setIsProcessing(true);
    try {
      const res = await apiClient.revokeAgent(agentId);
      if (onShowToast) onShowToast(res.message, 'warning');
      if (onRefresh) await onRefresh();
    } catch {
      if (onShowToast) onShowToast('Failed to revoke agent credentials', 'warning');
    } finally {
      setIsProcessing(false);
      setActionType(null);
      setSelectedAgentId(null);
    }
  };

  const handleKillSwitch = async () => {
    setIsProcessing(true);
    try {
      const res = await apiClient.triggerKillSwitch('SEC-ADMIN-KILL');
      if (onShowToast) onShowToast(res.message, 'warning');
      if (onRefresh) await onRefresh();
    } catch {
      if (onShowToast) onShowToast('Failed to trigger emergency kill switch', 'warning');
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const getStatusBadge = (status: Heartbeat['status']) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-[rgba(111,175,138,0.15)] text-[#6FAF8A] border border-[#6FAF8A]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FAF8A] animate-pulse" />
            ONLINE
          </span>
        );
      case 'stale':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-[rgba(192,80,77,0.15)] text-[#C0504D] border border-[#C0504D]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0504D]" />
            STALE (FAIL-CLOSED)
          </span>
        );
      case 'quarantined':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-[rgba(192,80,77,0.15)] text-[#C0504D] border border-[#C0504D]/30">
            QUARANTINED
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-[#1E1E1E] text-[#8A8A8A] border border-[#2A2A2A]">
            OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-xl space-y-6">
      {/* Header with Kill Switch Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#E6CBA8]" />
            <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight">
              Offline Agent Defense & Heartbeat Telemetry (Fail-Closed)
            </h3>
          </div>
          <p className="text-xs text-[#8A8A8A] font-sans mt-0.5">
            Agents must ping every 30s. Missing 3 heartbeats immediately revokes leased credentials and drops all gateway proxy routes.
          </p>
        </div>

        {/* Emergency Kill Switch Button */}
        <div>
          <button
            type="button"
            onClick={() => setActionType('killswitch')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[rgba(192,80,77,0.15)] border border-[#C0504D] text-[#C0504D] hover:bg-[#C0504D] hover:text-white transition-all text-xs font-mono font-bold shadow-[0_0_15px_rgba(192,80,77,0.2)]"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Emergency Kill Switch</span>
          </button>
        </div>
      </div>

      {/* Agents Heartbeat Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-[#5C5C5C] text-[10px] uppercase">
              <th className="pb-3 font-semibold">Agent Workload</th>
              <th className="pb-3 font-semibold">Heartbeat Status</th>
              <th className="pb-3 font-semibold">Last Beat</th>
              <th className="pb-3 font-semibold">Missed Beats</th>
              <th className="pb-3 font-semibold">Lease Expiry</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {heartbeats.map((hb) => (
              <tr key={hb.agent_id} className="hover:bg-[#151515] transition-colors">
                <td className="py-3 pr-4">
                  <div className="font-bold text-white">{hb.agent_name}</div>
                  <div className="text-[10px] text-[#8A8A8A]">{hb.agent_id}</div>
                </td>
                <td className="py-3 pr-4">{getStatusBadge(hb.status)}</td>
                <td className="py-3 pr-4 text-[#BDBDBD]">
                  {hb.seconds_since_last_beat < 10
                    ? 'Just now'
                    : `${hb.seconds_since_last_beat}s ago`}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      hb.missed_beats > 0
                        ? 'text-[#C0504D] font-bold'
                        : 'text-[#6FAF8A]'
                    }
                  >
                    {hb.missed_beats} / 3 threshold
                  </span>
                </td>
                <td className="py-3 pr-4">
                  {hb.seconds_until_revocation > 0 ? (
                    <span className="text-[#E6CBA8]">{hb.seconds_until_revocation}s remaining</span>
                  ) : (
                    <span className="text-[#8A8A8A]">Expired (Lease Revoked)</span>
                  )}
                </td>
                <td className="py-3 text-right space-x-2">
                  {hb.status !== 'online' ? (
                    <button
                      type="button"
                      onClick={() => handleReattest(hb.agent_id)}
                      disabled={isProcessing}
                      className="px-2.5 py-1 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#E6CBA8] border border-[#B89B72]/40 transition-colors text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-attest</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAgentId(hb.agent_id);
                        setActionType('revoke');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#151515] hover:bg-[#1E1E1E] text-[#8A8A8A] hover:text-[#C0504D] border border-[#2A2A2A] transition-colors text-[11px]"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog for Manual Revoke */}
      <ConfirmDialog
        isOpen={actionType === 'revoke'}
        title={`Revoke Lease for ${selectedAgentId || 'Agent'}`}
        isDestructive={true}
        description={
          <p>
            This will immediately invalidate the 15-minute cryptographic lease token and sever all gateway routing for this agent. The agent will transition to fail-closed state until re-attestation.
          </p>
        }
        confirmText="Revoke Credentials"
        cancelText="Cancel"
        isLoading={isProcessing}
        onConfirm={() => { if (selectedAgentId) handleRevoke(selectedAgentId); }}
        onClose={() => {
          setActionType(null);
          setSelectedAgentId(null);
        }}
      />

      {/* Confirm Dialog for Emergency Kill Switch */}
      <ConfirmDialog
        isOpen={actionType === 'killswitch'}
        title="Trigger Fleet Emergency Kill Switch"
        isDestructive={true}
        requiredConfirmationText="REVOKE FLEET"
        confirmationPlaceholder="Type REVOKE FLEET to confirm"
        description={
          <p>
            CRITICAL SEC-OPS OVERRIDE: This will sever egress connections across the entire agent fleet, revoke all active leased credentials, and isolate running containers.
          </p>
        }
        confirmText="Activate Kill Switch"
        cancelText="Cancel"
        isLoading={isProcessing}
        onConfirm={handleKillSwitch}
        onClose={() => setActionType(null)}
      />
    </div>
  );
};
