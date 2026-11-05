import { NextResponse } from 'next/server';
import { julesExecutor } from '../sessions/route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, autoRunAll } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    const session = julesExecutor.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: `Session ${sessionId} not found` }, { status: 404 });
    }

    if (autoRunAll) {
      // Execute all remaining steps
      let finished = false;
      let lastResult = null;
      while (!finished && session.currentStepIndex < session.plan.length) {
        lastResult = await julesExecutor.executeNextStep(sessionId);
        finished = lastResult.finished;
      }
      return NextResponse.json({
        success: true,
        session: lastResult ? lastResult.session : session,
        finished: true,
      });
    }

    // Step-by-step single iteration
    const { session: updatedSession, finished } = await julesExecutor.executeNextStep(sessionId);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      finished,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
