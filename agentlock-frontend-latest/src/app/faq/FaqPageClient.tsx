'use client';

import React from 'react';
import { FAQSection } from '../../components/faq/FAQSection';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { TopBar } from '../../components/navigation/TopBar';
import { SiteFooter } from '../../components/layout/SiteFooter';

export function FaqPageClient() {
  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      <TopBar activeSectionId="faq" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        <Breadcrumb items={[{ label: 'FAQ', href: '/faq' }]} />

        <div className="border-b border-[#1A2E5A] pb-5">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-cream font-display">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-cream-muted mt-2 font-sans max-w-2xl">
            Methodology, testing parameters, and vulnerability verification for AgentLock.
          </p>
        </div>

        <FAQSection />
      </div>

      <SiteFooter />
    </div>
  );
}
