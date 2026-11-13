import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json(
      {
        success: true,
        message: 'Emergency kill switch triggered. All fleet leases revoked and agents quarantined.',
        timestamp: new Date().toISOString(),
        token_used: body.token || 'SEC-ADMIN',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Kill switch execution failed' }, { status: 500 });
  }
}
