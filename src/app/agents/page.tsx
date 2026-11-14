import type { Metadata } from 'next';
import { AgentsPageClient } from './AgentsPageClient';

export const metadata: Metadata = {
  title: 'Agent Inventory',
  description:
    'Register target endpoints and verify active communication status for autonomous AI agents.',
  alternates: {
    canonical: '/agents',
  },
  openGraph: {
    title: 'Agent Inventory | AgentLock',
    description:
      'Register target endpoints and verify active communication status for autonomous AI agents.',
    url: '/agents',
  },
};

export default function AgentsPage() {
  return <AgentsPageClient />;
}
