import fs from 'fs';
import path from 'path';
import { JulesSession, PullRequestRecord, ProjectRuleInstruction, DeploymentRecord } from './types';
import { Logger } from '../logger';

export class SessionStorage {
  private memoryStore: Map<string, JulesSession> = new Map();
  private prStore: Map<string, PullRequestRecord> = new Map();
  private rulesStore: Map<string, ProjectRuleInstruction> = new Map();
  private deploymentsStore: Map<string, DeploymentRecord> = new Map();

  private storageFilePath: string;
  private prFilePath: string;
  private rulesFilePath: string;
  private deploymentsFilePath: string;

  constructor() {
    this.storageFilePath = path.join(process.cwd(), '.medusa-sessions.json');
    this.prFilePath = path.join(process.cwd(), '.medusa-prs.json');
    this.rulesFilePath = path.join(process.cwd(), '.medusa-rules.json');
    this.deploymentsFilePath = path.join(process.cwd(), '.medusa-deployments.json');

    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
        const list: JulesSession[] = JSON.parse(raw);
        for (const s of list) {
          this.memoryStore.set(s.id, s);
        }
      }
    } catch (err: any) {
      Logger.warn('Failed to load sessions from disk', { error: err.message });
    }

    try {
      if (fs.existsSync(this.prFilePath)) {
        const raw = fs.readFileSync(this.prFilePath, 'utf-8');
        const list: PullRequestRecord[] = JSON.parse(raw);
        for (const p of list) {
          this.prStore.set(p.id, p);
        }
      }
    } catch (err: any) {
      Logger.warn('Failed to load PRs from disk', { error: err.message });
    }

    try {
      if (fs.existsSync(this.rulesFilePath)) {
        const raw = fs.readFileSync(this.rulesFilePath, 'utf-8');
        const list: ProjectRuleInstruction[] = JSON.parse(raw);
        for (const r of list) {
          this.rulesStore.set(r.id, r);
        }
      } else {
        this.saveRule({
          id: 'rule-arch-1',
          title: 'Modular Architecture & Strict TypeScript',
          category: 'architecture',
          content: 'Strict adherence to TypeScript types, separation of API routes, domain engines, and UI presentation components.',
          enabled: true,
          updatedAt: Date.now()
        });
        this.saveRule({
          id: 'rule-verify-1',
          title: 'Pre-Commit Verification & Zero Phantom Diffs',
          category: 'testing',
          content: 'All file changes must apply targeted Git Merge Diffs and execute regression test suites before submission.',
          enabled: true,
          updatedAt: Date.now()
        });
      }
    } catch (err: any) {
      Logger.warn('Failed to load rules from disk', { error: err.message });
    }

    try {
      if (fs.existsSync(this.deploymentsFilePath)) {
        const raw = fs.readFileSync(this.deploymentsFilePath, 'utf-8');
        const list: DeploymentRecord[] = JSON.parse(raw);
        for (const d of list) {
          this.deploymentsStore.set(d.id, d);
        }
      }
    } catch (err: any) {
      Logger.warn('Failed to load deployments from disk', { error: err.message });
    }
  }

  private flushToDisk() {
    try {
      fs.writeFileSync(this.storageFilePath, JSON.stringify(Array.from(this.memoryStore.values()), null, 2), 'utf-8');
      fs.writeFileSync(this.prFilePath, JSON.stringify(Array.from(this.prStore.values()), null, 2), 'utf-8');
      fs.writeFileSync(this.rulesFilePath, JSON.stringify(Array.from(this.rulesStore.values()), null, 2), 'utf-8');
      fs.writeFileSync(this.deploymentsFilePath, JSON.stringify(Array.from(this.deploymentsStore.values()), null, 2), 'utf-8');
    } catch (err: any) {
      Logger.warn('Failed to persist stores to disk', { error: err.message });
    }
  }

  get(id: string): JulesSession | undefined {
    return this.memoryStore.get(id);
  }

  set(id: string, session: JulesSession) {
    this.memoryStore.set(id, session);
    this.flushToDisk();
  }

  list(): JulesSession[] {
    return Array.from(this.memoryStore.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  delete(id: string): boolean {
    const deleted = this.memoryStore.delete(id);
    if (deleted) this.flushToDisk();
    return deleted;
  }

  savePR(pr: PullRequestRecord) {
    this.prStore.set(pr.id, pr);
    this.flushToDisk();
  }

  listPRs(): PullRequestRecord[] {
    return Array.from(this.prStore.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  saveRule(rule: ProjectRuleInstruction) {
    this.rulesStore.set(rule.id, rule);
    this.flushToDisk();
  }

  listRules(): ProjectRuleInstruction[] {
    return Array.from(this.rulesStore.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  deleteRule(id: string): boolean {
    const deleted = this.rulesStore.delete(id);
    if (deleted) this.flushToDisk();
    return deleted;
  }

  saveDeployment(dep: DeploymentRecord) {
    this.deploymentsStore.set(dep.id, dep);
    this.flushToDisk();
  }

  listDeployments(): DeploymentRecord[] {
    return Array.from(this.deploymentsStore.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
}
