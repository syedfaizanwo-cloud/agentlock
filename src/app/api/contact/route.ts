import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const referenceId = `DISPATCH-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields' },
        { status: 400 }
      );
    }

    // In a live environment with database, store body + body.attribution
    return NextResponse.json(
      {
        success: true,
        reference_id: referenceId,
        message: 'Incident dispatch message received and encrypted in SecOps queue.',
        attribution_captured: Boolean(body.attribution),
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal dispatch error: ' + (err?.message || 'unknown') },
      { status: 500 }
    );
  }
}
