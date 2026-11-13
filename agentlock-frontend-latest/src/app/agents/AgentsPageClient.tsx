'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AgentManagementView } from '../../components/agents/AgentManagementView';
import { Breadcrumb } from '../../components/navigation/Breadcrumb';
import { TopBar } from '../../components/navigation/TopBar';
import { SiteFooter } from '../../components/layout/SiteFooter';
import { api } from '../../lib/api-client';
import { Agent, RegisterAgentPayload } from '../../types/api';

export function AgentsPageClient() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [latencyMs, setLatencyMs] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [connRes, agentsRes] = await Promise.allSettled([
      api.checkConnection(),
      api.getAgents(),
    ]);

    if (connRes.status === 'fulfilled') {
      setBackendOnline(connRes.value.ok);
      setLatencyMs(connRes.value.latencyMs);
    } else {
      setBackendOnline(false);
    }

    if (agentsRes.status === 'fulfilled') {
      setAgents(agentsRes.value);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegisterAgent = async (payload: RegisterAgentPayload) => {
    try {
      const created = await api.registerAgent(payload);
      setAgents((prev) => [created, ...prev]);
    } catch (err) {
      throw err;
    }
  };

  const handleSelectAgentForScan = (agent: Agent) => {
    router.push(`/scans?agentId=${encodeURIComponent(agent.id)}`);
  };

  return (
    <div className="relative min-h-screen text-[#F5EDDC]">
      <TopBar
        activeSectionId="agents"
        backendOnline={backendOnline}
        latencyMs={latencyMs}
        counts={{ agents: agents.length }}
        onRefreshHealth={loadData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
        <Breadcrumb items={[{ label: 'Agents', href: '/agents' }]} />

        <div className="border-b border-[#1A2E5A] pb-5">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-cream font-display">
            Agent Inventory
          </h1>
          <p className="text-sm text-cream-muted mt-2 font-sans max-w-2xl">
            Register target endpoints and verify active communication status. Each agent is monitored for adversarial attack exposure and scan readiness.
          </p>
        </div>

        <AgentManagementView
          agents={agents}
          onRegisterAgent={handleRegisterAgent}
          onSelectAgentForScan={handleSelectAgentForScan}
          isLoading={isLoading}
        />
      </div>

      <SiteFooter />
    </div>
  );
}
