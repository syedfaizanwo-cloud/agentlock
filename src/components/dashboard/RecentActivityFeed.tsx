'use client';

import React from 'react';
import { ActionRecord } from '../../types/api';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Terminal,
  Database,
  FileCode,
  KeyRound,
} from 'lucide-react';

interface RecentActivityFeedProps {
  actions: ActionRecord[];
  onInspectAction: (action: ActionRecord) => void;
  onViewAll: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  actions,
  onInspectAction,
  onViewAll,
}) => {
  const getActionIcon = (type: ActionRecord['action_type']) => {
    switch (type) {
      case 'bash':
        return <Terminal className="w-3.5 h-3.5" />;
      case 'sql':
        return <Database className="w-3.5 h-3.5" />;
      case 'file_write':
      case 'file_read':
        return <FileCode className="w-3.5 h-3.5" />;
      case 'iam_assume':
        return <KeyRound className="w-3.5 h-3.5" />;
      default:
        return <Terminal className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: ActionRecord['status']) => {
    switch (status) {
      case 'allowed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#6FAF8A]/10 text-[#6FAF8A] border border-[#6FAF8A]/30">
            <ShieldCheck className="w-3 h-3" /> ALLOWED
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#C0504D]/10 text-[#C0504D] border border-[#C0504D]/30">
            <ShieldAlert className="w-3 h-3 text-[#C0504D]" /> BLOCKED
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]">
            <AlertTriangle className="w-3 h-3 text-[#E6CBA8]" /> ESCALATED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/5 text-[#BDBDBD] border border-[#2A2A2A]">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
            Live Interception Stream
          </h3>
          <p className="text-xs text-[#8A8A8A]">Chronological telemetry audit feed</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-mono text-[#E6CBA8] hover:text-[#F7E7CE] hover:underline flex items-center gap-1 transition-colors"
        >
          View Full Table <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {actions.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#8A8A8A]">
            No recent activity recorded
          </div>
        ) : (
          actions.slice(0, 6).map((item) => (
            <div
              key={item.id}
              onClick={() => onInspectAction(item)}
              className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] hover:border-[#E6CBA8] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg border text-xs ${
                      item.status === 'blocked'
                        ? 'bg-[#C0504D]/10 border-[#C0504D]/30 text-[#C0504D]'
                        : item.status === 'escalated'
                        ? 'bg-[rgba(230,203,168,0.14)] border-[#B89B72] text-[#E6CBA8]'
                        : 'bg-[#1E1E1E] border-[#2A2A2A] text-[#BDBDBD]'
                    }`}
                  >
                    {getActionIcon(item.action_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-white group-hover:text-[#E6CBA8] transition-colors">
                        {item.agent_name}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">
                        [{item.action_type}]
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#8A8A8A] truncate max-w-sm sm:max-w-md mt-0.5">
                      {item.target}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {getStatusBadge(item.status)}
                  <span className="text-[10px] font-mono text-[#8A8A8A]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {item.explanation && (
                <div className="mt-2 text-[11px] text-[#8A8A8A] pl-8 border-t border-[#2A2A2A] pt-1.5 line-clamp-1">
                  {item.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
