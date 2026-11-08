import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { githubService } from '@/lib/jules-engine/github';

export async function POST(req: Request) {
  try {
    const { repoUrl, files } = await req.json();
    const fileMap: Record<string, string> = { ...(files || {}) };

    if (repoUrl && Object.keys(fileMap).length === 0) {
      const parsed = githubService.parseRepoUrl(repoUrl);
      if (parsed) {
        try {
          const tree = await githubService.getRepoTree(parsed.owner, parsed.repo);
          for (const item of tree) {
            fileMap[item.path] = item.type === 'blob' ? '// file content' : '';
          }
        } catch {}
      }
    }

    const fileNames = Object.keys(fileMap);
    let score = 95;
    const issues: string[] = [];

    // Check for README
    if (!fileNames.some(f => f.toLowerCase().includes('readme'))) {
      score -= 10;
      issues.push('Missing README documentation');
    }

    // Check for tests
    if (!fileNames.some(f => f.includes('test') || f.includes('spec'))) {
      score -= 15;
      issues.push('No test suites detected');
    }

    // Check for CI / workflow
    if (!fileNames.some(f => f.includes('.github/workflows') || f.includes('circleci'))) {
      score -= 5;
      issues.push('No CI/CD pipeline configuration found');
    }

    // Check for license
    if (!fileNames.some(f => f.toLowerCase().includes('license'))) {
      score -= 5;
      issues.push('No open source LICENSE declared');
    }

    let summary = `Scanned ${fileNames.length} repository files. Calculated repository health score: ${score}/100.`;

    if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
      try {
        const aiRes = await aiProvider.chatCompletion({
          messages: [
            {
              role: 'user',
              content: `Analyze repository health for files: ${fileNames.slice(0, 25).join(', ')}. Discovered issues: ${issues.join(', ')}. Provide a 2-sentence health summary.`
            }
          ]
        });
        if (aiRes.text) summary = aiRes.text;
      } catch {}
    }

    return NextResponse.json({
      healthScore: Math.max(score, 10),
      filesScanned: fileNames.length,
      detectedIssues: issues,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
