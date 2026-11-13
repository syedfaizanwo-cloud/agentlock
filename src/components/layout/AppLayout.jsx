import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: 'transparent' }}>
      {/* Fixed top bar with Wordmark, Breadcrumbs, and Hamburger Menu */}
      <AppNavbar />

      {/* Solid navy scrim over the canvas for app pages (85% opacity, no blur/backdrop-filter) */}
      <div
        className="fixed inset-0 pointer-events-none -z-0"
        style={{ backgroundColor: 'rgba(10, 22, 51, 0.88)' }}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <main
        className="flex-1 relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl w-full mx-auto"
      >
        <Outlet />
      </main>
    </div>
  );
}
