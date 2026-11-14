'use client';

import React from 'react';
import { Scan } from '../../types/api';
import { ShieldCheck, ShieldAlert, Clock, Loader2 } from 'lucide-react';

interface RecentActivityFeedProps {
  scans: Scan[];
  onSelectScan?: (scanId: string | number) => void;
  onViewAll?: () => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  scans = [],
  onSelectScan,
  onViewAll,
}) => {
  const getStatusBadge = (status: Scan['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-severity-low/10 text-severity-low border border-severity-low/30">
            <ShieldCheck className="w-3 h-3" /> Completed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-severity-medium/10 text-severity-medium border border-severity-medium/30">
            <Loader2 className="w-3 h-3 animate-spin" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-severity-critical/10 text-severity-critical border border-severity-critical/30">
            <ShieldAlert className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-navy-850 text-cream-muted border border-[#1A2E5A]">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  if (!scans || scans.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center space-y-1">
        <div className="text-xs font-mono text-cream">No recent scans</div>
        <p className="text-xs text-cream-muted">
          Start a security scan to evaluate your agent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scans.slice(0, 5).map((scan) => (
        <div
          key={scan.id}
          onClick={() => onSelectScan?.(scan.id)}
          className="p-4 rounded-lg bg-navy-900 border border-[#1A2E5A] hover:border-coral transition-colors cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cream">
                {scan.agent_id ? `Agent #${scan.agent_id}` : `Scan #${scan.id}`}
              </span>
              {getStatusBadge(scan.status)}
            </div>
            <div className="text-xs font-mono text-cream-muted">
              {new Date(scan.started_at || scan.created_at).toLocaleString()} | Categories: {(scan.attack_categories || []).length} vectors
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-coral/10 border border-coral/30 text-coral">
              {(scan.attack_categories || []).length} tested
            </span>
          </div>
        </div>
      ))}

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-2 text-center text-xs font-mono text-coral hover:underline"
        >
          View all scans
        </button>
      )}
    </div>
  );
};
