'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { SimplePageHeader } from '../../components/layout/SimplePageHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { CheckCircle2, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';

export default function ThankYouPage() {
  useEffect(() => {
    // Fire analytics conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: 'contact_form_lead',
        event_category: 'engagement',
        event_label: 'demo_request_submitted',
      });
      (window as any).gtag('event', 'form_submit_success', {
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#BDBDBD] relative selection:bg-[#E6CBA8] selection:text-[#0A0A0A]">
      <SimplePageHeader currentLabel="TRANSMISSION SECURED" />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(111,175,138,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-xl w-full p-8 sm:p-12 rounded-3xl bg-[#0D0D0D] border border-[#2A2A2A] shadow-2xl text-center space-y-6 relative">
          <div className="inline-flex p-4 rounded-2xl bg-[rgba(111,175,138,0.15)] border border-[#6FAF8A]/40 text-[#6FAF8A] shadow-[0_0_20px_rgba(111,175,138,0.2)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
              Transmission Received
            </h1>
            <p className="text-sm sm:text-base text-[#E6CBA8] font-mono">
              Thanks, we&apos;ll reply within 1 business day.
            </p>
            <p className="text-xs sm:text-sm text-[#8A8A8A] font-sans max-w-md mx-auto pt-2">
              Our autonomous agent security engineers have received your inquiry. We will review your fleet profile, gateway requirements, and prepare your customized demonstration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#151515] border border-[#2A2A2A] flex items-center justify-center gap-3 text-xs font-mono text-[#8A8A8A]">
            <Clock className="w-4 h-4 text-[#E6CBA8]" />
            <span>Average Dispatch Response Time: <strong>&lt; 3.5 Hours</strong></span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#E6CBA8] hover:bg-[#F7E7CE] text-[#0A0A0A] shadow-[0_0_20px_rgba(230,203,168,0.3)] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AgentLock 2.0</span>
            </Link>
            <Link
              href="/#telemetry"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-mono font-medium text-[#BDBDBD] hover:text-white bg-[#151515] border border-[#2A2A2A] hover:border-[#E6CBA8] transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-[#6FAF8A]" />
              <span>Explore Fleet Telemetry</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
