import { NextResponse } from 'next/server';
import { INITIAL_HEARTBEATS } from '@/lib/mock-data';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const agentId = params.id;
  const hb = INITIAL_HEARTBEATS.find((h) => h.agent_id === agentId);

  return NextResponse.json(
    {
      success: true,
      message: `Agent ${agentId} cryptographic re-attestation accepted. Workload token re-issued.`,
      heartbeat: hb
        ? {
            ...hb,
            status: 'online',
            missed_beats: 0,
            seconds_since_last_beat: 0,
            seconds_until_revocation: 900,
          }
        : null,
    },
    { status: 200 }
  );
}
