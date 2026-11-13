'use client';

import React from 'react';
import MagicBento from '../MagicBento/MagicBento';
import { CountUp } from './CountUp';
import { ChartTooltip } from './ChartTooltip';
import { CHART_PALETTE } from '../../data/chartData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Shield, Globe, Lock, HeartPulse, ShieldCheck, ShieldAlert } from 'lucide-react';
import { SecuritySummary } from '@/types/api';

interface SecurityBentoProps {
  summary?: SecuritySummary;
  onScrollToDetails?: (targetId: string) => void;
}

const SOURCE_BREAKDOWN_DATA = [
  { name: 'Direct Prompts (Verified)', value: 14200, color: CHART_PALETTE.gold },
  { name: 'Enterprise RAG (Trusted)', value: 8940, color: '#F7E7CE' },
  { name: 'MicroVM Sandbox (Verified)', value: 6810, color: CHART_PALETTE.grey1 },
  { name: 'Agent-to-Agent Mesh (Trusted)', value: 4500, color: CHART_PALETTE.grey2 },
  { name: 'External OSINT (Untrusted)', value: 3120, color: CHART_PALETTE.danger },
  { name: 'Incident Webhooks (Untrusted)', value: 940, color: '#d05c59' },
];

const BLOCKED_DESTINATIONS_DATA = [
  { target: '169.254.169.254', count: 42, reason: 'SSRF Cloud Meta' },
  { target: 'pastebin.com', count: 19, reason: 'Exfil Sink' },
  { target: '127.0.0.1:8080', count: 14, reason: 'Loopback Bridge' },
  { target: 'insecure-cdn', count: 9, reason: 'Plaintext HTTP' },
];

export const SecurityBento: React.FC<SecurityBentoProps> = ({
  summary = {
    hardening_score: 98,
    active_sources: 6,
    trusted_sources: 3,
    untrusted_sources: 2,
    allowed_destinations: 3,
    blocked_destinations: 3,
    ssrf_blocks_24h: 42,
    dlp_violations_24h: 17,
    offline_agents_count: 2,
    kill_switch_active: false,
  },
  onScrollToDetails,
}) => {
  const items = [
    // 1. Source Provenance Breakdown Donut (colSpan 2, rowSpan 2)
    {
      id: 'security-source-breakdown',
      colSpan: 2,
      rowSpan: 2,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#E6CBA8]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#8A8A8A]">
                  Inbound Source Distribution
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(230,203,168,0.12)] text-[#E6CBA8] border border-[#B89B72]/40 font-semibold">
                PROVENANCE TAGGED
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-sans">
              Cryptographic Ingestion Mesh
            </h3>
            <p className="text-xs text-[#8A8A8A] font-sans mt-0.5">
              38,510 total payloads ingested • 94.2% verified/trusted origin
            </p>
          </div>

          <div className="w-full h-44 my-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={<ChartTooltip unit=" payloads" />}
                  cursor={false}
                />
                <Pie
                  data={SOURCE_BREAKDOWN_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  stroke="#050505"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {SOURCE_BREAKDOWN_DATA.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-bold font-mono text-white">94.2%</span>
              <span className="text-[9px] font-mono text-[#8A8A8A] uppercase">Trusted</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono pt-2 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 text-[#E6CBA8]">
              <span className="w-2 h-2 rounded-full bg-[#E6CBA8]" />
              <span>Verified / Trusted (34.4k)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#C0504D]">
              <span className="w-2 h-2 rounded-full bg-[#C0504D]" />
              <span>Untrusted / Escalated (4.1k)</span>
            </div>
          </div>
        </div>
      ),
    },

    // 2. Blocked Destinations & SSRF Bar Chart (colSpan 2, rowSpan 1)
    {
      id: 'security-egress-blocks',
      colSpan: 2,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#E6CBA8]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#8A8A8A]">
                Top Blocked Destinations & SSRF Subnets
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#C0504D] font-bold">
              84 BLOCKS / 24H
            </span>
          </div>

          <div className="w-full h-24 my-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BLOCKED_DESTINATIONS_DATA} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="target" type="category" stroke="#8A8A8A" fontSize={10} width={110} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit=" blocks" />} cursor={false} />
                <Bar dataKey="count" fill={CHART_PALETTE.gold} radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8A8A8A]">
            <span>169.254.169.254 link-local (42)</span>
            <span>pastebin.com (19)</span>
            <span>127.0.0.1 (14)</span>
          </div>
        </div>
      ),
    },

    // 3. Environment Hardening Score Metric (colSpan 1, rowSpan 1)
    {
      id: 'security-hardening-score',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div className="flex items-center justify-between gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E6CBA8]" />
            <span className="text-[10px] font-mono text-[#6FAF8A] uppercase font-bold">
              All 8 Pass
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1">
              <CountUp value={summary.hardening_score} />
              <span className="text-base text-[#E6CBA8] font-normal">%</span>
            </div>
            <div className="text-xs font-mono font-medium text-white mt-0.5">
              Hardening Rating
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans mt-1">
              MicroVM sandboxing, dynamic vault leases, & tamper guard.
            </p>
          </div>

          <div className="text-[10px] font-mono text-[#E6CBA8] pt-1 border-t border-[#2A2A2A]">
            0 Unhardened Vectors
          </div>
        </div>
      ),
    },

    // 4. Fail-Closed Heartbeat Vitals (colSpan 1, rowSpan 1)
    {
      id: 'security-offline-vitals',
      colSpan: 1,
      rowSpan: 1,
      content: (
        <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
          <div className="flex items-center justify-between gap-2">
            <HeartPulse className="w-4 h-4 text-[#E6CBA8]" />
            <span className="text-[10px] font-mono text-[#C0504D] uppercase font-bold">
              Fail-Closed
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight flex items-baseline gap-1">
              <CountUp value={30} />
              <span className="text-base text-[#E6CBA8] font-normal">s</span>
            </div>
            <div className="text-xs font-mono font-medium text-white mt-0.5">
              Heartbeat Interval
            </div>
            <p className="text-[11px] text-[#8A8A8A] font-sans mt-1">
              Missing 3 pings revokes credentials automatically.
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#2A2A2A]">
            <span className="text-[#6FAF8A]">4 Active</span>
            <span className="text-[#C0504D]">2 Stale / Isolated</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <MagicBento
        items={items}
        columns={4}
        rowHeight={190}
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
        intro={false}
      />
    </div>
  );
};
