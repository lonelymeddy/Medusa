import { ToolCallRecord, FileDiff } from "./types";

export interface ToolExecutionContext {
  virtualFs: Map<string, string>;
  diffs: Map<string, FileDiff>;
}

export class JulesToolExecutor {
  private context: ToolExecutionContext;

  constructor(initialFiles: Record<string, string> = {}) {
    this.context = {
      virtualFs: new Map(Object.entries(initialFiles)),
      diffs: new Map(),
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
      case 'replace_with_git_merge_diff':
        return this.applyMergeDiff(input.filepath, input.merge_diff);
      case 'run_bash_command':
        return this.runBashCommand(input.command);
      default:
        return { error: `Tool "${toolName}" is not recognized by Jules Toolset.` };
    }
  }

  private listFiles(path: string): { result: string[] } {
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
    if (!this.context.virtualFs.has(filepath)) {
      return { error: `File not found: ${filepath}` };
    }
    return { result: this.context.virtualFs.get(filepath) };
  }

  private writeFile(filepath: string, content: string): { result: string } {
    const oldContent = this.context.virtualFs.get(filepath) || '';
    this.context.virtualFs.set(filepath, content);
    this.updateDiff(filepath, oldContent, content);
    return { result: `Successfully wrote ${content.length} characters to ${filepath}` };
  }

  private applyMergeDiff(filepath: string, mergeDiff: string): { result?: string; error?: string } {
    const existing = this.context.virtualFs.get(filepath);
    if (existing === undefined) {
      return { error: `File not found for merge diff: ${filepath}` };
    }

    const searchBlockMatch = mergeDiff.match(/<<<<<<< SEARCH\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> REPLACE/);
    if (!searchBlockMatch) {
      return { error: `Invalid merge diff format. Requires <<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE` };
    }

    let [, searchStr, replaceStr] = searchBlockMatch;

    // Normalize newlines
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
    if (command.includes('test') || command.includes('pytest') || command.includes('cargo test') || command.includes('go test')) {
      return {
        result: {
          exitCode: 0,
          stdout: `[Jules Sandbox] Running: ${command}\nTesting suites: 3 passed, 3 total\nTests: 18 passed, 18 total\nSnapshots: 0 total\nTime: 0.842 s\nAll test suites successfully passed!`,
          stderr: ''
        }
      };
    }

    if (command.includes('build') || command.includes('tsc')) {
      return {
        result: {
          exitCode: 0,
          stdout: `[Jules Sandbox] Executing build pipeline...\nCompilation complete. 0 errors, 0 warnings.`,
          stderr: ''
        }
      };
    }

    return {
      result: {
        exitCode: 0,
        stdout: `[Jules Sandbox] Executed "${command}" successfully.`,
        stderr: ''
      }
    };
  }

  private updateDiff(filepath: string, oldContent: string, newContent: string) {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

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
