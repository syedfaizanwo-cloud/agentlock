'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * ShieldZoomIntro
 * 
 * Cinematic opening camera-zoom introduction for AgentLock.
 * - Displays brand coral rounded-square with dark security shield cutout.
 * - Listens for true readiness signals: fonts loaded, window loaded, 3D wave canvas ready.
 * - Executes log-space camera zoom into the shield aperture using Web Animations API.
 * - Smoothly dissolves into the live application.
 * - Respects prefers-reduced-motion, supports instant skip on click/key, and remembers state in sessionStorage.
 */
export function ShieldZoomIntro() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const zoomTargetRef = useRef<HTMLDivElement>(null);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    // Check if user has already seen the intro in this session (unless ?intro=1 is present)
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const forceIntro = urlParams.get('intro') === '1';

    try {
      const seen = sessionStorage.getItem('agentlock_intro_seen');
      if (seen && !forceIntro) {
        return;
      }
    } catch {
      // Storage access blocked; proceed safely
    }

    setShouldRender(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Minimum display time for logo recognition: 1800ms
    const minHoldPromise = new Promise((resolve) => setTimeout(resolve, 1800));

    // Maximum timeout fallback: 4500ms
    const maxTimeoutPromise = new Promise((resolve) => setTimeout(resolve, 4500));

    // Fonts ready signal
    const fontsPromise = document.fonts ? document.fonts.ready : Promise.resolve();

    // Window loaded signal
    const windowLoadedPromise = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(true);
      } else {
        window.addEventListener('load', () => resolve(true), { once: true });
      }
    });

    // 3D Wave grid canvas ready signal
    const waveReadyPromise = new Promise((resolve) => {
      if ((window as any).__AGENTLOCK_WAVE_READY__) {
        resolve(true);
      } else {
        window.addEventListener('agentlock-wave-ready', () => resolve(true), { once: true });
      }
    });

    // Combined readiness
    const assetReadiness = Promise.all([fontsPromise, windowLoadedPromise, waveReadyPromise]);

    const finishIntro = (fastFade = false) => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;

      try {
        sessionStorage.setItem('agentlock_intro_seen', '1');
      } catch {
        // Storage access blocked
      }

      if (overlayRef.current) {
        overlayRef.current.style.transition = `opacity ${fastFade ? 250 : 350}ms ease-out`;
        overlayRef.current.style.opacity = '0';
        overlayRef.current.style.pointerEvents = 'none';
        setTimeout(() => {
          setShouldRender(false);
        }, fastFade ? 260 : 360);
      } else {
        setShouldRender(false);
      }
    };

    // User skip handlers (click, tap, or keypress)
    const handleSkip = () => {
      finishIntro(true);
    };

    window.addEventListener('keydown', handleSkip, { once: true });
    window.addEventListener('pointerdown', handleSkip, { once: true });

    // Wait for minimum hold + assets, bounded by max timeout
    Promise.race([
      Promise.all([minHoldPromise, assetReadiness]),
      maxTimeoutPromise,
    ]).then(() => {
      if (hasFinishedRef.current) return;

      if (prefersReducedMotion) {
        // Reduced motion: simple elegant crossfade after logo hold
        setTimeout(() => finishIntro(false), 600);
        return;
      }

      // Execute Cinematic Log-Space Camera Zoom
      setIsZooming(true);

      const zoomTarget = zoomTargetRef.current;
      if (!zoomTarget) {
        finishIntro(false);
        return;
      }

      // Calculate magnification scale S based on viewport diagonal vs shield hole
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const diagonal = Math.sqrt(vw * vw + vh * vh);

      // Hole width in screen coordinates is approx 28px when logo is 80px
      const holeSize = Math.max(24, Math.min(vw, vh) * 0.05);
      const S = Math.max(50, Math.ceil((diagonal / holeSize) * 1.25));

      // Build 24 log-space keyframes: scale = S^(easedT)
      const keyframes: Keyframe[] = [];
      const steps = 24;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Smooth cubic ease-in-out curve
        const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const scaleVal = Math.pow(S, easedT);
        keyframes.push({
          transform: `scale(${scaleVal.toFixed(4)})`,
        });
      }

      const anim = zoomTarget.animate(keyframes, {
        duration: 1100,
        easing: 'linear',
        fill: 'forwards',
      });

      anim.onfinish = () => {
        finishIntro(false);
      };
    });

    return () => {
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('pointerdown', handleSkip);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      ref={overlayRef}
      data-intro-overlay
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#060D1F] overflow-hidden select-none cursor-pointer"
      title="Click or press any key to skip intro"
    >
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: `[data-intro-overlay]{display:none !important;}` }} />
      </noscript>

      {/* Scalable Camera Target Container */}
      <div
        ref={zoomTargetRef}
        className="relative flex flex-col items-center justify-center will-change-transform origin-center"
        style={{
          transformOrigin: '50% 50%',
        }}
      >
        {/* Inline SVG with Coral Square, Dark Shield Cutout, and Outer Navy Field */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-2xl overflow-visible"
            aria-hidden="true"
          >
            <defs>
              {/* Mask: Outer world white, shield aperture black (transparent hole) */}
              <mask id="shield-aperture-mask">
                <rect x="-1000" y="-1000" width="2100" height="2100" fill="white" />
                {/* Shield path centered in 100x100 box (scaled from 24x24 viewBox) */}
                <path
                  d="M50 83.33s26.67-13.33 26.67-33.33V26.67l-26.67-10-26.67 10V50c0 20 26.67 33.33 26.67 33.33z"
                  fill="black"
                />
              </mask>
            </defs>

            {/* Oversized Navy Field to keep viewport covered at all zoom scales */}
            <rect
              x="-1000"
              y="-1000"
              width="2100"
              height="2100"
              fill="#060D1F"
              mask="url(#shield-aperture-mask)"
            />

            {/* Brand Coral Rounded Square Container */}
            <rect
              x="5"
              y="5"
              width="90"
              height="90"
              rx="24"
              fill="#FF6F59"
              mask="url(#shield-aperture-mask)"
            />

            {/* Dark Shield Contour Outline */}
            <path
              d="M50 83.33s26.67-13.33 26.67-33.33V26.67l-26.67-10-26.67 10V50c0 20 26.67 33.33 26.67 33.33z"
              fill="none"
              stroke="#060D1F"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Wordmark and Readiness Subtitle (fades out as camera approaches) */}
        <div
          className={`mt-6 text-center transition-opacity duration-300 ${
            isZooming ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-cream block">
            AgentLock
          </span>
          <span className="font-mono text-xs text-cream-muted uppercase tracking-widest mt-1 block">
            Autonomous Security Engine
          </span>
        </div>
      </div>

      {/* Skip Hint */}
      <div
        className={`absolute bottom-6 left-0 right-0 text-center text-[11px] font-mono text-cream-muted/50 transition-opacity duration-300 ${
          isZooming ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Press any key to enter
      </div>
    </div>
  );
}
