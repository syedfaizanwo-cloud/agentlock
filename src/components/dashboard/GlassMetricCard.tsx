'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  targetSectionId?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  targetSectionId,
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
            <span className="text-xs font-mono text-cream-soft">
              {title}
            </span>
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

      <div className="mt-3 text-xs text-cream-muted font-sans">
        {subtitle}
      </div>
    </div>
  );
};

export const GlassMetricCard = MetricCard;
export { MetricTile } from './MetricTile';

