'use client';

import React, { useState, useEffect } from 'react';
import { Scan, Finding, AgentComparisonResponse, ALL_ATTACK_CATEGORIES, ATTACK_CATEGORY_LABELS, AttackCategory } from '../../types/api';
import { api } from '../../lib/api-client';
import { GitCompare, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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
  const completedScans = scans.filter((s) => s.status === 'completed');

  const [scanAId, setScanAId] = useState<number | null>(
    completedScans.length > 1 ? completedScans[1].id : completedScans[0]?.id || null
  );
  const [scanBId, setScanBId] = useState<number | null>(
    completedScans.length > 0 ? completedScans[0].id : null
  );

  const [backendComparison, setBackendComparison] = useState<AgentComparisonResponse | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);

  // Synchronize initial selections if scans change
  useEffect(() => {
    if (completedScans.length > 0) {
      if (scanAId === null) setScanAId(completedScans.length > 1 ? completedScans[1].id : completedScans[0].id);
      if (scanBId === null) setScanBId(completedScans[0].id);
    }
  }, [completedScans, scanAId, scanBId]);

  // Fetch comparison from backend
  useEffect(() => {
    let isCurrent = true;
    const fetchComparison = async () => {
      setIsLoadingComparison(true);
      try {
        const res = await api.getAgentComparison(
          scanAId && scanBId
            ? { vulnerable_scan_id: scanAId, protected_scan_id: scanBId }
            : undefined
        );
        if (isCurrent) setBackendComparison(res);
      } catch {
        // Fall back to client calculation
      } finally {
        if (isCurrent) setIsLoadingComparison(false);
      }
    };

    fetchComparison();
    return () => {
      isCurrent = false;
    };
  }, [scanAId, scanBId]);

  const scanA = completedScans.find((s) => s.id === scanAId);
  const scanB = completedScans.find((s) => s.id === scanBId);

  if (completedScans.length < 2 || !scanA || !scanB) {
    return (
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center py-6 text-xs font-mono text-cream-muted space-y-1">
        <div className="font-bold text-cream">Two-Scan Comparative Analysis</div>
        <p>Complete at least two security evaluations to compare differential findings and posture deltas.</p>
      </div>
    );
  }

  // Findings matching each scan
  const findingsA = findings.filter((f) => f.scan_id === scanA.id);
  const findingsB = findings.filter((f) => f.scan_id === scanB.id);

  const catSetA = new Set(findingsA.map((f) => f.category));
  const catSetB = new Set(findingsB.map((f) => f.category));

  const blockedCount = backendComparison?.comparison_summary?.vulnerability_blocked_in_protected ??
    findingsA.filter((fa) => !catSetB.has(fa.category)).length;

  const persistentCount = backendComparison?.comparison_summary?.vulnerable_in_both ??
    findingsB.filter((fb) => catSetA.has(fb.category)).length;

  const newCount = backendComparison?.comparison_summary?.vulnerability_only_in_protected ??
    findingsB.filter((fb) => !catSetA.has(fb.category)).length;

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
            Compare adversarial security posture between baseline and hardened evaluation runs
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <select
            value={scanAId ?? ''}
            onChange={(e) => setScanAId(Number(e.target.value))}
            className="p-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-cream"
          >
            {completedScans.map((s) => (
              <option key={s.id} value={s.id}>
                Baseline: Scan #{s.id} ({s.agent_id ? `Agent #${s.agent_id}` : 'Mock'})
              </option>
            ))}
          </select>

          <ArrowRight className="w-3.5 h-3.5 text-cream-muted" />

          <select
            value={scanBId ?? ''}
            onChange={(e) => setScanBId(Number(e.target.value))}
            className="p-1.5 rounded-lg bg-navy-950 border border-[#1A2E5A] text-cream"
          >
            {completedScans.map((s) => (
              <option key={s.id} value={s.id}>
                Target: Scan #{s.id} ({s.agent_id ? `Agent #${s.agent_id}` : 'Mock'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg bg-navy-950 border border-severity-low/30 space-y-1">
          <div className="text-[11px] font-mono text-severity-low uppercase">
            Attacks Mitigated
          </div>
          <div className="text-2xl font-mono font-bold text-severity-low">
            +{blockedCount}
          </div>
          <div className="text-[10px] font-mono text-cream-muted">
            Vulnerabilities blocked in hardened configuration
          </div>
        </div>

        <div className="p-4 rounded-lg bg-navy-950 border border-severity-critical/30 space-y-1">
          <div className="text-[11px] font-mono text-severity-critical uppercase">
            Persistent Exposures
          </div>
          <div className="text-2xl font-mono font-bold text-severity-critical">
            {persistentCount}
          </div>
          <div className="text-[10px] font-mono text-cream-muted">
            Vulnerable across both agent configurations
          </div>
        </div>

        <div className="p-4 rounded-lg bg-navy-950 border border-[#1A2E5A] space-y-1">
          <div className="text-[11px] font-mono text-cream-muted uppercase">
            New Anomalies
          </div>
          <div className="text-2xl font-mono font-bold text-cream">
            {newCount}
          </div>
          <div className="text-[10px] font-mono text-cream-muted">
            Present only in target evaluation
          </div>
        </div>
      </div>

      {/* Eight-Vector Comparison Table */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-cream-muted uppercase tracking-wider">
          Attack Vector Outcome Differential
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#1A2E5A] bg-navy-950">
          <table className="w-full text-xs font-mono">
            <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">Attack Vector</th>
                <th className="py-2.5 px-3 text-center font-semibold">Baseline Outcome</th>
                <th className="py-2.5 px-3 text-center font-semibold">Target Outcome</th>
                <th className="py-2.5 px-3 text-center font-semibold">Differential Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E5A]">
              {ALL_ATTACK_CATEGORIES.map((cat) => {
                const vulnInA = catSetA.has(cat);
                const vulnInB = catSetB.has(cat);

                const backendComp = backendComparison?.attack_comparisons?.find((ac) => ac.category === cat);

                let statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-navy-900 text-cream-muted border border-[#1A2E5A]">
                    Inconclusive / No delta
                  </span>
                );

                if (backendComp?.outcome === 'vulnerability_blocked_in_protected' || (vulnInA && !vulnInB)) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-severity-low/15 text-severity-low border border-severity-low/30">
                      <ShieldCheck className="w-3 h-3" /> Mitigated in Target
                    </span>
                  );
                } else if (backendComp?.outcome === 'vulnerable_in_both' || (vulnInA && vulnInB)) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-severity-critical/15 text-severity-critical border border-severity-critical/30">
                      <ShieldAlert className="w-3 h-3" /> Vulnerable in Both
                    </span>
                  );
                } else if (!vulnInA && !vulnInB) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-navy-900 text-severity-low border border-[#1A2E5A]">
                      <CheckCircle2 className="w-3 h-3" /> Clean in Both
                    </span>
                  );
                }

                return (
                  <tr key={cat} className="hover:bg-navy-850/50 transition-colors">
                    <td className="py-3 px-4 text-cream font-medium">
                      {ATTACK_CATEGORY_LABELS[cat] || cat}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {vulnInA ? (
                        <span className="text-severity-critical font-bold">VULNERABLE</span>
                      ) : (
                        <span className="text-severity-low font-bold">BLOCKED / SECURE</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {vulnInB ? (
                        <span className="text-severity-critical font-bold">VULNERABLE</span>
                      ) : (
                        <span className="text-severity-low font-bold">BLOCKED / SECURE</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {statusBadge}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
