'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { DashboardFilters, FilterState } from './DashboardFilters';
import { DashboardStats, Scan, Agent, Finding, SeverityLevel, AttackCategory, ALL_ATTACK_CATEGORIES, ATTACK_CATEGORY_LABELS } from '../../types/api';

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

  const agentScanIds = useMemo(() => {
    if (filters.agentId === 'ALL') return null;
    const targetId = Number(filters.agentId);
    return new Set(scans.filter((s) => s.agent_id === targetId).map((s) => s.id));
  }, [scans, filters.agentId]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (agentScanIds && !agentScanIds.has(f.scan_id)) return false;
      if (filters.category !== 'ALL' && f.category !== filters.category) return false;
      if (filters.severity !== 'ALL' && f.severity.toLowerCase() !== filters.severity.toLowerCase()) return false;
      return true;
    });
  }, [findings, filters, agentScanIds]);

  const categoryData = useMemo(() => {
    if (findings.length > 0) {
      const counts: Record<string, number> = {};
      ALL_ATTACK_CATEGORIES.forEach((cat) => {
        counts[cat] = 0;
      });
      filteredFindings.forEach((f) => {
        if (counts[f.category] !== undefined) counts[f.category]++;
      });
      return ALL_ATTACK_CATEGORIES.map((cat) => ({
        category: ATTACK_CATEGORY_LABELS[cat] || cat,
        count: counts[cat] || 0,
      }));
    }

    if (stats?.results?.by_category) {
      return ALL_ATTACK_CATEGORIES.map((cat) => ({
        category: ATTACK_CATEGORY_LABELS[cat] || cat,
        count: stats.results.by_category[cat] || 0,
      }));
    }
    return [];
  }, [findings, filteredFindings, stats]);

  const severityData = useMemo(() => {
    const counts: Record<SeverityLevel, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    if (findings.length > 0) {
      filteredFindings.forEach((f) => {
        const sev = f.severity.toLowerCase() as SeverityLevel;
        if (counts[sev] !== undefined) counts[sev]++;
      });
      return counts;
    }
    if (stats?.results?.by_severity) {
      (Object.keys(counts) as SeverityLevel[]).forEach((sev) => {
        counts[sev] = stats.results.by_severity[sev] || 0;
      });
      return counts;
    }
    return counts;
  }, [findings, filteredFindings, stats]);

  const timelineData = useMemo(() => {
    return scans.map((s, idx) => {
      const scanFindings = findings.filter((f) => f.scan_id === s.id);
      return {
        scan: `Scan #${idx + 1}`,
        scanId: String(s.id),
        date: new Date(s.started_at || s.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        timestamp: new Date(s.started_at || s.created_at).getTime(),
        findings: scanFindings.length,
      };
    });
  }, [scans, findings]);

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
    const aScanIds = new Set(scans.filter((s) => s.agent_id === agent.id).map((s) => s.id));
    const match = findings.find(
      (f) => aScanIds.has(f.scan_id) && f.category === category
    );
    if (match) {
      setDrawerFinding(match);
      setIsDrawerOpen(true);
    } else {
      updateFilters({ agentId: String(agent.id), category, severity: 'ALL' });
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
