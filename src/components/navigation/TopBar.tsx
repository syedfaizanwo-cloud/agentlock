'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Loader2, Wifi, WifiOff } from 'lucide-react';
import { StickySectionLabel } from './StickySectionLabel';
import { HamburgerDrawer } from './HamburgerDrawer';
import { ApiStatusModal } from '../api-status/ApiStatusModal';
import { ScrollProgressLine } from '../bento/ScrollProgressLine';

interface TopBarProps {
  activeSectionId: string;
  isScanning?: boolean;
  scanProgress?: number | null;
  backendOnline?: boolean;
  latencyMs?: number;
  counts?: Record<string, number>;
  onRefreshHealth?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSectionId,
  isScanning = false,
  scanProgress = null,
  backendOnline = false,
  latencyMs = 0,
  counts = {},
  onRefreshHealth,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  return (
    <>
      <ScrollProgressLine />

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A1633] border-b border-[#12234A] shadow-[0_4px_12px_#030714] px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Wordmark & Backend Connectivity Pill */}
        <div className="flex items-center gap-3">
          <a
            href="#top"
            className="flex items-center gap-2.5 text-[#F5EDDC] group focus:outline-none focus:ring-2 focus:ring-[#FF6F59] rounded-lg p-1"
            aria-label="AgentLock Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FF6F59] text-[#060D1F] flex items-center justify-center font-bold shadow-[2px_2px_4px_#030714] transition-transform group-hover:scale-105">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <span className="font-sans font-bold text-base tracking-tight text-[#F5EDDC]">
              AgentLock
            </span>
          </a>

          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#060D1F] border border-[#12234A] text-[#C8C0AC] hover:border-[#FF6F59] hover:text-[#F5EDDC] transition-colors"
            title="Inspect backend connection state"
          >
            {backendOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>API {latencyMs}ms</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F59]" />
                <span>OFFLINE</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Scroll-spy Section Indicator */}
        <div className="flex items-center justify-center">
          <StickySectionLabel activeSectionId={activeSectionId} />
        </div>

        {/* Right: Live Scan Chip & Hamburger */}
        <div className="flex items-center gap-3">
          {isScanning && (
            <a
              href="#scan"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/40 hover:bg-[#FF6F59]/25 transition-colors shadow-sm animate-pulse"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {typeof scanProgress === 'number'
                  ? `SCANNING ${scanProgress}%`
                  : 'SCAN IN PROGRESS'}
              </span>
            </a>
          )}

          <HamburgerDrawer
            activeSectionId={activeSectionId}
            isOpen={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            counts={counts}
          />
        </div>
      </header>

      {/* Backend Status Modal */}
      <ApiStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        isConnected={backendOnline}
        latencyMs={latencyMs}
        onRefresh={onRefreshHealth}
      />
    </>
  );
};
