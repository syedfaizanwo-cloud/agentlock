'use client';

import React, { useState } from 'react';
import {
  Play,
  MousePointer,
  Plus,
  CornerDownRight,
  Clock,
} from 'lucide-react';

interface RelayHeroProps {
  onExploreCommand: () => void;
  onOpenSimulations: () => void;
  pendingApprovalsCount: number;
}

export const RelayHero: React.FC<RelayHeroProps> = ({
  onExploreCommand,
  onOpenSimulations,
}) => {
  const [activeStep, setActiveStep] = useState<string>('approval');

  return (
    <section className="relative pt-2 pb-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Black & White Editorial */}
        <div className="lg:col-span-6 space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#151515] border border-[#2A2A2A]">
            <span className="w-2 h-2 rounded-full bg-[#E6CBA8] shadow-[0_0_8px_rgba(230,203,168,0.5)] animate-ping" />
            <span className="text-xs font-mono text-[#BDBDBD] tracking-tight">
              AGENTLOCK 2.0 // 6 AUTONOMOUS AGENTS GUARDED
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            The AI defenses run{' '}
            <span className="font-serif italic font-normal text-[#E6CBA8] drop-shadow-[0_0_25px_rgba(230,203,168,0.3)] underline decoration-[#B89B72]/40 decoration-1 underline-offset-8">
              themselves.
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#8A8A8A] font-normal leading-relaxed max-w-xl">
            AgentLock 2.0 executes deterministic zero-trust runtime guards across all autonomous agent tool calls, halting code execution threats before process spawn.
          </p>

          {/* Primary Gold & Secondary Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreCommand}
              className="px-6 py-3 rounded-full bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(230,203,168,0.25)] hover:-translate-y-0.5"
            >
              Open SecOps Command
            </button>

            <button
              onClick={onOpenSimulations}
              className="px-5 py-3 rounded-full bg-transparent border border-[#2A2A2A] hover:border-[#E6CBA8] text-white font-medium text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 hover:bg-[#151515]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Watch Simulation, 2 min
            </button>
          </div>

          <div className="text-xs font-mono text-[#5C5C5C] pt-1">
            free 14-day evaluation / no credit card / instant gateway deployment
          </div>
        </div>

        {/* Right Column: Tilting Glass Workflow Window */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] p-5 shadow-2xl transition-transform duration-500 hover:[transform:perspective(1200px)_rotateX(2deg)_rotateY(-1deg)]">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A] text-xs font-mono">
              <div className="flex items-center gap-3 text-[#8A8A8A]">
                <span className="text-white font-medium">Policy Engine: L3 DB Write</span>
                <span className="text-[#3D3D3D]">|</span>
                <span>3 steps / 1 branch</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-white text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FAF8A] animate-ping"></span>
                  running
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8] text-[10px] font-semibold">
                  100%
                </span>
              </div>
            </div>

            {/* Window Body with Toolbar & Node Flow */}
            <div className="flex gap-4 pt-4 pb-3">
              {/* Left Toolbar */}
              <div className="flex flex-col gap-2 border-r border-[#2A2A2A] pr-3 text-[#8A8A8A]">
                <button className="p-1.5 rounded-lg bg-[#E6CBA8] text-[#0A0A0A] font-bold shadow-md">
                  <MousePointer className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] hover:border-[#E6CBA8] text-[#BDBDBD]">
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg bg-[#151515] border border-[#2A2A2A] hover:border-[#E6CBA8] text-[#BDBDBD]">
                  <CornerDownRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Node Flow Canvas */}
              <div className="flex-1 relative min-h-[220px]">
                {/* SVG Connecting Wires */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 120 70 C 160 70, 160 38, 200 38"
                    fill="none"
                    stroke="#E6CBA8"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <path
                    d="M 120 70 C 160 70, 160 115, 200 115"
                    fill="none"
                    stroke="#3D3D3D"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 290 38 C 320 38, 320 75, 350 75"
                    fill="none"
                    stroke="#E6CBA8"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Node 1: Root Ingestion */}
                <div
                  onClick={() => setActiveStep('trigger')}
                  className={`absolute left-0 top-10 w-28 p-2.5 rounded-xl border transition-all cursor-pointer font-mono text-left ${
                    activeStep === 'trigger'
                      ? 'bg-[#1E1E1E] border-[#E6CBA8] text-white shadow-xl'
                      : 'bg-[#151515] border-[#2A2A2A] hover:border-[#E6CBA8] text-[#BDBDBD]'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">Agent action</div>
                  <div className="text-[9px] text-[#8A8A8A] mt-0.5">claude-3-5</div>
                </div>

                {/* Branch Labels */}
                <span className="absolute left-[142px] top-[40px] text-[10px] font-mono text-[#E6CBA8] font-bold">
                  true
                </span>
                <span className="absolute left-[142px] top-[95px] text-[10px] font-mono text-[#5C5C5C]">
                  else
                </span>

                {/* Node 2: Condition */}
                <div
                  onClick={() => setActiveStep('condition')}
                  className={`absolute left-[180px] top-1 w-28 p-2.5 rounded-xl border transition-all cursor-pointer font-mono text-left ${
                    activeStep === 'condition'
                      ? 'bg-[#1E1E1E] border-[#E6CBA8] text-white shadow-xl'
                      : 'bg-[#151515] border-[#2A2A2A] hover:border-[#E6CBA8] text-[#BDBDBD]'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">Risk &gt; 80</div>
                  <div className="text-[9px] text-[#8A8A8A] mt-0.5">condition</div>
                </div>

                {/* Node 3: Lower Else branch */}
                <div
                  onClick={() => setActiveStep('audit')}
                  className={`absolute left-[180px] top-[95px] w-28 p-2.5 rounded-xl border transition-all cursor-pointer font-mono text-left ${
                    activeStep === 'audit'
                      ? 'bg-[#1E1E1E] border-[#E6CBA8] text-white shadow-xl'
                      : 'bg-[#151515] border-[#2A2A2A] hover:border-[#E6CBA8] text-[#BDBDBD]'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">Log to ledger</div>
                  <div className="text-[9px] text-[#8A8A8A] mt-0.5">sha256 seal</div>
                </div>

                {/* Node 4: Ask Vikas */}
                <div
                  onClick={() => setActiveStep('approval')}
                  className={`absolute right-1 top-[46px] w-36 p-3 rounded-xl border transition-all cursor-pointer font-mono text-left ${
                    activeStep === 'approval'
                      ? 'bg-[#151515] border-[#E6CBA8] text-white shadow-[0_0_20px_rgba(230,203,168,0.2)]'
                      : 'bg-[#151515] border-[#2A2A2A] hover:border-[#E6CBA8] text-[#BDBDBD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">Ask Vikas</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E6CBA8] animate-ping" />
                  </div>
                  <div className="text-[9px] text-[#8A8A8A] mt-0.5">waiting on sign-off</div>
                  <div className="mt-2 text-[9px] font-mono text-[#E6CBA8] bg-[rgba(230,203,168,0.14)] px-2 py-0.5 rounded-full border border-[#B89B72] flex items-center gap-1 font-semibold">
                    <Clock className="w-2.5 h-2.5" /> 26 min
                  </div>
                </div>
              </div>
            </div>

            {/* Window Bottom Bar */}
            <div className="pt-3 border-t border-[#2A2A2A] text-[11px] font-mono space-y-1.5">
              <div className="text-[#5C5C5C] text-[10px] uppercase tracking-wider mb-1">
                last runs
              </div>

              <div className="flex items-center justify-between text-[#BDBDBD]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C0504D]"></span>
                  <span className="text-[#8A8A8A]">11:14:02</span>
                  <span className="text-white font-medium">blocked curl pipe to bash</span>
                </span>
                <span className="text-[#8A8A8A] text-[10px]">129 ms</span>
              </div>

              <div className="flex items-center justify-between text-[#BDBDBD]">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6CBA8]"></span>
                  <span className="text-[#8A8A8A]">11:13:45</span>
                  <span className="text-[#BDBDBD]">escalated AssumeRole SuperAdmin</span>
                </span>
                <span className="text-[#8A8A8A] text-[10px]">2.1 s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
