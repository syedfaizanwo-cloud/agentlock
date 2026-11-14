'use client';

import React, { useState } from 'react';
import { Agent, Finding, Scan, AttackCategory } from '../../types/api';
import { getAgentRiskRanking, AgentRiskRankItem, ATTACK_CATEGORIES } from '../../lib/chart-data';
import { Bot, Table, BarChart2, ShieldCheck, ShieldAlert, Clock, AlertCircle } from 'lucide-react';

interface AgentRiskRankingProps {
  agents: Agent[];
  findings?: Finding[];
  scans?: Scan[];
  onSelectAgent?: (agent: Agent) => void;
}

export const AgentRiskRanking: React.FC<AgentRiskRankingProps> = ({
  agents = [],
  findings = [],
  scans = [],
  onSelectAgent,
}) => {
  const [showTable, setShowTable] = useState(false);
  const [expandedAgentId, setExpandedAgentId] = useState<number | null>(null);

  const rankedAgents = getAgentRiskRanking(agents, findings, scans);
  const maxScore = Math.max(...rankedAgents.map((a) => a.riskScore), 1);

  if (agents.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center py-8 space-y-3">
        <Bot className="w-8 h-8 mx-auto text-cream-muted/40" />
        <div className="text-xs font-mono text-cream-muted">
          Register an AI agent endpoint above to track posture and risk ranking.
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="w-2 h-2 rounded-full bg-severity-low" title="Active" />;
      case 'testing':
        return <span className="w-2 h-2 rounded-full bg-severity-medium" title="Testing" />;
      case 'offline':
        return <span className="w-2 h-2 rounded-full bg-severity-critical" title="Offline" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-cream-muted" title="Inactive" />;
    }
  };

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-4">
      {/* Header and Toggle */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1A2E5A]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-bold text-cream">
              Adversarial Risk Ranking
            </h3>
            <span className="text-xs font-mono text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30">
              {rankedAgents.length} agents
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Ranked by composite vulnerability exposure with historical scan delta markers
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] text-cream-muted hover:text-cream hover:border-coral transition-colors"
          title={showTable ? 'View as bars' : 'View as table'}
          aria-label={showTable ? 'View as bars' : 'View as table'}
        >
          {showTable ? <BarChart2 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto rounded-lg border border-[#1A2E5A] bg-navy-950">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
              <tr>
                <th className="py-2.5 px-3">Agent</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Previous</th>
                <th className="py-2.5 px-3 text-right">Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E5A] text-cream">
              {rankedAgents.map((agent) => (
                <tr
                  key={agent.agentId}
                  className="hover:bg-navy-850 cursor-pointer transition-colors"
                  onClick={() => {
                    const matched = agents.find((a) => a.id === agent.agentId);
                    if (matched) onSelectAgent?.(matched);
                  }}
                >
                  <td className="py-2.5 px-3 font-medium text-cream">{agent.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-cream-muted capitalize">
                      {getStatusIcon(agent.status)} {agent.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-coral">{agent.riskScore}</td>
                  <td className="py-2.5 px-3 text-right text-cream-muted">
                    {agent.previousScore !== null ? agent.previousScore : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{agent.findingsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {rankedAgents.map((agent) => {
            const barWidthPercent = Math.max(4, Math.round((agent.riskScore / maxScore) * 100));
            const prevPercent =
              agent.previousScore !== null
                ? Math.min(100, Math.round((agent.previousScore / maxScore) * 100))
                : null;
            const isExpanded = expandedAgentId === agent.agentId;

            return (
              <div
                key={agent.agentId}
                className="p-3.5 rounded-lg bg-navy-950 border border-[#1A2E5A] hover:border-[#1A2E5A]/90 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {getStatusIcon(agent.status)}
                    <span className="font-bold text-cream truncate">{agent.name}</span>
                    <span className="font-mono text-[11px] text-cream-muted truncate max-w-[140px] sm:max-w-xs">
                      #{agent.agentId} ({agent.agentType ? agent.agentType.replace('_', ' ') : 'mock'})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent.agentId)}
                      className="text-[11px] font-mono text-cream-muted hover:text-coral transition-colors"
                    >
                      {isExpanded ? 'Hide breakdown' : 'Vectors'}
                    </button>
                    <span className="font-mono font-bold text-coral">
                      Score: {agent.riskScore}
                    </span>
                  </div>
                </div>

                {/* Relative Horizontal Risk Bar with Previous Scan Marker */}
                <div className="relative w-full h-3 rounded-full bg-navy-900 overflow-hidden border border-[#1A2E5A]">
                  <div
                    className="h-full bg-coral rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${barWidthPercent}%` }}
                  />

                  {/* Previous Scan Marker */}
                  {prevPercent !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-cream-soft shadow-sm"
                      style={{ left: `${prevPercent}%` }}
                      title={`Previous evaluation score: ${agent.previousScore}`}
                    />
                  )}
                </div>

                {/* Expanded Attack Category Breakdown */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#1A2E5A] grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ATTACK_CATEGORIES.map((cat) => {
                      const count = agent.categoryBreakdown[cat.id] || 0;
                      return (
                        <div
                          key={cat.id}
                          className="p-2 rounded bg-navy-900 border border-[#1A2E5A] text-[11px] font-mono"
                        >
                          <div className="text-cream-muted truncate">{cat.label}</div>
                          <div className="font-bold text-cream mt-0.5">{count} findings</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Legend */}
      <div className="pt-2 border-t border-[#1A2E5A] flex items-center justify-between text-xs font-mono text-cream-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2 rounded bg-coral" /> Current score
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-2.5 bg-cream-soft" /> Previous scan
          </span>
        </div>
        <span>Click vector button to inspect category split</span>
      </div>
    </div>
  );
};
