'use client';

import React, { useState } from 'react';
import { Scan } from '../../types/api';
import { ActionMonitorTable } from '../actions/ActionMonitorTable';
import { api } from '../../lib/api-client';
import { FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';

interface ReportsSectionProps {
  scans: Scan[];
  onSelectScan?: (scanId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  scans = [],
  onSelectScan,
  onRefresh,
  isLoading = false,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadPdf = async (scanId: string) => {
    setDownloadingId(scanId);
    setDownloadError(null);
    try {
      const blob = await api.downloadReportPdf(scanId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentlock-report-${scanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccessId(scanId);
      setTimeout(() => setDownloadSuccessId(null), 3000);
    } catch (err: any) {
      setDownloadError(err?.message || 'Failed to download PDF report');
    } finally {
      setDownloadingId(null);
    }
  };

  const completedScans = scans.filter((s) => s.status === 'completed');
  const totalFindings = scans.reduce((acc, s) => acc + (s.vulnerabilities_found || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Header Card */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-[#FF6F59]/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC]">
            Audit Dossier Summary
          </div>
          <div className="text-lg font-bold font-sans text-[#F5EDDC]">
            {completedScans.length} Completed Scans &bull; {totalFindings} Total Vulnerabilities Detected
          </div>
        </div>

        {downloadError && (
          <div className="text-xs font-mono text-[#E11D48] px-3 py-1.5 rounded-lg bg-[#E11D48]/10 border border-[#E11D48]/30">
            {downloadError}
          </div>
        )}
      </div>

      {/* Scans Table */}
      <ActionMonitorTable
        scans={scans}
        onSelectScan={onSelectScan}
        onDownloadReport={handleDownloadPdf}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
    </div>
  );
};
