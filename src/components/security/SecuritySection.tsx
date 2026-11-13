'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldAlert, Globe, Lock, Activity, HeartPulse } from 'lucide-react';
import { SecurityBento } from '../bento/SecurityBento';
import { SectionInsight } from '../bento/SectionInsight';
import { SourceCards } from './SourceCards';
import { DestinationCards } from './DestinationCards';
import { HardeningChecklist } from './HardeningChecklist';
import { OfflineAgentsPanel } from './OfflineAgentsPanel';
import { apiClient } from '@/lib/api-client';
import {
  Source,
  Destination,
  Heartbeat,
  SecurityControl,
  SecuritySummary,
  DlpFinding,
  EgressBlockedEvent,
} from '@/types/api';
import {
  INITIAL_SOURCES,
  INITIAL_DESTINATIONS,
  INITIAL_HEARTBEATS,
  INITIAL_SECURITY_CONTROLS,
  INITIAL_SECURITY_SUMMARY,
  INITIAL_DLP_FINDINGS,
  INITIAL_EGRESS_BLOCKED,
} from '@/lib/mock-data';

interface SecuritySectionProps {
  onShowToast?: (msg: string, type: 'success' | 'warning' | 'info') => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ onShowToast }) => {
  const [summary, setSummary] = useState<SecuritySummary>(INITIAL_SECURITY_SUMMARY);
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [controls, setControls] = useState<SecurityControl[]>(INITIAL_SECURITY_CONTROLS);
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>(INITIAL_HEARTBEATS);
  const [dlpFindings, setDlpFindings] = useState<DlpFinding[]>(INITIAL_DLP_FINDINGS);
  const [blockedEvents, setBlockedEvents] = useState<EgressBlockedEvent[]>(INITIAL_EGRESS_BLOCKED);
  const [isLoading, setIsLoading] = useState(false);

  const loadAllSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, srcRes, dstRes, ctrlRes, hbRes, dlpRes, egrRes] = await Promise.all([
        apiClient.getSecuritySummary(),
        apiClient.getSources(),
        apiClient.getDestinations(),
        apiClient.getSecurityControls(),
        apiClient.getOfflineAgents(),
        apiClient.getDlpFindings(),
        apiClient.getEgressBlocked(),
      ]);

      setSummary(sumRes.data);
      setSources(srcRes.data);
      setDestinations(dstRes.data);
      setControls(ctrlRes);
      setHeartbeats(hbRes);
      setDlpFindings(dlpRes);
      setBlockedEvents(egrRes);
    } catch (err) {
      console.error('Failed to load security telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSecurityData();
  }, [loadAllSecurityData]);

  const handleAddSource = async (newSrc: Partial<Source>) => {
    await apiClient.createSource(newSrc);
    if (onShowToast) onShowToast('New input source channel registered successfully', 'success');
    await loadAllSecurityData();
  };

  const handleAddDestination = async (newDst: Partial<Destination>) => {
    await apiClient.createDestination(newDst);
    if (onShowToast) onShowToast('New egress allowlist rule configured', 'success');
    await loadAllSecurityData();
  };

  return (
    <section id="security" className="pt-12 scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6CBA8] shadow-[0_0_10px_rgba(230,203,168,0.4)]" />
            <Shield className="w-5 h-5 text-[#E6CBA8]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Source & Destination Security
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8] flex items-center gap-1.5 shadow-[0_0_10px_rgba(230,203,168,0.1)]">
              ZERO-TRUST PERIMETER MESH
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-sans">
            Cryptographic provenance tracking, default-deny egress boundaries, SSRF prevention, outbound DLP scanning, and fail-closed offline agent safeguards.
          </p>
        </div>
      </div>

      {/* Plain-English Insight Line */}
      <SectionInsight
        text="Every input channel is tagged with cryptographic provenance to stop indirect prompt injection, all egress is locked to allowlisted hosts with server-side SSRF and DLP inspection, and offline agents fail-closed automatically."
        badge="PERIMETER SECURITY INSIGHT"
      />

      {/* MagicBento Grid with Charts */}
      <div className="w-full">
        <SecurityBento summary={summary} />
      </div>

      {/* Sub-panels */}
      <div className="space-y-8">
        {/* 1. Inbound Source Security & Indirect Prompt Injection Defense */}
        <div id="security-sources">
          <SourceCards sources={sources} onAddSource={handleAddSource} />
        </div>

        {/* 2. Destination Security, SSRF & DLP */}
        <div id="security-destinations">
          <DestinationCards
            destinations={destinations}
            dlpFindings={dlpFindings}
            blockedEvents={blockedEvents}
            onAddDestination={handleAddDestination}
          />
        </div>

        {/* 3. Secure Environment Hardening Checklist */}
        <div id="security-controls">
          <HardeningChecklist controls={controls} score={summary.hardening_score} />
        </div>

        {/* 4. Offline Agent Protection (Fail-Closed) */}
        <div id="security-offline">
          <OfflineAgentsPanel
            heartbeats={heartbeats}
            onRefresh={loadAllSecurityData}
            onShowToast={onShowToast}
          />
        </div>
      </div>
    </section>
  );
};
