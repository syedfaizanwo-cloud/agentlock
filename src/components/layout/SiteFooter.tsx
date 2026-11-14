'use client';

import React from 'react';
import { Shield, Github, ExternalLink } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full bg-navy-950 border-t border-[#1A2E5A] text-xs font-mono text-cream-muted mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <a href="#top" className="inline-flex items-center gap-2.5 text-cream group">
              <div className="w-8 h-8 rounded-lg bg-coral text-navy-950 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4 fill-current" />
              </div>
              <span className="font-sans font-bold text-base tracking-tight text-cream">
                AgentLock
              </span>
            </a>
            <p className="text-xs text-cream-muted leading-relaxed font-sans">
              AI Agent Vulnerability Scanner and automated red teaming platform. Controlled adversarial evaluation across prompt injection, data leakage, tool abuse, and memory poisoning.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-coral/10 border border-coral/30 text-coral">
                <span className="w-1.5 h-1.5 rounded-full bg-severity-low" />
                Authorized sandbox testing only
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-cream text-xs font-bold font-sans">
              Platform modules
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#overview" className="hover:text-coral transition-colors">
                  Overview and telemetry
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-coral transition-colors">
                  Vulnerability analytics
                </a>
              </li>
              <li>
                <a href="#agents" className="hover:text-coral transition-colors">
                  Target inventory
                </a>
              </li>
              <li>
                <a href="#scan" className="hover:text-coral transition-colors">
                  Security scanning
                </a>
              </li>
              <li>
                <a href="#results" className="hover:text-coral transition-colors">
                  Vulnerability findings
                </a>
              </li>
              <li>
                <a href="#reports" className="hover:text-coral transition-colors">
                  Audit reports and PDF
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-coral transition-colors">
                  Methodology FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Engineering Team & Repository */}
          <div className="space-y-3">
            <h3 className="text-cream text-xs font-bold font-sans">
              Engineering team
            </h3>
            <div className="space-y-2 text-xs text-cream-muted">
              <div className="flex flex-col gap-1">
                <span className="text-cream font-medium">Core Contributors</span>
                <span className="text-xs">Syed Faizan (Attack Engine)</span>
                <span className="text-xs">Vikas C (Frontend and UI/UX)</span>
                <span className="text-xs">Dayanand R (FastAPI Backend)</span>
                <span className="text-xs">Mansi (Security Research)</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://github.com/syedfaizanwo-cloud/agentlock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-[#1A2E5A] text-cream hover:border-coral hover:text-coral transition-colors"
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
        <div className="mt-12 pt-8 border-t border-[#1A2E5A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            &copy; {new Date().getFullYear()} AgentLock. Automated Red Teaming Platform.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-cream-muted">
            <span>Controlled security evaluation</span>
            <span>,</span>
            <span className="text-coral">Zero fabricated data</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
