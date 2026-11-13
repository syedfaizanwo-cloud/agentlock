import { useEffect, useRef, useState } from 'react';

/**
 * Neumorphic stat tile with count-up animation.
 * @param {{ label: string, value: number, icon: import('lucide-react').LucideIcon, trend?: string, loading?: boolean }} props
 */
export default function StatTile({ label, value, icon: Icon, trend, loading = false }) {
  const [displayed, setDisplayed] = useState(0);
  const [settled, setSettled] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const DURATION = 600; // ms

  useEffect(() => {
    if (loading || typeof value !== 'number') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplayed(value);
      setSettled(true);
      return;
    }

    setSettled(false);
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSettled(true);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, loading]);

  return (
    <div className="neu-card p-5 flex flex-col gap-3 min-w-0">
      {/* Header: icon + label */}
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            size={18}
            aria-hidden="true"
            style={{ color: 'var(--color-text-muted)' }}
            className="shrink-0"
          />
        )}
        <span
          className="text-xs font-medium uppercase tracking-wider truncate"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
      </div>

      {/* Readout well */}
      <div className="neu-well px-4 py-3 flex items-baseline gap-2 min-h-[48px]">
        {loading ? (
          <div
            className="h-7 w-20 rounded-[var(--radius-control)] animate-scan-pulse"
            style={{ backgroundColor: 'var(--color-shadow-light)' }}
            aria-label="Loading value"
          />
        ) : (
          <>
            <span
              className={[
                'text-2xl font-medium tabular-nums',
                settled ? 'animate-count-settle' : '',
              ].join(' ')}
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-primary)',
              }}
            >
              {displayed.toLocaleString()}
            </span>
            {trend && (
              <span
                className="text-xs font-medium"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: trend.startsWith('+')
                    ? 'var(--color-severity-low)'
                    : trend.startsWith('-')
                    ? 'var(--color-severity-critical)'
                    : 'var(--color-text-muted)',
                }}
              >
                {trend}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
