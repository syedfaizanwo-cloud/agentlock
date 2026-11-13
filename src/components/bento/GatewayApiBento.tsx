'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { GATEWAY_CHARTS } from '../../data/chartData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Server, Activity, CheckCircle, Wifi } from 'lucide-react';

interface GatewayApiBentoProps {
  isConnected?: boolean;
  baseUrl?: string;
  onScrollToDetails?: (targetId: string) => void;
}

export const GatewayApiBento: React.FC<GatewayApiBentoProps> = ({
  isConnected = false,
  baseUrl = 'http://localhost:8000',
  onScrollToDetails,
}) => {
  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - Latency Percentiles Line Chart (p50 / p95)
    {
      id: 'gateway-latency-chart',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  Gateway Latency Percentiles (p50 / p95)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#E6CBA8] uppercase tracking-wider">
                LOW-LATENCY PROXY
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Round-trip evaluation duration across time in milliseconds.
            </p>
          </div>

          <div
            className="w-full h-44 sm:h-52 my-auto"
            aria-label="Line chart of p50 and p95 latency over 24 hours"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={GATEWAY_CHARTS.latencyTimeline} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#5C5C5C" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C5C5C" fontSize={10} tickLine={false} axisLine={false} unit="ms" />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={`Time ${label}`} unit="ms" />} />
                <Line
                  type="monotone"
                  dataKey="p50"
                  name="Median (p50)"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#FFFFFF' }}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  name="Peak (p95)"
                  stroke="#E6CBA8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#E6CBA8' }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-white" />
                <span className="text-[#BDBDBD]">p50: 14ms</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#E6CBA8]" />
                <span className="text-[#E6CBA8]">p95: 42ms</span>
              </span>
            </div>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Inspect endpoints ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. KPI Card 1 (colSpan 1, rowSpan 1) - 30-Day Uptime Strip
    {
      id: 'gateway-kpi-uptime',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#6FAF8A]" />
              30-Day Uptime
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              99.99%
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={99.99} decimals={2} />
              <span className="text-xs text-[#8A8A8A] font-sans">% SLA</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: High-availability gateway ingress uptime over 30 days.
            </p>
          </div>

          {/* 30-day mini uptime bar strip */}
          <div className="flex items-center gap-[2px] pt-1" title="30-day uptime strip: 100% operational">
            {GATEWAY_CHARTS.uptimeDays.map((d) => (
              <span
                key={d.day}
                className="flex-1 h-3 rounded-[1px]"
                style={{
                  backgroundColor: d.uptime === 100 ? '#6FAF8A' : '#E6CBA8',
                }}
              />
            ))}
          </div>
        </div>
      ),
    },

    // 3. KPI Card 2 (colSpan 1, rowSpan 1) - Requests per Second
    {
      id: 'gateway-kpi-rps',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Ingress RPS
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8]">
              HEALTHY
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#E6CBA8] font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={45} />
              <span className="text-xs text-[#8A8A8A] font-sans">avg RPS</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Peak 124 RPS handled during morning burst cycles.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Peak 124 rps</span>
            <Sparkline data={[18, 28, 52, 84, 112, 124, 96]} color="#E6CBA8" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - HTTP Status Codes & Active Endpoints
    {
      id: 'gateway-http-codes',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-4 h-4 text-[#E6CBA8]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                HTTP Code Distribution & Endpoints
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: 96.4% 200 OK pass-through, 2.8% policy blocks, 0.8% error.
            </p>
            <div className="mt-2.5 flex items-center gap-3 text-xs font-mono">
              <span className="text-white">200 OK: 96.4%</span>
              <span className="text-[#E6CBA8]">403 Block: 2.8%</span>
              <span className="text-[#8A8A8A]">422: 0.6%</span>
            </div>
          </div>

          {/* Micro endpoint indicators */}
          <div className="space-y-1.5 flex-shrink-0 text-[11px] font-mono">
            {GATEWAY_CHARTS.endpoints.map((ep, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6FAF8A]" />
                <span className="text-white">{ep.path.split('/')[2]}:</span>
                <span className="text-[#8A8A8A]">{ep.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = () => {
    onScrollToDetails?.('gateway-api');
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
