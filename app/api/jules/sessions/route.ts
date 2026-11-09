import { NextResponse } from 'next/server';
import { autonomousExecutor } from '@/lib/jules-engine/executor';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const session = autonomousExecutor.getSession(id);
    if (!session) {
      return NextResponse.json({ success: false, error: `Session ${id} not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, session });
  }

  const sessions = autonomousExecutor.listSessions();
  return NextResponse.json({ success: true, sessions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoUrl, taskPrompt, targetBranch } = body;

    if (!repoUrl || !taskPrompt) {
      return NextResponse.json(
        { success: false, error: 'repoUrl and taskPrompt are required fields' },
        { status: 400 }
      );
    }

    const session = autonomousExecutor.createSession(repoUrl, taskPrompt, targetBranch || 'main');
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
