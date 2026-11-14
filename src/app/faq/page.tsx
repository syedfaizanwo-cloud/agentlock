import React from 'react';
import type { Metadata } from 'next';
import { FaqPageClient } from './FaqPageClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Security methodology, testing scope, and vulnerability verification for AgentLock.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | AgentLock',
    description:
      'Security methodology, testing scope, and vulnerability verification for AgentLock.',
    url: '/faq',
  },
};

export default function FaqPage() {
  return <FaqPageClient />;
}
