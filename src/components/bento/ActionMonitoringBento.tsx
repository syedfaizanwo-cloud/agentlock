'use client';

import React, { useState, useEffect, useRef } from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { ACTION_CHARTS } from '../../data/chartData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Sliders, Cpu, Clock, Terminal } from 'lucide-react';

interface ActionMonitoringBentoProps {
  totalActionsCount?: number;
  onScrollToDetails?: (targetId: string) => void;
}

export const ActionMonitoringBento: React.FC<ActionMonitoringBentoProps> = ({
  totalActionsCount = 8,
  onScrollToDetails,
}) => {
  // Live ticking timeline state (drifts gently every 3s only when visible and active)
  const [timeline, setTimeline] = useState(ACTION_CHARTS.baseTimeline);
  const [currentRps, setCurrentRps] = useState(240);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisibleRef.current = e.isIntersecting;
        });
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    const interval = setInterval(() => {
      // Pause if tab hidden or element not visible
      if (document.hidden || !isVisibleRef.current) return;

      setTimeline((prev) => {
        const last = prev[prev.length - 1];
        const drift = Math.floor((Math.random() - 0.48) * 12);
        const newRate = Math.max(160, Math.min(360, last.rate + drift));
        setCurrentRps(newRate);
        return [...prev.slice(1), { ...last, time: 'Now', rate: newRate }];
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - Live Actions per Minute Area Chart
    {
      id: 'action-live-area-chart',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8] animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  Live Action Throughput Stream
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.12)] text-[#E6CBA8] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6FAF8A]" />
                LIVE 3S TICK
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Real-time agent action throughput evaluated per minute across the zero-trust runtime.
            </p>
          </div>

          <div
            className="w-full h-44 sm:h-52 my-auto"
            aria-label="Area chart showing live actions throughput per minute hovering around 240 operations"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="action-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E6CBA8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E6CBA8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#5C5C5C" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C5C5C" fontSize={10} tickLine={false} axisLine={false} domain={[100, 400]} />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip active={active} payload={payload} label={label} unit="ops/min" />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Operations / min"
                  stroke="#E6CBA8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#action-area-grad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <span className="text-[#BDBDBD]">Current Velocity: <strong className="text-white font-mono">{currentRps} ops/min</strong></span>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Inspect live table ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. KPI Card 1 (colSpan 1, rowSpan 1) - Event Rate
    {
      id: 'action-kpi-rate',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Event Stream
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              ▲ 8.4%
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={currentRps} />
              <span className="text-xs text-[#8A8A8A] font-sans">/ min</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Live streaming intercept capacity and decision velocity.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Velocity</span>
            <Sparkline data={ACTION_CHARTS.sparklines.throughput} color="#E6CBA8" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 3. KPI Card 2 (colSpan 1, rowSpan 1) - Decision Latency
    {
      id: 'action-kpi-latency',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Decision Latency
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              ▼ 2.1ms
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#E6CBA8] font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={16.4} decimals={1} />
              <span className="text-xs text-[#8A8A8A] font-sans">ms p95</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Ultra-low policy evaluation overhead per tool call.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">P95 jitter</span>
            <Sparkline data={ACTION_CHARTS.sparklines.p95Latency} color="#6FAF8A" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - Top 5 Tools Called
    {
      id: 'action-top-tools',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-4 h-4 text-[#E6CBA8]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                Top 5 Autonomous Tools Called
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Most frequently invoked agent tool interfaces and database adapters.
            </p>
            <div className="mt-2 text-xs font-mono text-[#8A8A8A]">
              Leading: <strong className="text-white">sql_read (41.0%)</strong> • bash_sandboxed (29.1%)
            </div>
          </div>

          <div className="w-40 h-24 flex-shrink-0" aria-label="Horizontal bar chart of top tools called">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={ACTION_CHARTS.topTools} margin={{ top: 2, right: 10, left: 10, bottom: 2 }}>
                <XAxis type="number" stroke="#5C5C5C" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis dataKey="tool" type="category" stroke="#BDBDBD" fontSize={9} axisLine={false} tickLine={false} width={80} tickFormatter={(v) => v.split(' ')[0]} />
                <Tooltip content={({ active, payload }) => <ChartTooltip active={active} payload={payload} unit="calls" />} />
                <Bar dataKey="calls" name="Calls" fill="#FFFFFF" radius={[0, 3, 3, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = () => {
    onScrollToDetails?.('action-monitoring');
  };

  return (
    <div ref={containerRef} className="w-full my-4">
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
