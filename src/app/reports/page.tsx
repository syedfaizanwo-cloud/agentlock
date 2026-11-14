import React from 'react';
import type { Metadata } from 'next';
import { ReportsPageClient } from './ReportsPageClient';

export const metadata: Metadata = {
  title: 'Audit Reports',
  description:
    'Cryptographically verifiable scan records and downloadable executive PDF summaries.',
  alternates: {
    canonical: '/reports',
  },
  openGraph: {
    title: 'Audit Reports | AgentLock',
    description:
      'Cryptographically verifiable scan records and downloadable executive PDF summaries.',
    url: '/reports',
  },
};

export default function ReportsPage() {
  return <ReportsPageClient />;
}
