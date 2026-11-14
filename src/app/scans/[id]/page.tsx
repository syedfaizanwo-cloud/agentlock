import React from 'react';
import type { Metadata } from 'next';
import { ScanDetailClient } from './ScanDetailClient';

interface PageProps {
  params: {
    id: string;
  };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return {
    title: `Scan Results ${params.id}`,
    description: `Detailed vulnerability findings, attack payloads, evidence, and remediation code for scan ${params.id}.`,
    alternates: {
      canonical: `/scans/${params.id}`,
    },
    openGraph: {
      title: `Scan Results ${params.id} | AgentLock`,
      description: `Detailed vulnerability findings, attack payloads, evidence, and remediation code.`,
      url: `/scans/${params.id}`,
    },
  };
}

export default function ScanDetailPage({ params }: PageProps) {
  return <ScanDetailClient scanId={params.id} />;
}
