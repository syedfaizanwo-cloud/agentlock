'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ThreatDistributionChartProps {
  categories: {
    category: string;
    count: number;
    color: string;
  }[];
}

const GRAYSCALE_GOLD_RAMP = ['#E6CBA8', '#FFFFFF', '#BDBDBD', '#8A8A8A', '#5C5C5C', '#3D3D3D'];

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-2.5 shadow-2xl font-mono text-xs">
        <div className="font-bold text-white mb-1 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.fillColor }} />
          {data.category}
        </div>
        <div className="text-[#BDBDBD]">
          Incidents: <span className="text-[#E6CBA8] font-bold">{data.count}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ThreatDistributionChart: React.FC<ThreatDistributionChartProps> = ({ categories }) => {
  const total = categories.reduce((acc, c) => acc + c.count, 0);

  // Map colors to grayscale ramp + gold for highlighted top series
  const mappedCategories = categories.map((cat, idx) => ({
    ...cat,
    fillColor: GRAYSCALE_GOLD_RAMP[idx % GRAYSCALE_GOLD_RAMP.length],
  }));

  return (
    <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold text-white tracking-wide uppercase">
            Threat Taxonomy
          </h3>
          <span className="text-xs font-mono text-[#E6CBA8] bg-[rgba(230,203,168,0.14)] px-2 py-0.5 rounded border border-[#B89B72]">
            {total} Total
          </span>
        </div>
        <p className="text-xs text-[#8A8A8A] mt-0.5">Classification by adversarial vector</p>
      </div>

      <div className="h-44 sm:h-48 my-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomPieTooltip />} />
            <Pie
              data={mappedCategories}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={4}
              dataKey="count"
              nameKey="category"
            >
              {mappedCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fillColor} stroke="#0D0D0D" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-mono font-bold text-white">{total}</span>
          <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">Threats</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[#2A2A2A]">
        {mappedCategories.map((cat, idx) => {
          const percent = total > 0 ? Math.round((cat.count / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-[#BDBDBD]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.fillColor }} />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{cat.category}</span>
              </span>
              <span className="text-[#8A8A8A]">
                <strong className="text-white">{cat.count}</strong> ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
