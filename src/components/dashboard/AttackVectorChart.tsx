'use client';

import React, { useState } from 'react';
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
import { Table, BarChart3, ShieldAlert, ArrowRight } from 'lucide-react';
import { AttackCategory } from '../../types/api';

interface CategoryBarItem {
  id?: AttackCategory;
  category: string;
  count: number;
}

interface AttackVectorChartProps {
  data?: CategoryBarItem[];
  onSelectCategory?: (category: AttackCategory | string) => void;
  selectedCategory?: string | null;
}

const CATEGORY_MAP: Record<string, AttackCategory> = {
  'Prompt Injection': 'prompt_injection',
  'Data Leakage': 'data_leakage',
  'Tool Abuse': 'tool_abuse',
  'Memory Poisoning': 'memory_poisoning',
};

export const AttackVectorChart: React.FC<AttackVectorChartProps> = ({
  data = [],
  onSelectCategory,
  selectedCategory,
}) => {
  const [showTable, setShowTable] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between min-h-[340px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Findings by Attack Vector
            </h3>
            <span className="text-xs font-mono text-[#C8C0AC] px-2.5 py-0.5 rounded-full bg-[#060D1F]/60 border border-white/10">
              0 Findings
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-1 font-sans">
            Vulnerability distribution across tested adversarial categories
          </p>
        </div>
        <div className="py-12 text-center text-xs font-mono text-[#C8C0AC]/70 space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-[#C8C0AC]/40" />
          <div>No scans yet. Start an adversarial evaluation to view vector analytics.</div>
        </div>
      </div>
    );
  }

  const handleBarClick = (entry: CategoryBarItem) => {
    const rawId = entry.id || CATEGORY_MAP[entry.category] || entry.category;
    onSelectCategory?.(rawId);
  };

  return (
    <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between min-h-[340px] relative overflow-hidden group">
      {/* Ambient Radial Backlight */}
      <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#FF6F59]/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header with Table / Chart Toggle */}
      <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Findings by Attack Vector
            </h3>
            <span className="text-xs font-mono text-[#FF6F59] bg-[#FF6F59]/10 px-2 py-0.5 rounded-full border border-[#FF6F59]/30">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-0.5 font-sans">
            Confirmed findings across the 4 primary test vectors
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-xl bg-[#060D1F]/60 border border-white/10 text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] transition-all"
          title={showTable ? 'View as Bar Chart' : 'View as Tabular Matrix'}
          aria-label={showTable ? 'View as Bar Chart' : 'View as Tabular Matrix'}
        >
          {showTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-[#060D1F]/50">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0A1633]/80 text-[#C8C0AC] border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Adversarial Vector</th>
                <th className="py-2.5 px-3 text-right">Confirmed Findings</th>
                <th className="py-2.5 px-3 text-right">Proportion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F5EDDC]">
              {data.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => handleBarClick(item)}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium">{item.category}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#FF6F59]">{item.count}</td>
                  <td className="py-2.5 px-3 text-right text-[#C8C0AC]">
                    {Math.round((item.count / total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-56 w-full my-2 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 30, left: 10, bottom: 8 }}
            >
              <defs>
                <linearGradient id="vectorGradPrimary" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF6F59" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#FF6F59" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="vectorGradSecondary" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3A5285" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#FF8A7A" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" horizontal={false} />
              <XAxis
                type="number"
                stroke="rgba(255, 255, 255, 0.15)"
                tick={{ fill: '#C8C0AC', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                type="category"
                dataKey="category"
                stroke="rgba(255, 255, 255, 0.15)"
                tick={{ fill: '#F5EDDC', fontSize: 11, fontFamily: 'monospace' }}
                width={135}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategoryBarItem;
                    return (
                      <div className="p-3 rounded-xl glass-tooltip text-xs font-mono">
                        <div className="font-bold text-[#F5EDDC] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF6F59]" />
                          {item.category}
                        </div>
                        <div className="text-[#C8C0AC] mt-1.5 flex items-center justify-between gap-4">
                          <span>Confirmed:</span>
                          <span className="font-bold text-[#FF6F59]">{item.count} findings</span>
                        </div>
                        <div className="text-[#C8C0AC] mt-0.5 flex items-center justify-between gap-4">
                          <span>Ratio:</span>
                          <span className="font-bold text-[#F5EDDC]">
                            {Math.round((item.count / total) * 100)}%
                          </span>
                        </div>
                        <div className="text-[10px] text-[#FF6F59] mt-2 pt-1 border-t border-white/10 flex items-center gap-1">
                          <span>Click bar to inspect findings</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 8, 8, 0]}
                animationDuration={900}
                animationEasing="ease-out"
                onClick={(entry) => handleBarClick(entry as any)}
                className="cursor-pointer"
              >
                {data.map((entry, index) => {
                  const isHovered = hoveredIdx === index;
                  const isTop = index === 0;
                  return (
                    <Cell
                      key={`bar-${index}`}
                      fill={isTop ? 'url(#vectorGradPrimary)' : 'url(#vectorGradSecondary)'}
                      stroke={isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)'}
                      strokeWidth={isHovered ? 1.5 : 1}
                      onMouseEnter={() => setHoveredIdx(index)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      style={{
                        filter: isHovered
                          ? 'drop-shadow(0 0 12px rgba(255, 111, 89, 0.5))'
                          : undefined,
                        transition: 'filter 0.2s ease',
                      }}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Vector Indicators */}
      <div className="pt-3 border-t border-white/[0.08] text-[11px] font-mono text-[#C8C0AC]/70 flex items-center justify-between relative z-10">
        <span className="truncate">
          Prompt Injection &bull; Data Leakage &bull; Tool Abuse &bull; Memory Poisoning
        </span>
        <span className="text-[#FF6F59] hidden sm:inline">Click vector to filter</span>
      </div>
    </div>
  );
};
