'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ReportsSection } from '../../components/reports/ReportsSection';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { TopBar } from '../../components/navigation/TopBar';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { api } from '../../lib/api-client';
import { Scan } from '../../types/api';

export function ReportsPageClient() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  const loadData = useCallback(async () => {
    const [connRes, scansRes] = await Promise.allSettled([
      api.checkConnection(),
      api.getScans(),
    ]);

    if (connRes.status === 'fulfilled') {
      setBackendOnline(connRes.value.ok);
      setLatencyMs(connRes.value.latencyMs);
    } else {
      setBackendOnline(false);
    }

    if (scansRes.status === 'fulfilled') {
      setScans(scansRes.value);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectScan = (scanId: string | number) => {
    router.push(`/scans/${encodeURIComponent(scanId)}`);
  };

  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      <TopBar
        activeSectionId="reports"
        backendOnline={backendOnline}
        latencyMs={latencyMs}
        counts={{ reports: scans.length }}
        onRefreshHealth={loadData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        <Breadcrumb items={[{ label: 'Reports', href: '/reports' }]} />

        <div className="border-b border-[#1A2E5A] pb-5">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-cream font-display">
            Audit Reports
          </h1>
          <p className="text-sm text-cream-muted mt-2 font-sans max-w-2xl">
            Cryptographically verifiable scan records and downloadable executive PDF summaries.
          </p>
        </div>

        <ReportsSection
          scans={scans}
          onSelectScan={handleSelectScan}
          onRefresh={loadData}
        />
      </div>

      <SiteFooter />
    </div>
  );
}
