export type Language =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'cpp'
  | 'ruby'
  | 'php'
  | 'unknown';

export interface RepoMetadata {
  owner: string;
  repo: string;
  branch: string;
  language: Language;
  description?: string;
  filesCount: number;
}

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  toolCalls?: ToolCallRecord[];
}

export interface ToolCallRecord {
  id: string;
  tool: string;
  input: Record<string, any>;
  output?: any;
  timestamp: number;
  durationMs?: number;
  status: 'running' | 'success' | 'failed';
}

export interface FileDiff {
  filepath: string;
  oldContent: string;
  newContent: string;
  patch: string;
  additions: number;
  deletions: number;
}

export interface JulesSession {
  id: string;
  repoUrl: string;
  targetBranch: string;
  newBranch: string;
  taskPrompt: string;
  status: 'idle' | 'analyzing' | 'planning' | 'executing' | 'verifying' | 'completed' | 'failed';
  plan: PlanStep[];
  currentStepIndex: number;
  diffs: FileDiff[];
  logs: JulesLogEntry[];
  testResults?: TestRunResult;
  prUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface JulesLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'reasoning' | 'action' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface TestRunResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  output: string;
}
