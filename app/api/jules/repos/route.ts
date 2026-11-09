import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/jules-engine/github';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const action = searchParams.get('action');

  const github = new GitHubService();

  if (action === 'branches' && url) {
    try {
      const { owner, repo } = github.parseRepoUrl(url);
      const branches = await github.listBranches(owner, repo);
      return NextResponse.json({ success: true, branches });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  if (action === 'tree' && url) {
    try {
      const branch = searchParams.get('branch') || 'main';
      const { owner, repo } = github.parseRepoUrl(url);
      const tree = await github.getRepoTree(owner, repo, branch);
      return NextResponse.json({ success: true, tree });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  if (url) {
    try {
      const { owner, repo } = github.parseRepoUrl(url);
      const details = await github.fetchRepoInfo(owner, repo);
      const branches = await github.listBranches(owner, repo);
      return NextResponse.json({ success: true, details, branches });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }

  const presets = [
    {
      owner: 'facebook',
      repo: 'react',
      url: 'https://github.com/facebook/react',
      language: 'typescript',
      description: 'The library for web and native user interfaces',
      isExample: true,
      stars: 228000,
    },
    {
      owner: 'tiangolo',
      repo: 'fastapi',
      url: 'https://github.com/tiangolo/fastapi',
      language: 'python',
      description: 'FastAPI framework, high performance, easy to learn, fast to code',
      isExample: true,
      stars: 76000,
    },
    {
      owner: 'gin-gonic',
      repo: 'gin',
      url: 'https://github.com/gin-gonic/gin',
      language: 'go',
      description: 'Gin is a HTTP web framework written in Go (Golang)',
      isExample: true,
      stars: 75000,
    },
    {
      owner: 'tokio-rs',
      repo: 'tokio',
      url: 'https://github.com/tokio-rs/tokio',
      language: 'rust',
      description: 'A runtime for writing reliable asynchronous applications with Rust',
      isExample: true,
      stars: 26000,
    }
  ];

  let userRepos: any[] = [];
  if (process.env.GITHUB_TOKEN) {
    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'Medusa-Autonomous-Agent'
        }
      });
      if (res.ok) {
        const data = await res.json();
        userRepos = data.map((r: any) => ({
          owner: r.owner?.login,
          repo: r.name,
          url: r.html_url,
          language: (r.language || 'typescript').toLowerCase(),
          description: r.description || 'Connected GitHub repository',
          isPrivate: r.private,
          isExample: false,
          stars: r.stargazers_count,
          defaultBranch: r.default_branch,
        }));
      }
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({
    success: true,
    presets,
    examples: presets,
    userRepos,
    hasGitHubToken: Boolean(process.env.GITHUB_TOKEN),
  });
}
