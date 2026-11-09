import { NextResponse } from 'next/server';
import { autonomousExecutor } from '@/lib/jules-engine/executor';
import { SessionStorage } from '@/lib/jules-engine/storage';

export const dynamic = 'force-dynamic';

const storage = new SessionStorage();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = storage.get(params.id);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, session });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, message } = body;

    const session = storage.get(params.id);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (action === 'pause') {
      const updated = autonomousExecutor.setSessionStatus(params.id, 'paused');
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === 'resume') {
      const updated = autonomousExecutor.setSessionStatus(params.id, 'idle');
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === 'cancel' || action === 'stop') {
      const updated = autonomousExecutor.setSessionStatus(params.id, 'cancelled');
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === 'retry') {
      const updated = autonomousExecutor.retrySession(params.id);
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === 'message' && message) {
      const updated = autonomousExecutor.addMessage(params.id, 'user', message);
      return NextResponse.json({ success: true, session: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const deleted = storage.delete(params.id);
  return NextResponse.json({ success: deleted });
}
