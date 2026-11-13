'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LazyViewportProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  minHeight?: number | string;
  className?: string;
}

export const LazyViewport: React.FC<LazyViewportProps> = ({
  children,
  placeholder,
  rootMargin = '600px 0px 600px 0px',
  minHeight = 360,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={!isVisible ? { minHeight } : undefined}
    >
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div
            className="w-full rounded-2xl bg-[#0D0D0D] skeleton-shimmer my-4"
            style={{ height: minHeight }}
            aria-hidden="true"
          />
        )
      )}
    </div>
  );
};
