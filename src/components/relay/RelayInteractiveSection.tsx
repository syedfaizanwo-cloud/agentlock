'use client';

import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Lock,
} from 'lucide-react';

export const RelayInteractiveSection: React.FC = () => {
  const [tokenRate, setTokenRate] = useState<number>(25000);
  const [firewallActive, setFirewallActive] = useState<boolean>(true);
  const [kmsSealActive, setKmsSealActive] = useState<boolean>(true);
  const [hitlStrict, setHitlStrict] = useState<boolean>(true);

  // Dynamic calculations
  const dailyActions = Math.round(tokenRate * 2.8);
  const latencyMs = Math.max(8, Math.round(18 - (tokenRate / 10000) * 1.2));
  const estimatedCoverage = '100% Deterministic Zero-Trust';

  return (
    <section className="py-14 border-t border-[#2A2A2A] relative">
      {/* Central section pill */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151515] border border-[#2A2A2A]">
          <span className="w-2 h-2 rounded-full bg-[#E6CBA8] shadow-[0_0_8px_rgba(230,203,168,0.4)]"></span>
          <span className="text-xs font-mono text-[#BDBDBD] font-semibold uppercase tracking-wider">
            POLICY ENGINE // RUNTIME METER
          </span>
        </div>
      </div>

      {/* Editorial Headline */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
          Most of AI security is{' '}
          <span className="font-serif italic font-normal text-[#E6CBA8] drop-shadow-[0_0_25px_rgba(230,203,168,0.3)] underline decoration-[#B89B72]/40 decoration-1 underline-offset-8">
            runtime.
          </span>
        </h2>
        <p className="text-sm sm:text-base text-[#8A8A8A] max-w-xl mx-auto leading-relaxed font-sans">
          Inspect tool arguments into bash. Check SQL query boundaries. Ask Vikas if a root IAM assume role is authorized. AgentLock takes the runtime glue and leaves you the decisions.
        </p>
      </div>

      {/* Interactive Container */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle top specular aura */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#E6CBA8]/40 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Draggable Precision Meter */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between font-mono text-xs text-[#BDBDBD]">
              <span className="uppercase text-[#8A8A8A] font-bold">Throughput Quota Meter</span>
              <span className="text-[#E6CBA8] font-bold text-sm bg-[rgba(230,203,168,0.14)] px-2.5 py-0.5 rounded-full border border-[#B89B72]">
                {tokenRate.toLocaleString()} tokens/min
              </span>
            </div>

            {/* Draggable Range Slider with Gold Accent */}
            <div className="relative py-2">
              <input
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={tokenRate}
                onChange={(e) => setTokenRate(Number(e.target.value))}
                className="w-full h-2 bg-[#1E1E1E] rounded-lg appearance-none cursor-pointer accent-[#E6CBA8]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8A8A8A] mt-2">
                <span>5K tpm (Sandbox)</span>
                <span>50K tpm (Production)</span>
                <span>100K tpm (Hyperscale)</span>
              </div>
            </div>

            {/* Feature Options */}
            <div className="space-y-3 pt-3 border-t border-[#2A2A2A]">
              <div className="text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider font-semibold">
                Runtime Defense Options:
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div
                  onClick={() => setFirewallActive(!firewallActive)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                    firewallActive
                      ? 'bg-[#151515] border border-[#E6CBA8]'
                      : 'bg-[#151515] border border-[#2A2A2A] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-[#E6CBA8]" />
                    <span className="text-white text-xs font-semibold">Air-Gapped Egress & Reverse Shell Interceptor</span>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      firewallActive
                        ? 'bg-[#E6CBA8] border-[#E6CBA8] text-[#0A0A0A] font-extrabold text-xs shadow-md'
                        : 'border-[#3D3D3D] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </div>

                <div
                  onClick={() => setKmsSealActive(!kmsSealActive)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                    kmsSealActive
                      ? 'bg-[#151515] border border-[#E6CBA8]'
                      : 'bg-[#151515] border border-[#2A2A2A] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-[#E6CBA8]" />
                    <span className="text-white text-xs font-semibold">Tamper-Proof SHA-256 Merkle Ledger Seal</span>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      kmsSealActive
                        ? 'bg-[#E6CBA8] border-[#E6CBA8] text-[#0A0A0A] font-extrabold text-xs shadow-md'
                        : 'border-[#3D3D3D] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </div>

                <div
                  onClick={() => setHitlStrict(!hitlStrict)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all ${
                    hitlStrict
                      ? 'bg-[#151515] border border-[#E6CBA8]'
                      : 'bg-[#151515] border border-[#2A2A2A] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#E6CBA8]" />
                    <span className="text-white text-xs font-semibold">Strict Human-In-The-Loop Sign-Off for L3/L4</span>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      hitlStrict
                        ? 'bg-[#E6CBA8] border-[#E6CBA8] text-[#0A0A0A] font-extrabold text-xs shadow-md'
                        : 'border-[#3D3D3D] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Engine Metrics */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#151515] border border-[#2A2A2A] space-y-5 font-mono text-xs shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
              <span className="text-[#8A8A8A]">ENGINE TELEMETRY</span>
              <span className="text-[#E6CBA8] font-bold px-2 py-0.5 rounded-full bg-[rgba(230,203,168,0.14)] border border-[#B89B72]">
                ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[#8A8A8A] text-[11px] block mb-0.5">EVALUATION SPEED</span>
                <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                  {latencyMs} <span className="text-xs text-[#8A8A8A]">ms</span>
                </div>
              </div>

              <div>
                <span className="text-[#8A8A8A] text-[11px] block mb-0.5">ESTIMATED DAILY CAPACITY</span>
                <div className="text-2xl font-bold text-white">
                  {dailyActions.toLocaleString()} <span className="text-xs text-[#8A8A8A]">actions / day</span>
                </div>
              </div>

              <div>
                <span className="text-[#8A8A8A] text-[11px] block mb-0.5">POLICY COVERAGE</span>
                <div className="text-sm font-bold text-white">
                  {estimatedCoverage}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A2A2A]">
              <div className="text-[11px] text-[#8A8A8A]">
                SecOps Lead: <strong className="text-white">Vikas</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
