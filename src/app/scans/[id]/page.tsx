import React from 'react';
import type { Metadata } from 'next';
import { ScanDetailClient } from './ScanDetailClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Scan Results ${id}`,
    description: `Detailed vulnerability findings, attack payloads, evidence, and remediation code for scan ${id}.`,
    alternates: {
      canonical: `/scans/${id}`,
    },
    openGraph: {
      title: `Scan Results ${id} | AgentLock`,
      description: `Detailed vulnerability findings, attack payloads, evidence, and remediation code.`,
      url: `/scans/${id}`,
    },
  };
}

export default async function ScanDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ScanDetailClient scanId={id} />;
}
