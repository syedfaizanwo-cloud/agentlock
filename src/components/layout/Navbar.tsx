'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { ApiStatusState } from '../../types/api';
import { NavigationTab } from './Sidebar';

interface NavbarProps {
  apiStatus: ApiStatusState;
  onOpenApiSettings: () => void;
  pendingApprovalsCount: number;
  onNavigate: (view: NavigationTab) => void;
  activeView: NavigationTab;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiStatus,
  onOpenApiSettings,
  pendingApprovalsCount,
  onNavigate,
  activeView,
}) => {
  const navLinks: { id: NavigationTab; label: string; badge?: number | string; targetId: string }[] = [
    { id: 'overview', label: 'Flowing Menu', badge: 'NAV', targetId: 'sidebar-navigation' },
    { id: 'overview', label: 'Telemetry', targetId: 'telemetry' },
    { id: 'agents', label: 'Fleet', badge: 1, targetId: 'fleet-governance' },
    { id: 'actions', label: 'Monitor', targetId: 'action-monitoring' },
    { id: 'threats', label: 'Threats', badge: 183, targetId: 'threat-forensics' },
    { id: 'approvals', label: 'Approvals', badge: pendingApprovalsCount || 3, targetId: 'approval-center' },
    { id: 'audit', label: 'Audit', targetId: 'audit-explorer' },
    { id: 'simulations', label: 'Lab', targetId: 'attack-simulation' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2A2A2A] bg-[#0D0D0D]/90 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Left: Brand Logo in Champagne Gold Accent */}
        <div
          onClick={() => {
            const el = document.getElementById('sidebar-navigation');
            el?.scrollIntoView({ behavior: 'smooth' });
            el?.focus?.();
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#E6CBA8] text-[#0A0A0A] font-extrabold shadow-[0_0_15px_rgba(230,203,168,0.3)] group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 fill-[#0A0A0A] stroke-[#0A0A0A]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-white font-sans transition-colors">
              AgentLock
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#B89B72] bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] font-semibold">
              2.0
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = activeView === link.id && link.targetId !== 'sidebar-navigation';
            return (
              <button
                key={`${link.id}-${link.label}`}
                onClick={() => {
                  if (link.targetId === 'sidebar-navigation') {
                    const el = document.getElementById('sidebar-navigation');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    el?.focus?.();
                  } else {
                    onNavigate(link.id);
                    document.getElementById(link.targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`relative px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#E6CBA8] text-[#0A0A0A] font-semibold shadow-[0_0_12px_rgba(230,203,168,0.25)]'
                    : 'bg-[#151515] text-[#BDBDBD] hover:text-white border border-[#2A2A2A] hover:border-[#E6CBA8]'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                      isActive
                        ? 'bg-[#0A0A0A] text-[#E6CBA8]'
                        : 'bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] border border-[#B89B72]'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Status & Operator Profile */}
        <div className="flex items-center gap-3">
          {/* Status pill */}
          <button
            onClick={onOpenApiSettings}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151515] border border-[#2A2A2A] hover:border-[#E6CBA8] text-xs font-mono text-[#BDBDBD] transition-all"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus.isConnected
                  ? 'bg-[#6FAF8A] shadow-[0_0_8px_#6FAF8A]'
                  : 'bg-[#E6CBA8] animate-pulse'
              }`}
            />
            <span className="hidden md:inline">
              {apiStatus.isConnected ? 'Engine Live' : 'Demo Sim Mode'}
            </span>
          </button>

          {/* User Profile: Grey ring, white initial */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#2A2A2A]">
            <div className="w-8 h-8 rounded-full bg-[#151515] border border-[#3D3D3D] flex items-center justify-center font-bold text-xs text-white">
              V
            </div>
            <div className="hidden xl:block text-left text-xs leading-none">
              <p className="font-semibold text-white">Vikas</p>
              <p className="text-[10px] text-[#8A8A8A] font-mono mt-0.5">Director SecOps</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
