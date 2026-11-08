import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'degraded'; message?: string }> = {
    server: { status: 'ok' },
    storage: { status: 'ok' },
    backgroundJobs: { status: 'ok' },
  };

  const isReady = Object.values(checks).every((c) => c.status === 'ok');

  return NextResponse.json(
    {
      ready: isReady,
      status: isReady ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: isReady ? 200 : 503 }
  );
}
