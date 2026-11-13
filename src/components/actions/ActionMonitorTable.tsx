'use client';

import React, { useState } from 'react';
import { ActionRecord, ActionStatus, SeverityLevel } from '../../types/api';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface ActionMonitorTableProps {
  actions: ActionRecord[];
  onSelectThreat: (actionId: string) => void;
  onRefresh: () => void;
  isLive: boolean;
}

export const ActionMonitorTable: React.FC<ActionMonitorTableProps> = ({
  actions,
  onSelectThreat,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<ActionRecord | null>(null);

  const filteredActions = actions.filter((act) => {
    const matchesSearch =
      act.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.payload.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (act.rule_triggered && act.rule_triggered.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || act.severity === severityFilter;
    const matchesType = typeFilter === 'ALL' || act.action_type === typeFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'allowed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#6FAF8A]/10 text-[#6FAF8A] border border-[#6FAF8A]/30">
            <ShieldCheck className="w-3 h-3" /> ALLOWED
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#C0504D]/10 text-[#C0504D] border border-[#C0504D]/30">
            <ShieldAlert className="w-3 h-3 text-[#C0504D]" /> BLOCKED
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]">
            <AlertTriangle className="w-3 h-3 text-[#E6CBA8]" /> ESCALATED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/5 text-[#BDBDBD] border border-[#2A2A2A]">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C0504D]/15 text-[#C0504D] border border-[#C0504D]/40">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#1E1E1E] text-white border border-[#3D3D3D]">
            MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#151515] text-[#8A8A8A] border border-[#2A2A2A]">
            LOW
          </span>
        );
    }
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredActions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agentlock-actions-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
              Live Action Monitoring
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8]">
              {filteredActions.length} Events
            </span>
          </div>
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Streaming inspection of autonomous agent tool calls, network requests, and database queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] hover:text-white hover:border-[#E6CBA8] text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#E6CBA8]" />
            Refresh
          </button>
          <button
            onClick={exportToJson}
            className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] hover:text-white hover:border-[#E6CBA8] text-xs font-mono transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#E6CBA8]" />
            Export Log
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search payload, target, rule or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs font-mono text-white placeholder-[#5C5C5C] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] focus:outline-none focus:border-[#E6CBA8]"
          >
            <option value="ALL">All Verdicts</option>
            <option value="allowed">Allowed</option>
            <option value="blocked">Blocked Threats</option>
            <option value="escalated">Escalated</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] focus:outline-none focus:border-[#E6CBA8]"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] focus:outline-none focus:border-[#E6CBA8]"
          >
            <option value="ALL">All Types</option>
            <option value="bash">Bash / Shell</option>
            <option value="sql">SQL Query</option>
            <option value="file_write">File Write</option>
            <option value="iam_assume">IAM Assume</option>
            <option value="api_call">API Call</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#151515] border-b border-[#2A2A2A] text-[#8A8A8A] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8A8A8A] font-mono">
                    No actions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredActions.map((action) => (
                  <tr
                    key={action.id}
                    className={`hover:bg-[#151515] transition-colors cursor-pointer ${
                      action.status === 'blocked' ? 'bg-[#C0504D]/5' : ''
                    }`}
                    onClick={() => setSelectedAction(action)}
                  >
                    <td className="py-3 px-4">
                      <div className="text-white font-bold">{action.id}</div>
                      <div className="text-[10px] text-[#8A8A8A]">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{action.agent_name}</div>
                      <div className="text-[10px] text-[#8A8A8A]">{action.agent_id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] uppercase">
                        {action.action_type}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-[#BDBDBD] font-mono">
                      {action.target}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(action.status)}</td>

                    <td className="py-3 px-4">{getSeverityBadge(action.severity)}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          action.risk_score >= 80
                            ? 'text-[#C0504D]'
                            : action.risk_score >= 50
                            ? 'text-[#E6CBA8]'
                            : 'text-[#6FAF8A]'
                        }`}
                      >
                        {action.risk_score}/100
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAction(action);
                          }}
                          className="p-1 rounded hover:bg-[#151515] text-[#8A8A8A] hover:text-white"
                          title="Inspect Telemetry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {action.status === 'blocked' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectThreat(action.id);
                            }}
                            className="p-1 rounded hover:bg-[#C0504D]/15 text-[#C0504D]"
                            title="Forensics Deep-Dive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Detail Drawer / Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#2A2A2A]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-white">
                    Action Event: {selectedAction.id}
                  </span>
                  {getStatusBadge(selectedAction.status)}
                </div>
                <div className="text-xs font-mono text-[#8A8A8A] mt-0.5">
                  Logged at {new Date(selectedAction.timestamp).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-[#8A8A8A] hover:text-white text-lg font-mono"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#151515] border border-[#2A2A2A]">
                <div>
                  <span className="text-[#8A8A8A] block text-[10px]">AGENT</span>
                  <span className="text-white font-semibold">{selectedAction.agent_name}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] block text-[10px]">ACTION TYPE</span>
                  <span className="text-[#E6CBA8] uppercase">{selectedAction.action_type}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] block text-[10px]">SEVERITY</span>
                  {getSeverityBadge(selectedAction.severity)}
                </div>
                <div>
                  <span className="text-[#8A8A8A] block text-[10px]">RISK SCORE</span>
                  <span className="text-[#C0504D] font-bold text-sm">
                    {selectedAction.risk_score} / 100
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#8A8A8A] block mb-1 text-[11px]">TARGET RESOURCE:</span>
                <div className="p-2.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-white font-mono text-xs break-all">
                  {selectedAction.target}
                </div>
              </div>

              <div>
                <span className="text-[#8A8A8A] block mb-1 text-[11px]">PAYLOAD & ARGUMENTS:</span>
                <pre className="p-3 rounded-lg bg-[#050505] border border-[#2A2A2A] text-[#BDBDBD] font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {selectedAction.payload}
                </pre>
              </div>

              {selectedAction.rule_triggered && (
                <div className="p-3 rounded-xl bg-[#C0504D]/10 border border-[#C0504D]/30">
                  <div className="text-[#C0504D] font-bold mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> TRIGGERED POLICY RULE:
                  </div>
                  <div className="text-[#BDBDBD]">{selectedAction.rule_triggered}</div>
                </div>
              )}

              <div>
                <span className="text-[#8A8A8A] block mb-1 text-[11px]">AGENTLOCK EXPLANATION:</span>
                <div className="p-3 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] font-sans leading-relaxed">
                  {selectedAction.explanation}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
              {selectedAction.status === 'blocked' ? (
                <button
                  onClick={() => {
                    const id = selectedAction.id;
                    setSelectedAction(null);
                    onSelectThreat(id);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#C0504D]/20 border border-[#C0504D]/40 text-[#C0504D] text-xs font-mono hover:bg-[#C0504D]/30 transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Investigate Threat Forensics
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedAction(null)}
                className="px-4 py-2 rounded-lg bg-[#151515] border border-[#2A2A2A] text-[#BDBDBD] text-xs font-mono hover:text-white hover:border-[#E6CBA8] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
