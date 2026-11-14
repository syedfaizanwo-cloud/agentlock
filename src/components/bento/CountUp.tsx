'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (val: number) => string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  formatter,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    const runAnimation = () => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      const startTime = performance.now();
      const durationMs = duration * 1000;

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        // easeOutCubic: 1 - Math.pow(1 - progress, 3)
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = ease * value;
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
          isAnimating.current = false;
        }
      };

      requestAnimationFrame(step);
    };

    // 1. Re-animate when parent section pops in
    const handlePopIn = () => {
      runAnimation();
    };

    const handlePopOut = () => {
      isAnimating.current = false;
      setDisplayValue(0);
    };

    const targetEl = elementRef.current;
    const parentSection = targetEl?.closest('[data-section]');

    if (parentSection) {
      parentSection.addEventListener('section-pop-in', handlePopIn);
      parentSection.addEventListener('section-pop-out', handlePopOut);
    }

    // 2. Also standard IntersectionObserver fallback
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runAnimation();
          } else {
            isAnimating.current = false;
            setDisplayValue(0);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (targetEl) observer.observe(targetEl);

    return () => {
      if (targetEl) observer.unobserve(targetEl);
      if (parentSection) {
        parentSection.removeEventListener('section-pop-in', handlePopIn);
        parentSection.removeEventListener('section-pop-out', handlePopOut);
      }
    };
  }, [value, duration]);

  const formatNumber = (num: number): string => {
    if (formatter) return formatter(num);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <span
      ref={elementRef}
      className={`tabular-nums font-mono ${className}`}
      aria-label={`${prefix}${formatNumber(value)}${suffix}`}
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
};
