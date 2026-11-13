'use client';

import React, { useState } from 'react';
import { Agent, AttackCategory, Finding, Scan, ALL_ATTACK_CATEGORIES, ATTACK_CATEGORY_LABELS } from '../../types/api';
import { ShieldAlert, Search } from 'lucide-react';

interface ExposureHeatmapProps {
  agents: Agent[];
  findings?: Finding[];
  scans?: Scan[];
  onSelectAgent?: (agent: Agent) => void;
  onSelectCell?: (agent: Agent, category: AttackCategory) => void;
}

const CATEGORIES: { id: AttackCategory; label: string }[] = ALL_ATTACK_CATEGORIES.map((id) => ({
  id,
  label: ATTACK_CATEGORY_LABELS[id] || id,
}));

export const ExposureHeatmap: React.FC<ExposureHeatmapProps> = ({
  agents = [],
  findings = [],
  scans = [],
  onSelectAgent,
  onSelectCell,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getCellStats = (agent: Agent, category: AttackCategory) => {
    const aScanIds = new Set(scans.filter((s) => s.agent_id === agent.id).map((s) => s.id));
    const matching = findings.filter(
      (f) => aScanIds.has(f.scan_id) && f.category === category
    );
    const count = matching.length;
    const hasCritical = matching.some((f) => f.severity.toLowerCase() === 'critical');
    const hasHigh = matching.some((f) => f.severity.toLowerCase() === 'high');
    const hasMedium = matching.some((f) => f.severity.toLowerCase() === 'medium');

    return {
      count,
      findings: matching,
      severity: hasCritical ? 'critical' : hasHigh ? 'high' : hasMedium ? 'medium' : count > 0 ? 'low' : 'none',
    };
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.agent_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.id).includes(searchTerm)
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
        return 'bg-severity-low/15 text-severity-low border-severity-low/30 hover:bg-severity-low/25';
      default:
        return 'bg-navy-950 text-cream-muted border-[#1A2E5A]';
    }
  };

  if (agents.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center py-8 space-y-2">
        <ShieldAlert className="w-8 h-8 mx-auto text-cream-muted/40" />
        <div className="text-xs font-mono text-cream-muted">
          Register AI agent endpoints to view cross-agent adversarial exposure matrix.
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-4">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1A2E5A]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-bold text-cream">
              Agent Adversarial Exposure Heatmap
            </h3>
            <span className="text-xs font-mono text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30">
              {agents.length} agents
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Cross-agent vulnerability distribution across eight security evaluation vectors
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
          />
        </div>
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto rounded-lg border border-[#1A2E5A] bg-navy-950">
        <table className="w-full text-xs font-mono">
          <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
            <tr>
              <th className="py-2.5 px-4 text-left font-semibold sticky left-0 bg-navy-850 z-10">
                Agent Target
              </th>
              {CATEGORIES.map((cat) => (
                <th key={cat.id} className="py-2.5 px-3 text-center font-semibold whitespace-nowrap">
                  {cat.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A2E5A]">
            {filteredAgents.map((agent) => (
              <tr key={agent.id} className="hover:bg-navy-850/50 transition-colors">
                <td className="py-3 px-4 sticky left-0 bg-navy-950 hover:bg-navy-850/50">
                  <div
                    onClick={() => onSelectAgent?.(agent)}
                    className="cursor-pointer group"
                  >
                    <div className="font-sans font-semibold text-cream text-xs group-hover:text-coral transition-colors">
                      {agent.name}
                    </div>
                    <div className="text-[11px] text-cream-muted font-mono truncate max-w-xs mt-0.5">
                      #{agent.id} ({agent.agent_type})
                    </div>
                  </div>
                </td>

                {CATEGORIES.map((cat) => {
                  const stats = getCellStats(agent, cat.id);
                  return (
                    <td key={cat.id} className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectCell?.(agent, cat.id)}
                        className={`inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded text-xs font-bold border transition-colors ${getCellBadgeStyle(
                          stats.severity,
                          stats.count
                        )}`}
                        title={`${agent.name} - ${cat.label}: ${stats.count} findings (${stats.severity})`}
                        aria-label={`${agent.name} ${cat.label}: ${stats.count} findings`}
                      >
                        {stats.count > 0 ? stats.count : '-'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
