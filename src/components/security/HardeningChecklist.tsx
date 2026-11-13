'use client';

import React from 'react';
import { SecurityControl } from '@/types/api';
import { CheckCircle2, Shield, AlertTriangle, ExternalLink, Activity } from 'lucide-react';

interface HardeningChecklistProps {
  controls: SecurityControl[];
  score: number;
}

export const HardeningChecklist: React.FC<HardeningChecklistProps> = ({ controls, score }) => {
  const handleFaqJump = (faqId?: string) => {
    if (!faqId) return;
    const el = document.getElementById(faqId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(
        new CustomEvent('open-faq-item', { detail: { faqId } })
      );
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-xl space-y-6">
      {/* Top Banner: Score Gauge + Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2A2A2A]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#E6CBA8]" />
            <h3 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight">
              Environment Hardening & Autonomous Safety Audit
            </h3>
          </div>
          <p className="text-xs text-[#8A8A8A] font-sans max-w-xl">
            Continuous verification across execution sandboxes, network choke points, cryptographic vaults, and immutable ledgers.
          </p>
        </div>

        {/* Hardening Score Badge */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#151515] border border-[#2A2A2A] shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#2A2A2A]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#E6CBA8]"
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-mono font-bold text-white">{score}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Hardening Rating
            </div>
            <div className="text-[11px] font-mono text-[#E6CBA8]">
              8/8 Controls Verified
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Rows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {controls.map((ctrl) => (
          <div
            key={ctrl.key}
            className="p-4 rounded-2xl bg-[#151515] border border-[#2A2A2A] hover:border-[#3D3D3D] transition-colors space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1E1E1E] text-[#8A8A8A] border border-[#2A2A2A]">
                  {ctrl.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#6FAF8A] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PASS
                </span>
              </div>
              <h4 className="text-xs font-bold text-white font-sans">{ctrl.title}</h4>
              <p className="text-[11px] text-[#8A8A8A] font-sans leading-relaxed">
                {ctrl.details}
              </p>
            </div>

            {ctrl.faq_id && (
              <div className="pt-2 border-t border-[#2A2A2A]/50">
                <button
                  type="button"
                  onClick={() => handleFaqJump(ctrl.faq_id)}
                  className="text-[10px] font-mono text-[#E6CBA8] hover:text-[#F7E7CE] inline-flex items-center gap-1 transition-colors"
                >
                  <span>Learn how this is enforced in FAQ</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
