'use client';

import React, { useEffect, useState, useRef } from 'react';

export const ScrollProgressLine: React.FC = () => {
  const [scaleX, setScaleX] = useState(0);
  const [supportsScrollTimeline, setSupportsScrollTimeline] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (CSS.supports && CSS.supports('animation-timeline: scroll()')) {
      setSupportsScrollTimeline(true);
      return;
    }

    // High-performance single rAF fallback without layout thrashing
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const doc = document.documentElement;
          const scrollHeight = doc.scrollHeight - window.innerHeight;
          if (scrollHeight > 0) {
            const progress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${progress})`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className={`scroll-progress-line fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none origin-left bg-gradient-to-r from-[#B89B72] via-[#E6CBA8] to-[#F7E7CE] shadow-[0_0_10px_rgba(230,203,168,0.5)] ${
        supportsScrollTimeline ? 'scroll-timeline-progress' : ''
      }`}
      style={{
        transform: supportsScrollTimeline ? undefined : `scaleX(${scaleX})`,
      }}
      aria-hidden="true"
    />
  );
};
