'use client';

import React, { useState, useEffect } from 'react';
import { SiteFooter } from '../components/layout/SiteFooter';
import { FAQSection } from '../components/faq/FAQSection';

export default function HomePage() {
  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* Section 1: Hero #top */}
        <section id="top" className="pt-20 pb-16 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#FF6F59]/10 border border-[#FF6F59]/30 text-[#FF6F59]">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" />
            AI Agent Vulnerability Scanner &amp; Red Teaming
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-sans text-[#F5EDDC]">
            Find weaknesses in AI agents before attackers do.
          </h1>
          <p className="text-lg text-[#C8C0AC] max-w-2xl mx-auto font-sans leading-relaxed">
            AgentLock runs controlled adversarial tests against AI agents you own and reports what it can make them do, with evidence and fixes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#scan"
              className="px-6 py-3 rounded-xl bg-[#FF6F59] text-[#060D1F] font-bold text-sm tracking-wide shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] hover:bg-[#E85A44] transition-all"
            >
              Start a scan
            </a>
            <a
              href="#overview"
              className="px-6 py-3 rounded-xl bg-[#0A1633] text-[#F5EDDC] font-medium text-sm border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] hover:border-[#FF6F59] transition-all"
            >
              How it works
            </a>
          </div>
          <div className="pt-8 text-xs font-mono text-[#C8C0AC]/70">
            AgentLock tests in an authorized sandbox. It does not attack public agents or run destructive actions.
          </div>
        </section>

        {/* Section 2: Overview #overview */}
        <section id="overview" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F5EDDC]">Platform Overview</h2>
          <p className="text-sm text-[#C8C0AC]">Real-time security telemetry and confirmed vulnerabilities across tested agents.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Registered Agents', value: '0', sub: 'Target inventory' },
              { label: 'Total Scans', value: '0', sub: 'Adversarial evaluations' },
              { label: 'Confirmed Vulnerabilities', value: '0', sub: 'Actionable security findings' },
              { label: 'Critical Findings', value: '0', sub: 'Immediate remediation required' },
            ].map((kpi, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] space-y-2"
              >
                <div className="text-xs font-mono text-[#C8C0AC]">{kpi.label}</div>
                <div className="text-3xl font-black font-mono text-[#F5EDDC]">{kpi.value}</div>
                <div className="text-[11px] text-[#C8C0AC]/70 font-sans">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Analytics #analytics */}
        <section id="analytics" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F5EDDC]">Vulnerability Analytics</h2>
          <p className="text-sm text-[#C8C0AC]">Deterministic breakdown by category, severity distribution, and historical scans.</p>
          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-sm font-mono text-[#C8C0AC]">
            No scans yet. Start a scan to see severity data here.
          </div>
        </section>

        {/* Section 4: Agents #agents */}
        <section id="agents" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F5EDDC]">Agent Management</h2>
          <p className="text-sm text-[#C8C0AC]">Register target endpoints and verify active communication status.</p>
          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-sm font-mono text-[#C8C0AC]">
            No registered agents. Add an agent endpoint to begin red teaming.
          </div>
        </section>

        {/* Section 5: Scan #scan */}
        <section id="scan" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F5EDDC]">Security Scanning</h2>
          <p className="text-sm text-[#C8C0AC]">Select attack vectors and launch automated adversarial simulations.</p>
          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-sm font-mono text-[#C8C0AC]">
            Ready to scan. Select target agent and test vectors to initiate.
          </div>
        </section>

        {/* Section 6: Results #results */}
        <section id="results" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F5EDDC]">Vulnerability Results</h2>
          <p className="text-sm text-[#C8C0AC]">Detailed findings with attack payloads, raw evidence, and code remediation.</p>
          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-sm font-mono text-[#C8C0AC]">
            No findings to display. Run an adversarial scan to generate findings.
          </div>
        </section>

        {/* Section 7: Reports #reports */}
        <section id="reports" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#F5EDDC]">Audit Reports</h2>
          <p className="text-sm text-[#C8C0AC]">Cryptographically verifiable scan records and downloadable executive PDF summaries.</p>
          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-sm font-mono text-[#C8C0AC]">
            No report generated yet. Complete a vulnerability scan to generate audit documents.
          </div>
        </section>

        {/* Section 8: FAQ #faq */}
        <FAQSection />
      </main>

      <SiteFooter />
    </div>
  );
}
