'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ThreatTimelineChartProps {
  data: {
    time: string;
    total: number;
    blocked: number;
    escalated: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-3 shadow-2xl font-mono text-xs">
        <div className="text-[#E6CBA8] font-bold mb-1.5 pb-1 border-b border-[#2A2A2A]">
          Timestamp: {label}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-[#BDBDBD]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E6CBA8]"></span> Total Operations:
            </span>
            <span className="font-bold text-white">{payload[0]?.value}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#BDBDBD]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C0504D]"></span> Threats Blocked:
            </span>
            <span className="font-bold text-[#C0504D]">{payload[1]?.value}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#8A8A8A]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8A8A8A]"></span> HITL Escalated:
            </span>
            <span className="font-bold text-white">{payload[2]?.value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ThreatTimelineChart: React.FC<ThreatTimelineChartProps> = ({ data }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
            Runtime Telemetry & Interception Velocity
          </h3>
          <p className="text-xs text-[#8A8A8A]">Total operations vs blocked attacks across 24h window</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6CBA8]"></span>
            <span className="text-[#BDBDBD]">Actions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C0504D]"></span>
            <span className="text-[#C0504D]">Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8A8A8A]"></span>
            <span className="text-[#8A8A8A]">Escalated</span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E6CBA8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E6CBA8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C0504D" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C0504D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEscalated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8A8A8A" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8A8A8A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.6} />
            <XAxis dataKey="time" stroke="#5C5C5C" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <YAxis stroke="#5C5C5C" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#E6CBA8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            <Area
              type="monotone"
              dataKey="blocked"
              stroke="#C0504D"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBlocked)"
            />
            <Area
              type="monotone"
              dataKey="escalated"
              stroke="#8A8A8A"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorEscalated)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
