'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  isDrawerOpen?: boolean;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
  isDrawerOpen = false,
}) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Do NOT hijack touch scrolling on mobile devices
    const isMobile =
      typeof window !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768);

    if (isMobile) {
      // Native smooth scroll on mobile to guarantee 60fps without JS touch interception
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1.0,
      autoRaf: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    (window as any).__lenis = lenis;

    let rafId: number;
    function sharedRaf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(sharedRaf);
    }
    rafId = requestAnimationFrame(sharedRaf);

    // Global hash link interceptor for smooth anchor scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el, { offset: 0, duration: 1.1 });
        }
      }
    };

    // Pause on cookie settings modal
    const handleCookieModalOpen = () => lenis.stop();
    const handleCookieModalClose = () => lenis.start();

    document.addEventListener('click', handleAnchorClick, { passive: false });
    window.addEventListener('open-cookie-settings', handleCookieModalOpen);
    window.addEventListener('close-cookie-settings', handleCookieModalClose);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('open-cookie-settings', handleCookieModalOpen);
      window.removeEventListener('close-cookie-settings', handleCookieModalClose);
      lenis.destroy();
      (window as any).__lenis = null;
    };
  }, []);

  // Pause Lenis when hamburger drawer is open
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isDrawerOpen) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isDrawerOpen]);

  return <>{children}</>;
};

// Global scroll helper that uses Lenis if active or falls back to native scrollIntoView
export const smoothScrollTo = (target: string | HTMLElement) => {
  if (typeof window !== 'undefined') {
    if ((window as any).__lenis) {
      (window as any).__lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    } else {
      const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
};
