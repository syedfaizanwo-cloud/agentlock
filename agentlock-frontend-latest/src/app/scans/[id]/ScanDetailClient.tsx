'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Breadcrumb } from '../../../components/navigation/Breadcrumb';
import { TopBar } from '../../../components/navigation/TopBar';
import { SiteFooter } from '../../../components/layout/SiteFooter';
import { VulnerabilityResultsSection } from '../../../components/results/VulnerabilityResultsSection';
import { ScanReportModal } from '../../../components/reports/ScanReportModal';
import { generateClientSidePdfReport } from '../../../lib/pdf-report-generator';
import { api } from '../../../lib/api-client';
import { Scan, Finding } from '../../../types/api';
import { ShieldCheck, ShieldAlert, ArrowLeft, Download, Bot, Eye } from 'lucide-react';

interface ScanDetailClientProps {
  scanId: string;
}

export function ScanDetailClient({ scanId }: ScanDetailClientProps) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const numericScanId = Number(scanId);
    const [connRes, scanRes, findingsRes] = await Promise.allSettled([
      api.checkConnection(),
      api.getScan(numericScanId),
      api.getScanFindings(numericScanId),
    ]);

    if (connRes.status === 'fulfilled') {
      setBackendOnline(connRes.value.ok);
      setLatencyMs(connRes.value.latencyMs);
    } else {
      setBackendOnline(false);
    }

    if (scanRes.status === 'fulfilled') {
      setScan(scanRes.value);
    }

    if (findingsRes.status === 'fulfilled') {
      setFindings(findingsRes.value);
    }
    setIsLoading(false);
  }, [scanId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownloadPdf = async () => {
    if (!scan) return;
    setIsDownloadingPdf(true);
    const numericScanId = Number(scanId);
    try {
      let blob: Blob;
      try {
        const report = await api.generateReport(numericScanId);
        blob = await api.downloadReportPdf(report.id);
      } catch {
        blob = await generateClientSidePdfReport({
          scan,
          findings,
        });
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeAgentName = scan.agent_id ? `agent-${scan.agent_id}` : 'agentlock';
      a.download = `agentlock-report-${safeAgentName}-scan-${numericScanId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Handle download failure silently
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      <TopBar
        activeSectionId="results"
        backendOnline={backendOnline}
        latencyMs={latencyMs}
        onRefreshHealth={loadData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        <Breadcrumb
          items={[
            { label: 'Scans', href: '/scans' },
            { label: scanId },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1A2E5A] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/scans"
                className="inline-flex items-center gap-1 text-xs font-mono text-cream-muted hover:text-coral transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Scans</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-cream font-display">
              Scan Results: #{scanId} {scan?.agent_id ? `(Agent #${scan.agent_id})` : ''}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-mono text-cream-muted">
              {scan?.agent_id && (
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-1.5 text-cream hover:text-coral transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-coral" />
                  <span>Agent ID: {scan.agent_id}</span>
                </Link>
              )}
              {scan?.started_at && (
                <span>Started: {new Date(scan.started_at).toLocaleString()}</span>
              )}
              {scan?.status && (
                <span className="capitalize">Status: {scan.status}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              disabled={!scan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-850 text-cream border border-[#1A2E5A] hover:border-coral font-bold text-xs font-mono transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-coral" />
              <span>Preview Report</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || !scan}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-coral hover:bg-coral-hover text-navy-950 font-bold text-xs transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </div>

        <VulnerabilityResultsSection
          findings={findings}
          isLoading={isLoading}
        />
      </div>

      {scan && (
        <ScanReportModal
          scan={scan}
          findings={findings}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      <SiteFooter />
    </div>
  );
}
