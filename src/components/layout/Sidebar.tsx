'use client';

import React from 'react';
import FlowingMenu, { FlowingMenuItem } from '../FlowingMenu';
import {
  Shield,
  Layers,
  Bot,
  Activity,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
  FlaskConical,
  Server,
  Lock,
} from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'options_flow'
  | 'agents'
  | 'actions'
  | 'threats'
  | 'approvals'
  | 'audit'
  | 'simulations'
  | 'api_status';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingApprovalsCount: number;
  blockedThreatsCount: number;
  quarantinedAgentsCount: number;
  showClassicCards?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  blockedThreatsCount,
  quarantinedAgentsCount,
  showClassicCards = false,
}) => {
  const items: FlowingMenuItem[] = [
    { text: 'Open 3D interface & telemetry', link: '#telemetry' },
    { text: 'Flowing Options', marquee: 'FLOW', link: '#flow' },
    { text: 'Fleet Governance', meta: String(quarantinedAgentsCount || 1), link: '#fleet' },
    { text: 'Action Monitoring', link: '#monitor' },
    { text: 'Threat Forensics', meta: String(blockedThreatsCount || 183), link: '#threats' },
    { text: 'Approval Center', meta: String(pendingApprovalsCount || 3), link: '#approvals' },
    { text: 'Audit Explorer', link: '#audit' },
    { text: 'Attack Simulation', link: '#lab' },
    { text: 'Gateway & API', link: '#gateway' },
  ];

  const getActiveIndex = (tab: NavigationTab): number => {
    switch (tab) {
      case 'overview':
        return 0;
      case 'options_flow':
        return 1;
      case 'agents':
        return 2;
      case 'actions':
        return 3;
      case 'threats':
        return 4;
      case 'approvals':
        return 5;
      case 'audit':
        return 6;
      case 'simulations':
        return 7;
      case 'api_status':
        return 8;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveIndex(currentTab);

  const handleItemClick = (item: FlowingMenuItem, index: number) => {
    const tabMap: Record<number, NavigationTab> = {
      0: 'overview',
      1: 'options_flow',
      2: 'agents',
      3: 'actions',
      4: 'threats',
      5: 'approvals',
      6: 'audit',
      7: 'simulations',
      8: 'api_status',
    };

    const targetTab = tabMap[index] || 'overview';
    onSelectTab(targetTab);

    const anchor = item.link?.replace('#', '');
    if (anchor) {
      const el =
        document.getElementById(anchor) ||
        (anchor === 'fleet' ? document.getElementById('fleet-governance') : null) ||
        (anchor === 'monitor' ? document.getElementById('action-monitoring') : null) ||
        (anchor === 'threats' ? document.getElementById('threat-forensics') : null) ||
        (anchor === 'approvals' ? document.getElementById('approval-center') : null) ||
        (anchor === 'audit' ? document.getElementById('audit-explorer') : null) ||
        (anchor === 'lab' ? document.getElementById('attack-simulation') : null) ||
        (anchor === 'gateway' ? document.getElementById('gateway-api') : null);

      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside
      id="sidebar-navigation"
      className="w-full md:w-72 lg:w-80 bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col flex-shrink-0 md:sticky md:top-16 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto min-h-0"
      style={{ minHeight: 0 }}
      tabIndex={-1}
    >
      {/* Header: Fixed Height */}
      <div className="p-4 border-b border-[#2A2A2A] flex-shrink-0 bg-[#0D0D0D]">
        <div className="flex items-center justify-between text-xs font-mono text-[#8A8A8A] mb-1">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Lock className="w-3.5 h-3.5 text-[#E6CBA8]" />
            RUNTIME GUARD
          </span>
          <span className="text-[10px] font-semibold bg-[rgba(230,203,168,0.14)] border border-[#B89B72] text-[#E6CBA8] px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(230,203,168,0.2)]">
            ACTIVE
          </span>
        </div>
        <div className="text-[11px] text-[#8A8A8A] leading-tight">
          Deterministic Zero-Trust Gateway for AI Fleets
        </div>
      </div>

      {/* Classic Option Cards - Hidden by default (only rendered if showClassicCards is true) */}
      {showClassicCards && (
        <nav className="p-2.5 space-y-1.5 overflow-y-auto">
          {/* Classic fallback cards */}
        </nav>
      )}

      {/* FlowingMenu Navigation replacing cards */}
      {!showClassicCards && (
        <div
          className="flex-1 min-h-[560px] relative overflow-hidden"
          style={{ flex: 1, minHeight: '560px', position: 'relative', overflow: 'hidden' }}
        >
          <FlowingMenu
            items={items}
            activeIndex={activeIndex}
            onItemClick={(item, index, e) => {
              e.preventDefault();
              handleItemClick(item, index);
            }}
            speed={60}
            stretch={0.6}
            magnet={0.25}
            followCursor={0.4}
            align="left"
            showIndex={false}
            showArrow={true}
            dimInactive={true}
            intro={true}
            bandInset={4}
            bandRadius={10}
            textColor="#ffffff"
            bgColor="transparent"
            marqueeBgColor="#E6CBA8"
            marqueeTextColor="#0A0A0A"
            borderColor="rgba(255,255,255,0.10)"
            className="sidebar-flow"
            ariaLabel="AgentLock sidebar navigation"
          />
        </div>
      )}

      {/* Operator Credentials Footer: Fixed Height */}
      <div className="p-3 border-t border-[#2A2A2A] bg-[#0D0D0D] flex-shrink-0">
        <div className="rounded-xl p-2.5 bg-[#151515] border border-[#2A2A2A] font-mono text-[11px]">
          <div className="flex items-center justify-between text-[#8A8A8A] mb-0.5">
            <span className="text-white text-[10px] font-bold">OPERATOR PROFILE</span>
            <span className="text-[9px] text-[#E6CBA8]">ACTIVE</span>
          </div>
          <div className="text-white font-semibold">Vikas (Lead SecOps)</div>
          <div className="text-[10px] text-[#8A8A8A] truncate">
            Key: <span className="text-[#BDBDBD]">VK-SEC-8921-PROD</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
