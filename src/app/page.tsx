'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from '../components/navigation/TopBar';
import { ScannerHero } from '../components/hero/ScannerHero';
import { MetricTile } from '../components/dashboard/MetricTile';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { AnalyticsSection } from '../components/analytics/AnalyticsSection';
import { FilterState } from '../components/analytics/DashboardFilters';
import { AgentManagementView } from '../components/agents/AgentManagementView';
import { SecurityScanSection } from '../components/scan/SecurityScanSection';
import { VulnerabilityResultsSection } from '../components/results/VulnerabilityResultsSection';
import { ReportsSection } from '../components/reports/ReportsSection';
import { FAQSection } from '../components/faq/FAQSection';
import { SiteFooter } from '../components/layout/SiteFooter';
import { ShieldZoomIntro } from '../components/intro/ShieldZoomIntro';
import { api } from '../lib/api-client';
import { getRealSparkline } from '../lib/chart-data';
import { Agent, Scan, DashboardStats, RegisterAgentPayload, Finding } from '../types/api';
import { Bot, Activity, ShieldAlert, AlertTriangle } from 'lucide-react';

const SECTIONS = ['top', 'overview', 'analytics', 'agents', 'scan', 'results', 'reports', 'faq'];

export default function HomePage() {
  const [activeSectionId, setActiveSectionId] = useState('top');
  const [backendOnline, setBackendOnline] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  // Real data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [isLoadingFindings, setIsLoadingFindings] = useState(false);

  // Selected agent for scanner prefill
  const [selectedAgentForScan, setSelectedAgentForScan] = useState<Agent | null>(null);

  // Active scan tracking
  const [activeScan, setActiveScan] = useState<Scan | null>(null);

  // Shared interactive filter state across Analytics and Results
  const [sharedFilters, setSharedFilters] = useState<FilterState>({
    agentId: 'ALL',
    category: 'ALL',
    severity: 'ALL',
  });

  // Handler to fetch findings for a specific scan and navigate to #results
  const handleSelectScan = useCallback(async (scanId: string | number) => {
    setIsLoadingFindings(true);
    try {
      const res = await api.getScanFindings(Number(scanId));
      setFindings(res);
      const resultsEl = document.getElementById('results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#results');
      }
    } catch {
      // Keep existing findings if lookup fails
    } finally {
      setIsLoadingFindings(false);
    }
  }, []);

  // Parallel data loading & backend health check (Phase 2 Performance)
  const refreshData = useCallback(async () => {
    setIsLoadingStats(true);
    setIsLoadingAgents(true);

    const [connResult, statsResult, agentsResult, scansResult] = await Promise.allSettled([
      api.checkConnection(),
      api.getDashboardStats(),
      api.getAgents(),
      api.getScans(),
    ]);

    // Backend connectivity
    if (connResult.status === 'fulfilled') {
      setBackendOnline(connResult.value.ok);
      setLatencyMs(connResult.value.latencyMs);
    } else {
      setBackendOnline(false);
    }

    // Dashboard stats
    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value);
    }
    setIsLoadingStats(false);

    // Agents
    if (agentsResult.status === 'fulfilled') {
      setAgents(agentsResult.value);
    }
    setIsLoadingAgents(false);

    // Scans & Findings
    if (scansResult.status === 'fulfilled') {
      const sc = scansResult.value;
      setScans(sc);

      // Load findings for latest completed scan if not yet loaded
      if (sc.length > 0) {
        const latestCompleted = sc.find((s) => s.status === 'completed') || sc[0];
        if (latestCompleted) {
          try {
            const f = await api.getScanFindings(latestCompleted.id);
            setFindings((prev) => (prev.length === 0 ? f : prev));
          } catch {
            // Keep empty findings if unavailable
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Scroll-spy using IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Agent registration handler
  const handleRegisterAgent = async (payload: RegisterAgentPayload) => {
    try {
      const created = await api.registerAgent(payload);
      setAgents((prev) => [created, ...prev]);
      api.getDashboardStats().then((s) => setStats(s)).catch(() => {});
    } catch (err) {
      throw err;
    }
  };

  const handleSelectAgentForScan = (agent: Agent) => {
    setSelectedAgentForScan(agent);
    const scanEl = document.getElementById('scan');
    if (scanEl) {
      scanEl.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', '#scan');
    }
  };

  const handleScanCompleted = useCallback(
    async (completedScan: Scan) => {
      setActiveScan(completedScan);
      // Concurrently update scan results, stats, and scan list
      const [findingsRes] = await Promise.allSettled([
        api.getScanFindings(completedScan.id),
        api.getDashboardStats().then((s) => setStats(s)),
        api.getScans().then((sc) => setScans(sc)),
      ]);

      if (findingsRes.status === 'fulfilled') {
        setFindings(findingsRes.value);
        const resultsEl = document.getElementById('results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState(null, '', '#results');
        }
      }
    },
    []
  );

  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      {/* Cinematic Opening Camera-Zoom Intro */}
      <ShieldZoomIntro />

      {/* Fixed TopBar with scroll-spy & connection monitor */}
      <TopBar
        activeSectionId={activeSectionId}
        isScanning={activeScan !== null && activeScan.status === 'running'}
        backendOnline={backendOnline}
        latencyMs={latencyMs}
        counts={{
          agents: agents.length,
          reports: scans.length,
        }}
        onRefreshHealth={refreshData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-28">
        {/* Section 1: Hero #top */}
        <ScannerHero
          backendOnline={backendOnline}
          latencyMs={latencyMs}
          onStartScan={() => {
            const el = document.getElementById('scan');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onHowItWorks={() => {
            const el = document.getElementById('overview');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Section 2: Overview #overview */}
        <section id="overview" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#12234A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                Platform Overview
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Real-time security telemetry and confirmed vulnerabilities across tested agents.
              </p>
            </div>
          </div>

          {/* 4 Metric Tiles with Real Sparklines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile
              title="Registered Agents"
              value={isLoadingStats ? '-' : stats?.agents?.total ?? agents.length}
              subtitle="Active target inventory"
              icon={Bot}
              targetSectionId="#agents"
            />

            <MetricTile
              title="Total Scans"
              value={isLoadingStats ? '-' : stats?.scans?.total ?? scans.length}
              subtitle="Adversarial evaluations"
              icon={Activity}
              sparklineData={getRealSparkline(scans)}
              targetSectionId="#reports"
            />

            <MetricTile
              title="Confirmed Vulns"
              value={isLoadingStats ? '-' : stats?.results?.confirmed_vulnerabilities ?? 0}
              subtitle="Verified security flaws"
              icon={AlertTriangle}
              sparklineData={getRealSparkline(scans)}
              targetSectionId="#results"
            />

            <MetricTile
              title="Critical Findings"
              value={isLoadingStats ? '-' : stats?.results?.by_severity?.critical ?? 0}
              subtitle="Immediate action required"
              icon={ShieldAlert}
              sparklineData={getRealSparkline(scans)}
              targetSectionId="#results"
              badge="CRITICAL"
            />
          </div>

          {/* Recent Activity Feed */}
          <div className="pt-2">
            <h3 className="text-xs font-mono text-[#C8C0AC] mb-3">
              Recent Scan Executions
            </h3>
            <RecentActivityFeed
              scans={scans}
              onSelectScan={handleSelectScan}
              onViewAll={() => {
                const reportsEl = document.getElementById('reports');
                if (reportsEl) reportsEl.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        </section>

        {/* Section 3: Analytics #analytics */}
        <section id="analytics" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                Vulnerability Analytics
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Deterministic breakdown by category, severity distribution, and historical velocity.
              </p>
            </div>
          </div>

          <AnalyticsSection
            stats={stats}
            scans={scans}
            agents={agents}
            findings={findings}
            onSelectAgentForScan={handleSelectAgentForScan}
            filters={sharedFilters}
            onFilterChange={setSharedFilters}
          />
        </section>

        {/* Section 4: Agents #agents */}
        <section id="agents" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                Agent Management
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Register target endpoints and verify active communication status.
              </p>
            </div>
          </div>

          <AgentManagementView
            agents={agents}
            findings={findings}
            scans={scans}
            onRegisterAgent={handleRegisterAgent}
            onSelectAgentForScan={handleSelectAgentForScan}
            isLoading={isLoadingAgents}
          />
        </section>

        {/* Section 5: Scan #scan */}
        <section id="scan" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                Security Scanning
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Select attack categories and launch automated adversarial evaluations.
              </p>
            </div>
          </div>

          <SecurityScanSection
            agents={agents}
            selectedAgent={selectedAgentForScan}
            onSelectAgent={setSelectedAgentForScan}
            onScanCompleted={handleScanCompleted}
            activeScan={activeScan}
            setActiveScan={setActiveScan}
          />
        </section>

        {/* Section 6: Results #results */}
        <section id="results" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                Vulnerability Results
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Detailed findings with attack payloads, raw evidence, and code remediation.
              </p>
            </div>
          </div>

          <VulnerabilityResultsSection
            findings={findings}
            isLoading={isLoadingFindings}
            selectedCategory={sharedFilters.category}
            selectedSeverity={sharedFilters.severity}
            onClearCategoryFilter={() =>
              setSharedFilters((prev) => ({ ...prev, category: 'ALL' }))
            }
            onClearSeverityFilter={() =>
              setSharedFilters((prev) => ({ ...prev, severity: 'ALL' }))
            }
          />
        </section>

        {/* Section 7: Reports #reports */}
        <section id="reports" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                Audit Reports
              </h2>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Cryptographically verifiable scan records and downloadable executive PDF summaries.
              </p>
            </div>
          </div>

          <ReportsSection
            scans={scans}
            findings={findings}
            onSelectScan={handleSelectScan}
            onRefresh={refreshData}
          />
        </section>

        {/* Section 8: FAQ #faq */}
        <FAQSection />
      </div>

      <SiteFooter />
    </div>
  );
}
