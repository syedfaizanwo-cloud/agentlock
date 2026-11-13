'use client';

import React, { useState } from 'react';
import { Scan, Finding, User } from '../../types/api';
import { generateClientSidePdfReport } from '../../lib/pdf-report-generator';
import { api } from '../../lib/api-client';
import { getSeverityCounts, getCategoryCounts } from '../../lib/chart-data';
import { maskSensitiveEvidence } from '../results/FindingStepDiagram';
import {
  X,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  FileCode,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface ScanReportModalProps {
  scan: Scan;
  findings: Finding[];
  currentUser?: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScanReportModal: React.FC<ScanReportModalProps> = ({
  scan,
  findings = [],
  currentUser,
  isOpen,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const severityCounts = getSeverityCounts(findings);
  const categoryCounts = getCategoryCounts(findings);

  const criticalCount = severityCounts.slices.find((s) => s.key === 'critical')?.count || 0;
  const highCount = severityCounts.slices.find((s) => s.key === 'high')?.count || 0;

  const executiveSummary =
    `AgentLock completed automated adversarial security testing against agent "${scan.agent_name || scan.agent_id}". ` +
    `A total of ${findings.length} confirmed vulnerabilities were identified across ${scan.categories.length} evaluated attack categories. ` +
    `The evaluation revealed ${criticalCount} critical-severity exploits and ${highCount} high-severity findings requiring immediate intervention. ` +
    `Immediate remediation is recommended prior to exposing this agentic workflow to untrusted external inputs.`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      let blob: Blob;
      try {
        // Try backend PDF streaming endpoint first
        blob = await api.downloadReportPdf(scan.id);
      } catch {
        // Fall back to client-side vector jsPDF generation
        blob = await generateClientSidePdfReport({
          scan,
          findings,
          currentUser,
        });
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeAgentName = (scan.agent_name || scan.agent_id).toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `agentlock-report-${safeAgentName}-${scan.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setDownloadError(err?.message || 'Failed to generate PDF audit report.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-navy-900 border border-[#1A2E5A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#1A2E5A] bg-navy-950 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-xs font-mono text-coral font-bold uppercase tracking-wider">
              Audit Dossier
            </div>
            <h3 className="text-lg font-bold font-sans text-cream">
              Security Evaluation Report: {scan.agent_name || scan.agent_id}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] hover:border-coral text-cream text-xs font-mono transition-colors"
              title="Copy executive summary to clipboard"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-severity-low" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'Copied' : 'Copy summary'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-coral hover:bg-coral-hover text-navy-950 text-xs font-mono font-bold transition-colors disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-navy-850 border border-[#1A2E5A] hover:border-coral text-cream-muted hover:text-cream transition-colors ml-2"
              aria-label="Close report preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="px-6 py-2 bg-severity-critical/10 border-b border-severity-critical/30 text-severity-critical text-xs font-mono">
            {downloadError}
          </div>
        )}

        {/* Modal Body: Report Preview */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 text-cream font-sans">
          {/* Cover Metadata */}
          <div className="p-5 rounded-xl bg-navy-950 border border-[#1A2E5A] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <div className="text-cream-muted">Target Agent</div>
              <div className="font-bold text-cream mt-0.5">{scan.agent_name || scan.agent_id}</div>
            </div>
            <div>
              <div className="text-cream-muted">Scan ID</div>
              <div className="font-bold text-coral mt-0.5 truncate">{scan.id}</div>
            </div>
            <div>
              <div className="text-cream-muted">Execution Date</div>
              <div className="font-bold text-cream mt-0.5">
                {new Date(scan.started_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-cream-muted">Auditor</div>
              <div className="font-bold text-cream mt-0.5 truncate">
                {currentUser?.email || 'Security Operator'}
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-mono font-bold text-cream uppercase tracking-wider border-b border-[#1A2E5A] pb-2">
              1. Executive Summary
            </h4>
            <p className="text-sm text-cream-soft leading-relaxed bg-navy-950 p-4 rounded-xl border border-[#1A2E5A]">
              {executiveSummary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] text-center">
                <div className="text-[10px] font-mono text-cream-muted">TOTAL FINDINGS</div>
                <div className="text-xl font-mono font-bold text-coral mt-1">{findings.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-severity-critical/30 text-center">
                <div className="text-[10px] font-mono text-severity-critical">CRITICAL</div>
                <div className="text-xl font-mono font-bold text-severity-critical mt-1">{criticalCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-severity-high/30 text-center">
                <div className="text-[10px] font-mono text-severity-high">HIGH</div>
                <div className="text-xl font-mono font-bold text-severity-high mt-1">{highCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-950 border border-severity-low/30 text-center">
                <div className="text-[10px] font-mono text-severity-low">VECTORS TESTED</div>
                <div className="text-xl font-mono font-bold text-severity-low mt-1">{scan.categories.length}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Vector Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-mono font-bold text-cream uppercase tracking-wider border-b border-[#1A2E5A] pb-2">
              2. Attack Vector Analysis
            </h4>
            <div className="space-y-2">
              {categoryCounts.items.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] flex items-center justify-between gap-4 text-xs font-mono"
                >
                  <span className="font-bold text-cream">{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-coral">{cat.count} confirmed</span>
                    <span className="text-cream-muted">({cat.share}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Findings List */}
          <div className="space-y-4">
            <h4 className="text-sm font-mono font-bold text-cream uppercase tracking-wider border-b border-[#1A2E5A] pb-2">
              3. Confirmed Vulnerability Details ({findings.length})
            </h4>

            {findings.length === 0 ? (
              <div className="p-6 rounded-xl bg-navy-950 border border-[#1A2E5A] text-center text-xs font-mono text-cream-muted">
                Zero security findings recorded for this evaluation.
              </div>
            ) : (
              <div className="space-y-3">
                {findings.map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-xl bg-navy-950 border border-[#1A2E5A] space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-coral font-bold">#{idx + 1}</span>
                        <span className="font-bold text-cream text-sm">{f.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold text-coral border border-coral/30">
                        {f.severity}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-navy-900 border border-[#1A2E5A] font-mono text-cream-muted">
                      <div className="text-coral font-bold mb-1">Payload:</div>
                      <div className="text-cream break-all">{f.attack_prompt}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-navy-900 border border-[#1A2E5A] font-mono text-cream-muted">
                      <div className="text-severity-medium font-bold mb-1">Evidence:</div>
                      <div className="text-cream-soft break-all">{maskSensitiveEvidence(f.evidence)}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-navy-900 border border-[#1A2E5A] text-cream-soft">
                      <div className="text-severity-low font-mono font-bold mb-1">Remediation:</div>
                      <div>{f.remediation}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Methodology & Disclaimer */}
          <div className="p-5 rounded-xl bg-navy-950 border border-[#1A2E5A] text-xs font-mono text-cream-muted space-y-2">
            <div className="font-bold text-cream uppercase">4. Methodology & Disclaimer</div>
            <p>
              Evaluation executed via AgentLock automated red teaming harness targeting Prompt Injection,
              Data Leakage, Tool Abuse, and Memory Poisoning. Results reflect target model security posture
              at the time of execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
