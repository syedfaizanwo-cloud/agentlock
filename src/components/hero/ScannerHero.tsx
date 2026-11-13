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

interface ScannerHeroProps {
  onStartScan?: () => void;
  onHowItWorks?: () => void;
  backendOnline?: boolean;
  latencyMs?: number;
}

export const ScannerHero: React.FC<ScannerHeroProps> = ({
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
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill text-[#C8C0AC]">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-[#34D399] shadow-[0_0_8px_#34D399]' : 'bg-[#FF6F59] shadow-[0_0_8px_#FF6F59]'
              }`}
            />
            <span className="text-xs font-mono tracking-tight">
              AGENTLOCK // {backendOnline ? `BACKEND CONNECTED (${latencyMs}ms)` : 'STANDALONE SECURE RUNTIME'}
            </span>
          </div>

          {/* Single H1 on Whole Page */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5EDDC] leading-[1.1] font-sans">
            AI Agent Vulnerability Scanner & Automated Red Teaming
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#C8C0AC] max-w-2xl font-sans leading-relaxed">
            Continuously evaluate autonomous AI agents and tool-augmented LLMs against Prompt Injection,
            Data Leakage, Tool Abuse, and Memory Poisoning before deployment.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartScan}
              className="px-6 py-3.5 rounded-xl bg-[#FF6F59] text-[#060D1F] font-bold text-sm tracking-wide shadow-[4px_4px_10px_#030714,-2px_-2px_6px_#12234A] hover:bg-[#E85A44] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>Launch Security Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onHowItWorks}
              className="px-6 py-3.5 rounded-xl glass-card text-[#F5EDDC] font-semibold text-sm hover:border-[#FF6F59] active:scale-[0.98] transition-all"
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Right Column: Architectural Terminal Preview */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl glass-panel p-5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#FF6F59]/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF3158]" />
                <span className="w-3 h-3 rounded-full bg-[#FFD43B]" />
                <span className="w-3 h-3 rounded-full bg-[#32D6A0]" />
                <span className="text-xs font-mono text-[#C8C0AC] ml-2">adversarial-probe.sh</span>
              </div>
              <span className="text-[11px] font-mono text-[#32D6A0]">TLS 1.3 / ACTIVE</span>
            </div>

            <div className="space-y-2 text-xs font-mono text-[#C8C0AC] leading-relaxed relative z-10">
              <div className="text-[#FF6F59]">$ agentlock eval --target https://agent.internal/v1</div>
              <div className="text-[#C8C0AC]/80">[*] Verifying authorized testing scope... OK</div>
              <div className="text-[#C8C0AC]/80">[*] Testing prompt injection delimiter evasion...</div>
              <div className="text-[#FF3158]">[!] Vulnerability detected: System prompt exfiltration</div>
              <div className="text-[#C8C0AC]/80">[*] Generating cryptographically verifiable dossier...</div>
              <div className="text-[#32D6A0]">[+] Evaluation complete: 4 test suites finished</div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#C8C0AC]/70 relative z-10">
              <span>Framework: Red Team v2.4</span>
              <span>MITRE ATLAS Compatible</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Pipeline Strip */}
      <div className="pt-6">
        <div className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC] mb-4">
          Red Teaming Execution Lifecycle
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stages.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-4 rounded-xl glass-card glass-card-hover space-y-2 relative group transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#FF6F59] font-bold">{st.num}</span>
                  <Icon className="w-4 h-4 text-[#C8C0AC] group-hover:text-[#FF6F59] transition-colors" />
                </div>
                <div className="text-xs font-bold text-[#F5EDDC] font-sans">{st.title}</div>
                <div className="text-[11px] text-[#C8C0AC]/80 font-sans leading-tight">
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
