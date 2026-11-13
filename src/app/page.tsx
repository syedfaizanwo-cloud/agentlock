'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopBar } from '../components/navigation/TopBar';
import { RelayHero } from '../components/relay/RelayHero';
import { StatCard } from '../components/dashboard/StatCard';
import { Sparkline } from '../components/bento/Sparkline';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { AgentManagementView } from '../components/agents/AgentManagementView';
import { SiteFooter } from '../components/layout/SiteFooter';
import { FAQSection } from '../components/faq/FAQSection';
import { MockBadge } from '../components/ui/MockBadge';
import { api, isMockMode } from '../lib/api-client';
import { Agent, Scan, DashboardStats, RegisterAgentPayload } from '../types/api';
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
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Selected agent for scanner prefill
  const [selectedAgentForScan, setSelectedAgentForScan] = useState<Agent | null>(null);

  // Active scan tracking
  const [activeScan, setActiveScan] = useState<Scan | null>(null);

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
        <RelayHero
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

          {/* 4 KPI Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <StatCard
                title="Registered Agents"
                value={isLoadingStats ? '—' : stats?.registered_agents ?? agents.length}
                subtitle="Target inventory"
                icon={Bot}
              />
              <div className="absolute right-4 bottom-3 pointer-events-none">
                <Sparkline data={[1, 1, 2, Math.max(agents.length, 2)]} color="#C8C0AC" />
              </div>
            </div>

            <div className="relative">
              <StatCard
                title="Total Scans"
                value={isLoadingStats ? '—' : stats?.total_scans ?? scans.length}
                subtitle="Evaluations executed"
                icon={Activity}
              />
              <div className="absolute right-4 bottom-3 pointer-events-none">
                <Sparkline data={scans.length > 1 ? scans.map((_, i) => i + 1) : [0, scans.length]} color="#FF6F59" />
              </div>
            </div>

            <div className="relative">
              <StatCard
                title="Confirmed Vulns"
                value={isLoadingStats ? '—' : stats?.confirmed_vulnerabilities ?? 0}
                subtitle="Verified findings"
                icon={AlertTriangle}
              />
              <div className="absolute right-4 bottom-3 pointer-events-none">
                <Sparkline data={getFindingTrend().length > 1 ? getFindingTrend() : [0, stats?.confirmed_vulnerabilities || 0]} color="#FACC15" />
              </div>
            </div>

            <div className="relative">
              <StatCard
                title="Critical Findings"
                value={isLoadingStats ? '—' : stats?.critical_findings ?? 0}
                subtitle="Immediate action required"
                icon={ShieldAlert}
              />
              <div className="absolute right-4 bottom-3 pointer-events-none">
                <Sparkline data={[0, stats?.critical_findings || 0]} color="#E11D48" />
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="pt-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#C8C0AC] mb-3">
              Recent Scan Executions
            </h3>
            <RecentActivityFeed
              scans={scans}
              onSelectScan={(id) => {
                const resultsEl = document.getElementById('results');
                if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
              }}
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

          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-xs font-mono text-[#C8C0AC]">
            No scans yet. Start a scan to see severity data here.
          </div>
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

          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-xs font-mono text-[#C8C0AC]">
            Ready to scan. Select target agent and test vectors to initiate.
          </div>
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

          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-xs font-mono text-[#C8C0AC]">
            No findings to display. Run an adversarial scan to generate findings.
          </div>
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

          <div className="p-8 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] text-center text-xs font-mono text-[#C8C0AC]">
            No report generated yet. Complete a vulnerability scan to generate audit documents.
          </div>
        </section>

        {/* Section 8: FAQ #faq */}
        <FAQSection />
      </main>

      <SiteFooter />
    </div>
  );
}
