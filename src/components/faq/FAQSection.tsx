'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, ChevronDown, Check, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is AgentLock 2.0?',
    answer:
      'AgentLock 2.0 is a deterministic zero-trust runtime gateway for autonomous AI agent fleets. It sits as a protective choke point between LLM agents and sensitive tools, APIs, filesystems, and databases, intercepting every action in real time to enforce least-privilege security policies, MITRE-aligned safeguards, and immutable audit ledgers.',
  },
  {
    id: 'faq-2',
    question: 'How does the zero-trust gateway decide?',
    answer:
      'Every agent request is evaluated across multiple deterministic vectors: cryptographic workload identity, HMAC timestamp validation, source input trust level (Trusted, Verified, or Untrusted), destination allowlists, SSRF IP filtering, and outbound DLP inspection. Actions are classified into ALLOW, ESCALATE (to human approval), or BLOCK in sub-millisecond evaluation cycles.',
  },
  {
    id: 'faq-3',
    question: 'What happens when an agent goes offline?',
    answer:
      'AgentLock operates on a strict fail-closed security posture. Agents must emit a cryptographic heartbeat every 30 seconds. If 3 consecutive beats are missed, leased API credentials expire automatically, the agent is quarantined, and all inbound/outbound actions are denied until full cryptographic re-attestation is completed.',
  },
  {
    id: 'faq-4',
    question: 'How are sources and destinations verified?',
    answer:
      'Inbound sources (prompts, RAG documents, tool outputs) are tagged with cryptographic provenance hashes and classified by trust tier. Outbound destinations are strictly restricted to pre-approved domain/IP allowlists. DNS is resolved server-side with strict blocking of loopback (127.0.0.1), link-local cloud metadata (169.254.169.254), and private RFC-1918 subnets.',
  },
  {
    id: 'faq-5',
    question: 'How is the audit chain tamper-proof?',
    answer:
      'Every agent evaluation, policy decision, approval, and simulation result is cryptographically hashed using SHA-256 and linked sequentially to the preceding record block in an append-only verifiable hash ledger. Any unauthorized modification breaks the cryptographic verification chain immediately.',
  },
  {
    id: 'faq-6',
    question: 'Can I run AgentLock self-hosted on-premises?',
    answer:
      'Yes. AgentLock is cloud-agnostic and fully containerized. Enterprise deployments support air-gapped Docker clusters, Kubernetes Helm charts, and bare-metal Linux instances with private HashiCorp Vault key management and local PostgreSQL storage.',
  },
  {
    id: 'faq-7',
    question: 'What data does AgentLock store?',
    answer:
      'AgentLock stores only execution metadata, cryptographic hashes, policy verdicts, and anomaly telemetry. Agent prompts, RAG documents, and sensitive payloads can be configured for zero-retention or real-time redaction through our inline Data Loss Prevention (DLP) engine.',
  },
  {
    id: 'faq-8',
    question: 'How do Human-in-the-Loop approvals work?',
    answer:
      'When an agent requests a high-risk operation (such as modifying production databases, dispatching funds, or executing unverified shell commands), the action is suspended in an encrypted state. Authorized SecOps operators receive instant push alerts and can inspect full forensic dossiers before granting dual-custody cryptographic approval.',
  },
  {
    id: 'faq-9',
    question: 'How do I connect my existing AI agents?',
    answer:
      'Integration requires only changing the base API URL in your agent framework. AgentLock provides native drop-in SDK wrappers for LangChain, LlamaIndex, CrewAI, AutoGen, OpenAI Assistant API, and raw REST proxies with zero code rewrites required.',
  },
  {
    id: 'faq-10',
    question: 'How do I report a security vulnerability?',
    answer:
      'We welcome responsible vulnerability disclosures. Please transmit PGP-encrypted vulnerability reports directly to security@agentlock.ai. Our dedicated 24/7 SecOps Incident Dispatch triage team responds within 15 minutes.',
  },
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [origin, setOrigin] = useState('https://agentlock.ai');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Listen for search-to-faq trigger
  useEffect(() => {
    const handleOpenFaq = (e: CustomEvent<{ faqId: string }>) => {
      if (e.detail?.faqId) {
        setOpenId(e.detail.faqId);
        const el = document.getElementById(e.detail.faqId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('open-faq-item' as any, handleOpenFaq);
    return () => window.removeEventListener('open-faq-item' as any, handleOpenFaq);
  }, []);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setHelpfulFeedback((prev) => ({ ...prev, [id]: type }));
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="pt-12 scroll-mt-24 space-y-8">
      {/* FAQPage JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6CBA8] shadow-[0_0_10px_rgba(230,203,168,0.4)]" />
            <HelpCircle className="w-5 h-5 text-[#E6CBA8]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Frequently Asked Questions
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8] flex items-center gap-1.5 shadow-[0_0_10px_rgba(230,203,168,0.1)]">
              ZERO-TRUST RUNTIME FAQ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-sans">
            Plain-English answers to zero-trust gateway architecture, self-hosting options, and autonomous agent safety.
          </p>
        </div>
      </div>

      {/* Accordion Container */}
      <div className="max-w-4xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openId === item.id;
          const shareUrl = `${origin}/#${item.id}`;

          return (
            <div
              key={item.id}
              id={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#0D0D0D] border-[#3D3D3D] shadow-lg'
                  : 'bg-[#0A0A0A] border-[#2A2A2A] hover:border-[#3D3D3D]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 transition-colors focus:outline-none focus:ring-1 focus:ring-[#E6CBA8]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#E6CBA8] font-bold">
                    0{index + 1}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-white font-sans tracking-tight">
                    {item.question}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-[#2A2A2A] transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#1E1E1E] text-[#E6CBA8]' : 'bg-[#151515] text-[#8A8A8A]'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Smooth Grid-Template-Rows Expand Transition */}
              <div
                id={`faq-answer-${item.id}`}
                data-faq-answer="true"
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#1E1E1E]">
                    <p className="text-xs sm:text-sm text-[#BDBDBD] font-sans leading-relaxed">
                      {item.answer}
                    </p>

                    {/* Bottom toolbar: Copy Link & Was this helpful? */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E1E1E] text-xs font-mono text-[#8A8A8A]">
                      <div className="flex items-center gap-2">
                        <span>Was this helpful?</span>
                        <button
                          type="button"
                          onClick={() => handleFeedback(item.id, 'up')}
                          aria-label="Mark answer as helpful"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            helpfulFeedback[item.id] === 'up'
                              ? 'bg-[rgba(230,203,168,0.2)] border-[#B89B72] text-[#E6CBA8]'
                              : 'bg-[#151515] border-[#2A2A2A] text-[#8A8A8A] hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(item.id, 'down')}
                          aria-label="Mark answer as not helpful"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            helpfulFeedback[item.id] === 'down'
                              ? 'bg-[rgba(192,80,77,0.2)] border-[#C0504D] text-[#C0504D]'
                              : 'bg-[#151515] border-[#2A2A2A] text-[#8A8A8A] hover:text-white'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        {helpfulFeedback[item.id] && (
                          <span className="text-[11px] text-[#E6CBA8] animate-in fade-in">
                            Thanks for the feedback!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <CopyButton text={shareUrl} label="Copy link" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
