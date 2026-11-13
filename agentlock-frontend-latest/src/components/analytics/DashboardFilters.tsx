'use client';

import React from 'react';
import { Agent, AttackCategory, SeverityLevel } from '../../types/api';
import { Filter, X, RotateCcw } from 'lucide-react';

export interface FilterState {
  agentId: string | 'ALL';
  category: AttackCategory | 'ALL';
  severity: SeverityLevel | 'ALL';
}

interface DashboardFiltersProps {
  agents: Agent[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  agents = [],
  filters,
  onChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.agentId !== 'ALL' || filters.category !== 'ALL' || filters.severity !== 'ALL';

  return (
    <div className="p-3 rounded-xl bg-navy-900 border border-[#1A2E5A] flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
      {/* Left: Toolbar Label & Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cream font-medium pr-2 border-r border-[#1A2E5A]">
          <Filter className="w-3.5 h-3.5 text-coral" />
          <span>Filters</span>
        </div>

        {/* Agent Filter */}
        <select
          value={filters.agentId}
          onChange={(e) => onChange({ ...filters, agentId: e.target.value })}
          className="px-2.5 py-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream focus:outline-none focus:border-coral"
        >
          <option value="ALL">All agents ({agents.length})</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value as any })}
          className="px-2.5 py-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream focus:outline-none focus:border-coral"
        >
          <option value="ALL">All categories</option>
          <option value="prompt_injection">Prompt Injection</option>
          <option value="data_leakage">Data Leakage</option>
          <option value="tool_abuse">Tool Abuse</option>
          <option value="memory_poisoning">Memory Poisoning</option>
        </select>

        {/* Severity Filter */}
        <select
          value={filters.severity}
          onChange={(e) => onChange({ ...filters, severity: e.target.value as any })}
          className="px-2.5 py-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream focus:outline-none focus:border-coral"
        >
          <option value="ALL">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Right: Active Filter Badges & Reset Button */}
      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {filters.agentId !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-coral/10 text-coral border border-coral/30">
                Agent: {agents.find((a) => a.id === filters.agentId)?.name || filters.agentId}
                <button
                  onClick={() => onChange({ ...filters, agentId: 'ALL' })}
                  className="hover:text-cream"
                  aria-label="Remove agent filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-coral/10 text-coral border border-coral/30">
                Category: {filters.category.replace('_', ' ')}
                <button
                  onClick={() => onChange({ ...filters, category: 'ALL' })}
                  className="hover:text-cream"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.severity !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-coral/10 text-coral border border-coral/30">
                Severity: {filters.severity}
                <button
                  onClick={() => onChange({ ...filters, severity: 'ALL' })}
                  className="hover:text-cream"
                  aria-label="Remove severity filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-cream-muted hover:text-coral hover:bg-navy-850 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
