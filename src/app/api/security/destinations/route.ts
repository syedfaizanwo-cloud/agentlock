import { NextResponse } from 'next/server';
import { INITIAL_DESTINATIONS } from '@/lib/mock-data';
import { Destination } from '@/types/api';

let destinationsList: Destination[] = [...INITIAL_DESTINATIONS];

export async function GET() {
  return NextResponse.json(destinationsList, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newDest: Destination = {
      id: `dest-${Date.now().toString(36)}`,
      host_or_cidr: body.host_or_cidr || '10.0.0.0/8',
      scope: body.scope || 'external_api',
      risk: body.risk || 'low',
      allowed_agents: body.allowed_agents || ['*'],
      status: body.status || 'allowed',
      requires_tls: body.requires_tls ?? true,
      rate_limit_rpm: body.rate_limit_rpm || 100,
      description: body.description || 'Configured via SecOps Console.',
    };
    destinationsList.unshift(newDest);
    return NextResponse.json(newDest, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid destination payload' }, { status: 400 });
  }
}
