/**
 * Client-side Search Index & Lightweight Fuzzy Matcher
 * Indexes Sections, FAQ items, Security topics, Menu links, and Legal pages.
 */

export interface SearchItem {
  id: string;
  title: string;
  category: 'Section' | 'FAQ' | 'Security' | 'Legal' | 'Menu';
  description: string;
  keywords: string[];
  url: string;
  faqId?: string;
}

export const SEARCH_INDEX: SearchItem[] = [
  // Sections
  {
    id: 'sec-telemetry',
    title: 'Live Fleet Telemetry',
    category: 'Section',
    description:
      'Real-time cluster vitals, authorization throughput, active threat block rates, and agent status.',
    keywords: ['telemetry', 'metrics', 'latency', 'rps', 'blocked', 'stats', 'fleet', 'throughput'],
    url: '/#telemetry',
  },
  {
    id: 'sec-flow',
    title: 'Flowing Navigation',
    category: 'Section',
    description:
      'Fluid kinetic navigation mesh with marquee velocity control and dynamic hover deformation.',
    keywords: ['flow', 'navigation', 'menu', 'marquee', 'speed'],
    url: '/#flow',
  },
  {
    id: 'sec-fleet-governance',
    title: 'Fleet Governance & Quotas',
    category: 'Section',
    description:
      'Autonomous agent lifecycle registry, quota tiers, and real-time permission boundaries.',
    keywords: ['governance', 'agents', 'quotas', 'tiers', 'rate limit', 'status', 'tokens'],
    url: '/#fleet-governance',
  },
  {
    id: 'sec-action-monitoring',
    title: 'Real-Time Action Monitoring',
    category: 'Section',
    description:
      'Sub-millisecond policy evaluation engine and deterministic gateway event bus.',
    keywords: ['actions', 'events', 'intercept', 'evaluation', 'monitor', 'live stream'],
    url: '/#action-monitoring',
  },
  {
    id: 'sec-threat-forensics',
    title: 'Threat Forensics & MITRE Dossiers',
    category: 'Section',
    description:
      'Deep attack reconstruction, MITRE ATT&CK mapping, and automated countermeasure logs.',
    keywords: ['threats', 'forensics', 'mitre', 'attack', 'exfiltration', 'injection', 'dossier'],
    url: '/#threat-forensics',
  },
  {
    id: 'sec-approval-center',
    title: 'Human-in-the-Loop Approval Center',
    category: 'Section',
    description:
      'High-risk escalation queue with dual-custody cryptographic sign-offs.',
    keywords: ['approval', 'hitl', 'escalation', 'sign-off', 'human', 'review', 'custody'],
    url: '/#approval-center',
  },
  {
    id: 'sec-audit-explorer',
    title: 'Tamper-Proof Audit Explorer',
    category: 'Section',
    description:
      'Cryptographically signed SHA-256 ledger tracking every agent decision and gateway verdict.',
    keywords: ['audit', 'sha256', 'cryptographic', 'ledger', 'hash', 'chain', 'immutable'],
    url: '/#audit-explorer',
  },
  {
    id: 'sec-attack-simulation',
    title: 'Autonomous Attack Simulation Lab',
    category: 'Section',
    description:
      'Synthetic adversary testbed validating policy resiliency against zero-day exploit vectors.',
    keywords: ['simulation', 'lab', 'adversary', 'synthetic', 'attack', 'prompt injection', 'jailbreak'],
    url: '/#attack-simulation',
  },
  {
    id: 'sec-gateway-api',
    title: 'Gateway Architecture & OpenAPI Specs',
    category: 'Section',
    description:
      'OpenAPI 3.1 runtime schema, deterministic latency metrics, and FastAPI sync endpoints.',
    keywords: ['api', 'gateway', 'fastapi', 'openapi', 'rest', 'sdk', 'endpoints', 'schema'],
    url: '/#gateway-api',
  },
  {
    id: 'sec-security',
    title: 'Source & Destination Security',
    category: 'Section',
    description:
      'Source trust registry, egress allowlists, SSRF protection, DLP inspection, and offline agent safeguards.',
    keywords: ['source', 'destination', 'security', 'egress', 'ssrf', 'dlp', 'offline', 'kill switch', 'heartbeat'],
    url: '/#security',
  },
  {
    id: 'sec-faq',
    title: 'Frequently Asked Questions (FAQ)',
    category: 'Section',
    description:
      'Answers to architectural, self-hosting, zero-trust policies, and security operations questions.',
    keywords: ['faq', 'questions', 'answers', 'support', 'help', 'docs'],
    url: '/#faq',
  },
  {
    id: 'sec-contact',
    title: 'Contact Incident Dispatch & Demo',
    category: 'Section',
    description:
      'Connect with zero-trust runtime architects, schedule enterprise simulations, and report vulnerabilities.',
    keywords: ['contact', 'demo', 'email', 'phone', 'dispatch', 'sales', 'support'],
    url: '/#contact',
  },

  // Security Topics
  {
    id: 'sec-topic-source-registry',
    title: 'Source Registry & Trust Tiers',
    category: 'Security',
    description:
      'Every input channel (prompts, uploads, web RAG, email, API) is assigned Trusted, Verified, or Untrusted levels.',
    keywords: ['source', 'trust', 'untrusted', 'indirect prompt injection', 'rag', 'ingestion'],
    url: '/#security-sources',
  },
  {
    id: 'sec-topic-egress-allowlist',
    title: 'Default-Deny Egress Allowlists',
    category: 'Security',
    description:
      'Strict per-agent egress boundaries. Unlisted domains, IPs, and cloud buckets are intercepted and blocked.',
    keywords: ['egress', 'allowlist', 'domain', 'ip', 'cidr', 'firewall', 'destination'],
    url: '/#security-destinations',
  },
  {
    id: 'sec-topic-ssrf',
    title: 'Server-Side Request Forgery (SSRF) Shield',
    category: 'Security',
    description:
      'Server-side DNS resolution blocking loopback, link-local (169.254.169.254), and private RFC-1918 subnets.',
    keywords: ['ssrf', 'metadata', '169.254', 'aws metadata', 'loopback', 'private ip'],
    url: '/#security-destinations',
  },
  {
    id: 'sec-topic-dlp',
    title: 'Outbound Data Loss Prevention (DLP)',
    category: 'Security',
    description:
      'Automated scanning for secrets, API tokens, PII, and classified corporate data before egress transmission.',
    keywords: ['dlp', 'leak', 'pii', 'secrets', 'api key', 'exfiltration', 'redact'],
    url: '/#security-destinations',
  },
  {
    id: 'sec-topic-kill-switch',
    title: 'Fleet Kill Switch & Quarantine',
    category: 'Security',
    description:
      'Instant emergency command to quarantine all active agent processes and revoke leased credentials.',
    keywords: ['kill switch', 'emergency', 'revoke', 'quarantine', 'halt', 'shutdown'],
    url: '/#security-controls',
  },
  {
    id: 'sec-topic-heartbeat',
    title: 'Offline Agent Protection (Fail-Closed)',
    category: 'Security',
    description:
      '30-second heartbeat check. Agents missing heartbeats automatically lose leased tokens and fail closed.',
    keywords: ['offline', 'heartbeat', 'fail-closed', 'stale', 're-attest', 'lease'],
    url: '/#security-offline',
  },

  // FAQ Items
  {
    id: 'faq-what-is-agentlock',
    title: 'What is AgentLock 2.0?',
    category: 'FAQ',
    description:
      'A deterministic zero-trust runtime security gateway that inspects and enforces policies on autonomous AI agents.',
    keywords: ['what is', 'agentlock', 'gateway', 'runtime', 'zero trust'],
    url: '/#faq',
    faqId: 'faq-1',
  },
  {
    id: 'faq-gateway-decision',
    title: 'How does the zero-trust gateway decide?',
    category: 'FAQ',
    description:
      'Multi-factor evaluation: agent tier, HMAC signature, source trust level, destination allowlist, and DLP risk score.',
    keywords: ['decision', 'policy', 'evaluation', 'rules', 'engine'],
    url: '/#faq',
    faqId: 'faq-2',
  },
  {
    id: 'faq-offline-behavior',
    title: 'What happens when an agent goes offline?',
    category: 'FAQ',
    description:
      'Fail-closed posture: credentials expire, outbound requests are rejected, and re-attestation is required upon reconnect.',
    keywords: ['offline', 'disconnect', 'heartbeat', 'stale', 'credentials'],
    url: '/#faq',
    faqId: 'faq-3',
  },
  {
    id: 'faq-source-dest',
    title: 'How are sources and destinations verified?',
    category: 'FAQ',
    description:
      'Cryptographic provenance checks, server-side DNS resolution, SSRF blocking, and egress allowlists.',
    keywords: ['sources', 'destinations', 'verify', 'dns', 'ssrf'],
    url: '/#faq',
    faqId: 'faq-4',
  },
  {
    id: 'faq-tamper-proof',
    title: 'How is the audit chain tamper-proof?',
    category: 'FAQ',
    description:
      'Every event is hashed with SHA-256 and cryptographically linked to the previous block in an append-only ledger.',
    keywords: ['audit', 'tamper', 'sha256', 'cryptography', 'ledger'],
    url: '/#faq',
    faqId: 'faq-5',
  },
  {
    id: 'faq-self-host',
    title: 'Can I run AgentLock self-hosted on-premises?',
    category: 'FAQ',
    description:
      'Yes, AgentLock runs via air-gapped Docker containers, Kubernetes Helm charts, or bare-metal Linux binaries.',
    keywords: ['self-host', 'on-premise', 'docker', 'kubernetes', 'air-gapped'],
    url: '/#faq',
    faqId: 'faq-6',
  },
  {
    id: 'faq-data-storage',
    title: 'What data does AgentLock store?',
    category: 'FAQ',
    description:
      'Metadata, audit hashes, and forensic anomalies only. Prompts and payloads can be redacted with zero retention.',
    keywords: ['privacy', 'data retention', 'storage', 'gdpr', 'pii'],
    url: '/#faq',
    faqId: 'faq-7',
  },
  {
    id: 'faq-approvals',
    title: 'How do Human-in-the-Loop approvals work?',
    category: 'FAQ',
    description:
      'High-risk actions pause in an encrypted queue awaiting cryptographic approval tokens from authorized SecOps operators.',
    keywords: ['hitl', 'approvals', 'operator', 'dual-custody'],
    url: '/#faq',
    faqId: 'faq-8',
  },
  {
    id: 'faq-connect-agents',
    title: 'How do I connect my existing AI agents?',
    category: 'FAQ',
    description:
      'One-line integration with LangChain, LlamaIndex, CrewAI, AutoGen, or raw REST/OpenAPI proxy endpoints.',
    keywords: ['langchain', 'llamaindex', 'crewai', 'autogen', 'sdk', 'connect'],
    url: '/#faq',
    faqId: 'faq-9',
  },
  {
    id: 'faq-report-vuln',
    title: 'How do I report a security vulnerability?',
    category: 'FAQ',
    description:
      'Email security@agentlock.ai with PGP encryption or use our Bug Bounty dispatch channel.',
    keywords: ['vulnerability', 'disclosure', 'bug bounty', 'security report'],
    url: '/#faq',
    faqId: 'faq-10',
  },

  // Legal
  {
    id: 'legal-privacy',
    title: 'Privacy Policy',
    category: 'Legal',
    description:
      'Compliance with GDPR, CCPA, and strict zero-data-retention principles for runtime telemetry.',
    keywords: ['privacy', 'gdpr', 'ccpa', 'cookies', 'terms'],
    url: '/privacy',
  },
  {
    id: 'legal-terms',
    title: 'Terms of Service',
    category: 'Legal',
    description:
      'Enterprise licensing, acceptable use policy, and zero-trust service level commitments.',
    keywords: ['terms', 'license', 'sla', 'service'],
    url: '/terms',
  },
];

export interface SearchMatch {
  item: SearchItem;
  score: number;
  matchedField: 'title' | 'description' | 'keywords';
}

/**
 * Fuzzy score calculator
 */
function scoreMatch(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();

  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;

  // Fuzzy subsequence match
  let qIdx = 0;
  let matches = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      matches++;
      qIdx++;
    }
  }

  if (qIdx === q.length) {
    return Math.floor((matches / t.length) * 40);
  }

  return 0;
}

export function searchSite(query: string): SearchMatch[] {
  if (!query || query.trim().length === 0) return [];

  const q = query.toLowerCase().trim();
  const results: SearchMatch[] = [];

  for (const item of SEARCH_INDEX) {
    let bestScore = 0;
    let matchedField: 'title' | 'description' | 'keywords' = 'title';

    const titleScore = scoreMatch(q, item.title) * 1.5;
    if (titleScore > bestScore) {
      bestScore = titleScore;
      matchedField = 'title';
    }

    const keywordMatches = item.keywords.some((k) => k.toLowerCase().includes(q));
    if (keywordMatches && 70 > bestScore) {
      bestScore = 70;
      matchedField = 'keywords';
    }

    const descScore = scoreMatch(q, item.description) * 0.8;
    if (descScore > bestScore) {
      bestScore = descScore;
      matchedField = 'description';
    }

    if (bestScore > 15) {
      results.push({ item, score: bestScore, matchedField });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}
