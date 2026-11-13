'use client';

import React, { useState } from 'react';
import { Agent, AttackCategory, Finding } from '../../types/api';
import { ShieldAlert, Search } from 'lucide-react';

interface ExposureHeatmapProps {
  agents: Agent[];
  findings?: Finding[];
  onSelectAgent?: (agent: Agent) => void;
  onSelectCell?: (agent: Agent, category: AttackCategory) => void;
}

const CATEGORIES: { id: AttackCategory; label: string; color: string }[] = [
  { id: 'prompt_injection', label: 'Prompt Injection', color: '#FF6F59' },
  { id: 'data_leakage', label: 'Data Leakage', color: '#E11D48' },
  { id: 'tool_abuse', label: 'Tool Abuse', color: '#F59E0B' },
  { id: 'memory_poisoning', label: 'Memory Poisoning', color: '#34D399' },
];

export const ExposureHeatmap: React.FC<ExposureHeatmapProps> = ({
  agents = [],
  findings = [],
  onSelectAgent,
  onSelectCell,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

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
      return 'bg-navy-950 text-cream-muted/50 border-[#1A2E5A] hover:bg-navy-850';
    }
    switch (severity) {
      case 'critical':
        return 'bg-severity-critical/15 text-severity-critical border-severity-critical/30 hover:bg-severity-critical/25';
      case 'high':
        return 'bg-severity-high/15 text-severity-high border-severity-high/30 hover:bg-severity-high/25';
      case 'medium':
        return 'bg-severity-medium/15 text-severity-medium border-severity-medium/30 hover:bg-severity-medium/25';
      case 'low':
      default:
        return 'bg-severity-low/15 text-severity-low border-severity-low/30 hover:bg-severity-low/25';
    }
  };

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-4">
      {/* Header and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1A2E5A]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-bold text-cream">
              Agent exposure matrix
            </h3>
            <span className="text-xs font-mono text-cream-muted px-2 py-0.5 rounded bg-navy-850 border border-[#1A2E5A]">
              {agents.length} targets
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Confirmed vulnerability density mapped across registered AI agents
          </p>
        </div>

        {/* Search Input Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted focus:outline-none focus:border-coral"
          />
        </div>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-cream-muted space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-cream-muted/40" />
          <div>No target agents match your search filter.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#1A2E5A] bg-navy-950">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Target Agent</th>
                {CATEGORIES.map((cat) => (
                  <th key={cat.id} className="py-2.5 px-3 text-center font-semibold">
                    {cat.label}
                  </th>
                ))}
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E5A]">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-sans font-semibold text-cream text-xs">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-cream-muted font-mono truncate max-w-xs mt-0.5">
                      {agent.target_url}
                    </div>
                  </td>

                  {CATEGORIES.map((cat) => {
                    const stats = getCellStats(agent.id, cat.id);
                    return (
                      <td key={cat.id} className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectCell?.(agent, cat.id)}
                          className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded text-xs font-bold border transition-colors ${getCellBadgeStyle(
                            stats.severity,
                            stats.count
                          )}`}
                          title={`${agent.name}: ${stats.count} confirmed findings in ${cat.label}`}
                        >
                          {stats.count}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectAgent?.(agent)}
                      className="px-2.5 py-1 rounded bg-navy-850 border border-[#1A2E5A] text-cream-soft hover:text-cream hover:border-coral text-xs transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="pt-2 border-t border-[#1A2E5A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-cream-muted">
        <div className="flex items-center gap-4">
          <span>Density:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-severity-critical" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-severity-high" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-severity-medium" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-severity-low" /> Low
          </span>
          <span className="flex items-center gap-1.5 text-cream-muted/50">
            <span className="w-2 h-2 rounded bg-[#1A2E5A]" /> Clean
          </span>
        </div>
        <span>Select any cell to inspect findings</span>
      </div>
    </div>
  );
};
