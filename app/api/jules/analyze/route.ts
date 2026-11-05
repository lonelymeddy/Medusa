import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/jules-engine/github';
import { JulesPlanner } from '@/lib/jules-engine/planner';

export async function POST(request: Request) {
  try {
    const { repoUrl, taskPrompt } = await request.json();

    if (!repoUrl || !taskPrompt) {
      return NextResponse.json(
        { success: false, error: 'repoUrl and taskPrompt are required' },
        { status: 400 }
      );
    }

    const github = new GitHubService();
    const { owner, repo } = github.parseRepoUrl(repoUrl);
    const details = await github.fetchRepoInfo(owner, repo);

    const planner = new JulesPlanner();
    const plan = planner.generatePlan({
      taskPrompt,
      repoOwner: owner,
      repoName: repo,
      language: details.primaryLanguage,
    });

    return NextResponse.json({
      success: true,
      repo: details,
      plan,
      proposedBranch: github.createBranchName(taskPrompt),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
