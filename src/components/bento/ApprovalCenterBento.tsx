'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { APPROVAL_CHARTS } from '../../data/chartData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { CheckCircle2, Clock, UserCheck, ShieldCheck } from 'lucide-react';

interface ApprovalCenterBentoProps {
  pendingCount?: number;
  onScrollToDetails?: (targetId: string) => void;
}

export const ApprovalCenterBento: React.FC<ApprovalCenterBentoProps> = ({
  pendingCount = 3,
  onScrollToDetails,
}) => {
  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - Approval Funnel
    {
      id: 'approval-funnel',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  Human-in-the-Loop Governance Funnel
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#E6CBA8] uppercase tracking-wider">
                PIPELINE RESOLUTION
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Autonomous agent actions requiring manual operator authorization stages.
            </p>
          </div>

          <div className="space-y-2.5 my-auto py-2" aria-label="Approval funnel stage bars">
            {APPROVAL_CHARTS.funnel.map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#BDBDBD]">{stage.stage}</span>
                  <span className="font-bold text-white">
                    {stage.count} <span className="text-[#8A8A8A] font-normal">({stage.pct})</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#151515] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: stage.pct,
                      backgroundColor:
                        idx === 0
                          ? '#FFFFFF'
                          : idx === 1
                          ? '#BDBDBD'
                          : idx === 2
                          ? '#8A8A8A'
                          : idx === 3
                          ? '#6FAF8A'
                          : '#E6CBA8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <span>Pass Ratio: <strong className="text-white">89.4% Approved</strong> • 10.6% Denied</span>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Review queue ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. KPI Card 1 (colSpan 1, rowSpan 1) - Pending Requests
    {
      id: 'approval-kpi-pending',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Pending Gates
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.14)] text-[#E6CBA8]">
              ACTIVE HOLD
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={pendingCount} />
              <span className="text-xs text-[#8A8A8A] font-sans">Awaiting Sign-off</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: High-impact actions quarantined awaiting SecOps approval.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Age &lt; 1h</span>
            <Sparkline data={[1, 2, 2, 3, 4, 3, pendingCount]} color="#E6CBA8" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 3. KPI Card 2 (colSpan 1, rowSpan 1) - Average Review Time
    {
      id: 'approval-kpi-review-time',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6FAF8A]" />
              Avg SLA Velocity
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              ▼ 1.3m
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={4.2} decimals={1} />
              <span className="text-xs text-[#8A8A8A] font-sans">minutes</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Mean turnaround time from agent trigger to human decision.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Fast Lane</span>
            <Sparkline data={[6.2, 5.8, 5.1, 4.8, 4.5, 4.3, 4.2]} color="#6FAF8A" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - Pending Approvals by Age
    {
      id: 'approval-pending-age',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#E6CBA8]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                Pending Approvals by Age Bucket
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Active requests grouped by time elapsed since trigger.
            </p>
            <div className="mt-2 text-xs font-mono text-[#8A8A8A]">
              Status: <strong className="text-white">2 requests under 1 hr</strong> • 1 request under 4 hrs
            </div>
          </div>

          <div className="w-36 h-24 flex-shrink-0" aria-label="Bar chart of pending requests by age">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={APPROVAL_CHARTS.pendingByAge} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="bucket" stroke="#5C5C5C" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C5C5C" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={label} unit="requests" />} />
                <Bar dataKey="count" name="Pending" radius={[3, 3, 0, 0]} isAnimationActive={true}>
                  {APPROVAL_CHARTS.pendingByAge.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = () => {
    onScrollToDetails?.('approval-center');
  };

  return (
    <div className="w-full my-4">
      <MagicBento
        items={items}
        columns={4}
        rowHeight={200}
        gap={16}
        radius={20}
        theme="dark"
        glowColor="#E6CBA8"
        enableBorderGlow={false}
        enableSpotlight={true}
        spotlightRadius={300}
        enableStars={false}
        enableTilt={false}
        enableMagnetism={false}
        clickEffect={true}
        textAutoHide={false}
        intro={true}
        onItemClick={handleItemClick}
      />
    </div>
  );
};
