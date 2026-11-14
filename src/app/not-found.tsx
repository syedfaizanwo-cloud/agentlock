import React from 'react';
import Link from 'next/link';
import { SiteFooter } from '../components/layout/SiteFooter';
import { ShieldAlert, ArrowLeft, Bot, Activity, FileText, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: "That page doesn't exist. Return to AgentLock AI Agent Vulnerability Scanner.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-cream relative selection:bg-coral selection:text-navy-950">
      <header className="w-full border-b border-[#1A2E5A] bg-navy-900/90 py-4 px-6 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-lg text-cream flex items-center gap-2">
          <span>AgentLock</span>
        </Link>
        <span className="text-xs font-mono text-cream-muted px-2.5 py-1 rounded bg-navy-950 border border-[#1A2E5A]">
          404 Not Found
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-xl w-full p-8 sm:p-12 rounded-xl bg-navy-900 border border-[#1A2E5A] text-center space-y-6">
          <div className="inline-flex p-4 rounded-lg bg-severity-critical/10 border border-severity-critical/30 text-severity-critical">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-cream">
              404
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-cream font-display">
              That page doesn&apos;t exist
            </h1>
            <p className="text-sm text-cream-muted font-sans max-w-md mx-auto">
              The page you requested could not be located. You can return to the scanner or explore any of the sections below.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 text-left">
            <Link
              href="/"
              className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] hover:border-coral transition-colors"
            >
              <div className="text-xs font-bold text-cream font-sans">Overview</div>
              <div className="text-[11px] text-cream-muted font-sans">Home dashboard</div>
            </Link>
            <Link
              href="/agents"
              className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] hover:border-coral transition-colors"
            >
              <div className="text-xs font-bold text-cream font-sans">Agents</div>
              <div className="text-[11px] text-cream-muted font-sans">Target inventory</div>
            </Link>
            <Link
              href="/scans"
              className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] hover:border-coral transition-colors"
            >
              <div className="text-xs font-bold text-cream font-sans">Scans</div>
              <div className="text-[11px] text-cream-muted font-sans">Run evaluations</div>
            </Link>
            <Link
              href="/reports"
              className="p-3 rounded-lg bg-navy-950 border border-[#1A2E5A] hover:border-coral transition-colors"
            >
              <div className="text-xs font-bold text-cream font-sans">Reports</div>
              <div className="text-[11px] text-cream-muted font-sans">Audit exports</div>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold bg-coral hover:bg-coral-hover text-navy-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
