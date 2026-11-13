import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, ScanLine, Check, ChevronRight } from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { agentApi, scanApi } from '@/services/api';
import { MOCKS_ENABLED, mockAgents } from '@/mocks/data';

const ATTACK_CATEGORIES = [
  {
    group: 'Injection Attacks',
    items: [
      { id: 'prompt_injection', label: 'Prompt Injection', description: 'Test for direct and indirect prompt injection vulnerabilities.' },
      { id: 'jailbreak', label: 'Jailbreak Attempts', description: 'Attempt to bypass safety guardrails and content filters.' },
    ],
  },
  {
    group: 'Data Security',
    items: [
      { id: 'data_leakage', label: 'Data Leakage', description: 'Check for PII exposure, training data extraction, and context leaks.' },
      { id: 'data_exfiltration', label: 'Data Exfiltration', description: 'Test for data theft through output channels and tool calls.' },
    ],
  },
  {
    group: 'Tool & API Abuse',
    items: [
      { id: 'tool_abuse', label: 'Tool Abuse', description: 'Probe for unrestricted tool access, privilege escalation, and command injection.' },
      { id: 'api_manipulation', label: 'API Manipulation', description: 'Test for API misuse, rate limit bypass, and authentication flaws.' },
    ],
  },
  {
    group: 'Memory & State',
    items: [
      { id: 'memory_poisoning', label: 'Memory Poisoning', description: 'Check for persistent memory contamination across sessions.' },
    ],
  },
];

export default function NewScan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAgent = searchParams.get('agent');

  const [step, setStep] = useState(preselectedAgent ? 2 : 1);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [agentError, setAgentError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(preselectedAgent || null);
  const [selectedCategories, setSelectedCategories] = useState(
    ATTACK_CATEGORIES.flatMap((g) => g.items.map((i) => i.id))
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchAgents = useCallback(async () => {
    try {
      setAgentError(null);
      if (MOCKS_ENABLED) {
        setAgents(mockAgents);
        setLoadingAgents(false);
        return;
      }
      const res = await agentApi.list();
      setAgents(res.data);
    } catch (err) {
      setAgentError(err.userMessage || 'Failed to load agents.');
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(ATTACK_CATEGORIES.flatMap((g) => g.items.map((i) => i.id)));
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  const handleStartScan = async () => {
    if (!selectedAgent || selectedCategories.length === 0) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      if (MOCKS_ENABLED) {
        navigate(`/scans/scan-${Date.now()}`);
        return;
      }
      const res = await scanApi.create({
        agent_id: selectedAgent,
        categories: selectedCategories,
      });
      navigate(`/scans/${res.data.id}`);
    } catch (err) {
      setSubmitError(err.userMessage || 'Failed to start scan.');
      setSubmitting(false);
    }
  };

  const selectedAgentData = agents.find((a) => a.id === selectedAgent);

  return (
    <>
      <SEOHead title="New Scan" noIndex />
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Scans' }, { label: 'New Scan' }]} />
      <PageHeader title="New Scan" description="Configure and launch a security scan against an AI agent" />

      {/* Step indicators */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { num: 1, label: 'Select Agent' },
          { num: 2, label: 'Attack Categories' },
          { num: 3, label: 'Start Scan' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-3">
            {i > 0 && <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />}
            <button
              onClick={() => {
                if (s.num === 1) setStep(1);
                else if (s.num === 2 && selectedAgent) setStep(2);
                else if (s.num === 3 && selectedAgent && selectedCategories.length > 0) setStep(3);
              }}
              className={`flex items-center gap-2 min-h-[40px] px-3 py-1 rounded-[var(--radius-pill)] text-sm font-medium transition-shadow ${
                step === s.num ? 'shadow-inset-sm' : step > s.num ? 'shadow-raised-sm' : ''
              }`}
              style={{
                color: step >= s.num ? 'var(--color-accent)' : 'var(--color-text-muted)',
                backgroundColor: 'var(--color-base)',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: step >= s.num ? 'var(--color-accent-soft)' : 'transparent',
                  color: step >= s.num ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Step 1: Select Agent */}
      {step === 1 && (
        <div>
          {loadingAgents && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}
          {agentError && <ErrorState title="Failed to load agents" message={agentError} onRetry={fetchAgents} />}
          {!loadingAgents && !agentError && agents.length === 0 && (
            <EmptyState title="No agents registered" message="Register an agent first to run a scan." actionLabel="Register Agent" actionTo="/agents" icon={Bot} />
          )}
          {!loadingAgents && !agentError && agents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {agents.map((agent) => {
                const isSelected = selectedAgent === agent.id;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgent(agent.id);
                      setStep(2);
                    }}
                    className={`neu-card p-6 text-left transition-all min-h-[40px] ${
                      isSelected ? 'shadow-raised-lg' : 'shadow-raised-md hover:shadow-raised-lg'
                    }`}
                    style={{
                      borderColor: isSelected ? 'var(--color-accent)' : 'transparent',
                      borderWidth: isSelected ? '2px' : '0',
                      transform: isSelected ? 'perspective(600px) rotateY(-1deg)' : 'none',
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="shadow-inset-sm rounded-[var(--radius-control)] p-2">
                        <Bot size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{agent.name}</p>
                        <span className="neu-pill text-xs">{agent.type}</span>
                      </div>
                    </div>
                    <p className="text-xs break-all" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {agent.endpoint}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Attack Categories */}
      {step === 2 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={selectAllCategories} className="neu-btn text-xs min-h-[36px]">Select All</button>
            <button onClick={clearCategories} className="neu-btn text-xs min-h-[36px]">Clear All</button>
            <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {selectedCategories.length} selected
            </span>
          </div>

          <div className="flex flex-col gap-8">
            {ATTACK_CATEGORIES.map((group) => (
              <div key={group.group}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  {group.group}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item) => {
                    const isChecked = selectedCategories.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCategory(item.id)}
                        className={`neu-card p-5 text-left transition-all flex items-start gap-4 min-h-[40px] ${
                          isChecked ? 'shadow-raised-md' : 'shadow-raised-sm'
                        }`}
                        aria-pressed={isChecked}
                        role="switch"
                      >
                        {/* Toggle indicator */}
                        <div
                          className="w-5 h-5 rounded-[6px] shrink-0 mt-0.5 flex items-center justify-center transition-all"
                          style={{
                            boxShadow: isChecked ? 'none' : 'var(--shadow-inset-sm)',
                            backgroundColor: isChecked ? 'var(--color-accent)' : 'transparent',
                          }}
                        >
                          {isChecked && <Check size={14} style={{ color: 'var(--color-deep)' }} aria-hidden="true" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{item.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button onClick={() => setStep(1)} className="neu-btn min-h-[40px]">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedCategories.length === 0}
              className="neu-btn neu-btn-primary min-h-[40px]"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm & Start */}
      {step === 3 && (
        <div className="max-w-lg">
          <div className="neu-card shadow-raised-md p-6 mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Scan Summary
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Agent</span>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedAgentData?.name || selectedAgent}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Categories</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCategories.map((catId) => {
                    const cat = ATTACK_CATEGORIES.flatMap((g) => g.items).find((i) => i.id === catId);
                    return (
                      <span key={catId} className="neu-pill text-xs">{cat?.label || catId}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-sm mb-4" style={{ color: 'var(--color-severity-critical)' }} role="alert">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button onClick={() => setStep(2)} className="neu-btn min-h-[40px]">Back</button>
            <button
              onClick={handleStartScan}
              disabled={submitting}
              className="neu-btn neu-btn-primary min-h-[48px] px-8 text-base font-semibold"
              style={{ animation: !submitting ? 'button-anticipation 200ms var(--ease-out-back)' : 'none' }}
            >
              <span className="flex items-center gap-2">
                <ScanLine size={20} aria-hidden="true" />
                {submitting ? 'Starting Scan...' : 'Start Scan'}
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
