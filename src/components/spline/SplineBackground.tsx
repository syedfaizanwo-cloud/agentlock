'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { Box, Sparkles, EyeOff } from 'lucide-react';

interface SplineBackgroundProps {
  isDrawerOpen?: boolean;
}

export const SplineBackground: React.FC<SplineBackgroundProps> = memo(
  ({ isDrawerOpen = false }) => {
    const [isLowPower, setIsLowPower] = useState(false);
    const [forceEnable3D, setForceEnable3D] = useState(false);
    const [shouldLoadIframe, setShouldLoadIframe] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const lastScrollY = useRef(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    // 1. Detect low-power devices & reduced motion
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const nav = window.navigator as any;
      const isLowCpu = nav.hardwareConcurrency && nav.hardwareConcurrency <= 4;
      const isLowMem = nav.deviceMemory && nav.deviceMemory <= 4;
      const isSaveData = nav.connection?.saveData === true;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isLowCpu || isLowMem || isSaveData || prefersReducedMotion) {
        setIsLowPower(true);
      }
    }, []);

    // 2. Lazy-load after first paint and hero text visibility
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const startLoading = () => {
        setShouldLoadIframe(true);
      };

      if ('requestIdleCallback' in window) {
        const handle = (window as any).requestIdleCallback(startLoading, { timeout: 1200 });
        return () => (window as any).cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(startLoading, 250);
        return () => clearTimeout(timer);
      }
    }, []);

    // 3. Pause rendering when tab hidden or drawer open or fast scroll
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const handleVisibilityChange = () => {
        setIsPaused(document.visibilityState === 'hidden' || isDrawerOpen);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isDrawerOpen]);

    useEffect(() => {
      setIsPaused(isDrawerOpen);
    }, [isDrawerOpen]);

    // Send postMessage pause/resume to Spline scene iframe
    useEffect(() => {
      if (!iframeRef.current || !iframeRef.current.contentWindow) return;
      try {
        iframeRef.current.contentWindow.postMessage(isPaused ? 'pause' : 'resume', '*');
      } catch (e) {}
    }, [isPaused]);

    // Fast scroll detection
    useEffect(() => {
      if (typeof window === 'undefined') return;

      let lastTime = performance.now();

      const handleScroll = () => {
        const now = performance.now();
        const dt = now - lastTime;
        const currentY = window.scrollY;
        if (dt > 16) {
          const speed = Math.abs(currentY - lastScrollY.current) / (dt / 1000);
          if (speed > 1600) {
            setIsPaused(true);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
              setIsPaused(false);
            }, 180);
          }
          lastScrollY.current = currentY;
          lastTime = now;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      };
    }, []);

    const show3D = !isLowPower || forceEnable3D;

    return (
      <div
        className="fixed inset-0 pointer-events-auto z-0 overflow-hidden select-none bg-[#050505]"
        aria-hidden="true"
      >
        {/* Instant Black/Gold Gradient Poster */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ease-out pointer-events-none ${
            isLoaded && show3D ? 'opacity-30' : 'opacity-100'
          }`}
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(230, 203, 168, 0.08) 0%, rgba(5, 5, 5, 0.95) 70%, #050505 100%)',
          }}
        />

        {/* Live Spline 3D Scene */}
        {shouldLoadIframe && show3D && (
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              visibility: isPaused ? 'hidden' : 'visible',
              transform: 'translateZ(0)',
            }}
          >
            <iframe
              ref={iframeRef}
              src="/spline/scene.html"
              title="AgentLock 2.0 3D Spline Interactive Mesh"
              loading="lazy"
              // @ts-ignore
              fetchpriority="low"
              onLoad={() => setIsLoaded(true)}
              className="w-full h-full border-0 pointer-events-auto block"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              }}
            />
          </div>
        )}

        {/* Zero-Jank Hardware Grayscale & Vignette Compositor Layer */}
        {/* Uses mix-blend-mode: saturation with pure black overlay on isolated GPU layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: 'saturation',
            backgroundColor: '#000000',
            transform: 'translateZ(0)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(5, 5, 5, 0.25) 0%, rgba(5, 5, 5, 0.65) 50%, rgba(5, 5, 5, 0.92) 100%)',
            transform: 'translateZ(0)',
          }}
        />

        {/* Low-Power Mode Toggle Badge */}
        {isLowPower && (
          <div className="absolute bottom-6 left-6 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={() => setForceEnable3D((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono bg-[#151515]/90 border border-[#3D3D3D] text-[#BDBDBD] hover:text-[#E6CBA8] hover:border-[#E6CBA8] transition-colors shadow-lg active:scale-95"
              aria-label={forceEnable3D ? 'Disable 3D Background' : 'Enable 3D Background'}
            >
              {forceEnable3D ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#E6CBA8]" />
                  <span>3D Active (High Power)</span>
                </>
              ) : (
                <>
                  <Box className="w-3.5 h-3.5 text-[#E6CBA8]" />
                  <span>Enable 3D Scene</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  },
  (prev, next) => prev.isDrawerOpen === next.isDrawerOpen
);

SplineBackground.displayName = 'SplineBackground';
