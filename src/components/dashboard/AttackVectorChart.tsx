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
import { Table, BarChart3, ShieldAlert } from 'lucide-react';
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
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] flex flex-col justify-between min-h-[320px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-sans font-bold text-cream">
              Findings by attack vector
            </h3>
            <span className="text-xs font-mono text-cream-muted px-2 py-0.5 rounded bg-navy-850 border border-[#1A2E5A]">
              0 findings
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-1 font-sans">
            Vulnerabilities detected across adversarial categories
          </p>
        </div>
        <div className="py-8 text-center text-xs font-mono text-cream-muted space-y-3">
          <ShieldAlert className="w-8 h-8 mx-auto text-cream-muted/40" />
          <div>Run a scan to see attack category trends here.</div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('scan');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-coral hover:bg-coral-hover text-navy-950 transition-colors"
          >
            Launch security scan
          </button>
        </div>
      </div>
    );
  }

  const handleBarClick = (entry: CategoryBarItem) => {
    const rawId = entry.id || CATEGORY_MAP[entry.category] || entry.category;
    onSelectCategory?.(rawId);
  };

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] flex flex-col justify-between min-h-[320px]">
      {/* Header with Table / Chart Toggle */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-bold text-cream">
              Findings by attack vector
            </h3>
            <span className="text-xs font-mono text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30">
              {total} total
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Confirmed findings across the 4 primary test vectors
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] text-cream-muted hover:text-cream hover:border-coral transition-colors"
          title={showTable ? 'View as chart' : 'View as table'}
          aria-label={showTable ? 'View as chart' : 'View as table'}
        >
          {showTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="my-2 overflow-x-auto rounded-lg border border-[#1A2E5A] bg-navy-950">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
              <tr>
                <th className="py-2.5 px-3">Vector</th>
                <th className="py-2.5 px-3 text-right">Confirmed</th>
                <th className="py-2.5 px-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E5A] text-cream">
              {data.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => handleBarClick(item)}
                  className="hover:bg-navy-850 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium">{item.category}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-coral">{item.count}</td>
                  <td className="py-2.5 px-3 text-right text-cream-muted">
                    {Math.round((item.count / total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-52 my-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#1A2E5A"
              />
              <XAxis
                type="number"
                allowDecimals={false}
                stroke="#8A8578"
                tick={{ fill: '#C8C0AC', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#1A2E5A' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={120}
                stroke="#8A8578"
                tick={{ fill: '#F5EDDC', fontSize: 11, fontFamily: 'sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategoryBarItem;
                    return (
                      <div className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono shadow-md">
                        <div className="font-bold text-cream">{item.category}</div>
                        <div className="text-cream-muted mt-1.5 flex items-center justify-between gap-4">
                          <span>Confirmed:</span>
                          <span className="font-bold text-coral">{item.count}</span>
                        </div>
                        <div className="text-cream-muted mt-0.5 flex items-center justify-between gap-4">
                          <span>Share:</span>
                          <span className="font-bold text-cream">
                            {Math.round((item.count / total) * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                barSize={16}
                onClick={handleBarClick}
                className="cursor-pointer"
              >
                {data.map((entry, index) => {
                  const rawId = entry.id || CATEGORY_MAP[entry.category] || entry.category;
                  const isSelected = selectedCategory === rawId;
                  const isHovered = hoveredIdx === index;
                  return (
                    <Cell
                      key={`bar-${index}`}
                      fill={isSelected || isHovered ? '#FA5840' : '#FF6F59'}
                      onMouseEnter={() => setHoveredIdx(index)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer hint */}
      <div className="pt-2 border-t border-[#1A2E5A] flex items-center justify-between text-xs font-mono text-cream-muted">
        <span>Click any bar to filter findings</span>
        <span>{data.length} categories tested</span>
      </div>
    </div>
  );
};
