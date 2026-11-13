'use client';

import React, { useState } from 'react';
import { Agent, AttackCategory, Finding } from '../../types/api';
import { ShieldAlert, Search, Filter, ArrowUpRight } from 'lucide-react';

interface ExposureHeatmapProps {
  agents: Agent[];
  findings?: Finding[];
  onSelectAgent?: (agent: Agent) => void;
  onSelectCell?: (agent: Agent, category: AttackCategory) => void;
}

const CATEGORIES: { id: AttackCategory; label: string; color: string }[] = [
  { id: 'prompt_injection', label: 'Prompt Injection', color: '#FF6F59' },
  { id: 'data_leakage', label: 'Data Leakage', color: '#FF3158' },
  { id: 'tool_abuse', label: 'Tool Abuse', color: '#FF9F0A' },
  { id: 'memory_poisoning', label: 'Memory Poisoning', color: '#32D6A0' },
];

export const ExposureHeatmap: React.FC<ExposureHeatmapProps> = ({
  agents = [],
  findings = [],
  onSelectAgent,
  onSelectCell,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCell, setHoveredCell] = useState<{ agentId: string; catId: string } | null>(null);

  // Compute actual finding counts per agent and category
  const getCellStats = (agentId: string, category: AttackCategory) => {
    const matching = findings.filter(
      (f) => f.agent_id === agentId && f.category === category
    );
    const count = matching.length;
    const hasCritical = matching.some((f) => f.severity === 'critical');
    const hasHigh = matching.some((f) => f.severity === 'high');
    const hasMedium = matching.some((f) => f.severity === 'medium');

    return {
      count,
      findings: matching,
      severity: hasCritical ? 'critical' : hasHigh ? 'high' : hasMedium ? 'medium' : count > 0 ? 'low' : 'none',
    };
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.target_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCellBadgeStyle = (severity: string, count: number) => {
    if (count === 0) {
      return 'bg-white/[0.03] text-[#C8C0AC]/40 border-white/[0.05] hover:bg-white/[0.08]';
    }
    switch (severity) {
      case 'critical':
        return 'bg-[#FF3158]/20 text-[#FF3158] border-[#FF3158]/40 hover:bg-[#FF3158]/30 shadow-[0_0_12px_rgba(255,49,88,0.25)]';
      case 'high':
        return 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/40 hover:bg-[#FF9F0A]/30 shadow-[0_0_12px_rgba(255,159,10,0.25)]';
      case 'medium':
        return 'bg-[#FFD43B]/20 text-[#FFD43B] border-[#FFD43B]/40 hover:bg-[#FFD43B]/30 shadow-[0_0_12px_rgba(255,212,59,0.25)]';
      case 'low':
      default:
        return 'bg-[#32D6A0]/20 text-[#32D6A0] border-[#32D6A0]/40 hover:bg-[#32D6A0]/30 shadow-[0_0_12px_rgba(50,214,160,0.25)]';
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel space-y-5 relative overflow-hidden group">
      {/* Ambient Radial Backlight */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-[#FF6F59]/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08] relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] uppercase tracking-wide">
              Agent Adversarial Exposure Heatmap
            </h3>
            <span className="text-xs font-mono text-[#C8C0AC] px-2.5 py-0.5 rounded-full bg-[#060D1F]/60 border border-white/10">
              {agents.length} Targets
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-1 font-sans">
            Confirmed vulnerability density matrix mapped across tested autonomous agents
          </p>
        </div>

        {/* Search Input Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#C8C0AC]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter target agents..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] placeholder-[#C8C0AC]/50 focus:outline-none"
          />
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-[#C8C0AC]/70 space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-[#C8C0AC]/40" />
          <div>No agent targets evaluated yet. Register an agent and execute a scan to generate heatmap telemetry.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#060D1F]/50 relative z-10">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0A1633]/80 text-[#C8C0AC] border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Target Agent</th>
                {CATEGORIES.map((cat) => (
                  <th key={cat.id} className="py-3 px-4 text-center font-semibold">
                    <span className="truncate">{cat.label}</span>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F5EDDC]">
              {filteredAgents.map((agent) => {
                return (
                  <tr
                    key={agent.id}
                    className="hover:bg-white/[0.03] transition-colors group/row"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#F5EDDC] group-hover/row:text-[#FF6F59] transition-colors">
                        {agent.name}
                      </div>
                      <div className="text-[10px] text-[#C8C0AC]/70 font-mono truncate max-w-xs">
                        {agent.target_url}
                      </div>
                    </td>

                    {CATEGORIES.map((cat) => {
                      const cell = getCellStats(agent.id, cat.id);
                      const isHovered =
                        hoveredCell?.agentId === agent.id && hoveredCell?.catId === cat.id;

                      return (
                        <td key={cat.id} className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onSelectCell?.(agent, cat.id)}
                            onMouseEnter={() =>
                              setHoveredCell({ agentId: agent.id, catId: cat.id })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            title={`${agent.name} // ${cat.label}: ${cell.count} findings`}
                            className={`inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 rounded-lg border font-mono font-bold text-xs transition-all ${getCellBadgeStyle(
                              cell.severity,
                              cell.count
                            )} ${isHovered ? 'scale-110' : ''}`}
                          >
                            {cell.count}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectAgent?.(agent)}
                        className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-[#FF6F59] text-[#C8C0AC] hover:text-[#F5EDDC] transition-all inline-flex items-center gap-1"
                        title="Focus on this agent"
                      >
                        <span className="text-[10px] hidden sm:inline">Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Exposure Matrix Severity Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#C8C0AC]/80 relative z-10">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-white/60">Risk Legend:</span>
          <span className="flex items-center gap-1.5 text-[#FF3158]">
            <span className="w-2 h-2 rounded-full bg-[#FF3158]" /> Critical
          </span>
          <span className="flex items-center gap-1.5 text-[#FF9F0A]">
            <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" /> High
          </span>
          <span className="flex items-center gap-1.5 text-[#FFD43B]">
            <span className="w-2 h-2 rounded-full bg-[#FFD43B]" /> Medium
          </span>
          <span className="flex items-center gap-1.5 text-[#32D6A0]">
            <span className="w-2 h-2 rounded-full bg-[#32D6A0]" /> Low
          </span>
          <span className="flex items-center gap-1.5 text-[#C8C0AC]/50">
            <span className="w-2 h-2 rounded-full bg-white/20" /> Zero Exploits
          </span>
        </div>

        <span className="text-[#FF6F59]">Click cell to inspect matching vulnerability evidence</span>
      </div>
    </div>
  );
};
