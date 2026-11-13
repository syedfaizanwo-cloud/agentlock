import { NextResponse } from 'next/server';
import { DestinationCheckRequest, DestinationCheckResponse } from '@/types/api';

export async function POST(req: Request) {
  try {
    const body: DestinationCheckRequest = await req.json();
    const urlLower = (body.url || '').toLowerCase();

    const isSsrf =
      urlLower.includes('169.254.169.254') ||
      urlLower.includes('127.0.0.1') ||
      urlLower.includes('localhost') ||
      urlLower.includes('::1') ||
      urlLower.includes('10.') ||
      urlLower.includes('192.168.');

    let resolvedIp = '104.21.34.120';
    if (urlLower.includes('169.254.169.254')) resolvedIp = '169.254.169.254';
    else if (urlLower.includes('127.0.0.1') || urlLower.includes('localhost')) resolvedIp = '127.0.0.1';

    const findings: string[] = [];
    if (isSsrf) {
      findings.push('CRITICAL: Destination resolves to blocked SSRF subnet / link-local metadata');
    }

    const isAllowlisted =
      !isSsrf &&
      (urlLower.includes('api.github.com') ||
        urlLower.includes('finops-reports-vault') ||
        urlLower.includes('10.128.'));

    if (!isAllowlisted && !isSsrf) {
      findings.push('WARNING: Target is unlisted in default-deny egress registry');
    }

    let dlpStatus: 'clean' | 'redacted' | 'violation' = 'clean';
    if (body.payload_sample) {
      if (/AKIA[0-9A-Z]{16}/.test(body.payload_sample) || /BEGIN RSA PRIVATE KEY/.test(body.payload_sample)) {
        dlpStatus = 'violation';
        findings.push('DLP VIOLATION: Unencrypted cryptographic secret detected in outbound buffer');
      } else if (/\b\d{3}-\d{2}-\d{4}\b/.test(body.payload_sample)) {
        dlpStatus = 'redacted';
        findings.push('DLP NOTICE: PII pattern (SSN) detected - redacted before transmission');
      }
    }

    const verdict = isSsrf || dlpStatus === 'violation' ? 'BLOCK' : isAllowlisted ? 'ALLOW' : 'ESCALATE';

    const response: DestinationCheckResponse = {
      allowed: verdict === 'ALLOW',
      verdict,
      resolved_ip: resolvedIp,
      is_ssrf_risk: isSsrf,
      is_allowlisted: isAllowlisted,
      dlp_status: dlpStatus,
      findings,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to evaluate destination' }, { status: 400 });
  }
}
