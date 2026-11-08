import path from 'path';
import { execSync } from 'child_process';

export interface SandboxExecutionOptions {
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
  files?: Record<string, string>;
}

export interface SandboxExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class ExecutionSandbox {
  private allowedExtensions = new Set([
    '.js', '.ts', '.jsx', '.tsx', '.json', '.py', '.go', '.rs', '.java',
    '.cpp', '.c', '.h', '.hpp', '.php', '.rb', '.md', '.txt', '.yaml',
    '.yml', '.toml', '.css', '.html'
  ]);

  validatePath(relativePath: string): { valid: boolean; normalizedPath?: string; error?: string } {
    if (!relativePath || typeof relativePath !== 'string') {
      return { valid: false, error: 'Filepath must be a non-empty string' };
    }

    if (relativePath.includes('..') || path.isAbsolute(relativePath)) {
      return { valid: false, error: 'Path traversal or absolute paths are strictly forbidden' };
    }

    const normalized = path.normalize(relativePath).replace(/^[\\\/]+/, '');
    if (normalized.startsWith('..')) {
      return { valid: false, error: 'Target path escapes sandbox boundaries' };
    }

    return { valid: true, normalizedPath: normalized };
  }

  isExtensionAllowed(filepath: string): boolean {
    const ext = path.extname(filepath).toLowerCase();
    if (!ext) return true;
    return this.allowedExtensions.has(ext);
  }

  sanitizeCommand(cmd: string): { safe: boolean; error?: string } {
    const dangerousPatterns = [
      /rm\s+-rf\s+\//,
      /:(){ :\|:& };:/,
      />\s*\/dev\/sd/,
      /mkfs/,
      /dd\s+if=/,
      /curl.*\|\s*(bash|sh)/,
      /wget.*\|\s*(bash|sh)/,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(cmd)) {
        return { safe: false, error: `Command blocked by security filter: matched unsafe pattern` };
      }
    }

    return { safe: true };
  }

  async execute(cmd: string, opts?: { files?: Record<string, string>; timeoutMs?: number }): Promise<SandboxExecutionResult> {
    const check = this.sanitizeCommand(cmd);
    if (!check.safe) {
      return { stdout: '', stderr: check.error || 'Blocked', exitCode: 1 };
    }
    try {
      const output = execSync(cmd, {
        timeout: opts?.timeoutMs || 5000,
        encoding: 'utf-8',
        maxBuffer: 1024 * 512,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return { stdout: output, stderr: '', exitCode: 0 };
    } catch (err: any) {
      return {
        stdout: err.stdout?.toString() || '',
        stderr: err.stderr?.toString() || err.message,
        exitCode: typeof err.status === 'number' ? err.status : 1
      };
    }
  }
}

export const executionSandbox = new ExecutionSandbox();
export const runInSandbox = (cmd: string, files: Record<string, string>) => executionSandbox.execute(cmd, { files });
