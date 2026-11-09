import { NextResponse } from 'next/server';
import { autonomousExecutor } from '@/lib/jules-engine/executor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, autoRunAll } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    const session = autonomousExecutor.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: `Session ${sessionId} not found` }, { status: 404 });
    }

    if (autoRunAll) {
      let finished = false;
      let lastResult = null;
      while (!finished && session.currentStepIndex < session.plan.length) {
        lastResult = await autonomousExecutor.executeNextStep(sessionId);
        finished = lastResult.finished;
      }
      return NextResponse.json({
        success: true,
        session: lastResult ? lastResult.session : session,
        finished: true,
      });
    }

    const { session: updatedSession, finished } = await autonomousExecutor.executeNextStep(sessionId);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      finished,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
