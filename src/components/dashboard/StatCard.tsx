'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'danger';
  icon: LucideIcon;
  variant?: 'coral' | 'default';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon: Icon,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-[#0A1633] border border-[#12234A] shadow-[4px_4px_8px_#030714,-4px_-4px_8px_#12234A] hover:border-[#FF6F59] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#C8C0AC]">
            {title}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-[#F5EDDC] tracking-tight">
            {value}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-[#12234A] bg-[#060D1F] text-[#FF6F59] shadow-[inset_2px_2px_4px_#030714]">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-3.5 pt-3 border-t border-[#12234A] flex items-center justify-between text-xs font-mono">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                changeType === 'positive'
                  ? 'text-[#34D399]'
                  : changeType === 'danger'
                  ? 'text-[#E11D48]'
                  : changeType === 'negative'
                  ? 'text-[#F59E0B]'
                  : 'text-[#C8C0AC]'
              }`}
            >
              {change}
            </span>
          )}

          {subtitle && (
            <span className="text-[#C8C0AC]/70 ml-auto font-sans text-[11px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
