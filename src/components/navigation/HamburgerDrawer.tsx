'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Shield, X, Github, ExternalLink } from 'lucide-react';
import TextRoll from '../ui/text-roll';

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
}

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  activeSectionId = 'overview',
  isOpen,
  onOpenChange,
  counts = {},
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
    }
  };

  return (
    <>
      {/* Fixed Hamburger Trigger Button (48x48px hit area, raised-sm, navy surface) */}
      <button
        ref={triggerButtonRef}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        className="w-12 h-12 rounded-xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] flex flex-col items-center justify-center gap-1.5 p-3 text-[#F5EDDC] hover:border-[#FF6F59] active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6F59]"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="site-menu"
        type="button"
      >
        <span
          className={`w-5 h-0.5 bg-[#F5EDDC] rounded-full transition-all duration-200 transform origin-center ${
            isOpen ? 'rotate-45 translate-y-2 bg-[#FF6F59]' : ''
          }`}
        />
        <span
          className={`w-5 h-0.5 bg-[#F5EDDC] rounded-full transition-opacity duration-150 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`w-5 h-0.5 bg-[#F5EDDC] rounded-full transition-all duration-200 transform origin-center ${
            isOpen ? '-rotate-45 -translate-y-2 bg-[#FF6F59]' : ''
          }`}
        />
      </button>

      {/* Solid Navy Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[95] bg-[#030714]/80 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Solid Navy Drawer (No blur, no glassmorphism) */}
      <aside
        id="site-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 bottom-0 z-[96] w-full sm:w-[380px] bg-[#0A1633] border-l border-[#12234A] shadow-[8px_0_24px_#030714] flex flex-col transition-transform duration-250 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#12234A] bg-[#060D1F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6F59] text-[#060D1F] flex items-center justify-center font-bold shadow-[2px_2px_4px_#030714]">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-sm font-sans font-bold text-[#F5EDDC] tracking-tight">
                AgentLock
              </div>
              <div className="text-[10px] font-mono text-[#C8C0AC] uppercase tracking-wider">
                Red Teaming Platform
              </div>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={handleClose}
            aria-label="Close navigation drawer"
            className="w-9 h-9 rounded-lg bg-[#0A1633] border border-[#12234A] text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6F59]"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items with TextRoll */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeSectionId === item.id;
            const count = counts[item.id];

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleItemSelect(item.id, e)}
                aria-current={isActive ? 'true' : undefined}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-[#12234A] border-[#FF6F59] text-[#F5EDDC] shadow-[inset_3px_3px_6px_#030714,inset_-3px_-3px_6px_#12234A]'
                    : 'bg-[#0A1633] border-transparent hover:border-[#12234A] text-[#C8C0AC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isActive ? 'bg-[#FF6F59]' : 'bg-[#12234A] group-hover:bg-[#FF6F59]/50'
                    }`}
                  />
                  <span className="text-xs font-mono text-[#C8C0AC]/60">0{idx + 1}</span>
                  <TextRoll
                    className="font-sans font-semibold text-sm tracking-wide text-[#F5EDDC]"
                    active={isActive}
                  >
                    {item.label}
                  </TextRoll>
                </div>

                {typeof count === 'number' && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#060D1F] border border-[#12234A] text-[#C8C0AC]">
                    {count}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Drawer Footer with GitHub Link */}
        <div className="p-6 border-t border-[#12234A] bg-[#060D1F] space-y-3">
          <a
            href="https://github.com/syedfaizanwo-cloud/agentlock"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0A1633] border border-[#12234A] text-xs font-mono text-[#C8C0AC] hover:text-[#F5EDDC] hover:border-[#FF6F59] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              <span>GitHub Repo</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
          <div className="text-[10px] font-mono text-[#C8C0AC]/60 text-center">
            AgentLock // Authorized Testing Only
          </div>
        </div>
      </aside>
    </>
  );
};
