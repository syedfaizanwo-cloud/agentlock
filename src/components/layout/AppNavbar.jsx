import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Shield, Github, X } from 'lucide-react';
import TextRoll from '@/components/ui/text-roll';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

const MENU_ITEMS = [
  { to: '/', label: 'HOME', index: '01' },
  { to: '/dashboard', label: 'DASHBOARD', index: '02' },
  { to: '/agents', label: 'AGENTS', index: '03' },
  { to: '/scans/new', label: 'NEW SCAN', index: '04' },
  { to: '/reports', label: 'REPORTS', index: '05' },
];

function getBreadcrumbsForPath(pathname) {
  if (pathname === '/' || pathname === '') return null;
  if (pathname === '/dashboard') {
    return [{ label: 'Dashboard' }];
  }
  if (pathname === '/agents') {
    return [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Agents' }];
  }
  if (pathname.startsWith('/agents/')) {
    const id = pathname.replace('/agents/', '');
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Agents', to: '/agents' },
      { label: id },
    ];
  }
  if (pathname === '/scans/new') {
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Scans' },
      { label: 'New Scan' },
    ];
  }
  if (pathname.endsWith('/results')) {
    const parts = pathname.split('/');
    const scanId = parts[2] || 'Scan';
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Scans' },
      { label: scanId, to: `/scans/${scanId}` },
      { label: 'Results' },
    ];
  }
  if (pathname.startsWith('/scans/')) {
    const scanId = pathname.replace('/scans/', '');
    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Scans' },
      { label: scanId },
    ];
  }
  if (pathname === '/reports') {
    return [{ label: 'Dashboard', to: '/dashboard' }, { label: 'Reports' }];
  }
  return null;
}

export default function AppNavbar({ breadcrumb = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const overlayRef = useRef(null);
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        hamburgerRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll(
          'a[href], button:not([disabled])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus into overlay
    const timer = setTimeout(() => {
      const firstLink = overlayRef.current?.querySelector('a[href]');
      firstLink?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      hamburgerRef.current?.focus();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Fixed top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-16 px-6 lg:px-8 flex items-center justify-between"
        style={{
          backgroundColor: '#0A1633',
          borderBottom: '1px solid var(--color-edge-highlight)',
        }}
        role="banner"
      >
        {/* Left: Wordmark & Breadcrumb */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-h-[40px] no-underline shrink-0"
            aria-label="AgentLock home"
          >
            <Shield size={22} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
            <span
              className="text-lg font-bold tracking-tight text-cream"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              AgentLock
            </span>
          </Link>

          {breadcrumb && (
            <div className="hidden sm:flex items-center border-l pl-4 truncate" style={{ borderColor: 'var(--color-shadow-light)' }}>
              {breadcrumb}
            </div>
          )}
        </div>

        {/* Right: Hamburger button (48px hit area, neumorphic raised-sm, lines morphing into X) */}
        <button
          ref={hamburgerRef}
          type="button"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          aria-controls="navigation-overlay"
          className={`neu-btn flex items-center justify-center w-12 h-12 p-0 min-h-[48px] min-w-[48px] transition-transform duration-150 ${
            isOpen ? 'shadow-inset-sm scale-95' : 'shadow-raised-sm hover:shadow-raised-md'
          }`}
          style={{ backgroundColor: '#0A1633' }}
        >
          <div className="relative w-5 h-4 flex flex-col justify-between" aria-hidden="true">
            <span
              className={`block h-[2px] w-full rounded-full bg-cream transition-all duration-200 origin-center ${
                isOpen ? 'rotate-45 translate-y-[7px] bg-coral' : ''
              }`}
            />
            <span
              className={`block h-[2px] w-full rounded-full bg-cream transition-all duration-200 ${
                isOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block h-[2px] w-full rounded-full bg-cream transition-all duration-200 origin-center ${
                isOpen ? '-rotate-45 -translate-y-[7px] bg-coral' : ''
              }`}
            />
          </div>
        </button>
      </header>

      {/* Fullscreen Overlay */}
      {isOpen && (
        <div
          id="navigation-overlay"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex flex-col justify-between p-8 sm:p-12 overflow-y-auto"
          style={{
            backgroundColor: '#0A1633',
            animation: 'menu-slide-fade 220ms var(--ease-out-expo) forwards',
          }}
        >
          {/* Top header inside overlay */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 min-h-[40px] no-underline"
              aria-label="AgentLock home"
            >
              <Shield size={24} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
              <span
                className="text-xl font-bold tracking-tight text-cream"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                AgentLock
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleMenu}
              className="neu-btn flex items-center justify-center w-12 h-12 p-0 min-h-[48px] min-w-[48px] text-cream"
              aria-label="Close menu"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Centered navigation items with TextRoll selection animation */}
          <nav
            className="flex flex-col items-center justify-center gap-6 sm:gap-8 my-auto py-8"
            role="navigation"
            aria-label="Main menu"
          >
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `group relative flex items-center justify-center gap-4 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wider no-underline transition-colors min-h-[48px] px-6 py-2 ${
                    isActive ? 'text-coral' : 'text-cream hover:text-coral'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Coral index marker for active route */}
                    <span
                      className={`text-xs sm:text-sm font-mono tracking-widest transition-opacity ${
                        isActive ? 'text-coral opacity-100 font-bold' : 'text-cream-soft opacity-40 group-hover:opacity-100'
                      }`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {item.index}
                    </span>

                    <TextRoll
                      active={isActive}
                      hoverClassName="text-coral"
                      className="tracking-wider uppercase"
                    >
                      {item.label}
                    </TextRoll>

                    {isActive && (
                      <span
                        className="w-2 h-2 rounded-full bg-coral shrink-0 ml-1"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom secondary link: GitHub repository */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4" style={{ borderColor: 'var(--color-navy-800)' }}>
            <span className="text-xs text-cream-soft" style={{ fontFamily: 'var(--font-mono)' }}>
              AgentLock Platform: Red Teaming &amp; Security Verification
            </span>
            <a
              href="https://github.com/syedfaizanwo-cloud/agentlock"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-cream-soft hover:text-coral min-h-[40px] px-3 no-underline transition-colors"
              aria-label="AgentLock GitHub repository (opens in new tab)"
            >
              <Github size={18} aria-hidden="true" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>
      )}

      {/* CSS keyframe for smooth menu entrance under 250ms */}
      <style>{`
        @keyframes menu-slide-fade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
