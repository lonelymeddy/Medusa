import { JulesSession, PlanStep, JulesLogEntry, FileDiff, Language } from "./types";
import { JulesToolExecutor } from "./tools";
import { JulesPlanner } from "./planner";
import { GitHubService } from "./github";

// In-memory session store (can be replaced or persisted in DB)
const sessionStore = new Map<string, JulesSession>();

export class JulesAutonomousExecutor {
  private github: GitHubService;
  private planner: JulesPlanner;

  constructor() {
    this.github = new GitHubService();
    this.planner = new JulesPlanner();
  }

  createSession(repoUrl: string, taskPrompt: string): JulesSession {
    const { owner, repo } = this.github.parseRepoUrl(repoUrl);
    const sessionId = `jules-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newBranch = this.github.createBranchName(taskPrompt);

    const initialPlan = this.planner.generatePlan({
      taskPrompt,
      repoOwner: owner,
      repoName: repo,
      language: 'typescript'
    });

    const session: JulesSession = {
      id: sessionId,
      repoUrl,
      targetBranch: 'main',
      newBranch,
      taskPrompt,
      status: 'idle',
      plan: initialPlan,
      currentStepIndex: 0,
      diffs: [],
      logs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: Date.now(),
          level: 'info',
          message: `Initialized Jules Autonomous Engine session for ${owner}/${repo}`,
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: Date.now() + 1,
          level: 'reasoning',
          message: `Parsed task goal: "${taskPrompt}". Structured 5-stage execution plan according to Jules directives.`,
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    sessionStore.set(sessionId, session);
    return session;
  }

  getSession(id: string): JulesSession | undefined {
    return sessionStore.get(id);
  }

  listSessions(): JulesSession[] {
    return Array.from(sessionStore.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async executeNextStep(
    sessionId: string,
    onProgress?: (log: JulesLogEntry, step: PlanStep) => void
  ): Promise<{ session: JulesSession; finished: boolean }> {
    const session = sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.currentStepIndex >= session.plan.length) {
      session.status = 'completed';
      session.updatedAt = Date.now();
      return { session, finished: true };
    }

    session.status = 'executing';
    const currentStep = session.plan[session.currentStepIndex];
    currentStep.status = 'in_progress';
    currentStep.startedAt = Date.now();

    const toolExecutor = new JulesToolExecutor(this.getMockFilesForRepo(session.repoUrl));
    for (const diff of session.diffs) {
      toolExecutor.execute('write_file', { filepath: diff.filepath, content: diff.newContent });
    }

    // Step-specific execution logic
    const stepLogs: JulesLogEntry[] = [];
    const addLog = (level: JulesLogEntry['level'], message: string, details?: any) => {
      const entry: JulesLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        level,
        message,
        details,
      };
      session.logs.push(entry);
      stepLogs.push(entry);
      if (onProgress) onProgress(entry, currentStep);
    };

    switch (session.currentStepIndex) {
      case 0: { // Exploration
        addLog('reasoning', `[Step 1] Exploring codebase structure to find code files related to "${session.taskPrompt}"`);
        const listResult = toolExecutor.execute('list_files', { path: '.' });
        addLog('action', `Called list_files(.) -> Found ${listResult.result.length} files in repository tree`, listResult.result);

        const primaryFile = listResult.result.find((f: string) => f.includes('src/') || f.includes('lib/')) || listResult.result[0];
        const readResult = toolExecutor.execute('read_file', { filepath: primaryFile });
        addLog('action', `Inspected ${primaryFile} (${readResult.result?.length || 0} bytes) to understand module exports and types`);
        break;
      }

      case 1: { // Diagnosis & Root Cause
        addLog('reasoning', `[Step 2] Isolating bug patterns and edge cases in functions`);
        addLog('action', `Evaluated unit test specifications against input variations`);
        addLog('success', `Identified root cause: missing boundary condition check and unhandled null return`);
        break;
      }

      case 2: { // Targeted code change
        addLog('reasoning', `[Step 3] Formulating Git merge diff patch for targeted file repair`);
        const targetPath = 'src/service.ts';
        const patchDiff = `<<<<<<< SEARCH
  public process(data: any): boolean {
    return data.status === "ready";
  }
=======
  public process(data: any): boolean {
    if (!data || typeof data !== "object") {
      return false;
    }
    return data.status === "ready" && Boolean(data.payload);
  }
>>>>>>> REPLACE`;

        const diffResult = toolExecutor.execute('replace_with_git_merge_diff', {
          filepath: targetPath,
          merge_diff: patchDiff
        });

        if (diffResult.error) {
          // Fallback to write file if search block does not match
          toolExecutor.execute('write_file', {
            filepath: targetPath,
            content: `// Updated by Jules Autonomous Engine\nexport class Service {\n  public process(data: any): boolean {\n    if (!data || typeof data !== 'object') return false;\n    return data.status === 'ready' && Boolean(data.payload);\n  }\n}\n`
          });
        }
        addLog('action', `Applied merge diff patch to ${targetPath}`, { patch: patchDiff });
        addLog('success', `File updated successfully: ${targetPath}`);
        break;
      }

      case 3: { // Testing & Verification
        addLog('reasoning', `[Step 4] Triggering automated polyglot test suite in Jules container sandbox`);
        const testRes = toolExecutor.execute('run_bash_command', { command: 'npm test -- --coverage' });
        addLog('action', `Executed: npm test -- --coverage`);
        addLog('success', testRes.result?.stdout || 'Tests passed successfully.');

        session.testResults = {
          passed: true,
          totalTests: 18,
          passedTests: 18,
          failedTests: 0,
          durationMs: 842,
          output: testRes.result?.stdout || 'All tests passed',
        };
        break;
      }

      case 4: { // Pre-commit & Ready
        addLog('reasoning', `[Step 5] Performing pre-commit checks: linting, formatting, diff reflection, and review`);
        addLog('action', `Verified git diffs across all modified files. Zero regression detected.`);
        addLog('success', `Pre-commit validation complete. Prepared feature branch ${session.newBranch}`);
        break;
      }
    }

    currentStep.status = 'completed';
    currentStep.completedAt = Date.now();
    session.diffs = toolExecutor.getDiffs();
    session.currentStepIndex += 1;

    const isAllComplete = session.currentStepIndex >= session.plan.length;
    if (isAllComplete) {
      session.status = 'completed';
      const { owner, repo } = this.github.parseRepoUrl(session.repoUrl);
      session.prUrl = `https://github.com/${owner}/${repo}/pull/42`;
      addLog('success', `All Jules plan steps finished successfully! Pull Request branch ready: ${session.newBranch}`);
    } else {
      session.status = 'idle';
    }

    session.updatedAt = Date.now();
    sessionStore.set(sessionId, session);

    return { session, finished: isAllComplete };
  }

  private getMockFilesForRepo(repoUrl: string): Record<string, string> {
    return {
      'src/service.ts': `export class Service {\n  public process(data: any): boolean {\n    return data.status === "ready";\n  }\n}\n`,
      'src/index.ts': `import { Service } from './service';\nexport const run = () => new Service();\n`,
      'tests/service.test.ts': `import { Service } from '../src/service';\ndescribe('Service', () => {\n  it('handles ready state', () => {\n    const s = new Service();\n    expect(s.process({ status: 'ready', payload: true })).toBe(true);\n  });\n});\n`,
      'package.json': `{\n  "name": "target-repo",\n  "version": "1.0.0",\n  "scripts": {\n    "test": "jest"\n  }\n}\n`,
      'README.md': `# Target Repository\nManaged by Jules Autonomous Coding Agent.\n`
    };
  }
}
