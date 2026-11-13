import { NextResponse } from 'next/server';
import { INITIAL_SOURCES } from '@/lib/mock-data';
import { Source } from '@/types/api';

let sourcesList: Source[] = [...INITIAL_SOURCES];

export async function GET() {
  return NextResponse.json(sourcesList, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newSource: Source = {
      id: `src-${Date.now().toString(36)}`,
      name: body.name || 'Custom Inbound Channel',
      type: body.type || 'user_prompt',
      trust_level: body.trust_level || 'untrusted',
      allowlist: body.allowlist || ['*'],
      scanned: true,
      pii_masked: true,
      total_ingested: 0,
      blocked_attempts: 0,
      description: body.description || 'Configured via SecOps Console.',
    };
    sourcesList.unshift(newSource);
    return NextResponse.json(newSource, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid source payload' }, { status: 400 });
  }
}
