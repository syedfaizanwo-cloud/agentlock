'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Cookie, Check, X, Shield, Settings } from 'lucide-react';
import { onConsentGranted } from '../../lib/utm';

const Link = ({ href, children, ...props }: any) => (
  <a href={href} {...props}>
    {children}
  </a>
);

const GA_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GA_ID) || 'G-XXXXXXXXXX';
const CONSENT_KEY = 'agentlock_consent';

export interface ConsentPreferences {
  necessary: boolean; // always true
  analytics: boolean;
  timestamp: string;
}

export function trackEvent(
  eventName: string,
  eventParams: Record<string, any> = {}
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
}

export const AnalyticsManager: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  // Initialize consent mode
  useEffect(() => {
    // Configure default Google Consent Mode
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => {
        (window as any).dataLayer.push(args);
      };
      (window as any).gtag = gtag;

      // Default consent to denied
      gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        anonymize_ip: true,
      });

      // Check existing consent in localStorage
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        try {
          const parsed: ConsentPreferences = JSON.parse(stored);
          if (parsed.analytics) {
            enableAnalytics();
          }
          setShowBanner(false);
        } catch {
          setShowBanner(true);
        }
      } else {
        setShowBanner(true);
      }
    }

    // Listen for custom event to reopen cookie settings from footer
    const handleReopen = () => {
      setShowPreferences(true);
      setShowBanner(true);
    };
    window.addEventListener('open-cookie-settings', handleReopen);
    return () => window.removeEventListener('open-cookie-settings', handleReopen);
  }, []);

  const enableAnalytics = () => {
    setAnalyticsConsent(true);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });

      // Load GA4 script if not already present
      if (!document.getElementById('ga-gtag-script') && GA_ID && GA_ID !== 'G-XXXXXXXXXX') {
        const script = document.createElement('script');
        script.id = 'ga-gtag-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        (window as any).gtag('js', new Date());
        (window as any).gtag('config', GA_ID, {
          anonymize_ip: true,
          send_page_view: true,
        });
      }
    }
  };

  const saveConsent = (analytics: boolean) => {
    const preferences: ConsentPreferences = {
      necessary: true,
      analytics,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    if (analytics) {
      enableAnalytics();
      onConsentGranted();
    } else {
      setAnalyticsConsent(false);
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }
    setShowBanner(false);
    setShowPreferences(false);
    window.dispatchEvent(new CustomEvent('cookie-banner-closed'));
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto p-5 rounded-2xl bg-[#0D0D0D]/95 border border-[#E6CBA8]/50 shadow-[0_0_35px_rgba(0,0,0,0.85)] backdrop-blur-xl text-xs font-mono text-[#BDBDBD] space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-white font-sans font-bold">
          <Cookie className="w-4 h-4 text-[#E6CBA8]" />
          <span>Privacy & Security Preferences</span>
        </div>
        <button
          onClick={() => saveConsent(false)}
          aria-label="Dismiss cookie notice"
          className="p-1 rounded text-[#8A8A8A] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-[#8A8A8A] font-sans">
        We use cookies to understand how the site is used, measure telemetry latency, and secure autonomous agent transactions. Read our{' '}
        <Link href="/privacy" className="text-[#E6CBA8] underline hover:text-[#F7E7CE]">
          Privacy Policy
        </Link>.
      </p>

      {/* Preferences Accordion */}
      {showPreferences && (
        <div className="p-3 rounded-xl bg-[#151515] border border-[#2A2A2A] space-y-2.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-white">
              <Shield className="w-3.5 h-3.5 text-[#6FAF8A]" />
              Strictly Necessary (Always Active)
            </span>
            <span className="text-[10px] text-[#6FAF8A] bg-[#6FAF8A]/10 px-2 py-0.5 rounded">REQUIRED</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#2A2A2A]">
            <span className="text-zinc-300">Analytics & Performance</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={(e) => setAnalyticsConsent(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#E6CBA8]"></div>
            </label>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => saveConsent(true)}
          className="flex-1 min-w-[110px] px-3.5 py-2 rounded-full text-xs font-bold bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] shadow-[0_0_12px_rgba(230,203,168,0.25)] transition-all text-center"
        >
          Accept all
        </button>
        <button
          onClick={() => saveConsent(false)}
          className="flex-1 min-w-[110px] px-3.5 py-2 rounded-full text-xs font-medium bg-[#151515] hover:bg-[#1E1E1E] text-white border border-[#2A2A2A] transition-all text-center"
        >
          Reject non-essential
        </button>
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className="px-3 py-2 rounded-full text-xs text-[#8A8A8A] hover:text-[#E6CBA8] border border-transparent hover:border-[#2A2A2A] transition-all flex items-center justify-center gap-1"
          aria-expanded={showPreferences}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Preferences</span>
        </button>
      </div>
    </div>
  );
};
