import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/jules-engine/github';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({
      presets: [
        {
          owner: 'facebook',
          repo: 'react',
          url: 'https://github.com/facebook/react',
          language: 'typescript',
          description: 'The library for web and native user interfaces'
        },
        {
          owner: 'tiangolo',
          repo: 'fastapi',
          url: 'https://github.com/tiangolo/fastapi',
          language: 'python',
          description: 'FastAPI framework, high performance, easy to learn, fast to code'
        },
        {
          owner: 'gin-gonic',
          repo: 'gin',
          url: 'https://github.com/gin-gonic/gin',
          language: 'go',
          description: 'Gin is a HTTP web framework written in Go (Golang)'
        },
        {
          owner: 'tokio-rs',
          repo: 'tokio',
          url: 'https://github.com/tokio-rs/tokio',
          language: 'rust',
          description: 'A runtime for writing reliable asynchronous applications with Rust'
        }
      ]
    });
  }

  const github = new GitHubService();
  try {
    const { owner, repo } = github.parseRepoUrl(url);
    const details = await github.fetchRepoInfo(owner, repo);
    return NextResponse.json({ success: true, details });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
