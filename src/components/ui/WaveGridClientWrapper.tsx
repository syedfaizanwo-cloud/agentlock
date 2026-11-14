'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { WaveGridErrorBoundary } from './wave-grid-background';

const WaveGrid = dynamic(() => import('./wave-grid-background'), {
  ssr: false,
  loading: () => (
    <div
      className="fixed inset-0 z-0 pointer-events-none bg-[#060D1F]"
      aria-hidden="true"
    />
  ),
});

export function WaveGridClientWrapper() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isInHero, setIsInHero] = useState(true);

  useEffect(() => {
    // Defer mount after first paint using requestIdleCallback or setTimeout
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => setShouldRender(true));
      } else {
        setTimeout(() => setShouldRender(true), 50);
      }
    }

    // IntersectionObserver to adjust intensity: full in hero #top, calm elsewhere
    const heroEl = document.getElementById('top');
    if (heroEl && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInHero(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      observer.observe(heroEl);
      return () => observer.disconnect();
    }
  }, []);

  if (!shouldRender) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-[#060D1F]"
        aria-hidden="true"
      />
    );
  }

  return (
    <WaveGridErrorBoundary>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <WaveGrid
          colorBase="#22407A"
          colorHigh="#FF6F59"
          autoAnimate={isInHero}
          waveAmplitude={isInHero ? 0.55 : 0.25}
          waveSpeed={isInHero ? 1.0 : 0.5}
        />
      </div>
    </WaveGridErrorBoundary>
  );
}
