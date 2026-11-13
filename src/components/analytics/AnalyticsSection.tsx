'use client';

import React from 'react';
import { ThreatDistributionChart } from '../dashboard/ThreatDistributionChart';
import { AgentRiskBarChart } from '../dashboard/AgentRiskBarChart';
import { ThreatTimelineChart } from '../dashboard/ThreatTimelineChart';
import { LazyViewport } from '../layout/LazyViewport';
import { DashboardStats, Scan, Agent } from '../../types/api';
import { ShieldAlert } from 'lucide-react';

interface AnalyticsSectionProps {
  stats: DashboardStats | null;
  scans: Scan[];
  agents: Agent[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  stats,
  scans = [],
  agents = [],
}) => {
  // Format Category Bar items
  const categoryData = stats?.category_breakdown
    ? [
        { category: 'Prompt Injection', count: stats.category_breakdown.prompt_injection },
        { category: 'Data Leakage', count: stats.category_breakdown.data_leakage },
        { category: 'Tool Abuse', count: stats.category_breakdown.tool_abuse },
        { category: 'Memory Poisoning', count: stats.category_breakdown.memory_poisoning },
      ]
    : [];

  // Format Timeline points
  const timelineData = scans.map((s, idx) => ({
    scan: `Scan #${idx + 1}`,
    findings: s.vulnerabilities_found || 0,
    critical: Math.min(s.vulnerabilities_found || 0, 1),
  }));

  const hasData = (stats?.total_scans || 0) > 0 || scans.length > 0;

  return (
    <div className="space-y-8">
      {/* 2-Column Grid: Severity Donut + Category Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LazyViewport minHeight={320}>
          <ThreatDistributionChart data={stats?.severity_breakdown} />
        </LazyViewport>

        <LazyViewport minHeight={320}>
          <AgentRiskBarChart data={categoryData} />
        </LazyViewport>
      </div>

      {/* Full-width Timeline Velocity Chart */}
      <LazyViewport minHeight={340}>
        <ThreatTimelineChart data={timelineData} />
      </LazyViewport>

      {/* Agent by Category Heatmap */}
      <div className="p-6 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
          <div>
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] uppercase tracking-wide">
              Agent Adversarial Exposure Heatmap
            </h3>
            <p className="text-xs text-[#C8C0AC] mt-0.5 font-sans">
              Confirmed vulnerability matrix mapped across tested agent inventory
            </p>
          </div>
          <span className="text-xs font-mono text-[#C8C0AC] px-2.5 py-0.5 rounded bg-[#060D1F] border border-[#12234A]">
            {agents.length} Targets
          </span>
        </div>

        {agents.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#C8C0AC]/70">
            No agent targets evaluated yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#12234A] bg-[#060D1F]">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#0A1633] text-[#C8C0AC] border-b border-[#12234A]">
                <tr>
                  <th className="py-3 px-4">Target Agent</th>
                  <th className="py-3 px-4 text-center">Prompt Injection</th>
                  <th className="py-3 px-4 text-center">Data Leakage</th>
                  <th className="py-3 px-4 text-center">Tool Abuse</th>
                  <th className="py-3 px-4 text-center">Memory Poisoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#12234A] text-[#F5EDDC]">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-[#12234A]/30">
                    <td className="py-3 px-4 font-bold">{agent.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded bg-[#FF6F59]/15 text-[#FF6F59] font-bold">
                        {hasData ? 1 : 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded bg-[#E11D48]/15 text-[#E11D48] font-bold">
                        {hasData ? 1 : 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded bg-[#F59E0B]/15 text-[#F59E0B] font-bold">
                        {hasData ? 1 : 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded bg-[#34D399]/15 text-[#34D399] font-bold">
                        0
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
