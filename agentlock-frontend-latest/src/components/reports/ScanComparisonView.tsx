'use client';

import React, { useState } from 'react';
import { Scan, Finding } from '../../types/api';
import { getScanComparison } from '../../lib/chart-data';
import { GitCompare, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface ScanComparisonViewProps {
  scans: Scan[];
  findings?: Finding[];
  onSelectFinding?: (finding: Finding) => void;
}

export const ScanComparisonView: React.FC<ScanComparisonViewProps> = ({
  scans = [],
  findings = [],
  onSelectFinding,
}) => {
  const completedScans = scans.filter((s) => s.status === 'completed' || s.vulnerabilities_found !== undefined);

  const [scanAId, setScanAId] = useState<string>(
    completedScans.length > 1 ? completedScans[1].id : completedScans[0]?.id || ''
  );
  const [scanBId, setScanBId] = useState<string>(
    completedScans.length > 0 ? completedScans[0].id : ''
  );

  const scanA = completedScans.find((s) => s.id === scanAId);
  const scanB = completedScans.find((s) => s.id === scanBId);

  if (completedScans.length < 2 || !scanA || !scanB) {
    return (
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center py-6 text-xs font-mono text-cream-muted space-y-1">
        <div className="font-bold text-cream">Scan Comparison Engine</div>
        <p>Complete at least two security evaluations to compare differential findings and delta shifts.</p>
      </div>
    );
  }

  // Find findings matching each scan
  const findingsA = findings.filter((f) => f.scan_id === scanA.id);
  const findingsB = findings.filter((f) => f.scan_id === scanB.id);

  const comparison = getScanComparison(scanA, scanB, findingsA, findingsB);

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-6">
      {/* Header and Scan Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2E5A]">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-coral" />
            <h3 className="text-sm font-sans font-bold text-cream">
              Two-Scan Comparative Analysis
            </h3>
          </div>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Evaluate differential security posture between baseline and follow-up scans
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <select
            value={scanAId}
            onChange={(e) => setScanAId(e.target.value)}
            className="p-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-cream"
          >
            {completedScans.map((s, idx) => (
              <option key={s.id} value={s.id}>
                Baseline: {s.agent_name || s.agent_id} ({new Date(s.started_at).toLocaleDateString()})
              </option>
            ))}
          </select>

          <ArrowRight className="w-3.5 h-3.5 text-cream-muted" />

          <select
            value={scanBId}
            onChange={(e) => setScanBId(e.target.value)}
            className="p-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-cream"
          >
            {completedScans.map((s, idx) => (
              <option key={s.id} value={s.id}>
                Target: {s.agent_name || s.agent_id} ({new Date(s.started_at).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Tiles: New vs Resolved vs Unchanged */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg bg-navy-950 border border-severity-critical/30 space-y-1">
          <div className="text-[11px] font-mono text-severity-critical uppercase">
            New Vulnerabilities
          </div>
          <div className="text-2xl font-mono font-bold text-severity-critical">
            +{comparison.newFindings.length}
          </div>
          <div className="text-[10px] font-mono text-cream-muted">
            Introduced since baseline scan
          </div>
        </div>

        <div className="p-4 rounded-lg bg-navy-950 border border-severity-low/30 space-y-1">
          <div className="text-[11px] font-mono text-severity-low uppercase">
            Resolved Findings
          </div>
          <div className="text-2xl font-mono font-bold text-severity-low">
            -{comparison.resolvedFindings.length}
          </div>
          <div className="text-[10px] font-mono text-cream-muted">
            Successfully remediated flaws
          </div>
        </div>

        <div className="p-4 rounded-lg bg-navy-950 border border-[#1A2E5A] space-y-1">
          <div className="text-[11px] font-mono text-cream-muted uppercase">
            Persistent Findings
          </div>
          <div className="text-2xl font-mono font-bold text-cream">
            {comparison.unchangedFindings.length}
          </div>
          <div className="text-[10px] font-mono text-cream-muted">
            Unaddressed across both evaluations
          </div>
        </div>
      </div>

      {/* Delta Bars for each Category */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-cream-muted uppercase tracking-wider">
          Category Vulnerability Delta Shifts
        </div>

        <div className="space-y-2">
          {comparison.categoryDeltas.map((cat) => {
            const isImprovement = cat.delta < 0;
            const isDegradation = cat.delta > 0;

            return (
              <div
                key={cat.category}
                className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="w-44 text-cream font-medium truncate">{cat.label}</div>

                <div className="flex-1 flex items-center gap-3">
                  <div className="w-16 text-right text-cream-muted">
                    {cat.countA} &rarr; {cat.countB}
                  </div>

                  <div className="flex-1 h-2 rounded-full bg-navy-900 border border-[#1A2E5A] overflow-hidden flex">
                    {isDegradation && (
                      <div
                        className="bg-severity-critical h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.abs(cat.delta) * 20)}%` }}
                      />
                    )}
                    {isImprovement && (
                      <div
                        className="bg-severity-low h-full rounded-full"
                        style={{ width: `${Math.min(100, Math.abs(cat.delta) * 20)}%` }}
                      />
                    )}
                  </div>
                </div>

                <div
                  className={`w-16 text-right font-bold ${
                    isDegradation
                      ? 'text-severity-critical'
                      : isImprovement
                      ? 'text-severity-low'
                      : 'text-cream-muted'
                  }`}
                >
                  {cat.delta > 0 ? `+${cat.delta}` : cat.delta}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
