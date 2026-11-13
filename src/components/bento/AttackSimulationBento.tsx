'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { SIMULATION_CHARTS } from '../../data/chartData';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { AlertTriangle, ShieldCheck, Zap, Crosshair } from 'lucide-react';

interface AttackSimulationBentoProps {
  scenariosCount?: number;
  onScrollToDetails?: (targetId: string) => void;
}

export const AttackSimulationBento: React.FC<AttackSimulationBentoProps> = ({
  scenariosCount = 5,
  onScrollToDetails,
}) => {
  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - Red-Team Radar Chart
    {
      id: 'sim-radar-chart',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  Adversarial Jailbreak Resistance Radar
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#E6CBA8] uppercase tracking-wider">
                MULTI-VECTOR LAB
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Defense intercept percentage across 6 red-team attack vectors.
            </p>
          </div>

          <div
            className="w-full h-44 sm:h-52 my-auto"
            aria-label="Radar chart showing jailbreak intercept rates from 94% to 100%"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SIMULATION_CHARTS.radarCategories} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                <PolarAngleAxis dataKey="category" stroke="#8A8A8A" fontSize={9} />
                <PolarRadiusAxis domain={[80, 100]} stroke="#5C5C5C" fontSize={8} />
                <Radar
                  name="Blocked %"
                  dataKey="blocked"
                  stroke="#E6CBA8"
                  fill="#E6CBA8"
                  fillOpacity={0.35}
                  isAnimationActive={true}
                />
                <Tooltip content={({ active, payload }) => <ChartTooltip active={active} payload={payload} unit="%" />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <span className="text-[#BDBDBD]">Mean Intercept Rate: <strong className="text-white">98.7%</strong></span>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Launch simulation ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. KPI Card 1 (colSpan 1, rowSpan 1) - Defense Pass Rate
    {
      id: 'sim-kpi-pass-rate',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6FAF8A]" />
              Pass Rate
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              ▲ 1.3%
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={98.7} decimals={1} />
              <span className="text-xs text-[#8A8A8A] font-sans">%</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Benchmark score across standard attack corpora.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Pass trend</span>
            <Sparkline data={SIMULATION_CHARTS.historySparkline} color="#6FAF8A" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 3. KPI Card 2 (colSpan 1, rowSpan 1) - Zero-Day Tests
    {
      id: 'sim-kpi-scenarios',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Zero-Day Lab
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.12)] text-[#E6CBA8]">
              5/5 BLOCKED
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#E6CBA8] font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={scenariosCount} />
              <span className="text-xs text-[#8A8A8A] font-sans">Active Tests</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Live synthetic exploits available for sandbox testing.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Exploits</span>
            <Sparkline data={[4, 4, 5, 5, 5, 5, 5]} color="#E6CBA8" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - Scenario Comparison
    {
      id: 'sim-scenarios-bar',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-[#E6CBA8]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                Blocked vs. Bypassed by Scenario
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: 100% intercept efficacy on all 5 standard red-team scenarios.
            </p>
            <div className="mt-2 text-xs font-mono text-[#8A8A8A]">
              Tested: <strong className="text-white">RCE, SQL Drop, AWS STS, DNS Tunnel, PII</strong>
            </div>
          </div>

          <div className="w-36 h-24 flex-shrink-0" aria-label="Scenario defense bars">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={SIMULATION_CHARTS.scenariosComparison} margin={{ top: 2, right: 10, left: 10, bottom: 2 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#5C5C5C" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis dataKey="scenario" type="category" stroke="#BDBDBD" fontSize={8} axisLine={false} tickLine={false} width={65} tickFormatter={(v) => v.split(' ')[0]} />
                <Tooltip content={({ active, payload }) => <ChartTooltip active={active} payload={payload} unit="%" />} />
                <Bar dataKey="blocked" name="Blocked %" fill="#E6CBA8" radius={[0, 3, 3, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = () => {
    onScrollToDetails?.('attack-simulation');
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
