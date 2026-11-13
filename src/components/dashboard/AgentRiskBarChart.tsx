'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AgentStatus } from '../../types/api';

interface AgentRiskBarChartProps {
  data: {
    agent_name: string;
    risk_score: number;
    threats_blocked: number;
    status: AgentStatus;
  }[];
  onSelectAgentName?: (name: string) => void;
}

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-3 shadow-2xl font-mono text-xs">
        <div className="font-bold text-white mb-1">{item.agent_name}</div>
        <div className="text-[#BDBDBD]">
          Risk Index:{' '}
          <span className={item.risk_score >= 80 ? 'text-[#C0504D] font-bold' : 'text-[#E6CBA8] font-bold'}>
            {item.risk_score}/100
          </span>
        </div>
        <div className="text-[#8A8A8A]">
          Blocked Threats: <span className="text-white font-bold">{item.threats_blocked}</span>
        </div>
        <div className="text-[#8A8A8A] text-[10px] uppercase mt-1">
          Status: {item.status}
        </div>
      </div>
    );
  }
  return null;
};

export const AgentRiskBarChart: React.FC<AgentRiskBarChartProps> = ({ data, onSelectAgentName }) => {
  return (
    <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
            Agent Risk Profiling
          </h3>
          <p className="text-xs text-[#8A8A8A]">Heuristic score by agent instance</p>
        </div>
      </div>

      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.6} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} stroke="#5C5C5C" tick={{ fill: '#8A8A8A', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="agent_name"
              stroke="#5C5C5C"
              tick={{ fill: '#BDBDBD', fontSize: 11, width: 120 }}
              width={140}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="risk_score" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => {
                let color = '#5C5C5C';
                if (entry.risk_score >= 80) color = '#C0504D'; // Semantic critical error
                else if (entry.risk_score >= 50) color = '#E6CBA8'; // Champagne Gold highlight
                else if (entry.risk_score >= 25) color = '#BDBDBD'; // Silver grey
                return <Cell key={`bar-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
