import React from 'react';
import { SimplePageHeader } from '../components/layout/SimplePageHeader';
import { SiteFooter } from '../components/layout/SiteFooter';

import { Shield } from 'lucide-react';
import { LAST_UPDATED_FORMATTED, LAST_UPDATED_ISO } from '../lib/last-updated';

export const metadata: Metadata = {
  title: 'Terms of Service | AgentLock 2.0',
  description:
    'AgentLock 2.0 Terms of Service. Understand our terms for runtime gateway access, acceptable AI fleet usage, and service reliability guarantees.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#BDBDBD] relative selection:bg-[#E6CBA8] selection:text-[#0A0A0A]">
      <SimplePageHeader currentLabel="LEGAL & TERMS" />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-3 pb-8 border-b border-[#2A2A2A]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[rgba(230,203,168,0.12)] border border-[#B89B72]/40 text-[#E6CBA8]">
              <Shield className="w-3.5 h-3.5" />
              <span>COMMERCIAL TERMS OF SERVICE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-sans tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs font-mono text-[#8A8A8A]">
              Last updated: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED_FORMATTED}</time> • Version 2.0.4
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-10 text-sm leading-relaxed text-[#BDBDBD] font-sans">
            {/* 1. Acceptance of Terms */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the AgentLock 2.0 website, interactive telemetry visualizer, or API gateway (collectively, the &ldquo;Service&rdquo;), operated by <strong>[COMPANY LEGAL NAME]</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>

            {/* 2. Use of the Service */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                2. Use of the Service
              </h2>
              <p>
                AgentLock 2.0 grants you a non-exclusive, non-transferable, revocable license to evaluate and utilize our zero-trust runtime interception gateway in accordance with your organization&apos;s authorized subscription tier and deployment parameters.
              </p>
            </section>

            {/* 3. Account & Operator Credentials */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                3. Accounts & Operator Credentials
              </h2>
              <p>
                Authorized SecOps personnel are responsible for safeguarding enterprise API keys, gateway tokens, and sign-off credentials. Any action intercepted or approved using valid operator credentials shall be deemed authorized by your organization.
              </p>
            </section>

            {/* 4. Acceptable AI Fleet Usage */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                4. Acceptable Use Policy
              </h2>
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-[#8A8A8A]">
                <li>Probe, bypass, or reverse engineer runtime gateway policy engines or SHA-256 audit ledger verifiers.</li>
                <li>Conduct denial-of-service simulations against third-party endpoints without verified mutual consent.</li>
                <li>Transmit illegal, malicious, or non-consensual surveillance instructions across autonomous fleet networks.</li>
              </ul>
            </section>

            {/* 5. Intellectual Property */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                5. Intellectual Property
              </h2>
              <p>
                All patents, trademarks, service marks, codebases, 3D interactive command shaders, and documentation comprising AgentLock 2.0 are the exclusive property of <strong>[COMPANY LEGAL NAME]</strong> or its licensors.
              </p>
            </section>

            {/* 6. Disclaimers */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                6. Warranty Disclaimers
              </h2>
              <p>
                The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. While AgentLock 2.0 provides deterministic policy filtering and threat interception, no cybersecurity tool can guarantee 100% defense against novel zero-day attack vectors.
              </p>
            </section>

            {/* 7. Limitation of Liability */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                7. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, <strong>[COMPANY LEGAL NAME]</strong> shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data corruption, or operational disruption resulting from autonomous agent fleet actions.
              </p>
            </section>

            {/* 8. Termination */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                8. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate access to gateway instances immediately if a material breach of security policies, non-payment, or unauthorized probing is identified.
              </p>
            </section>

            {/* 9. Governing Law */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                9. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of <strong>[JURISDICTION]</strong>, without regard to its conflict of law principles. Any dispute arising out of these Terms shall be resolved in the courts of <strong>[JURISDICTION]</strong>.
              </p>
            </section>

            {/* 10. Changes to Terms */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                10. Changes to Terms
              </h2>
              <p>
                We may revise these Terms from time to time. The revised version will be effective immediately upon posting. Your continued use of the Service after changes constitute acceptance.
              </p>
            </section>

            {/* 11. Contact Information */}
            <section className="space-y-3 p-6 rounded-2xl bg-[#0D0D0D] border border-[#2A2A2A]">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono text-[#E6CBA8]">
                11. Contact Legal Affairs
              </h2>
              <p className="text-xs text-[#8A8A8A]">
                For questions regarding these Terms or enterprise Master Services Agreements (MSAs), please contact:
              </p>
              <div className="pt-2 text-xs font-mono text-[#BDBDBD] space-y-1">
                <div>Entity: <strong>[COMPANY LEGAL NAME]</strong></div>
                <div>Address: <strong>[ADDRESS]</strong></div>
                <div>Legal Inquiries: <a href="mailto:[EMAIL]" className="text-[#E6CBA8] underline">[EMAIL]</a></div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
