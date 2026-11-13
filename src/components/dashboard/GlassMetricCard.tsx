'use client';

import React, { useEffect, useState } from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { Sparkline } from '../bento/Sparkline';
import { motion, useReducedMotion } from 'motion/react';

interface GlassMetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  sparklineData?: number[];
  sparklineColor?: string;
  accentColor?: string;
  badge?: string;
  targetSectionId?: string;
  onClick?: () => void;
}

export const GlassMetricCard: React.FC<GlassMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  sparklineData,
  sparklineColor = '#FF6F59',
  accentColor = '#FF6F59',
  badge,
  targetSectionId,
  onClick,
}) => {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number | string>(value);

  // Smooth numerical countup animation when value is a number
  useEffect(() => {
    if (typeof value !== 'number' || prefersReduced) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 800; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, prefersReduced]);

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
      className={`group relative p-5 rounded-2xl glass-card transition-all duration-300 select-none ${
        isClickable
          ? 'glass-card-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6F59]'
          : ''
      }`}
    >
      {/* Subtle Coral Ambient Reflection in top-right */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6F59]/[0.03] rounded-tr-2xl blur-2xl pointer-events-none group-hover:bg-[#FF6F59]/[0.08] transition-colors" />

      {/* Top Header: Title, Badge, and Translucent Icon */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#C8C0AC]">
            {title}
          </span>
          {badge && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/30">
              {badge}
            </span>
          )}
          {/* Animated Main Value */}
          <div className="mt-2 text-2xl sm:text-3xl font-mono font-bold text-[#F5EDDC] tracking-tight group-hover:text-[#FFFFFF] transition-colors">
            {displayValue}
          </div>
        </div>

        {/* Refined Translucent Icon Container with Soft Glow */}
        <div className="relative">
          <div className="p-2.5 rounded-xl border border-white/10 bg-[#060D1F]/60 backdrop-blur-md text-[#FF6F59] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-[#FF6F59]/50 group-hover:shadow-[0_0_16px_rgba(255,111,89,0.3)] transition-all">
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          {isClickable && (
            <ArrowUpRight className="w-3 h-3 text-[#C8C0AC]/40 group-hover:text-[#FF6F59] absolute -top-1 -right-1 transition-colors" />
          )}
        </div>
      </div>

      {/* Bottom Footer: Subtitle + Miniature Interactive Sparkline */}
      <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between gap-2 relative z-10">
        <span className="text-[11px] font-sans text-[#C8C0AC]/80 truncate">
          {subtitle}
        </span>

        {sparklineData && sparklineData.length > 1 && (
          <div className="opacity-75 group-hover:opacity-100 transition-opacity">
            <Sparkline data={sparklineData} color={sparklineColor} width={80} height={24} />
          </div>
        )}
      </div>
    </div>
  );
};
