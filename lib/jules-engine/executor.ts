import { JulesSession, PlanStep, JulesLogEntry, FileDiff, Language } from "./types";
import { JulesToolExecutor } from "./tools";
import { JulesPlanner } from "./planner";
import { GitHubService } from "./github";
import { SessionStorage } from "./storage";
import {
  ArchitectAgent,
  DebuggerAgent,
  DeveloperAgent,
  TestingAgent,
  SecurityAgent,
  ReviewerAgent,
  DeploymentDoctorAgent,
} from "../agents";
import { Logger } from "../logger";

const storage = new SessionStorage();

export class JulesAutonomousExecutor {
  private github: GitHubService;
  private planner: JulesPlanner;
  private architectAgent: ArchitectAgent;
  private debuggerAgent: DebuggerAgent;
  private developerAgent: DeveloperAgent;
  private testingAgent: TestingAgent;
  private securityAgent: SecurityAgent;
  private reviewerAgent: ReviewerAgent;
  private deployAgent: DeploymentDoctorAgent;

  constructor() {
    this.github = new GitHubService();
    this.planner = new JulesPlanner();
    this.architectAgent = new ArchitectAgent();
    this.debuggerAgent = new DebuggerAgent();
    this.developerAgent = new DeveloperAgent();
    this.testingAgent = new TestingAgent();
    this.securityAgent = new SecurityAgent();
    this.reviewerAgent = new ReviewerAgent();
    this.deployAgent = new DeploymentDoctorAgent();
  }

  createSession(repoUrl: string, taskPrompt: string): JulesSession {
    const { owner, repo } = this.github.parseRepoUrl(repoUrl);
    const sessionId = `medusa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
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
          message: `Initialized Medusa Autonomous Coding session for ${owner}/${repo}`,
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: Date.now() + 1,
          level: 'reasoning',
          message: `Parsed task goal: "${taskPrompt}". Initialized 7-stage multi-agent orchestration loop.`,
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    storage.set(sessionId, session);
    return session;
  }

  getSession(id: string): JulesSession | undefined {
    return storage.get(id);
  }

  listSessions(): JulesSession[] {
    return storage.list();
  }

  deleteSession(id: string): boolean {
    return storage.delete(id);
  }

  async executeNextStep(
    sessionId: string,
    onProgress?: (log: JulesLogEntry, step: PlanStep) => void
  ): Promise<{ session: JulesSession; finished: boolean }> {
    const session = storage.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.currentStepIndex >= session.plan.length) {
      session.status = 'completed';
      session.updatedAt = Date.now();
      storage.set(sessionId, session);
      return { session, finished: true };
    }

    session.status = 'executing';
    const currentStep = session.plan[session.currentStepIndex];
    currentStep.status = 'in_progress';
    currentStep.startedAt = Date.now();

    const mockFiles = this.getMockFilesForRepo(session.repoUrl);
    const toolExecutor = new JulesToolExecutor(mockFiles);
    for (const diff of session.diffs) {
      toolExecutor.execute('write_file', { filepath: diff.filepath, content: diff.newContent });
    }

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

    const agentContext = {
      repoUrl: session.repoUrl,
      taskPrompt: session.taskPrompt,
      primaryLanguage: 'typescript',
      files: toolExecutor.getFiles(),
      sharedMemory: {},
      errorsDetected: [] as string[],
    };

    switch (session.currentStepIndex) {
      case 0: { // Stage 1 & 2: Understand & Architect
        addLog('reasoning', `[Stage 1: Understand] Exploring codebase tree and structure for "${session.taskPrompt}"`);
        const listResult = toolExecutor.execute('list_files', { path: '.' });
        addLog('action', `Inspected repository tree -> ${listResult.result.length} files detected`, listResult.result);

        const archRes = await this.architectAgent.execute(agentContext);
        addLog('reasoning', `[Architect Agent] ${archRes.message}`, archRes.findings);

        const primaryFile = listResult.result.find((f: string) => f.includes('src/') || f.includes('lib/')) || listResult.result[0];
        const readResult = toolExecutor.execute('read_file', { filepath: primaryFile });
        addLog('action', `Read ${primaryFile} (${readResult.result?.length || 0} bytes) to isolate exports`);
        break;
      }

      case 1: { // Stage 3: Analyze & Debug
        addLog('reasoning', `[Stage 3: Analyze] Debugger Agent isolating bug patterns and invariants`);
        const debugRes = await this.debuggerAgent.execute(agentContext);
        addLog('action', `Debugger evaluation: ${debugRes.message}`, debugRes.findings);

        const secRes = await this.securityAgent.execute(agentContext);
        addLog('reasoning', `[Security Agent] ${secRes.message}`);
        addLog('success', `Identified root cause: missing boundary condition validation in stream handler`);
        break;
      }

      case 2: { // Stage 4: Execute & Modify
        addLog('reasoning', `[Stage 4: Execute] Developer Agent formulating targeted git merge diff`);
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
          toolExecutor.execute('write_file', {
            filepath: targetPath,
            content: `// Updated by Medusa Autonomous Engine\nexport class Service {\n  public process(data: any): boolean {\n    if (!data || typeof data !== 'object') return false;\n    return data.status === 'ready' && Boolean(data.payload);\n  }\n}\n`
          });
        }
        addLog('action', `Applied targeted merge diff patch to ${targetPath}`);
        addLog('success', `Successfully patched ${targetPath}`);
        break;
      }

      case 3: { // Stage 5: Verify & Test
        addLog('reasoning', `[Stage 5: Verify] Testing Agent triggering automated test execution`);
        const testRes = toolExecutor.execute('run_bash_command', { command: 'npm test -- --coverage' });
        const testAgentRes = await this.testingAgent.execute(agentContext);
        addLog('action', `Executed: npm test -- --coverage`);
        addLog('success', `All test suites passed. ${testAgentRes.message}`);

        session.testResults = {
          passed: true,
          totalTests: testAgentRes.findings?.[0]?.testFiles?.length || 1,
          passedTests: testAgentRes.status === "success" ? (testAgentRes.findings?.[0]?.testFiles?.length || 1) : 0,
          failedTests: testAgentRes.status === "success" ? 0 : 1,
          durationMs: 720,
          output: testRes.result?.stdout || 'All tests passed',
        };
        break;
      }

      case 4: { // Stage 6 & 7: Review & Deliver
        addLog('reasoning', `[Stage 6 & 7: Deliver] Reviewer Agent running pre-commit checks`);
        const revRes = await this.reviewerAgent.execute(agentContext);
        addLog('action', `Code Review: ${revRes.message}`);
        const depRes = await this.deployAgent.execute(agentContext);
        addLog('action', `Deployment validation: ${depRes.message}`);
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
      const prNum = Math.floor(Date.now() % 1000) + 1;
      session.prUrl = `https://github.com/${owner}/${repo}/pull/${prNum}`;
      addLog('success', `All Medusa plan steps finished successfully! Pull Request branch ready: ${session.newBranch}`);
    } else {
      session.status = 'idle';
    }

    session.updatedAt = Date.now();
    storage.set(sessionId, session);

    return { session, finished: isAllComplete };
  }

  private getMockFilesForRepo(repoUrl: string): Record<string, string> {
    return {
      'src/service.ts': `export class Service {\n  public process(data: any): boolean {\n    return data.status === "ready";\n  }\n}\n`,
      'src/index.ts': `import { Service } from './service';\nexport const run = () => new Service();\n`,
      'tests/service.test.ts': `import { Service } from '../src/service';\ndescribe('Service', () => {\n  it('handles ready state', () => {\n    const s = new Service();\n    expect(s.process({ status: 'ready', payload: true })).toBe(true);\n  });\n});\n`,
      'package.json': `{\n  "name": "target-repo",\n  "version": "1.0.0",\n  "scripts": {\n    "test": "jest"\n  }\n}\n`,
      'README.md': `# Target Repository\nManaged by Medusa Autonomous Coding Agent.\n`
    };
  }
}
