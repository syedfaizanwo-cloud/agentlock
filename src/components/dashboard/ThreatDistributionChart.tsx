'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Table, PieChart as PieIcon, ShieldAlert } from 'lucide-react';

interface SeveritySlice {
  severity: string;
  count: number;
  color: string;
}

interface ThreatDistributionChartProps {
  data?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    info?: number;
  };
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#E11D48' },
  high: { label: 'High', color: '#F59E0B' },
  medium: { label: 'Medium', color: '#FACC15' },
  low: { label: 'Low', color: '#34D399' },
  info: { label: 'Info', color: '#94A3B8' },
};

export const ThreatDistributionChart: React.FC<ThreatDistributionChartProps> = ({
  data = {},
}) => {
  const [showTable, setShowTable] = useState(false);

  const slices: SeveritySlice[] = Object.entries(SEVERITY_CONFIG)
    .map(([key, config]) => ({
      severity: config.label,
      count: (data as any)[key] || 0,
      color: config.color,
    }))
    .filter((s) => s.count > 0);

  const total = slices.reduce((acc, s) => acc + s.count, 0);

  if (total === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] flex flex-col justify-between min-h-[300px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Severity Distribution
            </h3>
            <span className="text-xs font-mono text-[#C8C0AC] px-2 py-0.5 rounded bg-[#060D1F] border border-[#12234A]">
              0 Findings
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-1 font-sans">
            Findings classified by vulnerability risk rating
          </p>
        </div>
        <div className="py-12 text-center text-xs font-mono text-[#C8C0AC]/70 space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-[#C8C0AC]/40" />
          <div>No scans yet. Start a scan to see severity data here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] flex flex-col justify-between min-h-[300px]">
      {/* Header with Table Toggle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Severity Distribution
            </h3>
            <span className="text-xs font-mono text-[#FF6F59] bg-[#FF6F59]/10 px-2 py-0.5 rounded border border-[#FF6F59]/30">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-0.5 font-sans">
            Findings breakdown by risk level
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-lg bg-[#060D1F] border border-[#12234A] text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] transition-colors"
          title={showTable ? 'View as Chart' : 'View as Table'}
          aria-label={showTable ? 'View as Chart' : 'View as Table'}
        >
          {showTable ? <PieIcon className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="my-4 overflow-x-auto rounded-xl border border-[#12234A] bg-[#060D1F]">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0A1633] text-[#C8C0AC] border-b border-[#12234A]">
              <tr>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3 text-right">Count</th>
                <th className="py-2 px-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12234A] text-[#F5EDDC]">
              {slices.map((slice, i) => (
                <tr key={i}>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                    {slice.severity}
                  </td>
                  <td className="py-2 px-3 text-right font-bold">{slice.count}</td>
                  <td className="py-2 px-3 text-right text-[#C8C0AC]">
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
                      <div className="p-2.5 rounded-lg bg-[#060D1F] border border-[#12234A] text-xs font-mono shadow-[4px_4px_12px_#030714]">
                        <div className="flex items-center gap-2 font-bold text-[#F5EDDC]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.severity}
                        </div>
                        <div className="text-[#C8C0AC] mt-1">
                          Findings: <span className="font-bold text-[#FF6F59]">{item.count}</span> ({Math.round((item.count / total) * 100)}%)
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
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="count"
                nameKey="severity"
                animationDuration={700}
              >
                {slices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0A1633" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-mono font-bold text-[#F5EDDC]">{total}</span>
            <span className="text-[10px] font-mono text-[#C8C0AC] uppercase">Findings</span>
          </div>
        </div>
      )}

      {/* Direct Labels Legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#12234A]">
        {slices.map((slice, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#C8C0AC]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
              <span>{slice.severity}</span>
            </span>
            <span className="font-bold text-[#F5EDDC]">{slice.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
