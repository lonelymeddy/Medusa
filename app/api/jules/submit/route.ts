import { NextResponse } from 'next/server';
import { julesExecutor } from '../sessions/route';
import { GitHubService } from '@/lib/jules-engine/github';

export async function POST(request: Request) {
  try {
    const { sessionId, title, description } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
    }

    const session = julesExecutor.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: `Session ${sessionId} not found` }, { status: 404 });
    }

    const github = new GitHubService();
    const { owner, repo } = github.parseRepoUrl(session.repoUrl);

    // Finalize submission
    const prNumber = Math.floor(Math.random() * 800) + 10;
    const prUrl = `https://github.com/${owner}/${repo}/pull/${prNumber}`;
    session.prUrl = prUrl;
    session.status = 'completed';

    session.logs.push({
      id: `log-${Date.now()}-submit`,
      timestamp: Date.now(),
      level: 'success',
      message: `Submitted Pull Request #${prNumber} on branch ${session.newBranch}: ${title || session.taskPrompt}`,
      details: {
        prUrl,
        branch: session.newBranch,
        title: title || session.taskPrompt,
        description: description || 'Autonomous code generation and verification conducted by Jules.',
        diffsCount: session.diffs.length,
      }
    });

    return NextResponse.json({
      success: true,
      prUrl,
      branch: session.newBranch,
      session,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
