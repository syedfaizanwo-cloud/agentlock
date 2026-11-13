'use client';

import React, { useState } from 'react';
import { Scan, Finding } from '../../types/api';
import { ActionMonitorTable } from '../actions/ActionMonitorTable';
import { ScanTimelineStrip } from './ScanTimelineStrip';
import { ScanComparisonView } from './ScanComparisonView';
import { ScanReportModal } from './ScanReportModal';
import { api } from '../../lib/api-client';

interface ReportsSectionProps {
  scans: Scan[];
  findings?: Finding[];
  onSelectScan?: (scanId: number | string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  scans = [],
  findings = [],
  onSelectScan,
  onRefresh,
  isLoading = false,
}) => {
  const [reportModalScan, setReportModalScan] = useState<Scan | null>(null);
  const [modalFindings, setModalFindings] = useState<Finding[]>([]);

  const handleOpenReportModal = async (scanId: number) => {
    const targetScan = scans.find((s) => s.id === scanId);
    if (!targetScan) return;

    let scanFindings = findings.filter((f) => f.scan_id === scanId);
    if (scanFindings.length === 0) {
      try {
        scanFindings = await api.getScanFindings(scanId);
      } catch {
        scanFindings = [];
      }
    }

    setModalFindings(scanFindings);
    setReportModalScan(targetScan);
  };

  const completedScans = scans.filter((s) => s.status === 'completed');
  const totalFindings = scans.reduce((acc, s) => acc + (s.attack_categories?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Historical Scan Timeline Strip */}
      <ScanTimelineStrip
        scans={scans}
        findings={findings}
        selectedScanId={reportModalScan?.id}
        onSelectScan={(id) => {
          onSelectScan?.(id);
          handleOpenReportModal(id);
        }}
      />

      {/* 2. Summary Dossier Header */}
      <div className="p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-cream-muted">
            Evaluation dossier summary
          </div>
          <div className="text-base sm:text-lg font-bold font-sans text-cream">
            {completedScans.length} completed evaluations, {totalFindings} total confirmed vulnerabilities
          </div>
        </div>
      </div>

      {/* 3. Two-Scan Comparative Analysis */}
      <ScanComparisonView scans={scans} findings={findings} />

      {/* 4. Complete Audit Records Table */}
      <ActionMonitorTable
        scans={scans}
        onSelectScan={onSelectScan}
        onDownloadReport={handleOpenReportModal}
        onRefresh={onRefresh}
        isLoading={isLoading}
      />

      {/* 5. Comprehensive On-Screen Report Preview & PDF Downloader Modal */}
      {reportModalScan && (
        <ScanReportModal
          scan={reportModalScan}
          findings={modalFindings}
          isOpen={Boolean(reportModalScan)}
          onClose={() => setReportModalScan(null)}
        />
      )}
    </div>
  );
};
