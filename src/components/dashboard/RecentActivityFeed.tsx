'use client';

import React from 'react';
import { Scan } from '../../types/api';
import { ShieldCheck, ShieldAlert, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface RecentActivityFeedProps {
  scans: Scan[];
  onSelectScan?: (scanId: string) => void;
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30">
            <ShieldCheck className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/30">
            <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/30">
            <ShieldAlert className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#12234A] text-[#C8C0AC] border border-[#12234A]">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  if (!scans || scans.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] text-center space-y-2">
        <div className="text-xs font-mono text-[#C8C0AC]">No recent scan activity</div>
        <p className="text-xs text-[#C8C0AC]/70">
          Initiate an adversarial scan to generate execution history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scans.slice(0, 5).map((scan) => (
        <div
          key={scan.id}
          onClick={() => onSelectScan?.(scan.id)}
          className="p-4 rounded-xl bg-[#0A1633] border border-[#12234A] hover:border-[#FF6F59] transition-all cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#F5EDDC]">
                {scan.agent_name || scan.agent_id}
              </span>
              {getStatusBadge(scan.status)}
            </div>
            <div className="text-[11px] font-mono text-[#C8C0AC]/70">
              {new Date(scan.started_at).toLocaleString()} // {scan.categories.join(', ')}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {typeof scan.vulnerabilities_found === 'number' && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#060D1F] border border-[#12234A] text-[#FF6F59]">
                {scan.vulnerabilities_found} findings
              </span>
            )}
            <ArrowRight className="w-4 h-4 text-[#C8C0AC] hover:text-[#FF6F59] transition-colors" />
          </div>
        </div>
      ))}

      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-2.5 text-center text-xs font-mono text-[#FF6F59] hover:underline"
        >
          View all scans &rarr;
        </button>
      )}
    </div>
  );
};
