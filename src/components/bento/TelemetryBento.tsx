'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { TELEMETRY_CHARTS, CHART_PALETTE } from '../../data/chartData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Activity, ShieldAlert, Zap, TrendingUp } from 'lucide-react';

interface TelemetryBentoProps {
  totalActions?: number;
  blockedThreats?: number;
  onScrollToDetails?: (targetId: string) => void;
}

export const TelemetryBento: React.FC<TelemetryBentoProps> = ({
  totalActions = 13196,
  blockedThreats = 183,
  onScrollToDetails,
}) => {
  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - 24h Hourly Volume & Threats
    {
      id: 'telemetry-hourly-volume',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  24-Hour Operations & Intercept Volume
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-wider">
                PEAK 11:00 UTC
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Hourly fleet transactions and policy intercepts across all runtime nodes.
            </p>
          </div>

          <div
            className="w-full h-44 sm:h-52 my-auto"
            aria-label="Hourly operations bar chart showing peaks between 09:00 and 12:00 with up to 3,120 operations"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={TELEMETRY_CHARTS.hourlyVolume}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="hour"
                  stroke="#5C5C5C"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#5C5C5C"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      payload={payload}
                      label={`Hour ${label}`}
                      unit="ops"
                    />
                  )}
                />
                <Bar
                  dataKey="ops"
                  name="Total Operations"
                  fill="#FFFFFF"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="blocked"
                  name="Threats Blocked"
                  fill="#E6CBA8"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-white" />
                <span className="text-[#BDBDBD]">Total Ops</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#E6CBA8]" />
                <span className="text-[#E6CBA8]">Blocked Threats</span>
              </span>
            </div>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Inspect timeline ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. Small KPI Card 1 (colSpan 1, rowSpan 1) - Total Operations
    {
      id: 'telemetry-kpi-total-ops',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Total Operations
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              ▲ 14.8%
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              <CountUp value={totalActions} />
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Autonomous agent calls verified in last 24h.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">7-day trend</span>
            <Sparkline data={TELEMETRY_CHARTS.sparklines.totalOps} color="#E6CBA8" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 3. Small KPI Card 2 (colSpan 1, rowSpan 1) - Threats Blocked
    {
      id: 'telemetry-kpi-threats',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Threats Blocked
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8]">
              48 Crit
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#E6CBA8] font-mono tracking-tight">
              <CountUp value={blockedThreats} />
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Malicious injections and unauthorized RCE attempts isolated.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Velocity</span>
            <Sparkline data={TELEMETRY_CHARTS.sparklines.blockedThreats} color="#E6CBA8" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - Blocked vs Allowed Ratio Ring & Vectors
    {
      id: 'telemetry-ratio-ring',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#6FAF8A]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                Blocked vs. Allowed Ratio
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: 98.6% of operations executed cleanly; 1.4% intercepted deterministically.
            </p>
            <div className="mt-2.5 flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#BDBDBD]">
                <span className="w-2 h-2 rounded-full bg-white" />
                Allowed: 13.0k (98.6%)
              </span>
              <span className="flex items-center gap-1.5 text-[#E6CBA8]">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                Blocked: {blockedThreats} (1.4%)
              </span>
            </div>
          </div>

          <div className="w-28 h-28 flex-shrink-0" aria-label="Donut ratio chart of allowed versus blocked operations">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TELEMETRY_CHARTS.ratioRing}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={46}
                  stroke="none"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  <Cell fill="#FFFFFF" />
                  <Cell fill="#E6CBA8" />
                </Pie>
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltip active={active} payload={payload} unit="ops" />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = (item: any) => {
    onScrollToDetails?.('telemetry');
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
