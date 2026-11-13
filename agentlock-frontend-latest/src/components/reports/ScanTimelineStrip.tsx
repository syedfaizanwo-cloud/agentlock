'use client';

import React from 'react';
import { Scan, Finding, SeverityLevel } from '../../types/api';
import { getScanTimeline, ScanTimelineMark, SEVERITY_COLORS } from '../../lib/chart-data';
import { Clock, ShieldCheck, ShieldAlert, ChevronRight } from 'lucide-react';

interface ScanTimelineStripProps {
  scans: Scan[];
  findings?: Finding[];
  selectedScanId?: string | null;
  onSelectScan?: (scanId: string) => void;
}

export const ScanTimelineStrip: React.FC<ScanTimelineStripProps> = ({
  scans = [],
  findings = [],
  selectedScanId,
  onSelectScan,
}) => {
  const marks = getScanTimeline(scans, findings);

  if (marks.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center py-6 text-xs font-mono text-cream-muted">
        No evaluation scans recorded yet.
      </div>
    );
  }

  const getMarkColor = (sev: SeverityLevel | 'none') => {
    if (sev === 'none') return '#34D399';
    return SEVERITY_COLORS[sev] || '#FF6F59';
  };

  return (
    <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1A2E5A]">
        <div>
          <h3 className="text-sm font-sans font-bold text-cream">
            Scan History Timeline
          </h3>
          <p className="text-xs text-cream-muted mt-0.5 font-sans">
            Chronological evaluation sequence colored by worst severity detected
          </p>
        </div>
        <span className="text-xs font-mono text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30">
          {marks.length} runs
        </span>
      </div>

      {/* Horizontal Timeline Strip */}
      <div className="relative overflow-x-auto py-2">
        <div className="flex items-center gap-3 min-w-max pb-2">
          {marks.map((mark, idx) => {
            const isSelected = selectedScanId === mark.scanId;
            const markColor = getMarkColor(mark.worstSeverity);

            return (
              <button
                key={mark.scanId}
                type="button"
                onClick={() => onSelectScan?.(mark.scanId)}
                className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between w-44 h-24 ${
                  isSelected
                    ? 'bg-navy-850 border-coral ring-1 ring-coral text-cream'
                    : 'bg-navy-950 border-[#1A2E5A] hover:border-coral/50 text-cream-muted hover:text-cream'
                }`}
                title={`Scan ${mark.scanId}: ${mark.findingsCount} findings (${mark.worstSeverity})`}
              >
                {/* Top: Date and status dot */}
                <div className="flex items-center justify-between w-full text-[11px] font-mono">
                  <span>{mark.dateLabel}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: markColor }}
                  />
                </div>

                {/* Middle: Agent name */}
                <div className="font-bold text-xs text-cream truncate w-full">
                  {mark.agentName}
                </div>

                {/* Bottom: Vulnerability count */}
                <div className="flex items-center justify-between w-full text-[10px] font-mono pt-1.5 border-t border-[#1A2E5A]/40">
                  <span className="text-coral font-bold">{mark.findingsCount} findings</span>
                  <span className="uppercase text-cream-muted">{mark.worstSeverity}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-[#1A2E5A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-cream-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-severity-critical" /> Critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-severity-high" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-severity-low" /> Clean / Low
          </span>
        </div>
        <span>Click any run to view findings & audit report</span>
      </div>
    </div>
  );
};
