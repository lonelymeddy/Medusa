import { execSync } from 'child_process';
import { ToolCallRecord, FileDiff } from "./types";
import { ExecutionSandbox } from "./sandbox";
import { Logger } from "../logger";

export interface ToolExecutionContext {
  virtualFs: Map<string, string>;
  diffs: Map<string, FileDiff>;
  sandbox: ExecutionSandbox;
}

export class JulesToolExecutor {
  private context: ToolExecutionContext;

  constructor(initialFiles: Record<string, string> = {}) {
    this.context = {
      virtualFs: new Map(Object.entries(initialFiles)),
      diffs: new Map(),
      sandbox: new ExecutionSandbox(),
    };
  }

  getFiles(): Record<string, string> {
    return Object.fromEntries(this.context.virtualFs.entries());
  }

  getDiffs(): FileDiff[] {
    return Array.from(this.context.diffs.values());
  }

  execute(toolName: string, input: Record<string, any>): { result?: any; error?: string } {
    switch (toolName) {
      case 'list_files':
        return this.listFiles(input.path || '.');
      case 'read_file':
        return this.readFile(input.filepath);
      case 'write_file':
        return this.writeFile(input.filepath, input.content);
      case 'delete_file':
        return this.deleteFile(input.filepath);
      case 'rename_file':
        return this.renameFile(input.filepath, input.new_filepath);
      case 'replace_with_git_merge_diff':
        return this.applyMergeDiff(input.filepath, input.merge_diff);
      case 'run_bash_command':
        return this.runBashCommand(input.command);
      default:
        return { error: `Tool "${toolName}" is not recognized by Medusa Toolset.` };
    }
  }

  private listFiles(path: string): { result: string[] } {
    const valid = this.context.sandbox.validatePath(path === '.' ? 'root' : path);
    if (!valid.valid && path !== '.') {
      return { result: [] };
    }
    const normalizedPrefix = path === '.' || path === './' ? '' : (path.endsWith('/') ? path : `${path}/`);
    const files: string[] = [];
    for (const key of Array.from(this.context.virtualFs.keys())) {
      if (!normalizedPrefix || key.startsWith(normalizedPrefix)) {
        files.push(key);
      }
    }
    return { result: files.sort() };
  }

  private readFile(filepath: string): { result?: string; error?: string } {
    const valid = this.context.sandbox.validatePath(filepath);
    if (!valid.valid) {
      return { error: valid.error };
    }
    if (!this.context.virtualFs.has(filepath)) {
      return { error: `File not found: ${filepath}` };
    }
    return { result: this.context.virtualFs.get(filepath) };
  }

  private writeFile(filepath: string, content: string): { result?: string; error?: string } {
    const valid = this.context.sandbox.validatePath(filepath);
    if (!valid.valid) {
      return { error: valid.error };
    }
    const oldContent = this.context.virtualFs.get(filepath) || '';
    this.context.virtualFs.set(filepath, content);
    this.updateDiff(filepath, oldContent, content);
    return { result: `Successfully wrote ${content.length} characters to ${filepath}` };
  }

  private deleteFile(filepath: string): { result?: string; error?: string } {
    const valid = this.context.sandbox.validatePath(filepath);
    if (!valid.valid) {
      return { error: valid.error };
    }
    if (!this.context.virtualFs.has(filepath)) {
      return { error: `File not found to delete: ${filepath}` };
    }
    const oldContent = this.context.virtualFs.get(filepath) || '';
    this.context.virtualFs.delete(filepath);
    this.updateDiff(filepath, oldContent, '');
    return { result: `Successfully deleted file ${filepath}` };
  }

  private renameFile(oldPath: string, newPath: string): { result?: string; error?: string } {
    const validOld = this.context.sandbox.validatePath(oldPath);
    const validNew = this.context.sandbox.validatePath(newPath);
    if (!validOld.valid) return { error: validOld.error };
    if (!validNew.valid) return { error: validNew.error };

    if (!this.context.virtualFs.has(oldPath)) {
      return { error: `Source file not found: ${oldPath}` };
    }
    const content = this.context.virtualFs.get(oldPath)!;
    this.context.virtualFs.delete(oldPath);
    this.context.virtualFs.set(newPath, content);
    this.updateDiff(oldPath, content, '');
    this.updateDiff(newPath, '', content);
    return { result: `Successfully renamed ${oldPath} to ${newPath}` };
  }

  private applyMergeDiff(filepath: string, mergeDiff: string): { result?: string; error?: string } {
    const valid = this.context.sandbox.validatePath(filepath);
    if (!valid.valid) {
      return { error: valid.error };
    }

    const existing = this.context.virtualFs.get(filepath);
    if (existing === undefined) {
      return { error: `File not found for merge diff: ${filepath}` };
    }

    const searchBlockMatch = mergeDiff.match(/<<<<<<< SEARCH\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> REPLACE/);
    if (!searchBlockMatch) {
      return { error: `Invalid merge diff format. Requires <<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE` };
    }

    let [, searchStr, replaceStr] = searchBlockMatch;

    const normalizedExisting = existing.replace(/\r\n/g, '\n');
    const normalizedSearch = searchStr.replace(/\r\n/g, '\n');
    const normalizedReplace = replaceStr.replace(/\r\n/g, '\n');

    let updated: string;
    if (normalizedExisting.includes(normalizedSearch)) {
      updated = normalizedExisting.replace(normalizedSearch, normalizedReplace);
    } else if (normalizedExisting.trim().includes(normalizedSearch.trim())) {
      updated = normalizedExisting.replace(normalizedSearch.trim(), normalizedReplace.trim());
    } else {
      return { error: `Search block was not found in file: ${filepath}` };
    }

    this.context.virtualFs.set(filepath, updated);
    this.updateDiff(filepath, existing, updated);

    return { result: `Successfully applied git merge diff to ${filepath}` };
  }

  private runBashCommand(command: string): { result: { exitCode: number; stdout: string; stderr: string } } {
    const check = this.context.sandbox.sanitizeCommand(command);
    if (!check.safe) {
      return {
        result: {
          exitCode: 126,
          stdout: '',
          stderr: check.error || 'Blocked command'
        }
      };
    }

    try {
      // Execute in isolated process with strict resource limits and timeout
      const output = execSync(command, {
        timeout: 10000,
        maxBuffer: 1024 * 512,
        encoding: 'utf-8',
        env: { ...process.env, NODE_ENV: 'test', CI: 'true' }
      });
      return {
        result: {
          exitCode: 0,
          stdout: output,
          stderr: ''
        }
      };
    } catch (err: any) {
      return {
        result: {
          exitCode: err.status || 1,
          stdout: err.stdout?.toString() || '',
          stderr: err.stderr?.toString() || err.message
        }
      };
    }
  }

  private updateDiff(filepath: string, oldContent: string, newContent: string) {
    const oldLines = oldContent ? oldContent.split('\n') : [];
    const newLines = newContent ? newContent.split('\n') : [];

    let additions = 0;
    let deletions = 0;
    const diffLines: string[] = [`--- a/${filepath}`, `+++ b/${filepath}`];

    if (oldLines.join('') !== newLines.join('')) {
      for (const line of newLines) {
        if (!oldLines.includes(line)) {
          additions++;
          diffLines.push(`+ ${line}`);
        }
      }
      for (const line of oldLines) {
        if (!newLines.includes(line)) {
          deletions++;
          diffLines.push(`- ${line}`);
        }
      }
    }

    this.context.diffs.set(filepath, {
      filepath,
      oldContent,
      newContent,
      patch: diffLines.join('\n'),
      additions: additions || (oldContent ? 1 : newLines.length),
      deletions: deletions || (oldContent && !newContent ? oldLines.length : 0),
    });
  }
}
