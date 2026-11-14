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

interface CategoryBarItem {
  category: string;
  count: number;
}

interface AgentRiskBarChartProps {
  data?: CategoryBarItem[];
}

export const AgentRiskBarChart: React.FC<AgentRiskBarChartProps> = ({
  data = [],
}) => {
  const [showTable, setShowTable] = useState(false);

  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] flex flex-col justify-between min-h-[300px]">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Findings by Attack Vector
            </h3>
            <span className="text-xs font-mono text-[#C8C0AC] px-2 py-0.5 rounded bg-[#060D1F] border border-[#12234A]">
              0 Findings
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-1 font-sans">
            Vulnerability distribution across tested adversarial categories
          </p>
        </div>
        <div className="py-12 text-center text-xs font-mono text-[#C8C0AC]/70 space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-[#C8C0AC]/40" />
          <div>No scans yet. Start a scan to see category data here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] flex flex-col justify-between min-h-[300px]">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold text-[#F5EDDC] tracking-wide uppercase">
              Findings by Attack Vector
            </h3>
            <span className="text-xs font-mono text-[#FF6F59] bg-[#FF6F59]/10 px-2 py-0.5 rounded border border-[#FF6F59]/30">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-[#C8C0AC] mt-0.5 font-sans">
            Confirmed findings across the 4 primary test categories
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="p-1.5 rounded-lg bg-[#060D1F] border border-[#12234A] text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] transition-colors"
          title={showTable ? 'View as Chart' : 'View as Table'}
          aria-label={showTable ? 'View as Chart' : 'View as Table'}
        >
          {showTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTable ? (
        <div className="my-4 overflow-x-auto rounded-xl border border-[#12234A] bg-[#060D1F]">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0A1633] text-[#C8C0AC] border-b border-[#12234A]">
              <tr>
                <th className="py-2 px-3">Attack Category</th>
                <th className="py-2 px-3 text-right">Confirmed Findings</th>
                <th className="py-2 px-3 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12234A] text-[#F5EDDC]">
              {data.map((item, i) => (
                <tr key={i}>
                  <td className="py-2 px-3">{item.category}</td>
                  <td className="py-2 px-3 text-right font-bold text-[#FF6F59]">{item.count}</td>
                  <td className="py-2 px-3 text-right text-[#C8C0AC]">
                    {Math.round((item.count / total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-52 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#12234A" horizontal={false} />
              <XAxis type="number" stroke="#12234A" tick={{ fill: '#C8C0AC', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="category"
                stroke="#12234A"
                tick={{ fill: '#F5EDDC', fontSize: 11 }}
                width={130}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategoryBarItem;
                    return (
                      <div className="p-2.5 rounded-lg bg-[#060D1F] border border-[#12234A] text-xs font-mono shadow-[4px_4px_12px_#030714]">
                        <div className="font-bold text-[#F5EDDC]">{item.category}</div>
                        <div className="text-[#FF6F59] mt-1 font-bold">
                          {item.count} confirmed findings
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={700}>
                {data.map((_, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={index === 0 ? '#FF6F59' : '#C8C0AC'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="pt-3 border-t border-[#12234A] text-[11px] font-mono text-[#C8C0AC]/70 flex items-center justify-between">
        <span>Prompt Injection &bull; Data Leakage &bull; Tool Abuse &bull; Memory Poisoning</span>
      </div>
    </div>
  );
};
