'use client';

import React, { useState, useEffect } from 'react';

export const DevPerfMeter: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [fps, setFps] = useState(60);
  const [minFps, setMinFps] = useState(60);
  const [frameTimeMs, setFrameTimeMs] = useState(16.6);
  const [memoryMb, setMemoryMb] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('perf') === '1') {
      setIsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    let frames = 0;
    let prevTime = performance.now();
    let minRecorded = 60;
    let animId: number;

    const loop = (currentTime: number) => {
      frames++;
      const delta = currentTime - prevTime;

      if (delta >= 1000) {
        const currentFps = Math.round((frames * 1000) / delta);
        const avgFrameTime = +(delta / frames).toFixed(1);
        if (currentFps < minRecorded && currentFps > 5) {
          minRecorded = currentFps;
          setMinFps(minRecorded);
        }
        setFps(currentFps);
        setFrameTimeMs(avgFrameTime);

        const perfMem = (performance as any).memory;
        if (perfMem && perfMem.usedJSHeapSize) {
          setMemoryMb(Math.round(perfMem.usedJSHeapSize / (1024 * 1024)));
        }

        frames = 0;
        prevTime = currentTime;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isEnabled]);

  if (!isEnabled) return null;

  const fpsColor = fps >= 55 ? '#34D399' : fps >= 40 ? '#FACC15' : '#E11D48';

  return (
    <div
      className="fixed bottom-3 left-3 z-[9999] pointer-events-auto select-none bg-[#0A1633] border border-[#12234A] rounded-xl px-3 py-2 text-[11px] font-mono shadow-[4px_4px_12px_#030714] flex items-center gap-3"
      style={{ color: '#F5EDDC' }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: fpsColor }}
        />
        <span className="font-bold text-xs" style={{ color: fpsColor }}>
          {fps} FPS
        </span>
      </div>

      <div className="text-[#C8C0AC] flex items-center gap-2 border-l border-[#12234A] pl-2.5">
        <span>Min: <strong className="text-[#F5EDDC]">{minFps}</strong></span>
        <span>{frameTimeMs}ms</span>
        {memoryMb && (
          <span className="text-[#FF6F59]">{memoryMb}MB</span>
        )}
      </div>

      <button
        onClick={() => {
          setMinFps(fps);
        }}
        title="Reset min FPS"
        className="text-[10px] text-[#C8C0AC] hover:text-[#FF6F59] px-1 py-0.5 rounded border border-[#12234A] hover:border-[#FF6F59] transition-colors"
      >
        Reset
      </button>
    </div>
  );
};
