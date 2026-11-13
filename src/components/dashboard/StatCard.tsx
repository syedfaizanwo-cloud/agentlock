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
  variant?: 'gold' | 'default';
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
      className={`relative p-5 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#E6CBA8] transition-all duration-200 shadow-sm ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#8A8A8A]">
            {title}
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            {value}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-[#B89B72] bg-[rgba(230,203,168,0.14)] text-[#E6CBA8] shadow-[0_0_10px_rgba(230,203,168,0.15)]">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-3.5 pt-3 border-t border-[#2A2A2A] flex items-center justify-between text-xs font-mono">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                changeType === 'positive'
                  ? 'text-[#6FAF8A]'
                  : changeType === 'danger'
                  ? 'text-[#C0504D]'
                  : changeType === 'negative'
                  ? 'text-[#E6CBA8]'
                  : 'text-[#8A8A8A]'
              }`}
            >
              {change}
            </span>
          )}

          {subtitle && (
            <span className="text-[#8A8A8A] ml-auto">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
