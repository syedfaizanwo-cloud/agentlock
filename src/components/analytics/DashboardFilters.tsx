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
    <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 select-none relative z-20">
      {/* Left: Toolbar Label & Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#F5EDDC] font-bold uppercase tracking-wider pr-2 border-r border-white/10">
          <Filter className="w-3.5 h-3.5 text-[#FF6F59]" />
          <span>Intelligence Filters</span>
        </div>

        {/* Agent Filter */}
        <select
          value={filters.agentId}
          onChange={(e) => onChange({ ...filters, agentId: e.target.value })}
          className="px-3 py-1.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] focus:outline-none"
        >
          <option value="ALL">All Target Agents ({agents.length})</option>
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
          className="px-3 py-1.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] focus:outline-none"
        >
          <option value="ALL">All Attack Categories</option>
          <option value="prompt_injection">Prompt Injection</option>
          <option value="data_leakage">Data Leakage</option>
          <option value="tool_abuse">Tool Abuse</option>
          <option value="memory_poisoning">Memory Poisoning</option>
        </select>

        {/* Severity Filter */}
        <select
          value={filters.severity}
          onChange={(e) => onChange({ ...filters, severity: e.target.value as any })}
          className="px-3 py-1.5 rounded-xl glass-input text-xs font-mono text-[#F5EDDC] focus:outline-none"
        >
          <option value="ALL">All Severities</option>
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/30">
                Agent: {agents.find((a) => a.id === filters.agentId)?.name || filters.agentId}
                <button
                  onClick={() => onChange({ ...filters, agentId: 'ALL' })}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/30">
                Category: {filters.category.replace('_', ' ')}
                <button
                  onClick={() => onChange({ ...filters, category: 'ALL' })}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.severity !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/30">
                Severity: {filters.severity}
                <button
                  onClick={() => onChange({ ...filters, severity: 'ALL' })}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-[#FF6F59] text-xs font-mono text-[#C8C0AC] hover:text-[#F5EDDC] transition-all flex items-center gap-1.5"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
