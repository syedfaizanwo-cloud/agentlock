'use client';

import React from 'react';
import { Scan, Finding } from '../../types/api';
import { getCategoryProgress } from '../../lib/chart-data';
import { Loader2, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react';

interface ScanProgressVisualizerProps {
  scan: Scan;
  recentFindings?: Finding[];
}

export const ScanProgressVisualizer: React.FC<ScanProgressVisualizerProps> = ({
  scan,
  recentFindings = [],
}) => {
  const segments = getCategoryProgress(scan, scan.attack_categories);
  const totalFindings = recentFindings.length;
  const numCategories = scan.attack_categories?.length || 8;

  return (
    <div className="p-6 rounded-xl bg-navy-900 border border-coral/40 space-y-6">
      {/* Top Status Header & Findings Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2E5A]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {scan.status === 'running' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-medium/15 text-severity-medium border border-severity-medium/30">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating
              </span>
            ) : scan.status === 'completed' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-low/15 text-severity-low border border-severity-low/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-severity-critical/15 text-severity-critical border border-severity-critical/30">
                <ShieldAlert className="w-3.5 h-3.5" /> {scan.status}
              </span>
            )}
            <span className="font-mono text-xs text-cream font-bold">
              Scan #{scan.id} {scan.agent_id ? `(Agent #${scan.agent_id})` : ''}
            </span>
          </div>

          <p className="text-xs text-cream-muted font-sans">
            Adversarial red teaming evaluation across {numCategories} attack vector suites
          </p>
        </div>

        {/* Findings Counter */}
        <div className="flex items-center gap-4 bg-navy-950 px-4 py-2 rounded-lg border border-[#1A2E5A]">
          <div className="text-right">
            <div className="text-[10px] font-mono text-cream-muted uppercase tracking-wider">
              Confirmed Findings
            </div>
            <div className="text-xl font-mono font-bold text-coral transition-transform duration-300">
              {totalFindings}
            </div>
          </div>
          <ShieldAlert className="w-6 h-6 text-coral shrink-0" />
        </div>
      </div>

      {/* Segmented Status by Test Category */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-cream-muted">
          <span>Vector evaluation status</span>
          <span>{scan.status === 'completed' ? '100% complete' : scan.status === 'running' ? 'Running' : 'Queued'}</span>
        </div>

        {/* Multi-segment track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {segments.map((seg) => (
            <div
              key={seg.category}
              className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-cream truncate" title={seg.label}>
                  {seg.label}
                </span>
                <span
                  className={
                    seg.isCompleted
                      ? 'text-severity-low font-bold'
                      : seg.isRunning
                      ? 'text-coral font-bold'
                      : 'text-cream-muted'
                  }
                >
                  {seg.isCompleted ? 'Pass/Done' : seg.isRunning ? 'Testing' : 'Pending'}
                </span>
              </div>

              {/* Status track */}
              <div className="w-full h-1.5 rounded-full bg-navy-900 overflow-hidden border border-[#1A2E5A]/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    seg.isCompleted
                      ? 'bg-severity-low w-full'
                      : seg.isRunning
                      ? 'bg-coral w-2/3 animate-pulse'
                      : 'bg-navy-850 w-0'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Findings Stream Feed */}
      {recentFindings.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#1A2E5A]">
          <div className="text-xs font-mono text-cream-muted flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-coral" />
            <span>Vulnerability telemetry</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {recentFindings.slice(0, 5).map((f) => (
              <div
                key={f.id}
                className="p-2.5 rounded-lg bg-navy-950 border border-[#1A2E5A] flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      f.severity === 'critical'
                        ? 'bg-severity-critical'
                        : f.severity === 'high'
                        ? 'bg-severity-high'
                        : 'bg-severity-medium'
                    }`}
                  />
                  <span className="font-bold text-cream truncate">{f.title}</span>
                </div>
                <span className="text-[11px] text-cream-muted uppercase shrink-0">
                  {f.category.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
