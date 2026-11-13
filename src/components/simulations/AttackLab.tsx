'use client';

import React, { useState } from 'react';
import { SimulationScenario, SimulationResult, ActionType } from '../../types/api';
import {
  Play,
} from 'lucide-react';

interface AttackLabProps {
  scenarios: SimulationScenario[];
  onRunSimulation: (scenarioId: string) => Promise<SimulationResult>;
  onEvaluateCustom: (payload: {
    agent_id: string;
    action_type: ActionType;
    target: string;
    payload: string;
  }) => Promise<any>;
}

export const AttackLab: React.FC<AttackLabProps> = ({
  scenarios,
  onRunSimulation,
  onEvaluateCustom,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || 'sim-01');
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);

  // Custom runner state
  const [customMode, setCustomMode] = useState(false);
  const [customActionType, setCustomActionType] = useState<ActionType>('bash');
  const [customTarget, setCustomTarget] = useState('/bin/bash');
  const [customPayload, setCustomPayload] = useState('rm -rf / --no-preserve-root');
  const [customResult, setCustomResult] = useState<any | null>(null);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleRunTest = async (scenarioId: string) => {
    setIsRunning(true);
    setLastResult(null);
    setCustomResult(null);
    try {
      const res = await onRunSimulation(scenarioId);
      setLastResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustomTest = async () => {
    setIsRunning(true);
    setCustomResult(null);
    setLastResult(null);
    try {
      const res = await onEvaluateCustom({
        agent_id: 'agt-sec-01',
        action_type: customActionType,
        target: customTarget,
        payload: customPayload,
      });
      setCustomResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
              Attack Simulation & Pen-Test Lab
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8]">
              Air-Gapped Sandbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-0.5">
            Safely stress-test AgentLock 2.0 defense heuristics against real-world adversarial attacks and jailbreaks.
          </p>
        </div>

        {/* Toggle Custom vs Predefined */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#151515] border border-[#2A2A2A] text-xs font-mono">
          <button
            onClick={() => setCustomMode(false)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              !customMode
                ? 'bg-[#E6CBA8] text-[#0A0A0A] font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            Predefined Scenarios
          </button>
          <button
            onClick={() => setCustomMode(true)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              customMode
                ? 'bg-[#E6CBA8] text-[#0A0A0A] font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            Ad-Hoc Policy Tester
          </button>
        </div>
      </div>

      {!customMode ? (
        /* Predefined Scenarios Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenarios List Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8A8A8A]">
              Adversarial Test Suite ({scenarios.length})
            </h3>
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenarioId(scenario.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer font-mono ${
                  selectedScenarioId === scenario.id
                    ? 'bg-[#151515] border-[#E6CBA8] shadow-[0_0_15px_rgba(230,203,168,0.1)]'
                    : 'bg-[#0D0D0D] border-[#2A2A2A] hover:border-[#3D3D3D]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-white truncate">{scenario.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#151515] text-[#8A8A8A] border border-[#2A2A2A]">
                    {scenario.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8A8A] line-clamp-2 font-sans">
                  {scenario.description}
                </p>
                <div className="mt-2 text-[10px] text-[#E6CBA8]">
                  Target: {scenario.target_agent_name}
                </div>
              </div>
            ))}
          </div>

          {/* Active Scenario Inspector & Runner */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A2A2A]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-mono font-bold text-white">
                      {activeScenario.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]">
                      {activeScenario.mitre_technique}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8A8A] mt-1 font-sans">
                    {activeScenario.description}
                  </p>
                </div>

                <button
                  disabled={isRunning}
                  onClick={() => handleRunTest(activeScenario.id)}
                  className="px-5 py-2.5 rounded-xl bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(230,203,168,0.25)] flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Play className={`w-4 h-4 fill-[#0A0A0A] ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Executing Defense Engine...' : 'Run Simulation'}
                </button>
              </div>

              {/* Payload View */}
              <div>
                <span className="text-xs font-mono text-[#8A8A8A] uppercase block mb-1.5">
                  Test Attack Vector Payload:
                </span>
                <pre className="p-4 rounded-xl bg-[#050505] border border-[#2A2A2A] text-[#BDBDBD] font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-48">
                  {activeScenario.payload}
                </pre>
              </div>

              {/* Target Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] text-xs font-mono">
                <div>
                  <span className="text-[#8A8A8A] block text-[10px]">TARGET AGENT</span>
                  <span className="text-white font-bold">{activeScenario.target_agent_name}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] block text-[10px]">PAYLOAD TYPE</span>
                  <span className="text-white uppercase">{activeScenario.action_type}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] block text-[10px]">EXPECTED VERDICT</span>
                  <span className="text-[#C0504D] font-bold uppercase">
                    {activeScenario.expected_verdict}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulation Results Feed */}
            {lastResult && (
              <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-white">
                      DEFENSE SIMULATION VERDICT:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                        lastResult.verdict === 'blocked'
                          ? 'bg-[#C0504D]/10 text-[#C0504D] border border-[#C0504D]/30'
                          : lastResult.verdict === 'escalated'
                          ? 'bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]'
                          : 'bg-[#6FAF8A]/10 text-[#6FAF8A] border border-[#6FAF8A]/30'
                      }`}
                    >
                      {lastResult.verdict}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-[#E6CBA8]">
                    Latency: {lastResult.execution_ms}ms
                  </span>
                </div>

                <div className="text-xs font-sans text-[#BDBDBD] leading-relaxed">
                  {lastResult.explanation}
                </div>

                {/* Step Execution Trace */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono text-[#8A8A8A] uppercase block">
                    Telemetry Execution Trace:
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {lastResult.full_trace.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1E1E1E] border border-[#3D3D3D] flex items-center justify-center text-[10px] text-[#8A8A8A] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-white font-semibold">{t.step}</span>
                        </div>
                        <span className="text-[#8A8A8A] text-[11px] truncate max-w-xs">
                          {t.detail}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                            t.status === 'blocked'
                              ? 'bg-[#C0504D]/10 text-[#C0504D]'
                              : t.status === 'flagged'
                              ? 'bg-[rgba(230,203,168,0.14)] text-[#E6CBA8]'
                              : 'bg-[#6FAF8A]/10 text-[#6FAF8A]'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Ad-Hoc Policy Tester Mode */
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-5">
          <div>
            <h2 className="text-base font-mono font-bold text-white">
              Ad-Hoc Policy Evaluator (Live API POST /api/v1/actions/evaluate)
            </h2>
            <p className="text-xs text-[#8A8A8A] font-sans mt-0.5">
              Submit any payload, query, or command to test against the AgentLock heuristic rules and Python threat detector.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-[#8A8A8A] uppercase block mb-1">
                Action Type
              </label>
              <select
                value={customActionType}
                onChange={(e) => setCustomActionType(e.target.value as ActionType)}
                className="w-full p-2.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-white focus:outline-none focus:border-[#E6CBA8]"
              >
                <option value="bash">bash (Shell Command)</option>
                <option value="sql">sql (Database Query)</option>
                <option value="file_write">file_write (Filesystem)</option>
                <option value="iam_assume">iam_assume (Cloud Identity)</option>
                <option value="llm_query">llm_query (Prompt String)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-[#8A8A8A] uppercase block mb-1">
                Target Resource
              </label>
              <input
                type="text"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                placeholder="/bin/bash, db.customers, etc."
                className="w-full p-2.5 rounded-lg bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-white focus:outline-none focus:border-[#E6CBA8]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#8A8A8A] uppercase block mb-1">
              Payload / Code / Prompt
            </label>
            <textarea
              rows={4}
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#050505] border border-[#2A2A2A] text-xs font-mono text-[#BDBDBD] focus:outline-none focus:border-[#E6CBA8]"
            />
          </div>

          <button
            disabled={isRunning}
            onClick={handleRunCustomTest}
            className="px-5 py-2.5 rounded-xl bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(230,203,168,0.2)] flex items-center gap-2"
          >
            <Play className={`w-4 h-4 fill-[#0A0A0A] ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Evaluating against Policy Engine...' : 'Evaluate Payload'}
          </button>

          {customResult && (
            <div className="p-4 rounded-xl bg-[#151515] border border-[#2A2A2A] space-y-3 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
                <span className="font-bold text-white">Decision:</span>
                <span
                  className={`px-3 py-0.5 rounded-full uppercase font-bold ${
                    customResult.decision === 'blocked'
                      ? 'bg-[#C0504D]/10 text-[#C0504D] border border-[#C0504D]/30'
                      : customResult.decision === 'escalated'
                      ? 'bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]'
                      : 'bg-[#6FAF8A]/10 text-[#6FAF8A] border border-[#6FAF8A]/30'
                  }`}
                >
                  {customResult.decision}
                </span>
              </div>
              <div>
                Risk Score: <strong className="text-[#C0504D]">{customResult.risk_score}/100</strong>
              </div>
              {customResult.rule_triggered && (
                <div className="text-[#C0504D]">Rule Triggered: {customResult.rule_triggered}</div>
              )}
              <div className="text-[#BDBDBD] font-sans">{customResult.explanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
