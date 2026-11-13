import React from 'react';
import { SimplePageHeader } from '../../components/layout/SimplePageHeader';
import { SiteFooter } from '../../components/layout/SiteFooter';
import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { LAST_UPDATED_FORMATTED, LAST_UPDATED_ISO } from '../../lib/last-updated';

export const metadata: Metadata = {
  title: 'Privacy Policy | AgentLock 2.0',
  description:
    'Read the AgentLock 2.0 Privacy Policy. Learn how we handle enterprise data, security telemetry, analytics consent, and your privacy rights.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#BDBDBD] relative selection:bg-[#E6CBA8] selection:text-[#0A0A0A]">
      <SimplePageHeader currentLabel="LEGAL & PRIVACY" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3 pb-8 border-b border-[#2A2A2A]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8]">
              <Shield className="w-3.5 h-3.5" />
              <span>DATA PROTECTION COMPLIANCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-sans tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs font-mono text-[#8A8A8A]">
              Last updated: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_FORMATTED}</time> • Version 2.0.4
            </p>
          </div>

          {/* Policy Content */}
          <div className="space-y-10 text-sm leading-relaxed text-[#BDBDBD] font-sans">
            {/* 1. Who We Are */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                1. Who We Are
              </h2>
              <p>
                This Privacy Policy outlines how <strong>[COMPANY LEGAL NAME]</strong> (&ldquo;AgentLock 2.0&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, and safeguards personal information when you access our website, enterprise runtime gateway, or interactive security command center located at <strong>[DOMAIN]</strong>.
              </p>
              <p className="text-xs text-[#8A8A8A]">
                Principal Place of Business: [COMPANY LEGAL NAME], [ADDRESS], [EMAIL].
              </p>
            </section>

            {/* 2. Data We Collect */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                2. Data We Collect
              </h2>
              <p>We process information only to the extent necessary to deliver zero-trust security telemetry and communication services:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#8A8A8A]">
                <li><strong>Contact Form Data:</strong> Full name, professional work email address, company name, and message details submitted via our incident dispatch and demo request interfaces.</li>
                <li><strong>Fleet Security Telemetry:</strong> Anonymized runtime agent actions, policy intercept logs, and cryptographic SHA-256 block identifiers processed via customer gateway instances.</li>
                <li><strong>Analytics Data:</strong> Page navigation velocity, scroll-depth milestones, button clicks, and anonymous browser metrics collected exclusively upon your explicit consent.</li>
                <li><strong>Cookies & Local State:</strong> Essential security tokens, operator UI preferences, and cookie consent state stored locally in your browser.</li>
              </ul>
            </section>

            {/* 3. How We Use It */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                3. How We Use Your Data
              </h2>
              <p>
                We use collected information strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#8A8A8A]">
                <li>Evaluate and respond to demonstration inquiries and support dispatch requests within 1 business day.</li>
                <li>Operate, calibrate, and monitor the health and latency of the AgentLock 2.0 runtime policy engine.</li>
                <li>Prevent malicious activity, credential scraping, and distributed denial-of-service attempts.</li>
                <li>Comply with SOC2 Type II, ISO/IEC 27001, and applicable legal obligations.</li>
              </ul>
            </section>

            {/* 4. Legal Basis */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                4. Legal Basis for Processing (GDPR / CCPA)
              </h2>
              <p>
                Our legal grounds for collecting and processing personal information under GDPR Article 6 include: (a) <strong>Consent</strong> where you provide affirmative consent for optional analytics; (b) <strong>Contractual Necessity</strong> to process demonstration requests; and (c) <strong>Legitimate Interests</strong> in protecting our security perimeter against adversarial injection vectors.
              </p>
            </section>

            {/* 5. Data Retention */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                5. Data Retention
              </h2>
              <p>
                Contact inquiry records are retained for no longer than eighteen (18) months from last interaction unless a commercial contract is executed. Anonymized security audit ledgers are cryptographically sealed with immutable SHA-256 chaining.
              </p>
            </section>

            {/* 6. Sharing & Third-Party Processors */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                6. Sharing & Third-Party Processors
              </h2>
              <p>
                We never sell, rent, or monetize your personal data. We disclose information only to vetted sub-processors under strict Data Processing Agreements (DPAs) for cloud hosting, DNS routing, and Google Analytics 4 (only upon consent with IP anonymization enabled).
              </p>
            </section>

            {/* 7. Cookies & Tracking Technologies */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                7. Cookies & Tracking Technologies
              </h2>
              <p>
                We employ necessary operational cookies (e.g. storing your consent preference under <code>agentlock_consent</code>). Performance and analytics cookies are disabled by default (Consent Mode &ldquo;denied&rdquo;) and are activated solely when you click &ldquo;Accept all&rdquo; or enable them in Preferences.
              </p>
            </section>

            {/* 8. Your Data Protection Rights */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                8. Your Data Protection Rights
              </h2>
              <p>
                Depending on your jurisdiction (such as GDPR, UK GDPR, or CCPA/CPRA), you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#8A8A8A]">
                <li>Request access to the personal data we hold about you.</li>
                <li>Request correction or deletion of your personal records.</li>
                <li>Object to or restrict the processing of your data.</li>
                <li>Withdraw consent at any time without affecting prior lawful processing.</li>
                <li>Lodge a complaint with a supervisory data protection authority.</li>
              </ul>
            </section>

            {/* 9. Security Measures */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                9. Security Measures
              </h2>
              <p>
                We implement zero-trust network architectures, TLS 1.3 in-transit encryption, AES-256 rest encryption, and cryptographic audit chains to protect personal information against unauthorized disclosure, interception, or alteration.
              </p>
            </section>

            {/* 10. Children&apos;s Privacy */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                10. Children&apos;s Privacy
              </h2>
              <p>
                Our services are directed exclusively to enterprise professionals and AI engineering teams. We do not knowingly solicit or collect data from individuals under 18 years of age.
              </p>
            </section>

            {/* 11. Changes to this Policy */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                11. Changes to this Policy
              </h2>
              <p>
                We may revise this Privacy Policy periodically to reflect technological or regulatory updates. Any modifications will be posted to this page with an updated &ldquo;Last updated&rdquo; timestamp.
              </p>
            </section>

            {/* 12. Contact Data Protection Officer */}
            <section className="space-y-3 p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A]">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                12. Contact Our Privacy Office
              </h2>
              <p className="text-xs text-[#8A8A8A]">
                To exercise your rights or submit privacy-related questions, please contact our Data Protection Officer:
              </p>
              <div className="pt-2 text-xs font-mono text-[#BDBDBD] space-y-1">
                <div>Entity: <strong>[COMPANY LEGAL NAME]</strong></div>
                <div>Address: <strong>[ADDRESS]</strong></div>
                <div>Privacy Email: <a href="mailto:[EMAIL]" className="text-[#E6CBA8] underline">[EMAIL]</a></div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
