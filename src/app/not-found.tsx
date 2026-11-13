import React from 'react';
import Link from 'next/link';
import { SimplePageHeader } from '../components/layout/SimplePageHeader';
import { SiteFooter } from '../components/layout/SiteFooter';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | AgentLock 2.0',
  description:
    'The requested AgentLock 2.0 security route is off the grid. Return to the zero-trust command center to monitor fleet operations and telemetry.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#BDBDBD] relative selection:bg-[#E6CBA8] selection:text-[#0A0A0A]">
      <SimplePageHeader currentLabel="404 ROUTE INTERCEPT" />

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-hidden">
        {/* Subtle grid background and ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,203,168,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-xl w-full p-8 sm:p-12 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-2xl text-center space-y-6 relative">
          <div className="inline-flex p-4 rounded-2xl bg-[rgba(192,80,77,0.15)] border border-[#C0504D]/40 text-[#C0504D]">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-white">
              404
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">
              This page is off the grid.
            </h1>
            <p className="text-xs sm:text-sm text-[#8A8A8A] font-sans max-w-md mx-auto">
              The requested resource or zero-trust policy route cannot be resolved on the AgentLock 2.0 security mesh.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] shadow-[0_0_20px_rgba(230,203,168,0.3)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AgentLock 2.0</span>
            </Link>
            <Link
              href="/#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-mono font-medium text-[#BDBDBD] hover:text-white bg-[#151515] border border-[#2A2A2A] hover:border-[#E6CBA8] transition-all"
            >
              <span>Contact SecOps Dispatch</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
