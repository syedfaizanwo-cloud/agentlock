'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { THREAT_CHARTS } from '../../data/chartData';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ShieldAlert, Crosshair, CheckCircle2, Flame } from 'lucide-react';

interface ThreatForensicsBentoProps {
  blockedThreatsCount?: number;
  criticalCount?: number;
  onScrollToDetails?: (targetId: string) => void;
}

export const ThreatForensicsBento: React.FC<ThreatForensicsBentoProps> = ({
  blockedThreatsCount = 183,
  criticalCount = 48,
  onScrollToDetails,
}) => {
  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - MITRE Technique Heatmap
    {
      id: 'threat-mitre-heatmap',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  MITRE ATLAS Technique Heatmap
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#E6CBA8] uppercase tracking-wider">
                TACTIC CLASSIFICATION
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Attack vector distribution mapped to adversarial tactics with cell intensity shading.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-auto py-2" aria-label="MITRE technique heatmap tiles">
            {THREAT_CHARTS.mitreTactics.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border-none transition-all flex flex-col justify-between"
                style={{
                  backgroundColor:
                    item.intensity > 0.8
                      ? 'rgba(230, 203, 168, 0.22)'
                      : item.intensity > 0.5
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="text-[11px] font-mono font-bold text-white truncate">
                  {item.tactic}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-mono font-bold text-[#E6CBA8]">
                    {item.count} incidents
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: item.intensity > 0.8 ? '#E6CBA8' : '#BDBDBD',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <span>Primary Attack: <strong className="text-white">Prompt Injection (T1059)</strong></span>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Inspect forensics ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. KPI Card 1 (colSpan 1, rowSpan 1) - Critical Threats
    {
      id: 'threat-kpi-critical',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#C0504D]" />
              Critical Tier
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(192,80,77,0.15)] text-[#C0504D]">
              100% NEUTRALIZED
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#C0504D] font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={criticalCount} />
              <span className="text-xs text-[#8A8A8A] font-sans">Blocked</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: High-severity RCE and trojan injection payloads neutralized.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">7-day Critical</span>
            <Sparkline data={[6, 8, 5, 9, 11, 4, 5]} color="#C0504D" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 3. KPI Card 2 (colSpan 1, rowSpan 1) - Mitigation Coverage
    {
      id: 'threat-kpi-mitigation',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6FAF8A]" />
              Mitigation Rate
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              ZERO BYPASS
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={99.4} decimals={1} />
              <span className="text-xs text-[#8A8A8A] font-sans">%</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Automated heuristic intercept and payload filtering efficacy.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Confidence</span>
            <Sparkline data={[98.8, 99.0, 99.1, 99.2, 99.4, 99.4, 99.4]} color="#6FAF8A" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - Severity Breakdown Donut
    {
      id: 'threat-severity-donut',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Crosshair className="w-4 h-4 text-[#E6CBA8]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                Threat Severity Distribution
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: {blockedThreatsCount} quarantined events grouped by risk impact.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#E6CBA8]">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                Critical: 48 (26.2%)
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2 h-2 rounded-full bg-white" />
                High: 74 (40.4%)
              </span>
              <span className="flex items-center gap-1.5 text-[#BDBDBD]">
                <span className="w-2 h-2 rounded-full bg-[#BDBDBD]" />
                Medium: 42 (23.0%)
              </span>
              <span className="flex items-center gap-1.5 text-[#5C5C5C]">
                <span className="w-2 h-2 rounded-full bg-[#5C5C5C]" />
                Low: 19 (10.4%)
              </span>
            </div>
          </div>

          <div className="w-28 h-28 flex-shrink-0" aria-label="Severity donut chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={THREAT_CHARTS.severityBreakdown}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={46}
                  stroke="none"
                  isAnimationActive={true}
                >
                  {THREAT_CHARTS.severityBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltip active={active} payload={payload} unit="threats" />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = () => {
    onScrollToDetails?.('threat-forensics');
  };

  return (
    <div className="w-full my-4">
      <MagicBento
        items={items}
        columns={4}
        rowHeight={200}
        gap={16}
        radius={20}
        theme="dark"
        glowColor="#E6CBA8"
        enableBorderGlow={false}
        enableSpotlight={true}
        spotlightRadius={300}
        enableStars={false}
        enableTilt={false}
        enableMagnetism={false}
        clickEffect={true}
        textAutoHide={false}
        intro={true}
        onItemClick={handleItemClick}
      />
    </div>
  );
};
