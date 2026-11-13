import { useState, useCallback } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Scan,
  FileText,
  Menu,
  X,
  Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/scans/new', label: 'New Scan', icon: Scan },
  { to: '/reports', label: 'Reports', icon: FileText },
];

function SidebarLink({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 px-4 py-3 rounded-[var(--radius-control)] transition-shadow',
          'min-h-[40px] min-w-[40px]',
          isActive
            ? 'shadow-inset-sm'
            : 'hover:shadow-raised-sm',
        ].join(' ')
      }
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
              aria-hidden="true"
            />
          )}
          <Icon
            size={20}
            aria-hidden="true"
            style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
            className="shrink-0 transition-colors"
          />
          {!collapsed && (
            <span
              className="text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
            >
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-deep)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(4, 7, 14, 0.7)' }}
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'neu-card flex flex-col shrink-0 z-50 transition-all',
          'rounded-none border-t-0 border-l-0',
          /* Desktop */
          'hidden lg:flex',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[240px]',
        ].join(' ')}
        style={{ borderRight: '1px solid var(--color-edge-highlight)' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 min-w-[40px] min-h-[40px]" aria-label="AgentLock home">
            <Shield size={24} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
                AgentLock
              </span>
            )}
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-4 shrink-0">
          <button
            onClick={toggleSidebar}
            className="neu-btn flex items-center justify-center w-full min-h-[40px]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={[
          'neu-card fixed inset-y-0 left-0 z-50 flex flex-col w-[240px] lg:hidden',
          'rounded-none border-t-0 border-l-0 transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ borderRight: '1px solid var(--color-edge-highlight)' }}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-5 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 min-h-[40px]" aria-label="AgentLock home" onClick={closeMobile}>
            <Shield size={24} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
              AgentLock
            </span>
          </Link>
          <button
            onClick={closeMobile}
            className="neu-btn flex items-center justify-center min-h-[40px] min-w-[40px] p-2"
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={false} />
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* TopBar */}
        <header
          className="flex items-center gap-4 px-6 py-4 shrink-0"
          style={{
            backgroundColor: 'var(--color-base)',
            borderBottom: '1px solid var(--color-edge-highlight)',
          }}
        >
          {/* Mobile menu button */}
          <button
            onClick={toggleMobile}
            className="neu-btn flex items-center justify-center min-h-[40px] min-w-[40px] p-2 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {/* Page context area - pages inject breadcrumbs here via their own components */}
          <div className="flex-1 min-w-0" />
        </header>

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          style={{ backgroundColor: 'var(--color-deep)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
