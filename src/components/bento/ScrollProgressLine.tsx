'use client';

import React, { useEffect, useRef } from 'react';

export const ScrollProgressLine: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const doc = document.documentElement;
          const scrollHeight = doc.scrollHeight - window.innerHeight;
          if (scrollHeight > 0 && barRef.current) {
            const progress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
            barRef.current.style.transform = `scaleX(${progress})`;
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
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none origin-left bg-[#FF6F59]"
      style={{
        transform: 'scaleX(0)',
      }}
      aria-hidden="true"
    />
  );
};
