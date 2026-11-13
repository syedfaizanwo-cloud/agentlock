/**
 * Reusable skeleton loading components.
 * All use subtle pulse on --bg-deep background and respect prefers-reduced-motion
 * (handled globally in CSS via the reduced-motion media query).
 */

const pulseClass = 'animate-scan-pulse rounded-[var(--radius-control)]';
const baseStyle = { backgroundColor: 'var(--color-shadow-light)' };

/**
 * Single line skeleton.
 * @param {{ width?: string, height?: string, className?: string }} props
 */
export function SkeletonLine({ width = '100%', height = '14px', className = '' }) {
  return (
    <div
      className={`${pulseClass} ${className}`}
      style={{ ...baseStyle, width, height }}
      aria-hidden="true"
    />
  );
}

/**
 * Card skeleton with header and lines.
 * @param {{ lines?: number, className?: string }} props
 */
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`neu-card p-5 flex flex-col gap-3 ${className}`} aria-hidden="true">
      {/* Header line */}
      <SkeletonLine width="40%" height="18px" />
      {/* Body lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height="14px"
        />
      ))}
    </div>
  );
}

/**
 * Table skeleton with header row and data rows.
 * @param {{ rows?: number, columns?: number, className?: string }} props
 */
export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`neu-card p-4 flex flex-col gap-3 ${className}`} aria-hidden="true" role="presentation">
      {/* Header row */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLine key={`h-${i}`} width={`${100 / columns}%`} height="16px" />
        ))}
      </div>
      {/* Separator */}
      <div style={{ height: '1px', backgroundColor: 'var(--color-edge-highlight)' }} />
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <SkeletonLine
              key={`r-${r}-c-${c}`}
              width={`${100 / columns}%`}
              height="14px"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
