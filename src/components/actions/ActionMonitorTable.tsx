'use client';

import React, { useState } from 'react';
import { Scan } from '../../types/api';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Download,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface ActionMonitorTableProps {
  scans: Scan[];
  onSelectScan?: (scanId: string) => void;
  onDownloadReport?: (scanId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ActionMonitorTable: React.FC<ActionMonitorTableProps> = ({
  scans = [],
  onSelectScan,
  onDownloadReport,
  onRefresh,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      (scan.agent_name && scan.agent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      scan.agent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Scan['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30">
            <ShieldCheck className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/30">
            <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/30">
            <ShieldAlert className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#12234A] text-[#C8C0AC] border border-[#12234A]">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C8C0AC]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scans by agent or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#060D1F] border border-[#12234A] text-xs font-mono text-[#F5EDDC] placeholder-[#C8C0AC]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6F59]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#060D1F] border border-[#12234A] text-xs font-mono text-[#F5EDDC] focus:outline-none focus:ring-2 focus:ring-[#FF6F59]"
          >
            <option value="ALL">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh scan history"
              className="p-2 rounded-xl bg-[#0A1633] border border-[#12234A] text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Flat Table (No per-row neumorphic shadows per spec) */}
      <div className="overflow-x-auto rounded-2xl border border-[#12234A] bg-[#0A1633]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#060D1F] border-b border-[#12234A] text-[#C8C0AC] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Scan ID</th>
              <th className="py-3 px-4">Target Agent</th>
              <th className="py-3 px-4">Test Categories</th>
              <th className="py-3 px-4">Findings</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Started At</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#12234A] text-[#F5EDDC]">
            {filteredScans.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#C8C0AC]/70">
                  No scan records matching your filter.
                </td>
              </tr>
            ) : (
              filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-[#12234A]/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#FF6F59]">
                    {scan.id.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-4">
                    {scan.agent_name || scan.agent_id}
                  </td>
                  <td className="py-3 px-4 text-[#C8C0AC]">
                    {scan.categories.join(', ')}
                  </td>
                  <td className="py-3 px-4">
                    {typeof scan.vulnerabilities_found === 'number' ? (
                      <span className="font-bold text-[#FF6F59]">
                        {scan.vulnerabilities_found}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(scan.status)}
                  </td>
                  <td className="py-3 px-4 text-[#C8C0AC]">
                    {new Date(scan.started_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {onSelectScan && (
                      <button
                        onClick={() => onSelectScan(scan.id)}
                        className="p-1.5 rounded-lg bg-[#060D1F] border border-[#12234A] hover:border-[#FF6F59] text-[#C8C0AC] hover:text-[#F5EDDC] transition-colors"
                        title="View Results"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDownloadReport && scan.status === 'completed' && (
                      <button
                        onClick={() => onDownloadReport(scan.id)}
                        className="p-1.5 rounded-lg bg-[#060D1F] border border-[#12234A] hover:border-[#FF6F59] text-[#C8C0AC] hover:text-[#F5EDDC] transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
