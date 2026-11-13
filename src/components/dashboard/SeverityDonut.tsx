'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Table, PieChart as PieIcon, ShieldAlert, ArrowRight } from 'lucide-react';
import { SeverityLevel } from '../../types/api';

interface SeveritySlice {
  key: SeverityLevel;
  severity: string;
  count: number;
  color: string;
}

interface SeverityDonutProps {
  data?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    info?: number;
  };
  onSelectSeverity?: (severity: SeverityLevel) => void;
  selectedSeverity?: SeverityLevel | null;
}

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#FF3158' },
  high: { label: 'High', color: '#FF9F0A' },
  medium: { label: 'Medium', color: '#FFD43B' },
  low: { label: 'Low', color: '#32D6A0' },
  info: { label: 'Info', color: '#94A3B8' },
};

export const SeverityDonut: React.FC<SeverityDonutProps> = ({
  data = {},
  onSelectSeverity,
  selectedSeverity,
}) => {
  const [showTable, setShowTable] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const slices: SeveritySlice[] = (Object.keys(SEVERITY_CONFIG) as SeverityLevel[])
    .map((key) => ({
      key,
      severity: SEVERITY_CONFIG[key].label,
      count: (data as any)[key] || 0,
      color: SEVERITY_CONFIG[key].color,
    }))
    .filter((s) => s.count > 0);

  const total = slices.reduce((acc, s) => acc + s.count, 0);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ filter: `drop-shadow(0 0 10px ${fill}66)` }}
        />
      </g>
    );
  };

  if (total === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between min-h-[340px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Severity Distribution
            </h3>
            <span className="text-xs font-mono text-[#C8C0AC] px-2.5 py-0.5 rounded-full bg-[#060D1F]/60 border border-white/10">
              0 Findings
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-1 font-sans">
            Findings classified by vulnerability risk rating
          </p>
        </div>
        <div className="py-12 text-center text-xs font-mono text-[#C8C0AC]/70 space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-[#C8C0AC]/40" />
          <div>No scans yet. Start an adversarial evaluation to view severity analytics.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between min-h-[340px] relative overflow-hidden group">
      {/* Soft Ambient Radial Reflection */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#FF6F59]/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Header with Table / Chart View Toggle */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Severity Distribution
            </h3>
            <span className="text-xs font-mono text-[#FF6F59] bg-[#FF6F59]/10 px-2 py-0.5 rounded-full border border-[#FF6F59]/30">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-0.5 font-sans">
            Interactive risk tier breakdown with click-to-filter
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-xl bg-[#060D1F]/60 border border-white/10 text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] transition-all"
          title={showTable ? 'View as Doughnut Chart' : 'View as Tabular Matrix'}
          aria-label={showTable ? 'View as Doughnut Chart' : 'View as Tabular Matrix'}
        >
          {showTable ? <PieIcon className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-[#060D1F]/50">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0A1633]/80 text-[#C8C0AC] border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Severity Level</th>
                <th className="py-2.5 px-3 text-right">Confirmed</th>
                <th className="py-2.5 px-3 text-right">Proportion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#F5EDDC]">
              {slices.map((slice, i) => (
                <tr
                  key={i}
                  onClick={() => onSelectSeverity?.(slice.key)}
                  className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 flex items-center gap-2 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    {slice.severity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold" style={{ color: slice.color }}>
                    {slice.count}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#C8C0AC]">
                    {Math.round((slice.count / total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-52 my-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SeveritySlice;
                    return (
                      <div className="p-3 rounded-xl glass-tooltip text-xs font-mono">
                        <div className="flex items-center gap-2 font-bold text-[#F5EDDC]">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.severity} Risk
                        </div>
                        <div className="text-[#C8C0AC] mt-1.5 flex items-center justify-between gap-4">
                          <span>Confirmed:</span>
                          <span className="font-bold text-[#F5EDDC]">{item.count}</span>
                        </div>
                        <div className="text-[#C8C0AC] mt-0.5 flex items-center justify-between gap-4">
                          <span>Ratio:</span>
                          <span className="font-bold text-[#FF6F59]">
                            {Math.round((item.count / total) * 100)}%
                          </span>
                        </div>
                        <div className="text-[10px] text-[#FF6F59] mt-2 pt-1 border-t border-white/10 flex items-center gap-1">
                          <span>Click to filter findings</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={78}
                paddingAngle={4}
                cornerRadius={5}
                dataKey="count"
                nameKey="severity"
                animationDuration={800}
                animationEasing="ease-out"
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(entry) => onSelectSeverity?.(entry.key)}
                className="cursor-pointer"
              >
                {slices.map((entry, index) => {
                  const isSelected = selectedSeverity === entry.key;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isSelected ? '#F5EDDC' : 'rgba(12, 22, 48, 0.8)'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      style={{ outline: 'none' }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Counter inside Doughnut Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-mono font-bold text-[#F5EDDC] tracking-tight">
              {total}
            </span>
            <span className="text-[10px] font-mono text-[#C8C0AC] uppercase tracking-wider">
              Findings
            </span>
          </div>
        </div>
      )}

      {/* Interactive Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.08] relative z-10">
        {slices.map((slice, idx) => {
          const isSelected = selectedSeverity === slice.key;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSeverity?.(slice.key)}
              className={`p-1.5 rounded-lg flex items-center justify-between text-xs font-mono border transition-all ${
                isSelected
                  ? 'bg-white/[0.08] border-[#FF6F59] shadow-[0_0_12px_rgba(255,111,89,0.2)]'
                  : 'bg-transparent border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <span className="flex items-center gap-1.5 text-[#C8C0AC]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                <span>{slice.severity}</span>
              </span>
              <span className="font-bold text-[#F5EDDC]">{slice.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
