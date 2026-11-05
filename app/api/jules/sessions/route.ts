import { NextResponse } from 'next/server';
import { JulesAutonomousExecutor } from '@/lib/jules-engine/executor';

// Global singleton instance for runtime sessions
const globalForJules = globalThis as unknown as { julesExecutor?: JulesAutonomousExecutor };
export const julesExecutor = globalForJules.julesExecutor || new JulesAutonomousExecutor();
if (process.env.NODE_ENV !== 'production') globalForJules.julesExecutor = julesExecutor;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const session = julesExecutor.getSession(id);
    if (!session) {
      return NextResponse.json({ success: false, error: `Session ${id} not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, session });
  }

  const sessions = julesExecutor.listSessions();
  return NextResponse.json({ success: true, sessions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoUrl, taskPrompt } = body;

    if (!repoUrl || !taskPrompt) {
      return NextResponse.json(
        { success: false, error: 'repoUrl and taskPrompt are required fields' },
        { status: 400 }
      );
    }

    const session = julesExecutor.createSession(repoUrl, taskPrompt);
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
