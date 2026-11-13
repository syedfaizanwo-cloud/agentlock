'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import FlowingMenu, { FlowingMenuItem } from '../FlowingMenu';
import { trackEvent } from '../analytics/AnalyticsManager';
import { Shield, X, Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HamburgerDrawerProps {
  items: FlowingMenuItem[];
  activeSectionId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSearch?: () => void;
}

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  items,
  activeSectionId = 'telemetry',
  isOpen,
  onOpenChange,
  onOpenSearch,
}) => {
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [drawerKey, setDrawerKey] = useState(0);

  // Compute activeIndex based on current section
  const activeIndex = items.findIndex(
    (item) => item.link === `#${activeSectionId}`
  );

  const handleOpen = useCallback(() => {
    onOpenChange(true);
    setDrawerKey((prev) => prev + 1); // trigger FlowingMenu intro animation
    trackEvent('menu_open', { menu_type: 'hamburger_drawer' });
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Restore focus to hamburger trigger
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
      // Auto-focus close button
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleItemSelect = (
    item: FlowingMenuItem,
    _index: number,
    event?: React.MouseEvent
  ) => {
    event?.preventDefault();
    handleClose();

    const targetId = item.link?.replace('#', '');
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${targetId}`);
        trackEvent('menu_item_click', { section: targetId, label: item.text });
      }
    }
  };

  return (
    <>
      {/* A2: Fixed Hamburger Button (Top-Right, 48x48px, z-index 100) */}
      <button
        ref={triggerButtonRef}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        className="fixed top-5 right-5 z-[100] w-12 h-12 rounded-full border border-[#E6CBA8] bg-[#0D0D0D]/90 hover:bg-[#151515] backdrop-blur-xl flex flex-col items-center justify-center gap-1.5 p-3 shadow-[0_0_20px_rgba(230,203,168,0.25)] transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#E6CBA8] focus:ring-offset-2 focus:ring-offset-[#050505]"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="site-menu"
        type="button"
      >
        <span
          className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 transform origin-center ${
            isOpen ? 'rotate-45 translate-y-2 bg-[#E6CBA8]' : 'group-hover:w-5'
          }`}
        />
        <span
          className={`w-5 h-0.5 bg-white rounded-full transition-opacity duration-200 ${
            isOpen ? 'opacity-0' : 'group-hover:bg-[#E6CBA8]'
          }`}
        />
        <span
          className={`w-5 h-0.5 bg-white rounded-full transition-all duration-300 transform origin-center ${
            isOpen ? '-rotate-45 -translate-y-2 bg-[#E6CBA8]' : 'group-hover:w-5'
          }`}
        />
      </button>

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-[95] bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* A2: Slide-in Overlay Drawer (Right-aligned, 420px wide or full-screen on mobile) */}
      <aside
        id="site-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation menu"
        className={`fixed top-0 right-0 bottom-0 z-[96] w-full sm:w-[420px] bg-[#0A0A0A] border-l border-[#2A2A2A] shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] bg-[#0D0D0D]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E6CBA8] text-[#0A0A0A] flex items-center justify-center shadow-[0_0_10px_rgba(230,203,168,0.3)]">
              <Shield className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-sm font-sans font-bold text-white tracking-tight">
                AgentLock <span className="text-[#E6CBA8]">2.0</span>
              </div>
              <div className="text-[10px] font-mono text-[#8A8A8A] uppercase tracking-wider">
                Autonomous SecOps Mesh
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleClose();
                if (onOpenSearch) onOpenSearch();
                else window.dispatchEvent(new CustomEvent('open-site-search'));
              }}
              aria-label="Search site (Ctrl+K)"
              title="Search site (Ctrl+K)"
              className="p-2 rounded-full text-[#8A8A8A] hover:text-white hover:bg-[#1E1E1E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6CBA8] flex items-center gap-1.5"
              type="button"
            >
              <Search className="w-4 h-4 text-[#E6CBA8]" />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-[#8A8A8A] bg-[#151515] border border-[#2A2A2A] rounded">
                ⌘K
              </kbd>
            </button>

            <button
              ref={closeButtonRef}
              onClick={handleClose}
              aria-label="Close navigation drawer"
              className="p-2 rounded-full text-[#8A8A8A] hover:text-white hover:bg-[#1E1E1E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E6CBA8]"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body: FlowingMenu with exact props */}
        <div className="flex-1 relative overflow-hidden min-h-0 bg-[#07060B]">
          {isOpen && (
            <FlowingMenu
              key={drawerKey}
              items={items}
              speed={60}
              stretch={0.6}
              magnet={0.25}
              followCursor={0.4}
              showIndex={true}
              showArrow={true}
              align="left"
              dimInactive={true}
              textColor="#ffffff"
              bgColor="transparent"
              marqueeBgColor="#E6CBA8"
              marqueeTextColor="#0A0A0A"
              ariaLabel="AgentLock 2.0 navigation"
              activeIndex={activeIndex !== -1 ? activeIndex : undefined}
              onItemClick={handleItemSelect}
            />
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#0D0D0D] flex flex-col gap-3 text-[11px] font-mono text-[#8A8A8A]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6FAF8A] animate-pulse" />
              Gateway Online
            </span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#5C5C5C] pt-1 border-t border-[#1E1E1E]">
            <span>Deterministic Runtime Mesh</span>
            <span className="text-[#E6CBA8]">12 Vectors Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
