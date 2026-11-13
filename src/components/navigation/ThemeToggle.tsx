'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export type ThemeChoice = 'dark' | 'light' | 'system';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeChoice>('dark');

  // Read current theme on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('agentlock_theme') as ThemeChoice | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setTheme(stored);
      }
    } catch {}
  }, []);

  const applyTheme = useCallback((choice: ThemeChoice) => {
    let resolvedTheme: 'dark' | 'light' = 'dark';

    if (choice === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = prefersDark ? 'dark' : 'light';
    } else {
      resolvedTheme = choice;
    }

    if (resolvedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    // Update meta theme-color
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', resolvedTheme === 'light' ? '#F7F5F2' : '#050505');

    try {
      localStorage.setItem('agentlock_theme', choice);
    } catch {}
    setTheme(choice);
  }, []);

  // System listener
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme('system');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme, applyTheme]);

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference selector"
      className="inline-flex items-center p-0.5 rounded-lg bg-[#151515] border border-[#2A2A2A]"
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        onClick={() => applyTheme('dark')}
        title="Dark mode (default)"
        aria-label="Dark mode"
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-[#1E1E1E] text-[#E6CBA8] shadow-sm'
            : 'text-[#8A8A8A] hover:text-white'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        onClick={() => applyTheme('light')}
        title="Light mode"
        aria-label="Light mode"
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === 'light'
            ? 'bg-[#EFECE6] text-[#0A0A0A] shadow-sm'
            : 'text-[#8A8A8A] hover:text-white'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={theme === 'system'}
        onClick={() => applyTheme('system')}
        title="Match system preference"
        aria-label="System theme"
        className={`p-1.5 rounded-md transition-all duration-200 ${
          theme === 'system'
            ? 'bg-[#1E1E1E] text-[#E6CBA8] shadow-sm'
            : 'text-[#8A8A8A] hover:text-white'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
