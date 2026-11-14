'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Sparkline } from '../bento/Sparkline';

interface MetricTileProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  targetSectionId?: string;
  sparklineData?: number[];
  delta?: {
    value: number;
    label: string;
    isIncreaseBad?: boolean;
  };
  onClick?: () => void;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  targetSectionId,
  sparklineData = [],
  delta,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (targetSectionId) {
      const el = document.querySelector(targetSectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', targetSectionId);
      }
    }
  };

  const isClickable = Boolean(onClick || targetSectionId);
  const hasSparkline = sparklineData && sparklineData.length >= 2;

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`p-5 rounded-xl bg-navy-900 border border-[#1A2E5A] select-none transition-colors ${
        isClickable
          ? 'hover:border-coral cursor-pointer focus:outline-none focus:ring-2 focus:ring-coral'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cream-soft">{title}</span>
            {badge && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-severity-critical/10 text-severity-critical border border-severity-critical/30">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-2 text-3xl font-mono font-bold text-cream tracking-tight">
            {value}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-navy-850 border border-[#1A2E5A] text-cream-muted">
          <Icon className="w-5 h-5 text-coral" />
        </div>
      </div>

      {/* Delta & Real Sparkline row */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#1A2E5A]/50 pt-2.5">
        <div className="text-xs text-cream-muted font-sans truncate">
          {delta ? (
            <span
              className={`font-mono text-[11px] font-medium ${
                delta.value > 0
                  ? delta.isIncreaseBad
                    ? 'text-severity-critical'
                    : 'text-severity-low'
                  : delta.value < 0
                  ? delta.isIncreaseBad
                    ? 'text-severity-low'
                    : 'text-severity-critical'
                  : 'text-cream-muted'
              }`}
            >
              {delta.value > 0 ? `+${delta.value}` : delta.value} {delta.label}
            </span>
          ) : (
            <span>{subtitle}</span>
          )}
        </div>

        {hasSparkline && (
          <div className="shrink-0" title="Historical trend over recent scans">
            <Sparkline
              data={sparklineData}
              color={badge ? '#E11D48' : '#FF6F59'}
              width={76}
              height={22}
            />
          </div>
        )}
      </div>
    </div>
  );
};
