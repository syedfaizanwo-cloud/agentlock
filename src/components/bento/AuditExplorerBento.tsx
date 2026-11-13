'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { Sparkline } from './Sparkline';
import { ChartTooltip } from './ChartTooltip';
import { AUDIT_CHARTS } from '../../data/chartData';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ShieldCheck, Link2, CheckCircle, Database } from 'lucide-react';

interface AuditExplorerBentoProps {
  totalLogsCount?: number;
  onScrollToDetails?: (targetId: string) => void;
}

export const AuditExplorerBento: React.FC<AuditExplorerBentoProps> = ({
  totalLogsCount = 6,
  onScrollToDetails,
}) => {
  const items = [
    // 1. Hero Card (colSpan 2, rowSpan 2) - Hash-Chain Integrity Indicator
    {
      id: 'audit-hash-chain',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6FAF8A]" />
                <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight m-0">
                  Merkle Hash-Chain Integrity Stream
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A] flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-[#6FAF8A]" />
                SHA-256 CHAIN VERIFIED
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Sequential cryptographic Merkle blocks sealed with AWS KMS private key sign-offs.
            </p>
          </div>

          {/* Sequential Linked Nodes in Champagne Gold */}
          <div className="my-auto py-3" aria-label="Cryptographic hash chain visualization">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#B89B72] via-[#E6CBA8] to-[#F7E7CE] opacity-60 z-0" />

              {AUDIT_CHARTS.hashChainNodes.map((node, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center group">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0D0D0D] border-2 border-[#E6CBA8] shadow-[0_0_12px_rgba(230,203,168,0.35)] flex items-center justify-center text-[10px] font-mono font-bold text-[#E6CBA8]">
                    #{node.seq}
                  </div>
                  <span className="text-[10px] font-mono text-white mt-1.5 hidden sm:inline">
                    {node.hash}
                  </span>
                  <span className="text-[9px] font-mono text-[#8A8A8A]">
                    {node.time.slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] pt-2 border-t border-[rgba(255,255,255,0.06)]">
            <span className="text-[#BDBDBD]">Current Root Digest: <code className="text-[#E6CBA8] text-[11px]">0000a3b7..aa</code></span>
            <span className="text-[11px] text-[#E6CBA8] cursor-pointer hover:underline">
              Verify ledger ↓
            </span>
          </div>
        </div>
      ),
    },

    // 2. KPI Card 1 (colSpan 1, rowSpan 1) - Verified Blocks
    {
      id: 'audit-kpi-blocks',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#E6CBA8]" />
              Merkle Blocks
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(111,175,138,0.15)] text-[#6FAF8A]">
              100% SEALED
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={1042} />
              <span className="text-xs text-[#8A8A8A] font-sans">Blocks</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Tamper-evident blocks chained with SHA-256.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Blocks / hr</span>
            <Sparkline data={[42, 68, 110, 165, 224, 248, 185]} color="#E6CBA8" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 3. KPI Card 2 (colSpan 1, rowSpan 1) - Last Verification
    {
      id: 'audit-kpi-last-verified',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 select-none">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#BDBDBD] uppercase tracking-wider font-mono m-0 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6FAF8A]" />
              Last Verified
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[rgba(230,203,168,0.12)] text-[#E6CBA8]">
              KMS SIGNED
            </span>
          </div>

          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-black text-[#E6CBA8] font-mono tracking-tight flex items-baseline gap-1">
              <CountUp value={2.4} decimals={1} />
              <span className="text-xs text-[#8A8A8A] font-sans">sec ago</span>
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans m-0 mt-0.5">
              What this shows: Live cryptographic seal confirmation latency.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-[#8A8A8A]">Active sync</span>
            <Sparkline data={[3.1, 2.9, 2.7, 2.6, 2.5, 2.4, 2.4]} color="#6FAF8A" width={80} height={22} />
          </div>
        </div>
      ),
    },

    // 4. Chart Card (colSpan 2, rowSpan 1) - Event Type Distribution Donut
    {
      id: 'audit-event-distribution',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full p-4 gap-4 select-none">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-4 h-4 text-[#E6CBA8]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight m-0">
                Audit Event Type Breakdown
              </h3>
            </div>
            <p className="text-xs text-[#8A8A8A] font-sans m-0">
              What this shows: Proportion of audit records by cryptographic category.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs font-mono">
              <span className="text-[#E6CBA8]">• Policy Intercepts: 68%</span>
              <span className="text-white">• KMS Seals: 18%</span>
              <span className="text-[#BDBDBD]">• Human Sign-offs: 9%</span>
              <span className="text-[#8A8A8A]">• Quarantines: 5%</span>
            </div>
          </div>

          <div className="w-28 h-28 flex-shrink-0" aria-label="Event types donut chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={AUDIT_CHARTS.eventTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={46}
                  stroke="none"
                  isAnimationActive={true}
                >
                  {AUDIT_CHARTS.eventTypes.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => <ChartTooltip active={active} payload={payload} unit="%" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  ];

  const handleItemClick = () => {
    onScrollToDetails?.('audit-explorer');
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
