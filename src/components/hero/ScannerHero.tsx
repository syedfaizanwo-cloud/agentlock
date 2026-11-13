'use client';

import React from 'react';
import {
  ShieldAlert,
  Bot,
  Zap,
  Eye,
  FileCheck2,
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
    { num: '01', title: 'Target verification', desc: 'Confirm authorized agent endpoint', icon: Bot },
    { num: '02', title: 'Adversarial probe', desc: 'Controlled injection and evasion suites', icon: Zap },
    { num: '03', title: 'Telemetry capture', desc: 'Record raw inputs, tools, and outputs', icon: Eye },
    { num: '04', title: 'Exploit analysis', desc: 'Score severity and confirm data leakage', icon: ShieldAlert },
    { num: '05', title: 'Dossier report', desc: 'Download reproducible remediation report', icon: FileCheck2 },
  ];

  return (
    <section id="top" className="relative pt-6 pb-12 space-y-12">
      {/* Top Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Heading & Primary Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-navy-900 border border-[#1A2E5A] text-xs font-mono text-cream-soft">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-severity-low' : 'bg-coral'
              }`}
            />
            <span>
              {backendOnline ? `Backend connected (${latencyMs}ms)` : 'Standalone runtime (offline)'}
            </span>
          </div>

          {/* Single H1 on Whole Page */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-cream leading-[1.1] font-display">
            Vulnerability scanner for autonomous AI agents
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-cream-soft max-w-2xl font-sans leading-relaxed">
            Test your LLM agents and tool integrations against prompt injection, unauthorized tool execution,
            sensitive data leaks, and memory tampering before putting them in front of users.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartScan}
              className="px-6 py-3 rounded-lg bg-coral text-navy-950 font-bold text-sm tracking-wide hover:bg-coral-hover active:bg-coral-active transition-colors focus:outline-none focus:ring-2 focus:ring-coral"
            >
              Start a scan
            </button>

            <button
              onClick={onHowItWorks}
              className="px-6 py-3 rounded-lg bg-navy-900 border border-[#1A2E5A] text-cream font-semibold text-sm hover:border-coral transition-colors focus:outline-none focus:ring-2 focus:ring-coral"
            >
              How scanning works
            </button>
          </div>
        </div>

        {/* Right Column: Terminal probe preview & documented screenshot slot */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-navy-900 border border-[#1A2E5A] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2E5A]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-severity-critical" />
                <span className="w-2.5 h-2.5 rounded-full bg-severity-medium" />
                <span className="w-2.5 h-2.5 rounded-full bg-severity-low" />
                <span className="text-xs font-mono text-cream-soft ml-2">adversarial-probe.sh</span>
              </div>
              <span className="text-xs font-mono text-severity-low">TLS 1.3 verified</span>
            </div>

            <div className="space-y-2 text-xs font-mono text-cream-soft leading-relaxed">
              <div className="text-coral">$ agentlock eval --target https://agent.internal/v1</div>
              <div className="text-cream-muted">[*] Verifying authorized testing scope: target confirmed</div>
              <div className="text-cream-muted">[*] Running prompt injection delimiter evasion: completed</div>
              <div className="text-severity-critical">[!] Finding confirmed: System prompt exfiltration detected</div>
              <div className="text-cream-muted">[*] Generating cryptographically verifiable dossier: completed</div>
              <div className="text-severity-low">[+] Evaluation finished: 4 test suites concluded</div>
            </div>

            <div className="pt-2 border-t border-[#1A2E5A] flex items-center justify-between text-xs font-mono text-cream-muted">
              <span>Test suite: Red Team v2.4</span>
              <span>MITRE ATLAS aligned</span>
            </div>
          </div>

          {/* 
            TODO: Real product screenshot slot.
            Please supply a high-resolution screenshot of the scan results interface
            (e.g., save as /public/product-screenshot.png) and uncomment next/image below:
            
            <div className="rounded-xl overflow-hidden border border-[#1A2E5A] bg-navy-900">
              <Image
                src="/product-screenshot.png"
                alt="AgentLock scan findings interface showing vulnerability details"
                width={720}
                height={400}
                loading="lazy"
                className="w-full h-auto object-cover"
              />
            </div>
          */}
        </div>
      </div>

      {/* 5-Step Process Section */}
      <div className="pt-4 border-t border-[#1A2E5A]">
        <h2 className="text-xs font-mono text-cream-muted mb-4">
          Scan lifecycle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stages.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-4 rounded-lg bg-navy-900 border border-[#1A2E5A] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-coral font-bold">{st.num}</span>
                  <Icon className="w-4 h-4 text-cream-muted" />
                </div>
                <div className="text-xs font-bold text-cream font-sans">{st.title}</div>
                <div className="text-xs text-cream-soft leading-normal">
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
