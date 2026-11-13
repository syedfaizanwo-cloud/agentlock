import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  ScanLine,
  Bot,
  FileSearch,
  Syringe,
  Database,
  Wrench,
  BrainCircuit,
  Github,
  ArrowRight,
  Lock,
} from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import AppNavbar from '@/components/layout/AppNavbar';
import TextRoll from '@/components/ui/text-roll';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://agentlock.dev';

const STEPS = [
  {
    num: '01',
    title: 'REGISTER YOUR AGENT',
    description: 'Point AgentLock at your AI agent endpoint. Provide the URL, authentication headers, and agent type.',
    icon: Bot,
  },
  {
    num: '02',
    title: 'SELECT ATTACK CATEGORIES',
    description: 'Choose which vulnerability classes to test: prompt injection, data leakage, tool abuse, memory poisoning, and more.',
    icon: ScanLine,
  },
  {
    num: '03',
    title: 'REVIEW FINDINGS',
    description: 'Get detailed evidence of each vulnerability with severity, impact assessment, and remediation guidance.',
    icon: FileSearch,
  },
];

const CATEGORIES = [
  {
    title: 'PROMPT INJECTION',
    description: 'Tests whether your agent follows instructions from untrusted input that override its system prompt.',
    icon: Syringe,
  },
  {
    title: 'DATA LEAKAGE',
    description: 'Checks for PII exposure, training data extraction, and sensitive context leaking between sessions.',
    icon: Database,
  },
  {
    title: 'TOOL ABUSE',
    description: 'Probes for unrestricted file access, command injection, and privilege escalation through agent tools.',
    icon: Wrench,
  },
  {
    title: 'MEMORY POISONING',
    description: 'Detects persistent memory contamination where injected instructions affect future sessions and other users.',
    icon: BrainCircuit,
  },
];

export default function Landing() {
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AgentLock',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: 'AI Agent Vulnerability Scanner and Automated Red Teaming Platform',
  };

  const jsonLdApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AgentLock',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    description: 'Open-source vulnerability scanner that tests AI agents for prompt injection, data leakage, tool abuse, and memory poisoning.',
    url: SITE_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative text-cream" style={{ backgroundColor: 'transparent' }}>
      <SEOHead
        title="AI Agent Vulnerability Scanner"
        description="Open-source vulnerability scanner that tests AI agents for prompt injection, data leakage, tool abuse, and memory poisoning. Find security flaws before attackers do."
        canonical="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLdOrg)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdApp)}</script>
      </Helmet>

      {/* Navigation: Fixed top bar with wordmark & hamburger button only */}
      <AppNavbar />

      <main className="flex-1 relative z-10 pt-24 px-6 lg:px-12 pb-16">
        {/* Hero Section with solid navy panel so text never sits on raw animated cubes */}
        <section className="py-12 lg:py-20 max-w-4xl mx-auto">
          <div
            className="neu-card shadow-raised-lg p-8 sm:p-14 text-center relative overflow-hidden"
            style={{ backgroundColor: 'rgba(10, 22, 51, 0.92)' }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 neu-pill text-xs font-mono uppercase tracking-wider text-coral">
              <Shield size={14} aria-hidden="true" />
              <span>Automated Red Teaming Console</span>
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-cream tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Find vulnerabilities in your AI agents before attackers do
            </h1>

            <p
              className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-cream-soft"
            >
              AgentLock is an open-source security scanner that tests AI agents for prompt injection,
              data leakage, tool abuse, and memory poisoning. It runs controlled attacks against your agent
              and reports what it found, with evidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="neu-btn neu-btn-primary px-8 py-3.5 min-h-[48px] text-base font-semibold inline-flex items-center gap-2 no-underline"
              >
                Get Started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="https://github.com/syedfaizanwo-cloud/agentlock"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View AgentLock on GitHub (opens in new tab)"
                className="neu-btn px-8 py-3.5 min-h-[48px] text-base inline-flex items-center gap-2 no-underline text-cream"
              >
                <Github size={18} aria-hidden="true" />
                View Source
              </a>
            </div>
          </div>
        </section>

        {/* How a scan works */}
        <section className="py-16 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-wider text-cream uppercase"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <TextRoll stagger={0.015}>HOW A SCAN WORKS</TextRoll>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="neu-card shadow-raised-md p-7 relative"
                style={{ backgroundColor: 'rgba(10, 22, 51, 0.92)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="text-xl font-bold text-coral"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {step.num}
                  </span>
                  <div className="shadow-inset-sm p-2.5 rounded-[var(--radius-control)]">
                    <step.icon size={22} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
                  </div>
                </div>
                <h3
                  className="text-base font-bold mb-2 tracking-wide text-cream"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-cream-soft">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What AgentLock tests */}
        <section className="py-16 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-wider text-cream uppercase"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <TextRoll stagger={0.015}>WHAT AGENTLOCK TESTS</TextRoll>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="neu-card shadow-raised-md p-7"
                style={{ backgroundColor: 'rgba(10, 22, 51, 0.92)' }}
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="shadow-inset-sm rounded-[var(--radius-control)] p-2.5">
                    <cat.icon size={20} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold tracking-wide text-cream" style={{ fontFamily: 'var(--font-heading)' }}>
                    {cat.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-cream-soft">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety boundary */}
        <section className="py-16 max-w-3xl mx-auto text-center">
          <div
            className="neu-card shadow-raised-md p-8 sm:p-12"
            style={{ backgroundColor: 'rgba(10, 22, 51, 0.92)' }}
          >
            <div className="shadow-inset-sm rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-6">
              <Lock size={26} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
            </div>
            <h2
              className="text-xl sm:text-2xl font-bold mb-4 text-cream tracking-wide uppercase"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <TextRoll stagger={0.015}>CONTROLLED TESTING, REAL EVIDENCE</TextRoll>
            </h2>
            <p className="text-sm leading-relaxed max-w-xl mx-auto text-cream-soft">
              AgentLock runs attack simulations in a controlled environment against agents you own.
              It does not attack third-party systems, exfiltrate data, or cause permanent changes.
              Every finding comes with the exact input that triggered it and the agent's response,
              so you can verify and reproduce it.
            </p>
          </div>
        </section>

        {/* Open source CTA */}
        <section className="py-16 max-w-3xl mx-auto text-center">
          <div
            className="neu-card shadow-raised-md p-8 sm:p-12"
            style={{ backgroundColor: 'rgba(10, 22, 51, 0.92)' }}
          >
            <h2
              className="text-2xl font-bold mb-4 text-cream tracking-wide uppercase"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <TextRoll stagger={0.015}>OPEN SOURCE PLATFORM</TextRoll>
            </h2>
            <p className="text-sm leading-relaxed max-w-xl mx-auto mb-8 text-cream-soft">
              AgentLock is open source. Inspect the attack engine, contribute new attack patterns,
              or self-host the entire platform.
            </p>
            <a
              href="https://github.com/syedfaizanwo-cloud/agentlock"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View AgentLock on GitHub (opens in new tab)"
              className="neu-btn neu-btn-primary px-8 py-3.5 min-h-[48px] text-base font-semibold inline-flex items-center gap-2 no-underline"
            >
              <Github size={20} aria-hidden="true" />
              View on GitHub
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="px-6 lg:px-12 py-8 relative z-10"
        style={{
          backgroundColor: '#060D1F',
          borderTop: '1px solid var(--color-edge-highlight)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
            <span className="text-sm font-medium text-cream-soft" style={{ fontFamily: 'var(--font-heading)' }}>
              AgentLock Security
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xs no-underline text-cream-soft hover:text-coral transition-colors">
              Dashboard
            </Link>
            <Link to="/agents" className="text-xs no-underline text-cream-soft hover:text-coral transition-colors">
              Agents
            </Link>
            <Link to="/reports" className="text-xs no-underline text-cream-soft hover:text-coral transition-colors">
              Reports
            </Link>
            <a
              href="https://github.com/syedfaizanwo-cloud/agentlock"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AgentLock on GitHub"
              className="text-xs no-underline text-cream-soft hover:text-coral transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
