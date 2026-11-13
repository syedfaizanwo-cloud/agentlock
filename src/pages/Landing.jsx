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

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://agentlock.dev';

const STEPS = [
  {
    num: '01',
    title: 'Register your agent',
    description: 'Point AgentLock at your AI agent endpoint. Provide the URL, authentication headers, and agent type.',
    icon: Bot,
  },
  {
    num: '02',
    title: 'Select attack categories',
    description: 'Choose which vulnerability classes to test: prompt injection, data leakage, tool abuse, memory poisoning, and more.',
    icon: ScanLine,
  },
  {
    num: '03',
    title: 'Review findings',
    description: 'Get detailed evidence of each vulnerability with severity, impact assessment, and remediation guidance.',
    icon: FileSearch,
  },
];

const CATEGORIES = [
  {
    title: 'Prompt Injection',
    description: 'Tests whether your agent follows instructions from untrusted input that override its system prompt.',
    icon: Syringe,
  },
  {
    title: 'Data Leakage',
    description: 'Checks for PII exposure, training data extraction, and sensitive context leaking between sessions.',
    icon: Database,
  },
  {
    title: 'Tool Abuse',
    description: 'Probes for unrestricted file access, command injection, and privilege escalation through agent tools.',
    icon: Wrench,
  },
  {
    title: 'Memory Poisoning',
    description: 'Detects persistent memory contamination where injected instructions affect future sessions and users.',
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
    <div style={{ backgroundColor: 'var(--color-base)', color: 'var(--color-text-primary)' }}>
      <SEOHead
        title="AI Agent Vulnerability Scanner"
        description="Open-source vulnerability scanner that tests AI agents for prompt injection, data leakage, tool abuse, and memory poisoning. Find security flaws before attackers do."
        canonical="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLdOrg)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdApp)}</script>
      </Helmet>

      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 px-6 lg:px-12 py-4"
        style={{
          backgroundColor: 'var(--color-base)',
          borderBottom: '1px solid var(--color-edge-highlight)',
        }}
        aria-label="Site navigation"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline min-h-[40px]" aria-label="AgentLock home">
            <Shield size={24} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
              AgentLock
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm min-h-[40px] flex items-center no-underline" style={{ color: 'var(--color-text-secondary)' }}>
              Dashboard
            </Link>
            <a
              href="https://github.com/syedfaizanwo-cloud/agentlock"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AgentLock GitHub repository"
              className="flex items-center gap-2 text-sm min-h-[40px] no-underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Github size={18} aria-hidden="true" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      <main>
      {/* Hero */}
      <section className="px-6 lg:px-12 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Find vulnerabilities in your AI agents before attackers do
          </h1>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            AgentLock is an open-source security scanner that tests AI agents for prompt injection,
            data leakage, tool abuse, and memory poisoning. It runs controlled attacks against your agent
            and reports what it found, with evidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="neu-btn neu-btn-primary px-8 py-3 min-h-[48px] text-base font-semibold inline-flex items-center gap-2 no-underline"
            >
              Get Started
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href="https://github.com/syedfaizanwo-cloud/agentlock"
              target="_blank"
              rel="noopener noreferrer"
              className="neu-btn px-8 py-3 min-h-[48px] text-base inline-flex items-center gap-2 no-underline"
            >
              <Github size={18} aria-hidden="true" />
              View Source
            </a>
          </div>
        </div>
      </section>

      {/* How a scan works */}
      <section className="px-6 lg:px-12 py-16 lg:py-24" style={{ backgroundColor: 'var(--color-deep)' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-14"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            How a scan works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="neu-card shadow-raised-md p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
                  >
                    {step.num}
                  </span>
                  <step.icon size={22} style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What AgentLock tests */}
      <section className="px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center mb-14"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            What AgentLock tests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className="neu-card shadow-raised-md p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="shadow-inset-sm rounded-[var(--radius-control)] p-2">
                    <cat.icon size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                    {cat.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety boundary */}
      <section className="px-6 lg:px-12 py-16 lg:py-24" style={{ backgroundColor: 'var(--color-deep)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="shadow-inset-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Lock size={28} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          </div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Controlled testing, real evidence
          </h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            AgentLock runs attack simulations in a controlled environment against agents you own.
            It does not attack third-party systems, exfiltrate data, or cause permanent changes.
            Every finding comes with the exact input that triggered it and the agent's response,
            so you can verify and reproduce it.
          </p>
        </div>
      </section>

      {/* Open source CTA */}
      <section className="px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Open source
          </h2>
          <p className="text-sm leading-relaxed max-w-xl mx-auto mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            AgentLock is open source. Inspect the attack engine, contribute new attack patterns,
            or self-host the entire platform.
          </p>
          <a
            href="https://github.com/syedfaizanwo-cloud/agentlock"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View AgentLock on GitHub"
            className="neu-btn neu-btn-primary px-8 py-3 min-h-[48px] text-base font-semibold inline-flex items-center gap-2 no-underline"
          >
            <Github size={20} aria-hidden="true" />
            View on GitHub
          </a>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer
        className="px-6 lg:px-12 py-8"
        style={{
          backgroundColor: 'var(--color-deep)',
          borderTop: '1px solid var(--color-edge-highlight)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-secondary)' }}>
              AgentLock
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xs no-underline" style={{ color: 'var(--color-text-muted)' }}>
              Dashboard
            </Link>
            <Link to="/agents" className="text-xs no-underline" style={{ color: 'var(--color-text-muted)' }}>
              Agents
            </Link>
            <Link to="/reports" className="text-xs no-underline" style={{ color: 'var(--color-text-muted)' }}>
              Reports
            </Link>
            <a
              href="https://github.com/syedfaizanwo-cloud/agentlock"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AgentLock on GitHub"
              className="text-xs no-underline"
              style={{ color: 'var(--color-text-muted)' }}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
