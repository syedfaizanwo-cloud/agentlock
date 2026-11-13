import React from 'react';
import Link from 'next/link';
import { SiteFooter } from '../components/layout/SiteFooter';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | AgentLock',
  description:
    'The requested page could not be found. Return to AgentLock AI Agent Vulnerability Scanner.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060D1F] text-[#F5EDDC] relative selection:bg-[#FF6F59] selection:text-[#060D1F]">
      {/* Minimal Top Header */}
      <header className="w-full border-b border-[#12234A] bg-[#0A1633]/90 py-4 px-6 flex items-center justify-between">
        <Link href="/" className="font-sans font-bold text-lg text-[#F5EDDC] flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF6F59]" />
          AgentLock
        </Link>
        <span className="text-xs font-mono text-[#C8C0AC] px-2.5 py-1 rounded bg-[#060D1F] border border-[#12234A]">
          404 NOT FOUND
        </span>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-hidden">
        <div className="max-w-xl w-full p-8 sm:p-12 rounded-3xl bg-[#0A1633] border border-[#12234A] shadow-[8px_8px_16px_#030714,-8px_-8px_16px_#12234A] text-center space-y-6 relative">
          <div className="inline-flex p-4 rounded-2xl bg-[#E11D48]/15 border border-[#E11D48]/40 text-[#E11D48]">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-[#F5EDDC]">
              404
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F5EDDC] font-sans">
              Route not found
            </h1>
            <p className="text-xs sm:text-sm text-[#C8C0AC] font-sans max-w-md mx-auto">
              The requested resource does not exist on the AgentLock vulnerability scanner.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#FF6F59] hover:bg-[#E85A44] text-[#060D1F] shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Scanner</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
