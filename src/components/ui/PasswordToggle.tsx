'use client';

import React, { useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
  label?: string;
}

export const PasswordToggle: React.FC<PasswordToggleProps> = ({
  isVisible,
  onToggle,
  className = '',
  label,
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-label={label || (isVisible ? 'Hide secret key' : 'Show secret key')}
      aria-pressed={isVisible}
      title={isVisible ? 'Hide secret key' : 'Show secret key'}
      className={`p-1.5 rounded-lg text-[#C8C0AC] hover:text-[#F5EDDC] hover:bg-[#12234A] transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF6F59] ${className}`}
    >
      {isVisible ? (
        <EyeOff className="w-4 h-4 shrink-0 text-[#FF6F59]" />
      ) : (
        <Eye className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};

export function usePasswordVisibility(autoHideMs: number = 20000) {
  const [isVisible, setIsVisible] = React.useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggle = () => {
    setIsVisible((prev) => {
      const next = !prev;
      clearTimer();
      if (next && autoHideMs > 0) {
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, autoHideMs);
      }
      return next;
    });
  };

  const onBlur = () => {
    setIsVisible(false);
    clearTimer();
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return {
    isVisible,
    toggle,
    onBlur,
    inputType: isVisible ? ('text' as const) : ('password' as const),
  };
}
