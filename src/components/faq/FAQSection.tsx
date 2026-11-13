'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is AgentLock?',
    answer:
      'AgentLock is an AI Agent Vulnerability Scanner and Automated Red Teaming Platform. It evaluates autonomous AI agents by executing controlled adversarial tests against user-owned targets to detect vulnerabilities before attackers exploit them.',
  },
  {
    id: 'faq-2',
    question: 'What types of vulnerabilities does AgentLock test for?',
    answer:
      'The platform tests four primary vulnerability categories: Prompt Injection (direct and indirect instruction override), Data Leakage (system prompt extraction and unauthorized data exfiltration), Tool Abuse (unauthorized parameter manipulation and unintended API invocation), and Memory Poisoning (state manipulation across chat sessions).',
  },
  {
    id: 'faq-3',
    question: 'Are the tests safe for production systems?',
    answer:
      'AgentLock tests only in an authorized sandbox environment using non-destructive simulation payloads. It does not target public third-party agents without explicit ownership confirmation or execute destructive write actions.',
  },
  {
    id: 'faq-4',
    question: 'How are vulnerability findings verified?',
    answer:
      'Every finding is accompanied by the exact attack prompt used, raw response evidence, impacted system boundaries, and prescriptive remediation guidance. Severity ratings (Critical, High, Medium, Low, Info) follow deterministic vulnerability scoring.',
  },
  {
    id: 'faq-5',
    question: 'Are reported metrics and statistics real?',
    answer:
      'Yes. AgentLock enforces a strict zero-fabricated-data policy. All scan results, finding counts, and agent statuses are directly derived from real backend scan executions. If no scans have been performed yet, honest empty states are displayed instead of synthetic numbers.',
  },
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#12234A]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6F59] shadow-[0_0_10px_rgba(255,111,89,0.4)]" />
            <HelpCircle className="w-5 h-5 text-[#FF6F59]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5EDDC] tracking-tight font-sans">
              Frequently Asked Questions
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#FF6F59]/10 border border-[#FF6F59]/30 text-[#FF6F59] flex items-center gap-1.5">
              SECURITY SCANNER FAQ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#C8C0AC] mt-1 font-sans">
            Direct, factual answers regarding evaluation scope, security controls, and verification methodology.
          </p>
        </div>
      </div>

      {/* Accordion Container */}
      <div className="max-w-4xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openId === item.id;

          return (
            <div
              key={item.id}
              id={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-[#0A1633] border-[#FF6F59]/40 shadow-lg'
                  : 'bg-[#060D1F] border-[#12234A] hover:border-[#12234A]/80'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6F59]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#FF6F59] font-bold">
                    0{index + 1}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-[#F5EDDC] font-sans tracking-tight">
                    {item.question}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-[#12234A] transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#12234A] text-[#FF6F59]' : 'bg-[#060D1F] text-[#C8C0AC]'
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
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-[#12234A]">
                    <p className="text-xs sm:text-sm text-[#C8C0AC] font-sans leading-relaxed">
                      {item.answer}
                    </p>

                    <div className="flex items-center justify-end pt-3 border-t border-[#12234A] text-xs font-mono text-[#C8C0AC]">
                      <CopyButton text={item.answer} label="Copy answer" />
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
