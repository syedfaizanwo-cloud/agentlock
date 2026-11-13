'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Table, LineChart as ChartIcon, ShieldAlert } from 'lucide-react';

interface ScanPoint {
  scan: string;
  findings: number;
  critical: number;
}

interface ThreatTimelineChartProps {
  data?: ScanPoint[];
}

export const ThreatTimelineChart: React.FC<ThreatTimelineChartProps> = ({
  data = [],
}) => {
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] flex flex-col justify-between min-h-[300px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Vulnerability Velocity Over Scans
            </h3>
            <span className="text-xs font-mono text-[#C8C0AC] px-2 py-0.5 rounded bg-[#060D1F] border border-[#12234A]">
              0 Scans
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-1 font-sans">
            Historical finding trends across consecutive evaluation runs
          </p>
        </div>
        <div className="py-12 text-center text-xs font-mono text-[#C8C0AC]/70 space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-[#C8C0AC]/40" />
          <div>No scans yet. Start a scan to see timeline data here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] flex flex-col justify-between min-h-[300px]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Vulnerability Velocity Over Scans
            </h3>
            <span className="text-xs font-mono text-[#FF6F59] bg-[#FF6F59]/10 px-2 py-0.5 rounded border border-[#FF6F59]/30">
              {data.length} Scans
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-0.5 font-sans">
            Total findings vs critical vulnerabilities per scan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59]" />
              <span className="text-[#F5EDDC]">Total Findings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
              <span className="text-[#E11D48]">Critical</span>
            </div>
          </div>

          <button
            onClick={() => setShowTable(!showTable)}
            className="p-1.5 rounded-lg bg-[#060D1F] border border-[#12234A] text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] transition-colors"
            title={showTable ? 'View as Chart' : 'View as Table'}
            aria-label={showTable ? 'View as Chart' : 'View as Table'}
          >
            {showTable ? <ChartIcon className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showTable ? (
        <div className="my-4 overflow-x-auto rounded-xl border border-[#12234A] bg-[#060D1F]">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0A1633] text-[#C8C0AC] border-b border-[#12234A]">
              <tr>
                <th className="py-2 px-3">Scan Run</th>
                <th className="py-2 px-3 text-right">Total Findings</th>
                <th className="py-2 px-3 text-right">Critical Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12234A] text-[#F5EDDC]">
              {data.map((pt, i) => (
                <tr key={i}>
                  <td className="py-2 px-3">{pt.scan}</td>
                  <td className="py-2 px-3 text-right font-bold text-[#FF6F59]">{pt.findings}</td>
                  <td className="py-2 px-3 text-right font-bold text-[#E11D48]">{pt.critical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-60 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFindings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6F59" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF6F59" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#12234A" />
              <XAxis dataKey="scan" stroke="#12234A" tick={{ fill: '#C8C0AC', fontSize: 11 }} />
              <YAxis stroke="#12234A" tick={{ fill: '#C8C0AC', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-2.5 rounded-lg bg-[#060D1F] border border-[#12234A] text-xs font-mono shadow-[4px_4px_12px_#030714]">
                        <div className="font-bold text-[#F5EDDC] mb-1">{label}</div>
                        <div className="text-[#FF6F59]">
                          Findings: <span className="font-bold">{payload[0]?.value}</span>
                        </div>
                        <div className="text-[#E11D48]">
                          Critical: <span className="font-bold">{payload[1]?.value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="findings"
                stroke="#FF6F59"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFindings)"
                animationDuration={700}
              />
              <Area
                type="monotone"
                dataKey="critical"
                stroke="#E11D48"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCritical)"
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="pt-3 border-t border-[#12234A] text-[11px] font-mono text-[#C8C0AC]/70">
        Consecutive scan data points &bull; Real measured execution findings only
      </div>
    </div>
  );
};
