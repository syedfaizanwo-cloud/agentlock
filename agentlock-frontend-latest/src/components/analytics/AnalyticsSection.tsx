'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { DashboardFilters, FilterState } from './DashboardFilters';
import { DashboardStats, Scan, Agent, Finding, SeverityLevel, AttackCategory } from '../../types/api';

// Dynamic lazy imports for heavy chart and drawer components
const SeverityDonut = dynamic(
  () => import('../dashboard/SeverityDonut').then((mod) => mod.SeverityDonut),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-xl bg-navy-900 border border-[#1A2E5A] animate-pulse" />,
  }
);

const AttackVectorChart = dynamic(
  () => import('../dashboard/AttackVectorChart').then((mod) => mod.AttackVectorChart),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-xl bg-navy-900 border border-[#1A2E5A] animate-pulse" />,
  }
);

const VulnerabilityVelocityChart = dynamic(
  () => import('../dashboard/VulnerabilityVelocityChart').then((mod) => mod.VulnerabilityVelocityChart),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-xl bg-navy-900 border border-[#1A2E5A] animate-pulse" />,
  }
);

const ExposureHeatmap = dynamic(
  () => import('./ExposureHeatmap').then((mod) => mod.ExposureHeatmap),
  {
    ssr: false,
    loading: () => <div className="h-64 rounded-xl bg-navy-900 border border-[#1A2E5A] animate-pulse" />,
  }
);

const CategorySeverityHeatmap = dynamic(
  () => import('./CategorySeverityHeatmap').then((mod) => mod.CategorySeverityHeatmap),
  {
    ssr: false,
    loading: () => <div className="h-64 rounded-xl bg-navy-900 border border-[#1A2E5A] animate-pulse" />,
  }
);

const FindingDetailDrawer = dynamic(
  () => import('../threats/FindingDetailDrawer').then((mod) => mod.FindingDetailDrawer),
  { ssr: false }
);

interface AnalyticsSectionProps {
  stats: DashboardStats | null;
  scans: Scan[];
  agents: Agent[];
  findings?: Finding[];
  onSelectAgentForScan?: (agent: Agent) => void;
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  stats,
  scans = [],
  agents = [],
  findings = [],
  onSelectAgentForScan,
  filters: externalFilters,
  onFilterChange,
}) => {
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    agentId: 'ALL',
    category: 'ALL',
    severity: 'ALL',
  });

  const filters = externalFilters || internalFilters;
  const updateFilters = (newFilters: FilterState) => {
    setInternalFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const [drawerFinding, setDrawerFinding] = useState<Finding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (filters.agentId !== 'ALL' && f.agent_id !== filters.agentId) return false;
      if (filters.category !== 'ALL' && f.category !== filters.category) return false;
      if (filters.severity !== 'ALL' && f.severity !== filters.severity) return false;
      return true;
    });
  }, [findings, filters]);

  const categoryData = useMemo(() => {
    if (findings.length > 0) {
      const counts: Record<string, number> = {
        'Prompt Injection': 0,
        'Data Leakage': 0,
        'Tool Abuse': 0,
        'Memory Poisoning': 0,
      };
      filteredFindings.forEach((f) => {
        if (f.category === 'prompt_injection') counts['Prompt Injection']++;
        if (f.category === 'data_leakage') counts['Data Leakage']++;
        if (f.category === 'tool_abuse') counts['Tool Abuse']++;
        if (f.category === 'memory_poisoning') counts['Memory Poisoning']++;
      });
      return Object.entries(counts).map(([category, count]) => ({ category, count }));
    }

    if (stats?.category_breakdown) {
      return [
        { category: 'Prompt Injection', count: stats.category_breakdown.prompt_injection },
        { category: 'Data Leakage', count: stats.category_breakdown.data_leakage },
        { category: 'Tool Abuse', count: stats.category_breakdown.tool_abuse },
        { category: 'Memory Poisoning', count: stats.category_breakdown.memory_poisoning },
      ];
    }
    return [];
  }, [findings, filteredFindings, stats]);

  const severityData = useMemo(() => {
    if (findings.length > 0) {
      const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
      filteredFindings.forEach((f) => {
        if (counts[f.severity] !== undefined) counts[f.severity]++;
      });
      return counts;
    }
    return stats?.severity_breakdown || {};
  }, [findings, filteredFindings, stats]);

  const timelineData = useMemo(() => {
    return scans.map((s, idx) => ({
      scan: `Scan #${idx + 1}`,
      scanId: s.id,
      date: new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: new Date(s.started_at).getTime(),
      findings: s.vulnerabilities_found || 0,
    }));
  }, [scans]);

  const handleSelectSeverity = (sev: SeverityLevel) => {
    if (filters.severity === sev) {
      updateFilters({ ...filters, severity: 'ALL' });
    } else {
      updateFilters({ ...filters, severity: sev });
    }
  };

  const handleSelectCategory = (cat: AttackCategory | string) => {
    if (filters.category === cat) {
      updateFilters({ ...filters, category: 'ALL' });
    } else {
      updateFilters({ ...filters, category: cat as AttackCategory });
    }
  };

  const handleHeatmapCellSelect = (category: AttackCategory, severity: SeverityLevel) => {
    updateFilters({ ...filters, category, severity });
    const resultsEl = document.getElementById('results');
    if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCellSelect = (agent: Agent, category: AttackCategory) => {
    const match = findings.find(
      (f) => f.agent_id === agent.id && f.category === category
    );
    if (match) {
      setDrawerFinding(match);
      setIsDrawerOpen(true);
    } else {
      updateFilters({ agentId: agent.id, category, severity: 'ALL' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Filters Bar */}
      <DashboardFilters
        agents={agents}
        filters={filters}
        onChange={updateFilters}
        onReset={() => updateFilters({ agentId: 'ALL', category: 'ALL', severity: 'ALL' })}
      />

      {/* Row 1: Split Charts (Donut + Attack Vector) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SeverityDonut
          data={severityData}
          onSelectSeverity={handleSelectSeverity}
          selectedSeverity={filters.severity !== 'ALL' ? filters.severity : null}
        />

        <AttackVectorChart
          data={categoryData}
          onSelectCategory={handleSelectCategory}
          selectedCategory={filters.category !== 'ALL' ? filters.category : null}
        />
      </div>

      {/* Row 2: Category vs Severity Heatmap */}
      <CategorySeverityHeatmap
        findings={findings}
        onSelectCell={handleHeatmapCellSelect}
        selectedCategory={filters.category !== 'ALL' ? (filters.category as AttackCategory) : null}
        selectedSeverity={filters.severity !== 'ALL' ? (filters.severity as SeverityLevel) : null}
      />

      {/* Row 3: Full-width Velocity Graph */}
      <VulnerabilityVelocityChart
        data={timelineData}
        onSelectScanPoint={(point) => {
          const matchedScan = scans.find((_, i) => `Scan #${i + 1}` === point.scan);
          if (matchedScan) {
            const resultsEl = document.getElementById('results');
            if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Row 4: Full-width Exposure Matrix */}
      <ExposureHeatmap
        agents={agents}
        findings={findings}
        onSelectAgent={(agent) => onSelectAgentForScan?.(agent)}
        onSelectCell={handleCellSelect}
      />

      {/* Slide-over Finding Detail Drawer */}
      <FindingDetailDrawer
        finding={drawerFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
