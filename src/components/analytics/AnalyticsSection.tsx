'use client';

import React, { useState, useMemo } from 'react';
import { SeverityDonut } from '../dashboard/SeverityDonut';
import { AttackVectorChart } from '../dashboard/AttackVectorChart';
import { VulnerabilityVelocityChart } from '../dashboard/VulnerabilityVelocityChart';
import { ExposureHeatmap } from './ExposureHeatmap';
import { DashboardFilters, FilterState } from './DashboardFilters';
import { FindingDetailDrawer } from '../threats/FindingDetailDrawer';
import { LazyViewport } from '../layout/LazyViewport';
import { DashboardStats, Scan, Agent, Finding, SeverityLevel, AttackCategory } from '../../types/api';

interface AnalyticsSectionProps {
  stats: DashboardStats | null;
  scans: Scan[];
  agents: Agent[];
  findings?: Finding[];
  onSelectAgentForScan?: (agent: Agent) => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  stats,
  scans = [],
  agents = [],
  findings = [],
  onSelectAgentForScan,
}) => {
  // Global filter state for analytics exploration
  const [filters, setFilters] = useState<FilterState>({
    agentId: 'ALL',
    category: 'ALL',
    severity: 'ALL',
  });

  // Drawer state for interactive deep dive
  const [drawerFinding, setDrawerFinding] = useState<Finding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filtered findings dataset
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      if (filters.agentId !== 'ALL' && f.agent_id !== filters.agentId) return false;
      if (filters.category !== 'ALL' && f.category !== filters.category) return false;
      if (filters.severity !== 'ALL' && f.severity !== filters.severity) return false;
      return true;
    });
  }, [findings, filters]);

  // Compute dynamic category breakdown based on filtered findings or stats
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

  // Compute dynamic severity breakdown based on filtered findings or stats
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

  // Format Timeline points
  const timelineData = useMemo(() => {
    return scans.map((s, idx) => ({
      scan: `Scan #${idx + 1}`,
      findings: s.vulnerabilities_found || 0,
      critical: Math.min(s.vulnerabilities_found || 0, 1),
    }));
  }, [scans]);

  const handleSelectSeverity = (sev: SeverityLevel) => {
    if (filters.severity === sev) {
      setFilters((prev) => ({ ...prev, severity: 'ALL' }));
    } else {
      setFilters((prev) => ({ ...prev, severity: sev }));
      // Open the first matching finding in the drawer if available
      const matching = findings.find((f) => f.severity === sev);
      if (matching) {
        setDrawerFinding(matching);
        setIsDrawerOpen(true);
      }
    }
  };

  const handleSelectCategory = (cat: AttackCategory | string) => {
    if (filters.category === cat) {
      setFilters((prev) => ({ ...prev, category: 'ALL' }));
    } else {
      setFilters((prev) => ({ ...prev, category: cat as AttackCategory }));
      // Open first matching finding in the drawer
      const matching = findings.find((f) => f.category === cat);
      if (matching) {
        setDrawerFinding(matching);
        setIsDrawerOpen(true);
      }
    }
  };

  const handleSelectHeatmapCell = (agent: Agent, category: AttackCategory) => {
    const matching = findings.find(
      (f) => f.agent_id === agent.id && f.category === category
    );
    if (matching) {
      setDrawerFinding(matching);
      setIsDrawerOpen(true);
    } else {
      // Set filter to inspect
      setFilters((prev) => ({
        ...prev,
        agentId: agent.id,
        category,
      }));
    }
  };

  const handleResetFilters = () => {
    setFilters({
      agentId: 'ALL',
      category: 'ALL',
      severity: 'ALL',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Intelligence Filter Toolbar */}
      <DashboardFilters
        agents={agents}
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* 2. Primary 2-Column Visualizations: Severity Donut + Attack Vector Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LazyViewport minHeight={340}>
          <SeverityDonut
            data={severityData}
            onSelectSeverity={handleSelectSeverity}
            selectedSeverity={filters.severity !== 'ALL' ? filters.severity : null}
          />
        </LazyViewport>

        <LazyViewport minHeight={340}>
          <AttackVectorChart
            data={categoryData}
            onSelectCategory={handleSelectCategory}
            selectedCategory={filters.category !== 'ALL' ? filters.category : null}
          />
        </LazyViewport>
      </div>

      {/* 3. Vulnerability Velocity Timeline */}
      <LazyViewport minHeight={340}>
        <VulnerabilityVelocityChart
          data={timelineData}
          onSelectScanPoint={(pt) => {
            // Find finding from that scan if possible
            const f = findings[0];
            if (f) {
              setDrawerFinding(f);
              setIsDrawerOpen(true);
            }
          }}
        />
      </LazyViewport>

      {/* 4. Agent Adversarial Exposure Matrix */}
      <LazyViewport minHeight={360}>
        <ExposureHeatmap
          agents={agents}
          findings={findings}
          onSelectAgent={(agent) => {
            setFilters((prev) => ({ ...prev, agentId: agent.id }));
            onSelectAgentForScan?.(agent);
          }}
          onSelectCell={handleSelectHeatmapCell}
        />
      </LazyViewport>

      {/* 5. Slide-over Finding Detail Drawer */}
      <FindingDetailDrawer
        finding={drawerFinding}
        agentName={agents.find((a) => a.id === drawerFinding?.agent_id)?.name}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
