'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Shield, X, Github, ExternalLink, LogIn, LogOut } from 'lucide-react';
import type { User } from '../../types/api';

export interface NavItem {
  id: string;
  label: string;
  count?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'agents', label: 'Agents' },
  { id: 'scan', label: 'Scan' },
  { id: 'results', label: 'Results' },
  { id: 'reports', label: 'Reports' },
  { id: 'faq', label: 'FAQ' },
];

interface HamburgerDrawerProps {
  activeSectionId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  counts?: Record<string, number>;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  activeSectionId = 'overview',
  isOpen,
  onOpenChange,
  counts = {},
  currentUser,
  onLogout,
}) => {
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      triggerButtonRef.current?.focus();
    }, 50);
  }, [onOpenChange]);

  // Handle ESC key and focus trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      // Trap focus
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 80);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleItemSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    handleClose();

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
      setTimeout(() => {
        const heading = el.querySelector('h1, h2, h3') as HTMLElement | null;
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      }, 350);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <>
      <button
        ref={triggerButtonRef}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        className="w-10 h-10 rounded-lg bg-navy-900 border border-[#1A2E5A] flex flex-col items-center justify-center gap-1 p-2.5 text-cream hover:border-coral active:scale-95 transition-colors focus:outline-none focus:ring-2 focus:ring-coral"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="site-menu"
        type="button"
      >
        <span
          className={`w-4 h-0.5 bg-cream rounded-full transition-all duration-200 transform origin-center ${
            isOpen ? 'rotate-45 translate-y-1.5 bg-coral' : ''
          }`}
        />
        <span
          className={`w-4 h-0.5 bg-cream rounded-full transition-opacity duration-150 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`w-4 h-0.5 bg-cream rounded-full transition-all duration-200 transform origin-center ${
            isOpen ? '-rotate-45 -translate-y-1.5 bg-coral' : ''
          }`}
        />
      </button>

      {/* Solid Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[95] bg-navy-950/80 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Solid Navy Drawer */}
      <aside
        id="site-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 bottom-0 z-[96] w-full sm:w-[360px] bg-navy-900 border-l border-[#1A2E5A] shadow-2xl flex flex-col transition-transform duration-200 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1A2E5A] bg-navy-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-coral text-navy-950 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-sm font-sans font-bold text-cream">
                AgentLock
              </div>
              <div className="text-xs font-mono text-cream-muted">
                Red Teaming Platform
              </div>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={handleClose}
            aria-label="Close navigation drawer"
            className="w-8 h-8 rounded-lg bg-navy-900 border border-[#1A2E5A] text-cream-muted hover:text-cream hover:border-coral flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-coral"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-5 space-y-1.5">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeSectionId === item.id;
            const count = counts[item.id];

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleItemSelect(item.id, e)}
                aria-current={isActive ? 'true' : undefined}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-navy-850 border-coral text-cream'
                    : 'bg-transparent border-transparent hover:bg-navy-850 hover:border-[#1A2E5A] text-cream-muted hover:text-cream'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cream-muted">0{idx + 1}</span>
                  <span className="text-sm font-sans font-medium text-cream">
                    {item.label}
                  </span>
                </div>

                {typeof count === 'number' && count > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-navy-950 text-coral border border-[#1A2E5A]">
                    {count}
                  </span>
                )}
              </a>
            );
          })}

          <div className="pt-2 border-t border-[#1A2E5A] mt-3">
            {currentUser ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono text-cream-muted bg-navy-950 rounded-lg border border-[#1A2E5A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-severity-low flex-shrink-0" />
                  <span className="truncate">{currentUser.email || currentUser.name || 'Signed In'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-mono text-cream hover:bg-navy-850 hover:text-coral transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-coral" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={handleClose}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-mono text-cream hover:bg-navy-850 hover:text-coral transition-colors"
              >
                <LogIn className="w-4 h-4 text-coral" />
                <span>Log in</span>
              </Link>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-[#1A2E5A] bg-navy-950 text-xs font-mono text-cream-muted space-y-3">
          <a
            href="https://github.com/syedfaizanwo-cloud/agentlock"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-cream hover:text-coral transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <div>Zero Fabricated Data Guarantee</div>
        </div>
      </aside>
    </>
  );
};
