'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * ShieldZoomIntro
 * 
 * Cinematic opening camera-zoom introduction for AgentLock.
 * - Single self-contained controller and state machine.
 * - Draws shield contour outline via stroke-dashoffset (0 to 600ms).
 * - Fades and scales in brand coral square (250 to 600ms) and wordmark (300 to 600ms).
 * - Progress line eases toward 90% (1800ms) and snaps to 100% on readiness signals.
 * - Gentle scanning pass sweeps across shield once using transform and opacity.
 * - Dissolves inner shield aperture and zooms camera straight through into live homepage.
 * - React 18 Strict Mode safe, reduced motion compliant, and crash-proof.
 */
export function ShieldZoomIntro() {
  const [shouldRender, setShouldRender] = useState(false);
  const [strokeOffset, setStrokeOffset] = useState(60);
  const [coralScale, setCoralScale] = useState(0.9);
  const [coralOpacity, setCoralOpacity] = useState(0);
  const [wordmarkOpacity, setWordmarkOpacity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanTop, setScanTop] = useState(0);
  const [scanOpacity, setScanOpacity] = useState(0);
  const [isApertureOpen, setIsApertureOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const zoomTargetRef = useRef<HTMLDivElement>(null);
  const isFinishedRef = useRef(false);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check query override and sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const forceIntro = urlParams.get('intro') === '1';

    try {
      const seen = sessionStorage.getItem('agentlock_intro_seen');
      const headSkip = document.documentElement.getAttribute('data-intro') === 'skip';
      if ((seen || headSkip) && !forceIntro) {
        return;
      }
    } catch {
      // Storage access blocked; proceed safely
    }

    setShouldRender(true);

    // Lock body scroll while intro is playing
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let isAborted = false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Finish intro helper
    const finishIntro = (fastFade = false) => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;
      isAborted = true;

      try {
        sessionStorage.setItem('agentlock_intro_seen', '1');
      } catch {
        // Storage access blocked
      }

      document.body.style.overflow = originalOverflow;
      window.dispatchEvent(new CustomEvent('agentlock:intro-done'));

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

    // User skip handler (convenience only; zero key presses required)
    const handleSkip = () => {
      if (!isFinishedRef.current) {
        finishIntro(true);
      }
    };

    window.addEventListener('keydown', handleSkip, { once: true });
    window.addEventListener('pointerdown', handleSkip, { once: true });

    // Handle Reduced Motion
    if (prefersReducedMotion) {
      setStrokeOffset(0);
      setCoralScale(1);
      setCoralOpacity(1);
      setWordmarkOpacity(1);
      const rmTimer = setTimeout(() => {
        if (!isAborted) finishIntro(false);
      }, 600);
      return () => {
        clearTimeout(rmTimer);
        window.removeEventListener('keydown', handleSkip);
        window.removeEventListener('pointerdown', handleSkip);
        document.body.style.overflow = originalOverflow;
      };
    }

    // --- STAGE 1: Logo Appearance (0ms to 600ms) ---
    // Frame 0ms: contour begins drawing
    const t0 = setTimeout(() => {
      if (isAborted) return;
      setStrokeOffset(0); // Transition draws shield outline over 600ms
    }, 20);

    // Frame 250ms: Coral square fades in and scales from 0.9 to 1.0
    const tCoral = setTimeout(() => {
      if (isAborted) return;
      setCoralOpacity(1);
      setCoralScale(1);
    }, 250);

    // Frame 300ms: Wordmark fades in over 300ms
    const tWordmark = setTimeout(() => {
      if (isAborted) return;
      setWordmarkOpacity(1);
    }, 300);

    // --- STAGE 2: Loading Phase (min 1800ms, max 4500ms) ---
    // Progress line smoothly moves toward 90% over 1800ms
    const progressStartTime = performance.now();
    let progressRafId: number;

    const updateProgress = (now: number) => {
      if (isAborted) return;
      const elapsed = now - progressStartTime;
      if (elapsed < 1800) {
        const t = elapsed / 1800;
        const eased = t * (2 - t); // Ease-out curve
        setProgress(Math.min(0.90, eased * 0.90));
        progressRafId = requestAnimationFrame(updateProgress);
      } else {
        setProgress((prev) => Math.max(prev, 0.90));
      }
    };
    progressRafId = requestAnimationFrame(updateProgress);

    // Gentle scanner pass sweeping across shield once (600ms to 1600ms)
    let scanRafId: number;
    const scanStartTime = progressStartTime + 600;

    const updateScan = (now: number) => {
      if (isAborted) return;
      if (now < scanStartTime) {
        scanRafId = requestAnimationFrame(updateScan);
        return;
      }
      const scanElapsed = now - scanStartTime;
      const scanDuration = 1000; // 1 second sweep
      if (scanElapsed <= scanDuration) {
        const t = scanElapsed / scanDuration;
        setScanTop(t * 40);
        const op = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
        setScanOpacity(op * 0.85);
        scanRafId = requestAnimationFrame(updateScan);
      } else {
        setScanOpacity(0);
      }
    };
    scanRafId = requestAnimationFrame(updateScan);

    // --- Readiness Signals ---
    const minHoldPromise = new Promise((resolve) => setTimeout(resolve, 1800));
    const maxTimeoutPromise = new Promise((resolve) => setTimeout(resolve, 4500));

    // Fonts ready
    const fontsPromise = (document.fonts ? document.fonts.ready : Promise.resolve()).catch(() => true);

    // Window loaded
    const windowLoadedPromise = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(true);
      } else {
        window.addEventListener('load', () => resolve(true), { once: true });
        setTimeout(() => resolve(true), 1500);
      }
    });

    // 3D Wave grid canvas ready
    const waveReadyPromise = new Promise((resolve) => {
      if ((window as any).__AGENTLOCK_WAVE_READY__) {
        resolve(true);
      } else {
        const handler = () => resolve(true);
        window.addEventListener('agentlock-wave-ready', handler, { once: true });
        setTimeout(() => resolve(true), 2000);
      }
    });

    const assetReadiness = Promise.all([fontsPromise, windowLoadedPromise, waveReadyPromise]);

    // Bounded resolution: min 1800ms, max 4500ms
    Promise.race([
      Promise.all([minHoldPromise, assetReadiness]),
      maxTimeoutPromise,
    ]).then(() => {
      if (isAborted || isFinishedRef.current) return;

      // Snap progress to 100%
      setProgress(1.0);

      // Brief pause for 100ms before camera zoom
      setTimeout(() => {
        if (isAborted || isFinishedRef.current) return;

        // --- STAGE 3: Camera Zoom Through Shield (1100ms) ---
        // 1. Fade out wordmark and progress bar (150ms)
        setWordmarkOpacity(0);

        // 2. Open aperture: inner navy shield dissolves to reveal homepage underneath (150ms)
        setIsApertureOpen(true);

        const zoomTarget = zoomTargetRef.current;
        if (!zoomTarget) {
          finishIntro(false);
          return;
        }

        // Calculate scale factor S based on viewport diagonal vs shield inner aperture
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const halfDiagonal = Math.sqrt(vw * vw + vh * vh) / 2;

        // Shield inner aperture width is 32px (half-width ~14px on desktop 96px box)
        const isDesktop = vw >= 640;
        const minInnerRadius = (isDesktop ? 48 : 40) * (7 / 24);
        const S = Math.ceil((halfDiagonal / minInnerRadius) * 1.35);

        // Cubic-bezier(0.65, 0, 0.35, 1) solver for 24 log-space keyframes
        const solveBezierY = (x: number): number => {
          let t = x;
          for (let iter = 0; iter < 8; iter++) {
            const currentX = 3 * (1 - t) * (1 - t) * t * 0.65 + 3 * (1 - t) * t * t * 0.35 + t * t * t - x;
            if (Math.abs(currentX) < 1e-5) break;
            const dX = 3 * (1 - t) * (1 - t) * 0.65 + 6 * (1 - t) * t * (0.35 - 0.65) + 3 * t * t * (1 - 0.35);
            if (Math.abs(dX) < 1e-5) break;
            t -= currentX / dX;
          }
          t = Math.max(0, Math.min(1, t));
          return 3 * (1 - t) * t * t * 1.0 + t * t * t;
        };

        const keyframes: Keyframe[] = [];
        const steps = 24;

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const easedT = solveBezierY(t);
          const scaleVal = Math.pow(S, easedT);
          keyframes.push({
            transform: `scale(${scaleVal.toFixed(4)})`,
          });
        }

        try {
          const anim = zoomTarget.animate(keyframes, {
            duration: 1100,
            easing: 'linear',
            fill: 'forwards',
          });
          animRef.current = anim;

          anim.onfinish = () => {
            finishIntro(false);
          };
        } catch {
          zoomTarget.style.transition = 'transform 1100ms cubic-bezier(0.65, 0, 0.35, 1)';
          zoomTarget.style.transform = `scale(${S})`;
          setTimeout(() => finishIntro(false), 1100);
        }
      }, 100);
    });

    // Crash-proof safety watchdog: guarantees removal at 5600ms total
    const watchdogTimer = setTimeout(() => {
      if (!isFinishedRef.current) {
        finishIntro(false);
      }
    }, 5600);

    return () => {
      isAborted = true;
      clearTimeout(t0);
      clearTimeout(tCoral);
      clearTimeout(tWordmark);
      clearTimeout(watchdogTimer);
      cancelAnimationFrame(progressRafId);
      cancelAnimationFrame(scanRafId);
      if (animRef.current) {
        animRef.current.cancel();
      }
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('pointerdown', handleSkip);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      ref={overlayRef}
      data-intro-overlay
      className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center overflow-hidden select-none"
      title="Click or press any key to skip intro"
    >
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: `[data-intro-overlay]{display:none !important;}` }} />
      </noscript>

      {/* Scalable Camera Target Container (Centered at exact viewport center) */}
      <div
        ref={zoomTargetRef}
        className="relative flex items-center justify-center will-change-transform"
        style={{
          width: '96px',
          height: '96px',
          transformOrigin: '48px 48px', // Center of shield and container
        }}
      >
        {/* Full-bleed SVG Mask and Field System */}
        <svg
          viewBox="-3000 -3000 6000 6000"
          className="absolute overflow-visible pointer-events-none"
          style={{
            width: '6000px',
            height: '6000px',
            left: 'calc(48px - 3000px)',
            top: 'calc(48px - 3000px)',
          }}
          aria-hidden="true"
        >
          <defs>
            {/* Aperture Mask: White is visible, black is transparent cutout */}
            <mask id="shield-intro-aperture-mask">
              <rect x="-3000" y="-3000" width="6000" height="6000" fill="white" />
              {/* Scaled Shield Cutout (24x24 centered to 48x48) */}
              <g transform="scale(2) translate(-12, -12)">
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  fill="black"
                />
              </g>
            </mask>
          </defs>

          {/* 1. Oversized Navy Field Masked by Shield Cutout */}
          <rect
            x="-3000"
            y="-3000"
            width="6000"
            height="6000"
            fill="#060D1F"
            mask="url(#shield-intro-aperture-mask)"
          />

          {/* 2. Brand Coral Rounded Square Container (96x96 with rx=24, matching rounded-lg) */}
          <g
            style={{
              transform: `scale(${coralScale})`,
              opacity: coralOpacity,
              transformOrigin: '0px 0px',
              transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease-out',
            }}
          >
            <rect
              x="-48"
              y="-48"
              width="96"
              height="96"
              rx="24"
              fill="#FF6F59"
              mask="url(#shield-intro-aperture-mask)"
            />
          </g>

          {/* 3. Dark Navy Inner Shield Layer: dissolves on zoom to reveal live homepage */}
          <g
            transform="scale(2) translate(-12, -12)"
            style={{
              opacity: isApertureOpen ? 0 : 1,
              transition: 'opacity 150ms ease-out',
            }}
          >
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              fill="#060D1F"
            />
          </g>

          {/* 4. Shield Contour Stroke Outline (drawn over 600ms) */}
          <g transform="scale(2) translate(-12, -12)">
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              fill="none"
              stroke="#060D1F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 60,
                strokeDashoffset: strokeOffset,
                transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </g>
        </svg>

        {/* Gentle Scanning Pass Across the Shield Aperture (transform & opacity only) */}
        <div
          className="absolute pointer-events-none overflow-hidden"
          style={{
            width: '36px',
            height: '40px',
            top: '28px',
            left: '30px',
          }}
        >
          <div
            className="w-full h-[2px] bg-coral shadow-[0_0_6px_#FF6F59] will-change-transform"
            style={{
              transform: `translateY(${scanTop}px)`,
              opacity: scanOpacity,
            }}
          />
        </div>

        {/* Wordmark and Progress Line (fades in under mark, fades out before zoom) */}
        <div
          className="absolute top-full mt-5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{
            opacity: wordmarkOpacity,
            transition: 'opacity 250ms ease-out',
          }}
        >
          <span className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-[#F5EDDC] whitespace-nowrap">
            AgentLock
          </span>

          {/* Thin 2px Coral Progress Line */}
          <div className="w-28 sm:w-32 h-[2px] bg-coral/20 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-coral rounded-full origin-left will-change-transform"
              style={{
                transform: `scaleX(${progress})`,
                transition: progress === 1 ? 'transform 120ms ease-out' : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
