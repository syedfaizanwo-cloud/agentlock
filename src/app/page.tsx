'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from '../components/navigation/TopBar';
import { ScannerHero } from '../components/hero/ScannerHero';
import { GlassMetricCard } from '../components/dashboard/GlassMetricCard';
import { Sparkline } from '../components/bento/Sparkline';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { AnalyticsSection } from '../components/analytics/AnalyticsSection';
import { AgentManagementView } from '../components/agents/AgentManagementView';
import { SecurityScanSection } from '../components/scan/SecurityScanSection';
import { VulnerabilityResultsSection } from '../components/results/VulnerabilityResultsSection';
import { ReportsSection } from '../components/reports/ReportsSection';
import { FAQSection } from '../components/faq/FAQSection';
import { SiteFooter } from '../components/layout/SiteFooter';
import { MockBadge } from '../components/ui/MockBadge';
import { api, isMockMode } from '../lib/api-client';
import { Agent, Scan, DashboardStats, RegisterAgentPayload, Finding } from '../types/api';
import { Bot, Activity, ShieldAlert, AlertTriangle } from 'lucide-react';

const SECTIONS = ['top', 'overview', 'analytics', 'agents', 'scan', 'results', 'reports', 'faq'];

export default function HomePage() {
  const [activeSectionId, setActiveSectionId] = useState('top');
  const [backendOnline, setBackendOnline] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  // Real data state (empty initial states, no fake numbers)
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

  // Handler to fetch findings for a specific scan and navigate to #results
  const handleSelectScan = useCallback(async (scanId: string) => {
    setIsLoadingFindings(true);
    try {
      const res = await api.getScanResults(scanId);
      setFindings(res);
      const resultsEl = document.getElementById('results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#results');
      }
    } catch (err) {
      console.warn('Failed to load scan findings:', err);
    } finally {
      setIsLoadingFindings(false);
    }
  }, []);

  // Initial data loading & backend health check
  const refreshData = useCallback(async () => {
    // Check backend health
    try {
      const conn = await api.checkConnection();
      setBackendOnline(conn.ok);
      setLatencyMs(conn.latencyMs);
    } catch {
      setBackendOnline(false);
    }

    // Load stats
    try {
      setIsLoadingStats(true);
      const s = await api.getDashboardStats();
      setStats(s);
    } catch (err) {
      console.warn('Dashboard stats unavailable:', err);
    } finally {
      setIsLoadingStats(false);
    }

    // Load agents
    try {
      setIsLoadingAgents(true);
      const a = await api.getAgents();
      setAgents(a);
    } catch (err) {
      console.warn('Agents list unavailable:', err);
    } finally {
      setIsLoadingAgents(false);
    }

    // Load scans
    try {
      const sc = await api.getScans();
      setScans(sc);

      // If we have completed scans and no findings loaded yet, load the latest completed scan findings
      if (sc.length > 0) {
        const latestCompleted = sc.find((s) => s.status === 'completed') || sc[0];
        if (latestCompleted) {
          try {
            const f = await api.getScanResults(latestCompleted.id);
            setFindings((prev) => (prev.length === 0 ? f : prev));
          } catch {
            // Keep empty findings if unavailable
          }
        }
      }
    } catch (err) {
      console.warn('Scans list unavailable:', err);
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
    await api.registerAgent(payload);
    await refreshData();
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
      await refreshData();
      await handleSelectScan(completedScan.id);
    },
    [refreshData, handleSelectScan]
  );

  // Sparkline data generator from real scan history
  const getFindingTrend = (): number[] => {
    if (!scans || scans.length === 0) return [];
    return scans.map((s) => s.vulnerabilities_found || 0);
  };

  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      {/* Fixed TopBar with scroll-spy & connection monitor */}
      <TopBar
        activeSectionId={activeSectionId}
        isScanning={activeScan !== null && activeScan.status === 'running'}
        scanProgress={activeScan?.progress}
        backendOnline={backendOnline}
        latencyMs={latencyMs}
        counts={{
          agents: agents.length,
          reports: scans.length,
        }}
        onRefreshHealth={refreshData}
      />

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-28">
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
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                  Platform Overview
                </h2>
                {isMockMode && <MockBadge />}
              </div>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Real-time security telemetry and confirmed vulnerabilities across tested agents.
              </p>
            </div>
          </div>

          {/* 4 Premium Glass Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassMetricCard
              title="Registered Agents"
              value={isLoadingStats ? '-' : stats?.registered_agents ?? agents.length}
              subtitle="Active target inventory"
              icon={Bot}
              targetSectionId="#agents"
              sparklineData={[1, 1, 2, Math.max(agents.length, 2)]}
              sparklineColor="#32D6A0"
              accentColor="#32D6A0"
            />

            <GlassMetricCard
              title="Total Scans"
              value={isLoadingStats ? '-' : stats?.total_scans ?? scans.length}
              subtitle="Adversarial evaluations"
              icon={Activity}
              targetSectionId="#reports"
              sparklineData={scans.length > 1 ? scans.map((_, i) => i + 1) : [0, scans.length]}
              sparklineColor="#FF6F59"
              accentColor="#FF6F59"
            />

            <GlassMetricCard
              title="Confirmed Vulns"
              value={isLoadingStats ? '-' : stats?.confirmed_vulnerabilities ?? 0}
              subtitle="Verified security flaws"
              icon={AlertTriangle}
              targetSectionId="#results"
              sparklineData={getFindingTrend().length > 1 ? getFindingTrend() : [0, stats?.confirmed_vulnerabilities || 0]}
              sparklineColor="#FFD43B"
              accentColor="#FFD43B"
            />

            <GlassMetricCard
              title="Critical Findings"
              value={isLoadingStats ? '-' : stats?.critical_findings ?? 0}
              subtitle="Immediate action required"
              icon={ShieldAlert}
              targetSectionId="#results"
              sparklineData={[0, stats?.critical_findings || 0]}
              sparklineColor="#FF3158"
              accentColor="#FF3158"
              badge="CRITICAL"
            />
          </div>

          {/* Recent Activity Feed */}
          <div className="pt-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC] mb-3">
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
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                  Vulnerability Analytics
                </h2>
                {isMockMode && <MockBadge />}
              </div>
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
          />
        </section>

        {/* Section 4: Agents #agents */}
        <section id="agents" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                  Agent Management
                </h2>
                {isMockMode && <MockBadge />}
              </div>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Register target endpoints and verify active communication status.
              </p>
            </div>
          </div>

          <AgentManagementView
            agents={agents}
            onRegisterAgent={handleRegisterAgent}
            onSelectAgentForScan={handleSelectAgentForScan}
            isLoading={isLoadingAgents}
          />
        </section>

        {/* Section 5: Scan #scan */}
        <section id="scan" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                  Security Scanning
                </h2>
                {isMockMode && <MockBadge />}
              </div>
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
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                  Vulnerability Results
                </h2>
                {isMockMode && <MockBadge />}
              </div>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Detailed findings with attack payloads, raw evidence, and code remediation.
              </p>
            </div>
          </div>

          <VulnerabilityResultsSection
            findings={findings}
            isLoading={isLoadingFindings}
          />
        </section>

        {/* Section 7: Reports #reports */}
        <section id="reports" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#12234A]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59]" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5EDDC] font-sans">
                  Audit Reports
                </h2>
                {isMockMode && <MockBadge />}
              </div>
              <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
                Cryptographically verifiable scan records and downloadable executive PDF summaries.
              </p>
            </div>
          </div>

          <ReportsSection
            scans={scans}
            onSelectScan={handleSelectScan}
            onRefresh={refreshData}
          />
        </section>

        {/* Section 8: FAQ #faq */}
        <FAQSection />
      </main>

      <SiteFooter />
    </div>
  );
}
