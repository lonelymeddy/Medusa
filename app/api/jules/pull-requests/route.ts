import { NextResponse } from 'next/server';
import { SessionStorage } from '@/lib/jules-engine/storage';

export const dynamic = 'force-dynamic';

const storage = new SessionStorage();

export async function GET() {
  const prs = storage.listPRs();
  return NextResponse.json({ success: true, prs });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, title, description } = body;

    const session = storage.get(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const prNumber = Math.floor(100 + Math.random() * 900);
    const prUrl = `${session.repoUrl}/pull/${prNumber}`;
    session.prUrl = prUrl;
    storage.set(sessionId, session);

    const prRecord = {
      id: `pr-${Date.now()}`,
      sessionId: session.id,
      repoUrl: session.repoUrl,
      branch: session.newBranch,
      targetBranch: session.targetBranch || 'main',
      title: title || session.taskPrompt,
      description: description || 'Autonomous pull request created by Medusa Agent.',
      prUrl,
      status: 'open' as const,
      createdAt: Date.now(),
      diffStats: {
        filesCount: session.diffs.length,
        additions: session.diffs.reduce((sum, d) => sum + d.additions, 0),
        deletions: session.diffs.reduce((sum, d) => sum + d.deletions, 0),
      },
    };

    storage.savePR(prRecord);
    return NextResponse.json({ success: true, pullRequest: prRecord, prUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
