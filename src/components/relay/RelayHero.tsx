'use client';

import React from 'react';
import {
  ShieldAlert,
  Bot,
  Zap,
  Eye,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface RelayHeroProps {
  onStartScan?: () => void;
  onHowItWorks?: () => void;
  backendOnline?: boolean;
  latencyMs?: number;
}

export const RelayHero: React.FC<RelayHeroProps> = ({
  onStartScan,
  onHowItWorks,
  backendOnline = false,
  latencyMs = 0,
}) => {
  const stages = [
    { num: '01', title: 'Target Agent', desc: 'Authorized endpoint verification', icon: Bot },
    { num: '02', title: 'Attack Engine', desc: 'Controlled red-team simulation', icon: Zap },
    { num: '03', title: 'Observe', desc: 'Capture raw prompt & responses', icon: Eye },
    { num: '04', title: 'Analyze', desc: 'Classify exploit vulnerability', icon: ShieldAlert },
    { num: '05', title: 'Report', desc: 'Actionable code remediation', icon: FileCheck2 },
  ];

  return (
    <section id="top" className="relative pt-6 pb-12 overflow-hidden space-y-12">
      {/* Top Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Heading & Primary Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0A1633] border border-[#12234A] shadow-[inset_2px_2px_4px_#030714]">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-[#34D399]' : 'bg-[#FF6F59]'
              }`}
            />
            <span className="text-xs font-mono text-[#C8C0AC] tracking-tight">
              AGENTLOCK // {backendOnline ? `BACKEND CONNECTED (${latencyMs}ms)` : 'STANDALONE SECURE RUNTIME'}
            </span>
          </div>

          {/* Single H1 on whole page */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F5EDDC] leading-[1.08] font-sans">
            Find weaknesses in AI agents before attackers do.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#C8C0AC] font-normal leading-relaxed max-w-xl font-sans">
            AgentLock runs controlled adversarial tests against AI agents you own and reports what it can make them do, with evidence and fixes.
          </p>

          {/* Primary & Secondary Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#scan"
              onClick={onStartScan}
              className="px-7 py-3.5 rounded-xl bg-[#FF6F59] hover:bg-[#E85A44] text-[#060D1F] font-bold text-xs sm:text-sm font-mono tracking-wide transition-all shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] active:scale-95 inline-flex items-center gap-2"
            >
              <span>Start a scan</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#overview"
              onClick={onHowItWorks}
              className="px-6 py-3.5 rounded-xl bg-[#0A1633] border border-[#12234A] hover:border-[#FF6F59] text-[#F5EDDC] font-medium text-xs sm:text-sm font-mono tracking-wide transition-all shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A]"
            >
              How it works
            </a>
          </div>

          {/* Safety Boundary Banner */}
          <div className="pt-2 flex items-start gap-2.5 text-xs font-sans text-[#C8C0AC]/80">
            <Shield className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
            <span>
              AgentLock tests in an authorized sandbox. It does not attack public agents or run destructive actions.
            </span>
          </div>
        </div>

        {/* Right Column: Inset Visual Simulation Window */}
        <div className="lg:col-span-5 relative">
          <div className="rounded-2xl bg-[#0A1633] border border-[#12234A] p-6 shadow-[8px_8px_16px_#030714,-8px_-8px_16px_#12234A] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#12234A] text-xs font-mono">
              <span className="text-[#F5EDDC] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6F59]" />
                Adversarial Simulation Harness
              </span>
              <span className="text-[10px] text-[#C8C0AC] px-2 py-0.5 rounded bg-[#060D1F] border border-[#12234A]">
                FASTAPI SYNCHRONIZED
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#060D1F] border border-[#12234A] shadow-[inset_2px_2px_4px_#030714] space-y-1">
                <div className="text-[10px] text-[#C8C0AC] uppercase">Test Vector 01</div>
                <div className="text-[#FF6F59] font-bold">Prompt Injection Override</div>
                <div className="text-[11px] text-[#C8C0AC]/70">Testing indirect instruction hijacking in RAG contexts</div>
              </div>

              <div className="p-3 rounded-xl bg-[#060D1F] border border-[#12234A] shadow-[inset_2px_2px_4px_#030714] space-y-1">
                <div className="text-[10px] text-[#C8C0AC] uppercase">Test Vector 02</div>
                <div className="text-[#F5EDDC] font-bold">Data Leakage &amp; Exfiltration</div>
                <div className="text-[11px] text-[#C8C0AC]/70">Testing system prompt and secret token extraction</div>
              </div>

              <div className="p-3 rounded-xl bg-[#060D1F] border border-[#12234A] shadow-[inset_2px_2px_4px_#030714] space-y-1">
                <div className="text-[10px] text-[#C8C0AC] uppercase">Test Vector 03</div>
                <div className="text-[#34D399] font-bold">Tool Abuse &amp; Privilege Escalation</div>
                <div className="text-[11px] text-[#C8C0AC]/70">Testing SQL/bash argument manipulation safeguards</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#C8C0AC]">
              <span>Coverage: 4 Attack Classes</span>
              <span className="text-[#34D399] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Stage Strip */}
      <div className="pt-4 border-t border-[#12234A]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#FF6F59] font-bold">
                    {stage.num}
                  </span>
                  <Icon className="w-4 h-4 text-[#C8C0AC]" />
                </div>
                <div className="text-xs font-mono font-bold text-[#F5EDDC]">
                  {stage.title}
                </div>
                <div className="text-[11px] font-sans text-[#C8C0AC]/70 leading-snug">
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
