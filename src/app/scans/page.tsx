import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ScansPageClient } from './ScansPageClient';

export const metadata: Metadata = {
  title: 'Security Scans',
  description:
    'Configure attack vectors and launch automated adversarial evaluations against AI agents.',
  alternates: {
    canonical: '/scans',
  },
  openGraph: {
    title: 'Security Scans | AgentLock',
    description:
      'Configure attack vectors and launch automated adversarial evaluations against AI agents.',
    url: '/scans',
  },
};

export default function ScansPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950 p-12 text-cream font-mono text-sm">Loading security scans...</div>}>
      <ScansPageClient />
    </Suspense>
  );
}
