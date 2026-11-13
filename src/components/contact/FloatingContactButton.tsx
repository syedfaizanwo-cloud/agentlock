'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mail, MessageSquare, ArrowUpRight, X, Clock, Shield } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';

interface FloatingContactButtonProps {
  isDrawerOpen?: boolean;
  isModalOpen?: boolean;
  currentSectionId?: string;
}

export const FloatingContactButton: React.FC<FloatingContactButtonProps> = ({
  isDrawerOpen = false,
  isModalOpen = false,
  currentSectionId = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const contactEmail = 'security@agentlock.ai';
  const responseTimeNote = '24/7 SecOps Dispatch • Avg response < 15m';

  // Hide button when on contact section or when drawer/modal is open
  const isHidden = isDrawerOpen || isModalOpen || currentSectionId === 'contact';

  // Outside click & ESC listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (isHidden) return null;

  const handleScrollToContact = () => {
    setIsOpen(false);
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '#contact');
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 mb-[env(safe-area-inset-bottom)] sm:mb-0">
      {/* Popover Card */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Direct SecOps Dispatch"
          className="absolute bottom-16 left-0 w-80 sm:w-88 bg-[#0D0D0D] border border-[#2A2A2A] rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6FAF8A] animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                SecOps Incident Dispatch
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#8A8A8A] hover:text-white p-1 rounded-md"
              aria-label="Close contact popover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Email row with CopyButton */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#8A8A8A]">
              Direct Security Inquiries
            </span>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#151515] border border-[#2A2A2A]">
              <a
                href={`mailto:${contactEmail}`}
                className="text-xs font-mono text-white hover:text-[#E6CBA8] transition-colors truncate"
              >
                {contactEmail}
              </a>
              <CopyButton text={contactEmail} label="Copy" />
            </div>
          </div>

          {/* Request a Demo CTA */}
          <div>
            <button
              type="button"
              onClick={handleScrollToContact}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(230,203,168,0.25)] flex items-center justify-center gap-2"
            >
              <span>Request Runtime Demo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Response time note */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8A8A8A] pt-1 border-t border-[#2A2A2A]">
            <Clock className="w-3.5 h-3.5 text-[#E6CBA8] shrink-0" />
            <span>{responseTimeNote}</span>
          </div>
        </div>
      )}

      {/* Floating Gold Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open incident dispatch contact"
        aria-expanded={isOpen}
        title="Contact SecOps Dispatch"
        className="w-12 h-12 rounded-full bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] shadow-[0_0_25px_rgba(230,203,168,0.4)] border border-[#B89B72] hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#E6CBA8] group"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[#0A0A0A]" />
        ) : (
          <Mail className="w-5 h-5 text-[#0A0A0A] group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
};
