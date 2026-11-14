'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Loader2, LogIn, LogOut } from 'lucide-react';
import { StickySectionLabel } from './StickySectionLabel';
import { HamburgerDrawer } from './HamburgerDrawer';
import { ApiStatusModal } from '../api-status/ApiStatusModal';
import { api } from '../../lib/api-client';
import type { User } from '../../types/api';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getCurrentUser()
      .then((user) => {
        if (isMounted) setCurrentUser(user);
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-navy-950 border-b border-[#1A2E5A] px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Wordmark & Backend Connectivity Pill */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-cream group focus:outline-none focus:ring-2 focus:ring-coral rounded-lg p-1"
            aria-label="AgentLock Home"
          >
            <div className="w-8 h-8 rounded-lg bg-coral text-navy-950 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <span className="font-sans font-bold text-base tracking-tight text-cream">
              AgentLock
            </span>
          </Link>

          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-navy-900 border border-[#1A2E5A] text-cream-muted hover:border-coral hover:text-cream transition-colors"
            title="Inspect backend connection state"
          >
            {backendOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-severity-low" />
                <span>API {latencyMs}ms</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                <span>Offline</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Scroll-spy Section Indicator */}
        <div className="flex items-center justify-center">
          <StickySectionLabel activeSectionId={activeSectionId} />
        </div>

        {/* Right: Live Scan Chip, Auth Controls & Hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isScanning && (
            <a
              href="#scan"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold bg-coral/15 text-coral border border-coral/40 hover:bg-coral/25 transition-colors"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {typeof scanProgress === 'number'
                  ? `Scanning ${scanProgress}%`
                  : 'Scan in progress'}
              </span>
            </a>
          )}

          {/* Auth Controls */}
          {currentUser ? (
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono bg-navy-900 border border-[#1A2E5A] text-cream">
              <span className="w-1.5 h-1.5 rounded-full bg-severity-low flex-shrink-0" aria-hidden="true" />
              <span className="max-w-[120px] truncate" title={currentUser.email || currentUser.name || 'User'}>
                {currentUser.name || currentUser.email?.split('@')[0] || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="text-cream-muted hover:text-coral transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-coral"
                aria-label="Log out of account"
                title="Log out"
                type="button"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium text-cream border border-[#1A2E5A] bg-navy-900 hover:border-coral hover:text-coral transition-colors focus:outline-none focus:ring-2 focus:ring-coral"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log in</span>
            </Link>
          )}

          <HamburgerDrawer
            activeSectionId={activeSectionId}
            isOpen={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            counts={counts}
            currentUser={currentUser}
            onLogout={handleLogout}
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
