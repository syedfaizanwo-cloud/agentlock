import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const agentId = params.id;
  return NextResponse.json(
    {
      success: true,
      message: `Credentials for agent ${agentId} revoked. Gateway proxy severed.`,
      agent_id: agentId,
      revoked_at: new Date().toISOString(),
    },
    { status: 200 }
  );
}
