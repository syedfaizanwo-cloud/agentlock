'use client';

import React, { useState, useEffect } from 'react';
import { trackEvent } from '../analytics/AnalyticsManager';
import { Mail, ArrowRight } from 'lucide-react';

interface StickyMobileCtaProps {
  isDrawerOpen: boolean;
}

export const StickyMobileCta: React.FC<StickyMobileCtaProps> = ({ isDrawerOpen }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [cookieBannerActive, setCookieBannerActive] = useState(false);

  useEffect(() => {
    // Check if contact section is in view
    const contactEl = document.getElementById('contact');
    if (!contactEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(contactEl);

    // Listen for cookie banner
    const handleCookieClosed = () => setCookieBannerActive(false);
    window.addEventListener('cookie-banner-closed', handleCookieClosed);

    return () => {
      observer.disconnect();
      window.removeEventListener('cookie-banner-closed', handleCookieClosed);
    };
  }, []);

  if (isDrawerOpen || !isVisible) return null;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#0D0D0D]/95 border-t border-[#2A2A2A] backdrop-blur-xl shadow-[0_-5px_25px_rgba(0,0,0,0.8)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
      role="region"
      aria-label="Mobile quick action"
    >
      <button
        onClick={() => {
          const el = document.getElementById('contact');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', '#contact');
            trackEvent('cta_click', { location: 'sticky_mobile_bar', label: 'Request a Demo' });
          }
        }}
        type="button"
        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#E6CBA8] active:bg-[#F7E7CE] text-[#0A0A0A] shadow-[0_0_15px_rgba(230,203,168,0.3)] transition-all"
      >
        <Mail className="w-4 h-4" />
        <span>Request a Demo</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
