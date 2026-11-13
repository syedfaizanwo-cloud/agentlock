'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { FLEET_CHARTS } from '../../data/chartData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Bot, ShieldCheck, AlertOctagon, Key } from 'lucide-react';

interface FleetGovernanceBentoProps {
  totalAgents?: number;
  activeAgents?: number;
  quarantinedAgents?: number;
  avgRisk?: number;
  onScrollToDetails?: (targetId: string) => void;
}

export const FleetGovernanceBento: React.FC<FleetGovernanceBentoProps> = ({
  totalAgents = 6,
  activeAgents = 3,
  quarantinedAgents = 1,
  avgRisk = 18.4,
  onScrollToDetails,
}) => {
  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - Per-Agent Risk Horizontal Bar Chart
    {
      id: 'fleet-agent-risk-scores',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  Per-Agent Risk Scores & Access Tiers
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#E6CBA8] uppercase tracking-wider">
                SORTED HIGH → LOW
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Autonomous agents ranked by heuristic risk score (0-100 scale).
            </p>
          </div>

          <div
            className="w-full h-44 sm:h-52 my-auto"
            aria-label="Horizontal bar chart of agent risk scores with Web-Research-Crawler highest at 92"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={FLEET_CHARTS.agentRiskScores}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} stroke="#5C5C5C" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#BDBDBD"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 13)}…` : val)}
                />
                <Tooltip
                  content={({ active, payload }) => (
                    <ChartTooltip active={active} payload={payload} unit="/ 100" />
                  )}
                />
                <Bar
                  dataKey="score"
                  name="Risk Score"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={true}
                  animationDuration={1100}
                >
                  {FLEET_CHARTS.agentRiskScores.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.score > 80
                          ? '#C0504D'
                          : entry.score > 50
                          ? '#E6CBA8'
                          : entry.score > 20
                          ? '#BDBDBD'
                          : '#FFFFFF'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#C0504D]" />
                <span>Critical (&gt;80)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#E6CBA8]" />
                <span>Elevated (50-80)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-white" />
                <span>Safe (&lt;25)</span>
              </span>
            </div>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Manage fleet ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. KPI Card 1 (colSpan 1, rowSpan 1) - Active Agents
    {
      id: 'fleet-kpi-active',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Active Fleet
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              50% ACTIVE
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={activeAgents} />
              <span className="text-sm text-[#8A8A8A]">/ {totalAgents}</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Autonomous agent instances authorized for runtime execution.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Node status</span>
            <Sparkline data={[2, 3, 3, 4, 3, 3, activeAgents]} color="#6FAF8A" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 3. KPI Card 2 (colSpan 1, rowSpan 1) - Quarantined Node
    {
      id: 'fleet-kpi-quarantined',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-[#C0504D]" />
              Quarantined
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(192,80,77,0.15)] text-[#C0504D]">
              NEEDS REVIEW
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#C0504D] font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={quarantinedAgents} />
              <span className="text-sm text-[#8A8A8A]">Node</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Isolated crawler agent with revoked tool tokens.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Zero-Trust Hold</span>
            <Sparkline data={[0, 0, 1, 1, 1, 1, quarantinedAgents]} color="#C0504D" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - Privilege Tiers & Risk Gauge
    {
      id: 'fleet-privilege-tiers',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-[#E6CBA8]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                Privilege Tiers & Mean Fleet Risk
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Access authorization boundary distribution across L1-L4 tiers.
            </p>
            <div className="mt-2.5 flex items-center gap-3 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-[rgba(230,203,168,0.12)] text-[#E6CBA8] font-bold">
                MEAN RISK: {avgRisk} / 100
              </span>
              <span className="text-[#8A8A8A]">L1: 2 | L2: 2 | L3: 1 | L4: 1</span>
            </div>
          </div>

          <div className="w-36 h-24 flex-shrink-0" aria-label="Privilege tiers bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FLEET_CHARTS.privilegeTiers} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="tier" stroke="#5C5C5C" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C5C5C" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip active={active} payload={payload} label={label} unit="agents" />
                  )}
                />
                <Bar dataKey="count" name="Agents" fill="#E6CBA8" radius={[3, 3, 0, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = () => {
    onScrollToDetails?.('fleet-governance');
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
