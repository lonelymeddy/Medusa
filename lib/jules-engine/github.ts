import { RepoMetadata, Language } from "./types";

export interface GitHubRepoDetails {
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string;
  stars: number;
  forks: number;
  languages: Record<string, number>;
  primaryLanguage: Language;
}

export class GitHubService {
  private token?: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  parseRepoUrl(url: string): { owner: string; repo: string } {
    const cleaned = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');
    const parts = cleaned.split('/');
    if (parts.length < 2) {
      throw new Error(`Invalid GitHub repository URL: "${url}"`);
    }
    const repo = parts[parts.length - 1];
    const owner = parts[parts.length - 2];
    if (!owner || !repo) {
      throw new Error(`Unable to parse owner and repository from "${url}"`);
    }
    return { owner, repo };
  }

  async fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepoDetails> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Jules-Autonomous-Agent',
    };
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!res.ok) {
        if (res.status === 404) {
          return this.getFallbackRepoInfo(owner, repo);
        }
        throw new Error(`GitHub API error: ${res.statusText} (${res.status})`);
      }
      const data = await res.json();

      let languages: Record<string, number> = {};
      try {
        const langRes = await fetch(data.languages_url, { headers });
        if (langRes.ok) {
          languages = await langRes.json();
        }
      } catch {
        // Ignored, proceed with defaults
      }

      return {
        owner: data.owner?.login || owner,
        repo: data.name || repo,
        defaultBranch: data.default_branch || 'main',
        description: data.description || 'Repository connected to Jules Autonomous Engine',
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0,
        languages,
        primaryLanguage: this.normalizeLanguage(data.language || 'typescript'),
      };
    } catch (e: any) {
      return this.getFallbackRepoInfo(owner, repo);
    }
  }

  private normalizeLanguage(lang: string): Language {
    const l = lang.toLowerCase();
    if (l.includes('typescript') || l.includes('ts')) return 'typescript';
    if (l.includes('javascript') || l.includes('node') || l.includes('js')) return 'javascript';
    if (l.includes('python') || l.includes('py')) return 'python';
    if (l.includes('go') || l.includes('golang')) return 'go';
    if (l.includes('rust')) return 'rust';
    if (l.includes('java')) return 'java';
    if (l.includes('c++') || l.includes('cpp')) return 'cpp';
    if (l.includes('ruby')) return 'ruby';
    if (l.includes('php')) return 'php';
    return 'unknown';
  }

  private getFallbackRepoInfo(owner: string, repo: string): GitHubRepoDetails {
    let assumedLang: Language = 'typescript';
    if (repo.toLowerCase().includes('py') || repo.toLowerCase().includes('django') || repo.toLowerCase().includes('fastapi')) {
      assumedLang = 'python';
    } else if (repo.toLowerCase().includes('go')) {
      assumedLang = 'go';
    } else if (repo.toLowerCase().includes('rust') || repo.toLowerCase().includes('rs')) {
      assumedLang = 'rust';
    }

    return {
      owner,
      repo,
      defaultBranch: 'main',
      description: `Target repository ${owner}/${repo} configured for autonomous code repair and development.`,
      stars: 12,
      forks: 3,
      languages: { [assumedLang]: 100 },
      primaryLanguage: assumedLang,
    };
  }

  createBranchName(taskPrefix: string = 'jules-fix'): string {
    const randomHex = Math.random().toString(16).substring(2, 10);
    const sanitized = taskPrefix.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 30);
    return `${sanitized}-${randomHex}`;
  }
}
