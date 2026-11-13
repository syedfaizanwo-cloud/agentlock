'use client';

import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'well' | 'subtle';
  glow?: boolean;
  hoverEffect?: boolean;
  as?: React.ElementType;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  variant = 'default',
  glow = false,
  hoverEffect = false,
  as: Component = 'div',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return 'glass-card' + (hoverEffect ? ' glass-card-hover cursor-pointer' : '');
      case 'well':
        return 'glass-well';
      case 'subtle':
        return 'glass-pill';
      case 'default':
      default:
        return 'glass-panel' + (hoverEffect ? ' glass-panel-hover' : '');
    }
  };

  const glowStyles = glow
    ? 'ring-1 ring-[#FF6F59]/30 shadow-[0_0_24px_rgba(255,111,89,0.15)]'
    : '';

  return (
    <Component
      className={`${getVariantStyles()} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
