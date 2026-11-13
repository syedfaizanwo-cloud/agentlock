'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Table, PieChart as PieIcon, ShieldAlert } from 'lucide-react';
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
  critical: { label: 'Critical', color: '#E11D48' },
  high: { label: 'High', color: '#F59E0B' },
  medium: { label: 'Medium', color: '#FACC15' },
  low: { label: 'Low', color: '#34D399' },
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
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (total === 0) {
    return (
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] flex flex-col justify-between min-h-[320px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-sans font-bold text-cream">
              Severity distribution
            </h3>
            <span className="text-xs font-mono text-cream-muted px-2 py-0.5 rounded bg-navy-850 border border-[#1A2E5A]">
              0 findings
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-1 font-sans">
            Findings classified by vulnerability risk rating
          </p>
        </div>
        <div className="py-8 text-center text-xs font-mono text-cream-muted space-y-3">
          <ShieldAlert className="w-8 h-8 mx-auto text-cream-muted/40" />
          <div>Run a scan to see severity trends here.</div>
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

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] flex flex-col justify-between min-h-[320px]">
      {/* Header with Table / Chart View Toggle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-sans font-bold text-cream">
              Severity distribution
            </h3>
            <span className="text-xs font-mono text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30">
              {total} total
            </span>
          </div>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Filter findings by selecting a risk tier
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] text-cream-muted hover:text-cream hover:border-coral transition-colors"
          title={showTable ? 'View as chart' : 'View as table'}
          aria-label={showTable ? 'View as chart' : 'View as table'}
        >
          {showTable ? <PieIcon className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="my-4 overflow-x-auto rounded-lg border border-[#1A2E5A] bg-navy-950">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
              <tr>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 text-right">Confirmed</th>
                <th className="py-2.5 px-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E5A] text-cream">
              {slices.map((slice, i) => (
                <tr
                  key={i}
                  onClick={() => onSelectSeverity?.(slice.key)}
                  className="hover:bg-navy-850 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 flex items-center gap-2 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    {slice.severity}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold" style={{ color: slice.color }}>
                    {slice.count}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cream-muted">
                    {Math.round((slice.count / total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-48 my-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SeveritySlice;
                    return (
                      <div className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] text-xs font-mono shadow-md">
                        <div className="flex items-center gap-2 font-bold text-cream">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.severity}
                        </div>
                        <div className="text-cream-muted mt-1.5 flex items-center justify-between gap-4">
                          <span>Confirmed:</span>
                          <span className="font-bold text-cream">{item.count}</span>
                        </div>
                        <div className="text-cream-muted mt-0.5 flex items-center justify-between gap-4">
                          <span>Share:</span>
                          <span className="font-bold text-coral">
                            {Math.round((item.count / total) * 100)}%
                          </span>
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
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                cornerRadius={4}
                dataKey="count"
                nameKey="severity"
                animationDuration={400}
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
                      stroke={isSelected ? '#F5EDDC' : '#0A1633'}
                      strokeWidth={isSelected ? 2 : 1}
                      style={{ outline: 'none' }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Counter inside Doughnut Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-mono font-bold text-cream tracking-tight">
              {total}
            </span>
            <span className="text-[10px] font-mono text-cream-muted">
              findings
            </span>
          </div>
        </div>
      )}

      {/* Interactive Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#1A2E5A]">
        {slices.map((slice, idx) => {
          const isSelected = selectedSeverity === slice.key;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSeverity?.(slice.key)}
              className={`p-1.5 rounded-md flex items-center justify-between text-xs font-mono border transition-colors ${
                isSelected
                  ? 'bg-navy-850 border-coral text-cream'
                  : 'bg-transparent border-transparent hover:bg-navy-850 text-cream-muted'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                <span>{slice.severity}</span>
              </span>
              <span className="font-bold text-cream">{slice.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
