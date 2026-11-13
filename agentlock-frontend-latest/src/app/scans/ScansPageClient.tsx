'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SecurityScanSection } from '../../components/scan/SecurityScanSection';
import { RecentActivityFeed } from '../../components/dashboard/RecentActivityFeed';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { TopBar } from '../../components/navigation/TopBar';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { api } from '../../lib/api-client';
import { Agent, Scan } from '../../types/api';
import { Plus } from 'lucide-react';

export function ScansPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedAgentId = searchParams.get('agentId');

  const [agents, setAgents] = useState<Agent[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeScan, setActiveScan] = useState<Scan | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  const loadData = useCallback(async () => {
    const [connRes, agentsRes, scansRes] = await Promise.allSettled([
      api.checkConnection(),
      api.getAgents(),
      api.getScans(),
    ]);

    if (connRes.status === 'fulfilled') {
      setBackendOnline(connRes.value.ok);
      setLatencyMs(connRes.value.latencyMs);
    } else {
      setBackendOnline(false);
    }

    if (agentsRes.status === 'fulfilled') {
      setAgents(agentsRes.value);
      if (requestedAgentId) {
        const found = agentsRes.value.find((a) => a.id === requestedAgentId);
        if (found) setSelectedAgent(found);
      }
    }

    if (scansRes.status === 'fulfilled') {
      setScans(scansRes.value);
    }
  }, [requestedAgentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleScanCompleted = (completedScan: Scan) => {
    setActiveScan(completedScan);
    api.getScans().then((sc) => setScans(sc)).catch(() => {});
    router.push(`/scans/${encodeURIComponent(completedScan.id)}`);
  };

  const handleSelectScan = (scanId: string) => {
    router.push(`/scans/${encodeURIComponent(scanId)}`);
  };

  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      <TopBar
        activeSectionId="scan"
        isScanning={activeScan !== null && activeScan.status === 'running'}
        scanProgress={activeScan?.progress}
        backendOnline={backendOnline}
        latencyMs={latencyMs}
        counts={{
          agents: agents.length,
          reports: scans.length,
        }}
        onRefreshHealth={loadData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        <Breadcrumb items={[{ label: 'Scans', href: '/scans' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A2E5A] pb-5">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-cream font-display">
              Security Scans
            </h1>
            <p className="text-sm text-cream-muted mt-2 font-sans max-w-2xl">
              Configure attack vectors and launch automated adversarial evaluations against your AI agents.
            </p>
          </div>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 border border-[#1A2E5A] hover:border-coral text-xs font-mono text-cream transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-coral" />
            <span>Manage Agents</span>
          </Link>
        </div>

        <SecurityScanSection
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
          onScanCompleted={handleScanCompleted}
          activeScan={activeScan}
          setActiveScan={setActiveScan}
        />

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-sans text-cream">
              Recent Scan Executions
            </h2>
            <Link
              href="/reports"
              className="text-xs font-mono text-coral hover:underline"
            >
              View all audit reports
            </Link>
          </div>

          <RecentActivityFeed
            scans={scans}
            onSelectScan={handleSelectScan}
            onViewAll={() => router.push('/reports')}
          />
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
