export type AgentRole =
  | 'architect'
  | 'debugger'
  | 'developer'
  | 'testing'
  | 'security'
  | 'reviewer'
  | 'deployment';

export interface AgentContext {
  repoUrl: string;
  taskPrompt: string;
  primaryLanguage: string;
  files: Record<string, string>;
  sharedMemory: Record<string, any>;
  errorsDetected: string[];
}

export interface AgentResponse {
  role: AgentRole;
  status: 'success' | 'warning' | 'error';
  message: string;
  findings?: any[];
  recommendations?: string[];
  proposedDiffs?: string[];
}

export interface SpecializedAgent {
  role: AgentRole;
  name: string;
  description: string;
  execute(context: AgentContext): Promise<AgentResponse>;
}
