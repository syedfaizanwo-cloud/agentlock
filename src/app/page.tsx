'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import FlowingMenu, { FlowingMenuItem } from '../components/FlowingMenu';
import { OpeningLoader } from '../components/intro/OpeningLoader';
import { HamburgerDrawer } from '../components/navigation/HamburgerDrawer';
import { SiteFooter } from '../components/layout/SiteFooter';
import { StickyMobileCta } from '../components/mobile/StickyMobileCta';
import { trackEvent } from '../components/analytics/AnalyticsManager';
import { DevPerfMeter } from '../components/analytics/DevPerfMeter';
import { SplineBackground } from '../components/spline/SplineBackground';
import { ScrollPopProvider, PopSection } from '../components/animation/ScrollPopProvider';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { ContactSection } from '../components/contact/ContactSection';
import { FAQSection } from '../components/faq/FAQSection';
import { LazyViewport } from '../components/layout/LazyViewport';
import dynamic from 'next/dynamic';

const SideRays = dynamic(() => import('../components/SideRays'), { ssr: false });
const AnalyticsManager = dynamic(
  () => import('../components/analytics/AnalyticsManager').then((m) => m.AnalyticsManager),
  { ssr: false }
);

const RelayHero = dynamic(
  () => import('../components/relay/RelayHero').then((m) => m.RelayHero),
  { ssr: false, loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);
const RelayInteractiveSection = dynamic(
  () => import('../components/relay/RelayInteractiveSection').then((m) => m.RelayInteractiveSection),
  { ssr: false, loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);

const ThreatTimelineChart = dynamic(
  () => import('../components/dashboard/ThreatTimelineChart').then((m) => m.ThreatTimelineChart),
  { ssr: false, loading: () => <div className="w-full h-64 rounded-2xl bg-[#0D0D0D] skeleton-shimmer" /> }
);
const ThreatDistributionChart = dynamic(
  () => import('../components/dashboard/ThreatDistributionChart').then((m) => m.ThreatDistributionChart),
  { ssr: false, loading: () => <div className="w-full h-64 rounded-2xl bg-[#0D0D0D] skeleton-shimmer" /> }
);
const AgentRiskBarChart = dynamic(
  () => import('../components/dashboard/AgentRiskBarChart').then((m) => m.AgentRiskBarChart),
  { ssr: false, loading: () => <div className="w-full h-64 rounded-2xl bg-[#0D0D0D] skeleton-shimmer" /> }
);

const ActionMonitorTable = dynamic(
  () => import('../components/actions/ActionMonitorTable').then((m) => m.ActionMonitorTable),
  { ssr: false, loading: () => <div className="w-full h-72 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);
const AgentManagementView = dynamic(
  () => import('../components/agents/AgentManagementView').then((m) => m.AgentManagementView),
  { ssr: false, loading: () => <div className="w-full h-72 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);
const ThreatInvestigationView = dynamic(
  () => import('../components/threats/ThreatInvestigationView').then((m) => m.ThreatInvestigationView),
  { ssr: false, loading: () => <div className="w-full h-72 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);
const ApprovalCenter = dynamic(
  () => import('../components/approvals/ApprovalCenter').then((m) => m.ApprovalCenter),
  { ssr: false, loading: () => <div className="w-full h-72 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);
const AuditExplorer = dynamic(
  () => import('../components/audit/AuditExplorer').then((m) => m.AuditExplorer),
  { ssr: false, loading: () => <div className="w-full h-72 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);
const AttackLab = dynamic(
  () => import('../components/simulations/AttackLab').then((m) => m.AttackLab),
  { ssr: false, loading: () => <div className="w-full h-72 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" /> }
);
const ApiStatusModal = dynamic(
  () => import('../components/api-status/ApiStatusModal').then((m) => m.ApiStatusModal),
  { ssr: false }
);
import { SmoothScrollProvider, smoothScrollTo } from '../components/animation/SmoothScrollProvider';
import { ScrollProgressLine } from '../components/bento/ScrollProgressLine';
import { SplitText } from '../components/animation/SplitText';
import { MagneticButton } from '../components/animation/MagneticButton';
import { SectionInsight } from '../components/bento/SectionInsight';

const TelemetryBento = dynamic(
  () => import('../components/bento/TelemetryBento').then((m) => m.TelemetryBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);
const FleetGovernanceBento = dynamic(
  () => import('../components/bento/FleetGovernanceBento').then((m) => m.FleetGovernanceBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);
const ActionMonitoringBento = dynamic(
  () => import('../components/bento/ActionMonitoringBento').then((m) => m.ActionMonitoringBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);
const ThreatForensicsBento = dynamic(
  () => import('../components/bento/ThreatForensicsBento').then((m) => m.ThreatForensicsBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);
const ApprovalCenterBento = dynamic(
  () => import('../components/bento/ApprovalCenterBento').then((m) => m.ApprovalCenterBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);
const AuditExplorerBento = dynamic(
  () => import('../components/bento/AuditExplorerBento').then((m) => m.AuditExplorerBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);
const AttackSimulationBento = dynamic(
  () => import('../components/bento/AttackSimulationBento').then((m) => m.AttackSimulationBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);
const GatewayApiBento = dynamic(
  () => import('../components/bento/GatewayApiBento').then((m) => m.GatewayApiBento),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);

const SecuritySection = dynamic(
  () => import('../components/security/SecuritySection').then((m) => m.SecuritySection),
  {
    ssr: false,
    loading: () => <div className="w-full h-80 rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4" />,
  }
);



const SearchModal = dynamic(
  () => import('../components/search/SearchModal').then((m) => m.SearchModal),
  { ssr: false }
);

import { StickySectionLabel } from '../components/navigation/StickySectionLabel';
import { FloatingContactButton } from '../components/contact/FloatingContactButton';
import { CopyButton } from '../components/ui/CopyButton';
import { captureUTM } from '../lib/utm';

import { apiClient } from '../lib/api-client';
import {
  DashboardSummary,
  Agent,
  ActionRecord,
  ApprovalRequest,
  AuditLogEntry,
  ThreatDetails,
  ApiStatusState,
  ActionType,
} from '../types/api';
import {
  SIMULATION_SCENARIOS,
  INITIAL_SUMMARY,
  INITIAL_AGENTS,
  INITIAL_ACTIONS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
} from '../lib/mock-data';

import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Shield,
  AlertTriangle,
  Sliders,
  Sparkles,
  ArrowUp,
  Cpu,
  Fingerprint,
  FileCode,
  Terminal,
  Sun,
  Mail,
  ChevronDown,
} from 'lucide-react';

interface SectionHeaderProps {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  count?: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  onOpenMenu?: () => void;
}

function SectionHeader({
  id,
  title,
  subtitle,
  badgeText,
  count,
  icon: Icon = Shield,
  onOpenMenu,
}: SectionHeaderProps) {
  return (
    <div data-reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A2A2A]">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E6CBA8] shadow-[0_0_10px_rgba(230,203,168,0.4)]" />
          <Icon className="w-5 h-5 text-[#E6CBA8]" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            <SplitText>{title}</SplitText>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8] flex items-center gap-1.5 shadow-[0_0_10px_rgba(230,203,168,0.1)]">
            {badgeText}
            {count !== undefined && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E6CBA8] text-[#0A0A0A] text-[10px] font-bold font-mono">
                {count}
              </span>
            )}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-sans">{subtitle}</p>
      </div>

      <button
        onClick={onOpenMenu}
        type="button"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-[#BDBDBD] hover:text-white bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#E6CBA8] transition-all self-start sm:self-auto shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E6CBA8]"
      >
        <ArrowUp className="w-3.5 h-3.5 text-[#E6CBA8]" />
        <span>Open Navigation</span>
      </button>
    </div>
  );
}

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('telemetry');

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(INITIAL_SUMMARY);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [actions, setActions] = useState<ActionRecord[]>(INITIAL_ACTIONS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [selectedThreat, setSelectedThreat] = useState<ThreatDetails | null>(null);

  // SideRays Interactive Background State
  const [raysEnabled, setRaysEnabled] = useState(true);
  const [rayOrigin, setRayOrigin] = useState<'top-right' | 'top-left' | 'right' | 'left' | 'bottom-right' | 'bottom-left'>('top-right');
  const [rayTheme, setRayTheme] = useState<'champagne' | 'bright' | 'silver' | 'deep'>('champagne');
  const [rayIntensity, setRayIntensity] = useState(1.8);
  const [raySpeed, setRaySpeed] = useState(2.0);
  const [rayDensity, setRayDensity] = useState(5);
  const [showRaysPanel, setShowRaysPanel] = useState(false);
  const [raysReady, setRaysReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const enableRays = () => setRaysReady(true);
    if ('requestIdleCallback' in window) {
      const h = (window as any).requestIdleCallback(enableRays, { timeout: 3500 });
      return () => (window as any).cancelIdleCallback(h);
    } else {
      const t = setTimeout(enableRays, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const RAY_THEMES = {
    champagne: {
      name: 'Champagne Gold & Warm Grey',
      rayColor1: '#E6CBA8',
      rayColor2: '#5C5C5C',
      preview: 'from-[#E6CBA8] to-[#5C5C5C]',
    },
    bright: {
      name: 'Bright Gold & Charcoal',
      rayColor1: '#F7E7CE',
      rayColor2: '#2A2A2A',
      preview: 'from-[#F7E7CE] to-[#2A2A2A]',
    },
    silver: {
      name: 'Silver Mist & Deep Gold',
      rayColor1: '#BDBDBD',
      rayColor2: '#B89B72',
      preview: 'from-[#BDBDBD] to-[#B89B72]',
    },
    deep: {
      name: 'Deep Bronze & Obsidian',
      rayColor1: '#B89B72',
      rayColor2: '#151515',
      preview: 'from-[#B89B72] to-[#151515]',
    },
  };

  // API Status
  const [apiStatus, setApiStatus] = useState<ApiStatusState>({
    isConnected: false,
    isDemoMode: true,
    baseUrl: apiClient.getBaseUrl(),
    latencyMs: null,
    lastChecked: null,
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check Backend Health & Fetch All Core Data
  const refreshAllData = useCallback(async () => {
    try {
      const health = await apiClient.checkBackendHealth();
      setApiStatus((prev) => ({
        ...prev,
        isConnected: health.isOnline,
        isDemoMode: !health.isOnline,
        latencyMs: health.latencyMs,
        lastChecked: new Date().toLocaleTimeString(),
        errorMessage: health.error,
      }));

      const [summaryRes, agentsRes, actionsRes, approvalsRes, auditRes] =
        await Promise.all([
          apiClient.getDashboardSummary(),
          apiClient.getAgents(),
          apiClient.getActions(),
          apiClient.getApprovals(),
          apiClient.getAuditLogs(),
        ]);

      setSummary(summaryRes.data);
      setAgents(agentsRes.data);
      setActions(actionsRes.data);
      setApprovals(approvalsRes.data);
      setAuditLogs(auditRes.data);

      if (actionsRes.data.length > 0) {
        const firstThreat = actionsRes.data.find((a) => a.status === 'blocked');
        if (firstThreat) {
          const details = await apiClient.getThreatDetails(firstThreat.id);
          setSelectedThreat(details);
        }
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const run = () => {
      refreshAllData();
    };
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(run, { timeout: 3500 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(run, 1500);
      return () => clearTimeout(timer);
    }
  }, [refreshAllData]);

  // Keep document.title constant on the home page (Item 3)
  useEffect(() => {
    document.title = 'AgentLock 2.0 | Zero-Trust Runtime Gateway for AI Fleets';
  }, []);

  // Feature 14: Capture UTM parameters on first page load
  useEffect(() => {
    captureUTM();
  }, []);

  // Feature 3: Global Ctrl+K / Cmd+K listener & search open event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    const handleOpenSearch = () => setIsSearchOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-site-search', handleOpenSearch);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-site-search', handleOpenSearch);
    };
  }, []);

  // Feature 4: Back to top / MENU button appearance after 600px scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for scroll-spy and analytics scroll-depth (A2 & Item 18)
  useEffect(() => {
    const sectionIds = [
      'telemetry',
      'flow',
      'fleet-governance',
      'action-monitoring',
      'threat-forensics',
      'approval-center',
      'audit-explorer',
      'attack-simulation',
      'gateway-api',
      'security',
      'faq',
      'contact',
    ];

    const observedSections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
            trackEvent('scroll_depth', { section: entry.target.id });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      }
    );

    observedSections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  // Actions
  const handleUpdateAgentStatus = async (agentId: string, status: any) => {
    await apiClient.updateAgentStatus(agentId, status);
    showToast(`Agent ${agentId} status changed to ${status.toUpperCase()}`, 'info');
    await refreshAllData();
  };

  const handleApprove = async (id: string, notes?: string) => {
    await apiClient.approveRequest(id, notes);
    showToast(`Request ${id} approved by Operator Vikas.`, 'success');
    await refreshAllData();
  };

  const handleReject = async (id: string, reason?: string) => {
    await apiClient.rejectRequest(id, reason);
    showToast(`Request ${id} rejected and quarantined.`, 'warning');
    await refreshAllData();
  };

  const handleSelectThreatForensics = async (actionId: string) => {
    const details = await apiClient.getThreatDetails(actionId);
    setSelectedThreat(details);
    const threatEl = document.getElementById('threat-forensics');
    if (threatEl) {
      threatEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRunSimulation = async (scenarioId: string) => {
    const res = await apiClient.runSimulation(scenarioId);
    showToast(`Simulation complete: Verdict ${res.data.verdict.toUpperCase()}`, 'info');
    await refreshAllData();
    return res.data;
  };

  const handleEvaluateCustom = async (payload: {
    agent_id: string;
    action_type: ActionType;
    target: string;
    payload: string;
  }) => {
    const res = await apiClient.evaluateAction(payload);
    showToast(`Policy Evaluated: Decision ${res.data.decision.toUpperCase()}`, 'info');
    await refreshAllData();
    return res.data;
  };

  const handleSaveBaseUrl = async (newUrl: string) => {
    apiClient.setBaseUrl(newUrl);
    setApiStatus((prev) => ({ ...prev, baseUrl: newUrl }));
    showToast(`Backend base URL updated to ${newUrl}`, 'info');
    await refreshAllData();
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const blockedThreatsCount = summary ? summary.blocked_threats : 183;
  const quarantinedCount = agents.filter((a) => a.status === 'quarantined').length || 1;

  // A2 Items: Exact menu items in order + Contact
  const drawerMenuItems: FlowingMenuItem[] = [
    { link: '#telemetry',        text: 'Open 3D interface & telemetry' },
    { link: '#flow',             text: 'Flowing Options',               marquee: 'FLOW' },
    { link: '#fleet-governance', text: 'Fleet Governance',              meta: String(quarantinedCount) },
    { link: '#action-monitoring',text: 'Action Monitoring' },
    { link: '#threat-forensics', text: 'Threat Forensics',              meta: String(blockedThreatsCount) },
    { link: '#approval-center',  text: 'Approval Center',               meta: String(pendingApprovalsCount || 3) },
    { link: '#audit-explorer',   text: 'Audit Explorer' },
    { link: '#attack-simulation',text: 'Attack Simulation' },
    { link: '#gateway-api',      text: 'Gateway & API' },
    { link: '#security',         text: 'Source & Destination Security' },
    { link: '#faq',              text: 'Frequently Asked Questions' },
    { link: '#contact',          text: 'Contact',                       marquee: 'DISPATCH' },
  ];

  return (
    <SmoothScrollProvider isDrawerOpen={isDrawerOpen}>
      <ScrollPopProvider>
        <div className="min-h-screen bg-[#050505] text-[#FFFFFF] flex flex-col relative selection:bg-[#E6CBA8] selection:text-[#0A0A0A]">
          {/* Dev-only FPS & Performance Diagnostic Panel (?perf=1) */}
          <DevPerfMeter />

          {/* Fixed Top Scroll Progress Line (CSS Scroll Timeline + rAF fallback) */}
          <ScrollProgressLine />

          {/* Skip to Content Accessible Link */}
          <a href="#main" className="skip-to-content">
            Skip to main content
          </a>

          {/* Live Spline 3D Grayscale Background (Interactive, Zero-Jank Composited) */}
          <SplineBackground isDrawerOpen={isDrawerOpen} />

          {/* A4: Opening Animation (plays once on site load, under 2.5s) */}
          <OpeningLoader onComplete={() => setIntroDone(true)} />

          {/* Feature 11: Sticky Section Label chip */}
          <StickySectionLabel activeSectionId={activeSectionId} />

          {/* A2: Fixed Hamburger Menu & Slide-in Drawer */}
          <HamburgerDrawer
            items={drawerMenuItems}
            activeSectionId={activeSectionId}
            isOpen={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Interactive WebGL2 SideRays Background */}
          {raysEnabled && introDone && raysReady && (
            <div
              className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000"
              style={{ opacity: 0.85 }}
              aria-hidden="true"
            >
              <SideRays
                rayColor1={RAY_THEMES[rayTheme].rayColor1}
                rayColor2={RAY_THEMES[rayTheme].rayColor2}
                origin={rayOrigin}
                speed={raySpeed}
                intensity={rayIntensity}
                spread={2.2}
                density={rayDensity}
                sharpness={0.45}
                falloff={1.4}
                glow={1.2}
                dust={0.35}
                followMouse={true}
                mouseInfluence={0.7}
              />
            </div>
          )}

          {/* A3: Fixed Centered Wordmark "AGENTLOCK 2.0" with Pure CSS Scroll-Driven Parallax */}
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-[1] overflow-hidden"
            aria-hidden="true"
          >
            <span
              className="wordmark-parallax font-black font-sans tracking-tighter uppercase whitespace-nowrap text-center select-none will-change-transform"
              style={{
                fontSize: 'clamp(40px, 11vw, 180px)',
                maxWidth: '92vw',
                color: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              AGENTLOCK 2.0
            </span>
          </div>

        {/* Hero Section (Above the Fold) */}
        <header className="relative min-h-[92vh] sm:min-h-[90vh] flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 pointer-events-none">
          {/* Brand Shield & System Status in Top Left */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-10 h-10 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(230,203,168,0.35)]">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-sans font-bold text-lg text-white tracking-tight leading-none">
                AgentLock <span className="text-[#E6CBA8]">2.0</span>
              </div>
              <div className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-wider mt-1">
                Autonomous Fleet Security Mesh
              </div>
            </div>
          </div>

          {/* Hero Headline & CTA */}
          <div className="max-w-3xl space-y-6 my-auto pt-8">
            <div className="space-y-4 pointer-events-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8]">
                <span className="w-2 h-2 rounded-full bg-[#6FAF8A] animate-pulse" />
                <span>DETERMINISTIC RUNTIME INTERCEPTOR</span>
              </div>

              {/* Semantic Single <h1> */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-sans tracking-tight text-white leading-[1.08]">
                Zero-Trust Runtime Gateway for AI Fleets.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#BDBDBD] font-sans leading-relaxed max-w-2xl">
                Deterministic multi-vector policy enforcement, real-time threat interception, and cryptographic audit ledgers for enterprise autonomous agent operations.
              </p>
            </div>

            {/* Above-the-Fold CTAs (Item 2 with Magnetic Effect on Primary CTA) */}
            <div
              className={`flex flex-wrap items-center gap-3 pt-2 transition-all duration-700 delay-200 pointer-events-auto ${
                introDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <MagneticButton
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  trackEvent('cta_click', { location: 'hero_above_fold', label: 'Request a Demo' });
                }}
                className="px-6 py-3.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] shadow-[0_0_20px_rgba(230,203,168,0.35)] btn-primary-glow cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E6CBA8]"
              >
                Request a Demo
              </MagneticButton>

              <button
                onClick={() => {
                  document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' });
                  trackEvent('cta_click', { location: 'hero_above_fold', label: 'Explore the 3D Interface' });
                }}
                type="button"
                className="px-6 py-3.5 rounded-full text-xs font-mono font-medium text-white hover:text-[#E6CBA8] bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#E6CBA8] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E6CBA8]"
              >
                Explore the 3D Interface
              </button>
            </div>
          </div>

          {/* Hero Bottom: Small status pills (A4 with subtle breathing) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#2A2A2A]/50 text-xs font-mono text-[#8A8A8A] pointer-events-auto">
            <div className="flex flex-wrap items-center gap-4 breathe-softly">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6FAF8A] shadow-[0_0_8px_#6FAF8A]" />
                <span>Interactive 3D Engine: <strong>Active</strong></span>
              </span>
              <span className="hidden sm:inline text-[#3D3D3D]">•</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E6CBA8] shadow-[0_0_8px_#E6CBA8]" />
                <span>Zero-Trust Runtime Active</span>
              </span>
            </div>

            <button
              onClick={() => {
                document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' });
              }}
              type="button"
              className="flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#E6CBA8] transition-colors"
            >
              <span>Scroll to Command Mesh</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </header>

      {/* Main Continuous Stack Container */}
      <main id="main" tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 min-w-0 space-y-20 relative z-10">
        {/* Demo Mode Notice Banner */}
        {!apiStatus.isConnected && (
          <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#B89B72]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#E6CBA8]">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#E6CBA8] flex-shrink-0" />
              <span>
                <strong>DEMO / SIMULATION MODE ACTIVE:</strong> Backend endpoint at{' '}
                <code className="text-white underline">{apiStatus.baseUrl}</code> is unreachable.
                All features, approvals, threat forensics, fleet telemetry, and FlowingMenu are running in interactive mock mode.
              </span>
            </div>
            <button
              onClick={() => setIsApiModalOpen(true)}
              type="button"
              className="px-3.5 py-1.5 rounded-full bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] font-semibold text-xs whitespace-nowrap self-start sm:self-auto transition-all shadow-[0_0_12px_rgba(230,203,168,0.25)]"
            >
              Configure Backend URL
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. #telemetry: Open 3D Interface & Telemetry                               */}
        {/* ========================================================================= */}
        <PopSection id="telemetry" variant="up-left" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="telemetry"
            title="Open 3D Interface & Telemetry"
            subtitle="Full SecOps fleet telemetry, timeline velocities, category distribution, and risk scoring."
            badgeText="LIVE TELEMETRY"
            icon={Activity}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text={`Across ${summary?.total_actions?.toLocaleString() || '13,196'} operations in the last 24h cycle, ${summary?.blocked_threats || 183} malicious payloads were blocked with zero unauthorized execution.`}
            />
          </div>

          {/* MagicBento Interactive Performance Grid */}
          <div data-reveal className="reveal-card">
            <TelemetryBento
              totalActions={summary?.total_actions || 13196}
              blockedThreats={summary?.blocked_threats || 183}
              onScrollToDetails={() => document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>

          {/* KPI Metric Cards */}
          <div data-reveal className="reveal-card">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] min-h-[120px] space-y-3">
                    <div className="w-24 h-4 rounded skeleton-shimmer" />
                    <div className="w-32 h-8 rounded skeleton-shimmer" />
                    <div className="w-20 h-3 rounded skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Operations"
                  value={summary?.total_actions.toLocaleString() || '13,196'}
                  subtitle="Last 24h cycle"
                  change="+14.8% velocity"
                  changeType="positive"
                  icon={Activity}
                  variant="gold"
                  onClick={() => {
                    document.getElementById('action-monitoring')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
                <StatCard
                  title="Threats Blocked"
                  value={summary?.blocked_threats || '183'}
                  subtitle="100% deterministic intercept"
                  change="Critical: 48 | High: 74"
                  changeType="danger"
                  icon={ShieldAlert}
                  variant="gold"
                  onClick={() => {
                    document.getElementById('threat-forensics')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
                <StatCard
                  title="Pending Approvals"
                  value={pendingApprovalsCount || 3}
                  subtitle="Human-in-the-loop queue"
                  change="Requires Operator Review"
                  changeType="negative"
                  icon={CheckCircle2}
                  variant="gold"
                  onClick={() => {
                    document.getElementById('approval-center')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
                <StatCard
                  title="Active Fleet"
                  value={`${summary?.active_agents || 4} / ${agents.length || 6}`}
                  subtitle={`${quarantinedCount} Quarantined`}
                  change="Average Risk: 18.4/100"
                  changeType="positive"
                  icon={Bot}
                  variant="gold"
                  onClick={() => {
                    document.getElementById('fleet-governance')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div data-reveal className="reveal-card">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] min-h-[320px] flex flex-col justify-between">
                  <div className="w-48 h-5 rounded skeleton-shimmer" />
                  <div className="w-full h-48 rounded skeleton-shimmer" />
                </div>
                <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] min-h-[320px] flex flex-col justify-between">
                  <div className="w-36 h-5 rounded skeleton-shimmer" />
                  <div className="w-full h-48 rounded skeleton-shimmer" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ThreatTimelineChart data={summary?.timeline || []} />
                </div>
                <div>
                  <ThreatDistributionChart categories={summary?.threat_categories || []} />
                </div>
              </div>
            )}
          </div>

          {/* Risk Rankings + Activity Feed */}
          <div data-reveal className="reveal-card grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AgentRiskBarChart data={summary?.agent_risk_rankings || []} />
            <RecentActivityFeed
              actions={actions}
              onInspectAction={(act) => {
                if (act.status === 'blocked') {
                  handleSelectThreatForensics(act.id);
                } else {
                  document.getElementById('action-monitoring')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onViewAll={() => {
                document.getElementById('action-monitoring')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        </PopSection>

        {/* ========================================================================= */}
        {/* 2. #flow: Flowing Options                                                  */}
        {/* ========================================================================= */}
        <PopSection id="flow" variant="up" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="flow"
            title="Flowing Options"
            subtitle="Editorial workflow canvas and interactive runtime quota throttle (5K–100K TPM)."
            badgeText="FLOW"
            icon={Sliders}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          <LazyViewport minHeight={480}>
            <div data-reveal className="reveal-card">
              <RelayHero
                onExploreCommand={() => {
                  document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenSimulations={() => {
                  document.getElementById('attack-simulation')?.scrollIntoView({ behavior: 'smooth' });
                }}
                pendingApprovalsCount={pendingApprovalsCount}
              />
            </div>

            <div data-reveal className="reveal-card">
              <RelayInteractiveSection />
            </div>
          </LazyViewport>
        </PopSection>

        {/* Section transition seam */}
        <div className="section-seam" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 3. #fleet-governance: Fleet Governance (meta: '1')                          */}
        {/* ========================================================================= */}
        <PopSection id="fleet-governance" variant="up-right" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="fleet-governance"
            title="Fleet Governance"
            subtitle="Zero-trust autonomous agent fleet oversight, permissions, and emergency isolation."
            badgeText="GOVERNANCE"
            count={quarantinedCount}
            icon={Bot}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text={`${agents.filter((a) => a.status === 'active' || a.status === 'supervised').length || 4} of ${agents.length || 6} agents are active; ${quarantinedCount} is quarantined and needs your review.`}
            />
          </div>

          {/* MagicBento Interactive Fleet Risk Grid */}
          <LazyViewport minHeight={520}>
            <div data-reveal className="reveal-card">
              <FleetGovernanceBento
                totalAgents={agents.length || 6}
                activeAgents={agents.filter((a) => a.status === 'active').length || 3}
                quarantinedAgents={quarantinedCount}
                avgRisk={summary?.avg_risk_score || 18.4}
                onScrollToDetails={() => document.getElementById('fleet-governance')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            <div data-reveal className="reveal-card">
              <AgentManagementView
                agents={agents}
                onUpdateStatus={handleUpdateAgentStatus}
                onInspectThreat={() => {
                  document.getElementById('threat-forensics')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onTestSimulation={() => {
                  document.getElementById('attack-simulation')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </LazyViewport>
        </PopSection>

        {/* Section transition seam */}
        <div className="section-seam" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 4. #action-monitoring: Action Monitoring                                   */}
        {/* ========================================================================= */}
        <PopSection id="action-monitoring" variant="up" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="action-monitoring"
            title="Action Monitoring"
            subtitle="Real-time multi-vector action stream, deterministic intercept logs, and JSON export."
            badgeText="ACTION MONITOR"
            icon={Activity}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text={`Streaming ${actions.length > 0 ? actions.length : 8} high-velocity agent actions; ${actions.filter((a) => a.status === 'blocked').length || 3} blocked in real-time with an average decision latency of 16.4ms.`}
            />
          </div>

          {/* MagicBento Live Action Throughput Grid */}
          <LazyViewport minHeight={520}>
            <div data-reveal className="reveal-card">
              <ActionMonitoringBento
                totalActionsCount={actions.length}
                onScrollToDetails={() => document.getElementById('action-monitoring')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            <div data-reveal className="reveal-card">
              <ActionMonitorTable
                actions={actions}
                onSelectThreat={handleSelectThreatForensics}
                onRefresh={refreshAllData}
                isLive={apiStatus.isConnected}
              />
            </div>
          </LazyViewport>
        </PopSection>

        {/* Section transition seam */}
        <div className="section-seam" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 5. #threat-forensics: Threat Forensics (meta: '183')                       */}
        {/* ========================================================================= */}
        <PopSection id="threat-forensics" variant="scale-in" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="threat-forensics"
            title="Threat Forensics"
            subtitle="Deep forensic incident dossiers, MITRE ATT&CK matrix mappings, and recommended mitigations."
            badgeText="FORENSICS"
            count={blockedThreatsCount}
            icon={ShieldAlert}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text={`Inspecting ${blockedThreatsCount} blocked threats across MITRE ATLAS vectors; 48 critical incidents isolated before process execution.`}
            />
          </div>

          {/* MagicBento Threat Forensics Matrix Grid */}
          <LazyViewport minHeight={520}>
            <div data-reveal className="reveal-card">
              <ThreatForensicsBento
                blockedThreatsCount={blockedThreatsCount}
                criticalCount={48}
                onScrollToDetails={() => document.getElementById('threat-forensics')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            <div data-reveal className="reveal-card">
              <ThreatInvestigationView
                threat={selectedThreat}
                allIncidents={actions
                  .filter((a) => a.status === 'blocked')
                  .map((a) => ({
                    id: a.id,
                    agent_name: a.agent_name,
                    rule: a.rule_triggered || 'Policy Violation',
                    time: a.timestamp,
                    severity: a.severity,
                  }))}
                onSelectIncident={handleSelectThreatForensics}
                onQuarantineAgent={async (agentId) => {
                  await handleUpdateAgentStatus(agentId, 'quarantined');
                }}
              />
            </div>
          </LazyViewport>
        </PopSection>

        {/* Section transition seam */}
        <div className="section-seam" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 6. #approval-center: Approval Center (meta: '3')                           */}
        {/* ========================================================================= */}
        <PopSection id="approval-center" variant="up-left" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="approval-center"
            title="Approval Center"
            subtitle="Human-in-the-loop sign-off console for high-risk autonomous agent operations."
            badgeText="APPROVAL QUEUE"
            count={pendingApprovalsCount || 3}
            icon={CheckCircle2}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text={`${pendingApprovalsCount || 3} high-risk autonomous actions await human operator sign-off; average resolution time is 4.2 minutes.`}
            />
          </div>

          {/* MagicBento Approval Pipeline Grid */}
          <LazyViewport minHeight={480}>
            <div data-reveal className="reveal-card">
              <ApprovalCenterBento
                pendingCount={pendingApprovalsCount || 3}
                onScrollToDetails={() => document.getElementById('approval-center')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            <div data-reveal className="reveal-card">
              <ApprovalCenter
                approvals={approvals}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          </LazyViewport>
        </PopSection>

        {/* Section transition seam */}
        <div className="section-seam" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 7. #audit-explorer: Audit Explorer                                         */}
        {/* ========================================================================= */}
        <PopSection id="audit-explorer" variant="up-right" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="audit-explorer"
            title="Audit Explorer"
            subtitle="Tamper-evident SHA-256 cryptographic audit chain and immutable ledger verification."
            badgeText="AUDIT TRAIL"
            icon={Fingerprint}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text={`All ${auditLogs.length > 0 ? auditLogs.length : 6} audit blocks are cryptographically verified with SHA-256 Merkle hashes, ensuring an immutable tamper-evident record.`}
            />
          </div>

          {/* MagicBento Merkle Audit Chain Grid */}
          <LazyViewport minHeight={480}>
            <div data-reveal className="reveal-card">
              <AuditExplorerBento
                totalLogsCount={auditLogs.length}
                onScrollToDetails={() => document.getElementById('audit-explorer')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            <div data-reveal className="reveal-card">
              <AuditExplorer logs={auditLogs} onRefresh={refreshAllData} />
            </div>
          </LazyViewport>
        </PopSection>

        {/* Section transition seam */}
        <div className="section-seam" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 8. #attack-simulation: Attack Simulation                                   */}
        {/* ========================================================================= */}
        <PopSection id="attack-simulation" variant="scale-in" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="attack-simulation"
            title="Attack Simulation"
            subtitle="Predefined adversarial vectors (Prompt Injection, Data Exfiltration) & ad-hoc policy tester."
            badgeText="SIMULATION LAB"
            icon={Terminal}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text="Autonomous defense mesh blocked 5 of 5 simulated red-team attack vectors with a 98.7% overall jailbreak resistance rate."
            />
          </div>

          {/* MagicBento Red-Team Jailbreak Grid */}
          <LazyViewport minHeight={520}>
            <div data-reveal className="reveal-card">
              <AttackSimulationBento
                scenariosCount={SIMULATION_SCENARIOS.length}
                onScrollToDetails={() => document.getElementById('attack-simulation')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            <div data-reveal className="reveal-card">
              <AttackLab
                scenarios={SIMULATION_SCENARIOS}
                onRunSimulation={handleRunSimulation}
                onEvaluateCustom={handleEvaluateCustom}
              />
            </div>
          </LazyViewport>
        </PopSection>

        {/* Section transition seam */}
        <div className="section-seam" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 9. #gateway-api: Gateway & API                                            */}
        {/* ========================================================================= */}
        <PopSection id="gateway-api" variant="up" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <SectionHeader
            id="gateway-api"
            title="Gateway & API"
            subtitle="FastAPI / Python policy engine synchronization, REST endpoints, and latency monitoring."
            badgeText="API GATEWAY"
            icon={Cpu}
            onOpenMenu={() => setIsDrawerOpen(true)}
          />

          {/* Plain-English Insight Line */}
          <div data-reveal>
            <SectionInsight
              text={`FastAPI gateway is ${apiStatus.isConnected ? 'connected and healthy' : 'running in local high-fidelity simulation'} with 99.99% uptime and 14ms median latency.`}
            />
          </div>

          {/* MagicBento Ingress & Latency Grid */}
          <LazyViewport minHeight={380}>
            <div data-reveal className="reveal-card">
              <GatewayApiBento
                isConnected={apiStatus.isConnected}
                baseUrl={apiStatus.baseUrl}
                onScrollToDetails={() => document.getElementById('gateway-api')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>
          </LazyViewport>

          <div data-reveal className="reveal-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${apiStatus.isConnected ? 'bg-[#6FAF8A]' : 'bg-[#E6CBA8] animate-ping'}`} />
                  <h3 className="text-lg font-bold text-white font-sans">
                    {apiStatus.isConnected
                      ? 'Python Security Backend Connected'
                      : 'Interactive Demo Mode (Fallback Telemetry)'}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#8A8A8A] font-sans">
                  Configured Base URL: <code className="text-[#E6CBA8] underline">{apiStatus.baseUrl}</code>
                  {apiStatus.latencyMs && ` • Latency: ${apiStatus.latencyMs}ms`}
                </p>
              </div>

              <button
                onClick={() => setIsApiModalOpen(true)}
                type="button"
                className="px-4 py-2 rounded-full font-mono text-xs font-semibold bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] transition-all shadow-[0_0_15px_rgba(230,203,168,0.25)] self-start sm:self-auto"
              >
                Configure Base URL & Test Endpoints
              </button>
            </div>

            {/* Endpoint Schema Reference Card */}
            <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] space-y-4">
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#E6CBA8]" />
                Verified REST Endpoints Contract
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#E6CBA8] truncate">GET /api/v1/dashboard/summary</span>
                    <CopyButton text="GET /api/v1/dashboard/summary" iconOnly className="p-0.5 bg-transparent border-0 shrink-0" />
                  </div>
                  <span className="text-[#8A8A8A] shrink-0">Telemetry KPIs</span>
                </div>
                <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#E6CBA8] truncate">GET /api/v1/agents</span>
                    <CopyButton text="GET /api/v1/agents" iconOnly className="p-0.5 bg-transparent border-0 shrink-0" />
                  </div>
                  <span className="text-[#8A8A8A] shrink-0">Fleet Profiles</span>
                </div>
                <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#E6CBA8] truncate">GET /api/v1/actions</span>
                    <CopyButton text="GET /api/v1/actions" iconOnly className="p-0.5 bg-transparent border-0 shrink-0" />
                  </div>
                  <span className="text-[#8A8A8A] shrink-0">Action Stream</span>
                </div>
                <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#E6CBA8] truncate">POST /api/v1/actions/evaluate</span>
                    <CopyButton text="POST /api/v1/actions/evaluate" iconOnly className="p-0.5 bg-transparent border-0 shrink-0" />
                  </div>
                  <span className="text-[#8A8A8A] shrink-0">Real-time Policy</span>
                </div>
                <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#E6CBA8] truncate">GET /api/v1/approvals</span>
                    <CopyButton text="GET /api/v1/approvals" iconOnly className="p-0.5 bg-transparent border-0 shrink-0" />
                  </div>
                  <span className="text-[#8A8A8A] shrink-0">HITL Queue</span>
                </div>
                <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[#E6CBA8] truncate">POST /api/v1/simulations/run</span>
                    <CopyButton text="POST /api/v1/simulations/run" iconOnly className="p-0.5 bg-transparent border-0 shrink-0" />
                  </div>
                  <span className="text-[#8A8A8A] shrink-0">Adversarial Lab</span>
                </div>
              </div>
            </div>
          </div>
        </PopSection>

        {/* ========================================================================= */}
        {/* 10. #security: Source & Destination Security (Part 2)                     */}
        {/* ========================================================================= */}
        <PopSection id="security" variant="up" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <LazyViewport minHeight={600} rootMargin="600px 0px">
            <SecuritySection onShowToast={showToast} />
          </LazyViewport>
        </PopSection>

        {/* ========================================================================= */}
        {/* 11. #faq: Frequently Asked Questions (Feature 19)                          */}
        {/* ========================================================================= */}
        <PopSection id="faq" variant="up" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <FAQSection />
        </PopSection>

        {/* ========================================================================= */}
        {/* 12. #contact: Contact Incident Dispatch & Request Demo                     */}
        {/* ========================================================================= */}
        <PopSection id="contact" variant="up" className="pt-8 scroll-mt-24 space-y-6 pointer-events-auto">
          <ContactSection />
        </PopSection>
      </main>

      {/* Site Footer */}
      <PopSection id="footer" variant="up" as="footer" className="pointer-events-auto">
        <SiteFooter onOpenCookieSettings={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))} />
      </PopSection>

      {/* Feature 20: Floating Contact Button (Bottom-Left, no collision with bottom-right MENU/RAYS) */}
      <FloatingContactButton
        isDrawerOpen={isDrawerOpen}
        isModalOpen={isApiModalOpen || isSearchOpen}
        currentSectionId={activeSectionId}
      />

      {/* Feature 4: Floating Action Bar with 600px scroll threshold: SideRays Controls & Jump to Menu (A5) */}
      <div
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-3 transition-opacity duration-300 ${
          showBackToTop ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Interactive SideRays Controller Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setRaysReady(true);
              setShowRaysPanel(!showRaysPanel);
            }}
            className={`p-3 rounded-full text-xs font-mono font-semibold transition-all border flex items-center gap-2 shadow-2xl group ${
              raysEnabled
                ? 'bg-[#0D0D0D] border-[#E6CBA8] text-[#E6CBA8] shadow-[0_0_20px_rgba(230,203,168,0.25)] hover:border-[#F7E7CE]'
                : 'bg-[#151515] border-[#2A2A2A] text-[#8A8A8A] hover:text-white'
            }`}
            title="Interactive Ambient Light Rays Controller"
            aria-label="Ambient Rays Controller"
            type="button"
          >
            <Sparkles className={`w-5 h-5 ${raysEnabled ? 'text-[#E6CBA8]' : 'text-[#8A8A8A]'}`} />
            <span className="text-xs font-mono font-bold pr-1 hidden md:inline">RAYS</span>
            <span className={`w-2 h-2 rounded-full ${raysEnabled ? 'bg-[#6FAF8A] shadow-[0_0_8px_#6FAF8A]' : 'bg-[#5C5C5C]'}`} />
          </button>

          {/* Interactive SideRays Settings HUD Popover */}
          {showRaysPanel && (
            <div className="absolute bottom-16 right-0 w-80 p-5 rounded-3xl bg-[#0D0D0D]/98 border border-[#2A2A2A] shadow-[0_0_30px_rgba(0,0,0,0.8)] text-xs space-y-4 z-50">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#E6CBA8]" />
                  <span className="font-bold text-white font-sans text-sm">SideRays Background</span>
                </div>
                <button
                  onClick={() => setRaysEnabled(!raysEnabled)}
                  type="button"
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all ${
                    raysEnabled
                      ? 'bg-[rgba(111,175,138,0.15)] text-[#6FAF8A] border-[#6FAF8A]/40'
                      : 'bg-[rgba(192,80,77,0.15)] text-[#C0504D] border-[#C0504D]/40'
                  }`}
                >
                  {raysEnabled ? 'ONLINE' : 'PAUSED'}
                </button>
              </div>

              {/* Origin / Angle Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
                  <span>Light Source Origin</span>
                  <span className="text-[#E6CBA8] capitalize">{rayOrigin.replace('-', ' ')}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['top-right', 'top-left', 'right', 'left', 'bottom-right', 'bottom-left'] as const).map((orig) => (
                    <button
                      key={orig}
                      onClick={() => setRayOrigin(orig)}
                      type="button"
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono capitalize transition-all border ${
                        rayOrigin === orig
                          ? 'bg-[#E6CBA8] text-[#0A0A0A] border-transparent font-bold shadow-[0_0_12px_rgba(230,203,168,0.3)]'
                          : 'bg-[#151515] text-[#8A8A8A] border-[#2A2A2A] hover:border-[#3D3D3D]'
                      }`}
                    >
                      {orig.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
                  <span>Spectral Palette</span>
                  <span className="text-[#E6CBA8]">{RAY_THEMES[rayTheme].name.split(' ')[0]}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(RAY_THEMES) as Array<keyof typeof RAY_THEMES>).map((key) => {
                    const t = RAY_THEMES[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setRayTheme(key)}
                        type="button"
                        className={`p-2 rounded-xl flex items-center gap-2 border text-[11px] font-mono transition-all ${
                          rayTheme === key
                            ? 'border-[#E6CBA8] bg-[rgba(230,203,168,0.12)] text-white shadow-[0_0_12px_rgba(230,203,168,0.2)]'
                            : 'border-[#2A2A2A] bg-[#151515] text-[#8A8A8A] hover:border-[#3D3D3D]'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${t.preview} shadow-sm shrink-0`} />
                        <span className="truncate capitalize">{key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intensity & Speed Controls */}
              <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A8A8A] font-mono">Beam Intensity:</span>
                  <div className="flex items-center gap-1.5">
                    {[1.0, 1.8, 3.0].map((val, idx) => (
                      <button
                        key={idx}
                        onClick={() => setRayIntensity(val)}
                        type="button"
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          rayIntensity === val
                            ? 'bg-[#E6CBA8] text-[#0A0A0A] border-transparent font-bold shadow-[0_0_8px_rgba(230,203,168,0.3)]'
                            : 'bg-[#151515] text-[#8A8A8A] border-[#2A2A2A]'
                        }`}
                      >
                        {idx === 0 ? 'Soft' : idx === 1 ? 'Balanced' : 'High'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8A8A8A] font-mono">Shimmer Velocity:</span>
                  <div className="flex items-center gap-1.5">
                    {[0.8, 2.0, 3.5].map((spd, idx) => (
                      <button
                        key={idx}
                        onClick={() => setRaySpeed(spd)}
                        type="button"
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          raySpeed === spd
                            ? 'bg-[#E6CBA8] text-[#0A0A0A] border-transparent font-bold shadow-[0_0_8px_rgba(230,203,168,0.3)]'
                            : 'bg-[#151515] text-[#8A8A8A] border-[#2A2A2A]'
                        }`}
                      >
                        {idx === 0 ? 'Calm' : idx === 1 ? 'Flow' : 'Rapid'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Status */}
              <div className="flex items-center justify-between pt-2 text-[10px] font-mono text-[#8A8A8A] border-t border-[#2A2A2A]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FAF8A] animate-pulse" />
                  Cursor Tracking Live
                </span>
                <span className="text-[#E6CBA8]">Move mouse to bend</span>
              </div>
            </div>
          )}
        </div>

        {/* A5: Floating MENU Button opens the Hamburger Drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          type="button"
          aria-label="Open full site navigation drawer"
          className="p-3.5 rounded-full bg-[#E6CBA8] text-[#0A0A0A] shadow-[0_0_25px_rgba(230,203,168,0.4)] hover:bg-[#F7E7CE] hover:scale-105 active:scale-95 transition-all border border-[#B89B72] group flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#E6CBA8]"
        >
          <ArrowUp className="w-5 h-5 text-[#0A0A0A] group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs font-mono font-bold text-[#0A0A0A] pr-1 hidden sm:inline">MENU</span>
        </button>
      </div>

      {/* Sticky Mobile CTA (under 768px, safe-area aware) */}
      <StickyMobileCta isDrawerOpen={isDrawerOpen} />

      {/* Cookie Consent & GA4 Manager */}
      <AnalyticsManager />

      {/* API Configuration Modal */}
      <ApiStatusModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiStatus={apiStatus}
        onSaveBaseUrl={handleSaveBaseUrl}
        onTestConnection={refreshAllData}
      />

      {/* Feature 3: Site Search Command Palette (Ctrl+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-medium shadow-2xl flex items-center gap-2 border ${
              toastMessage.type === 'success'
                ? 'bg-[#0D0D0D]/95 border-[#6FAF8A] text-[#6FAF8A]'
                : toastMessage.type === 'warning'
                ? 'bg-[#0D0D0D]/95 border-[#C0504D] text-[#C0504D]'
                : 'bg-[#0D0D0D]/95 border-[#E6CBA8] text-[#E6CBA8]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
        </div>
      </ScrollPopProvider>
    </SmoothScrollProvider>
  );
}
