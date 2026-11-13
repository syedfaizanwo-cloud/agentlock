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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-low/10 text-severity-low border border-severity-low/30">
            <ShieldCheck className="w-3 h-3" /> Completed
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-severity-medium/10 text-severity-medium border border-severity-medium/30">
            <Loader2 className="w-3 h-3 animate-spin" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-severity-critical/10 text-severity-critical border border-severity-critical/30">
            <ShieldAlert className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-navy-850 text-cream-muted border border-[#1A2E5A]">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scans by agent or scan ID..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-navy-900 border border-[#1A2E5A] text-xs font-mono text-cream placeholder-cream-muted/50 focus:outline-none focus:border-coral"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-navy-900 border border-[#1A2E5A] text-xs font-mono text-cream focus:outline-none focus:border-coral"
          >
            <option value="ALL">All statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh scans"
              aria-label="Refresh scans"
              className="p-2 rounded-lg bg-navy-900 border border-[#1A2E5A] text-cream-muted hover:text-cream hover:border-coral transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Main Scans Table */}
      {filteredScans.length === 0 ? (
        <div className="p-8 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center space-y-2">
          <div className="text-xs font-mono text-cream">No scans match your criteria</div>
          <p className="text-xs text-cream-muted">
            Execute a scan or clear the active filter to view scan history.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1A2E5A] bg-navy-900">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-navy-850 text-cream-muted border-b border-[#1A2E5A]">
              <tr>
                <th className="py-3 px-4 font-semibold">Target Agent</th>
                <th className="py-3 px-4 font-semibold">Scan ID</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Findings</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2E5A] text-cream">
              {filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-cream">
                    {scan.agent_name || scan.agent_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-cream-muted">
                    {scan.id}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(scan.status)}
                  </td>
                  <td className="py-3 px-4">
                    {typeof scan.vulnerabilities_found === 'number' ? (
                      <span className="font-bold text-coral">
                        {scan.vulnerabilities_found}
                      </span>
                    ) : (
                      <span className="text-cream-muted">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-cream-muted">
                    {new Date(scan.started_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {onSelectScan && (
                      <button
                        onClick={() => onSelectScan(scan.id)}
                        className="p-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] hover:border-coral text-cream-soft hover:text-cream transition-colors"
                        title="View findings"
                        aria-label={`View findings for scan ${scan.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDownloadReport && scan.status === 'completed' && (
                      <button
                        onClick={() => onDownloadReport(scan.id)}
                        className="p-1.5 rounded-lg bg-coral/10 border border-coral/30 hover:bg-coral hover:text-navy-950 text-coral transition-colors"
                        title="Download PDF report"
                        aria-label={`Download PDF report for scan ${scan.id}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
