'use client';

import React from 'react';
import { Shield, Github, ExternalLink } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#060D1F] border-t border-[#12234A] text-xs font-mono text-[#C8C0AC] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <a href="#top" className="inline-flex items-center gap-2.5 text-[#F5EDDC] group">
              <div className="w-8 h-8 rounded-lg bg-[#FF6F59] text-[#060D1F] flex items-center justify-center font-bold shadow-[0_0_12px_rgba(255,111,89,0.3)] transition-transform group-hover:scale-105">
                <Shield className="w-4 h-4 fill-current" />
              </div>
              <span className="font-sans font-bold text-base tracking-tight text-[#F5EDDC]">
                AgentLock
              </span>
            </a>
            <p className="text-xs text-[#C8C0AC] leading-relaxed font-sans">
              AI Agent Vulnerability Scanner and Automated Red Teaming Platform. Controlled adversarial evaluation across prompt injection, data leakage, tool abuse, and memory poisoning.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] bg-[#FF6F59]/10 border border-[#FF6F59]/30 text-[#FF6F59]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                Authorized Sandbox Testing Only
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-[#F5EDDC] text-xs font-bold uppercase tracking-wider font-sans">
              Platform Modules
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#overview" className="hover:text-[#FF6F59] transition-colors">
                  Overview & Telemetry
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-[#FF6F59] transition-colors">
                  Vulnerability Analytics
                </a>
              </li>
              <li>
                <a href="#agents" className="hover:text-[#FF6F59] transition-colors">
                  Agent Inventory
                </a>
              </li>
              <li>
                <a href="#scan" className="hover:text-[#FF6F59] transition-colors">
                  Security Scanning
                </a>
              </li>
              <li>
                <a href="#results" className="hover:text-[#FF6F59] transition-colors">
                  Vulnerability Findings
                </a>
              </li>
              <li>
                <a href="#reports" className="hover:text-[#FF6F59] transition-colors">
                  Audit Reports & PDF
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#FF6F59] transition-colors">
                  Methodology FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Engineering Team & Repository */}
          <div className="space-y-3">
            <h3 className="text-[#F5EDDC] text-xs font-bold uppercase tracking-wider font-sans">
              Engineering Team
            </h3>
            <div className="space-y-2 text-xs text-[#C8C0AC]">
              <div className="flex flex-col gap-1">
                <span className="text-[#F5EDDC] font-medium">Core Contributors</span>
                <span className="text-xs">Syed Faizan (Attack Engine)</span>
                <span className="text-xs">Vikas C (Frontend & UI/UX)</span>
                <span className="text-xs">Dayanand R (FastAPI Backend)</span>
                <span className="text-xs">Mansi (Security Research)</span>
              </div>
              <div className="pt-3">
                <a
                  href="https://github.com/syedfaizanwo-cloud/agentlock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1633] border border-[#12234A] text-[#F5EDDC] hover:border-[#FF6F59] hover:text-[#FF6F59] transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="mt-12 pt-8 border-t border-[#12234A] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} AgentLock. Automated Red Teaming Platform.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[#C8C0AC]">
            <span>Controlled Security Evaluation</span>
            <span>&bull;</span>
            <span className="text-[#FF6F59]">Zero Fabricated Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
