import * as fs from 'fs';
import * as path from 'path';
import { SecurityFinding } from './tools';
import { SecurityPlan } from './planner';

export interface ChatSessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  plan?: SecurityPlan;
  findings?: SecurityFinding[];
  activeTool?: string;
  status?: string;
}

export interface SecurityInvestigation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  target?: string;
  scope?: string;
  category: string;
  status: 'active' | 'completed' | 'failed';
  messages: ChatSessionMessage[];
  findings: SecurityFinding[];
  reportMarkdown?: string;
}

export class CybersecurityStorage {
  private storageFile = path.resolve(process.cwd(), '.medusa-investigations.json');

  private load(): Map<string, SecurityInvestigation> {
    const map = new Map<string, SecurityInvestigation>();
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const list: SecurityInvestigation[] = JSON.parse(raw);
        for (const item of list) {
          map.set(item.id, item);
        }
      }
    } catch {
      // Ignore
    }
    return map;
  }

  private save(map: Map<string, SecurityInvestigation>) {
    try {
      const list = Array.from(map.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(list, null, 2), 'utf-8');
    } catch {
      // Ignore
    }
  }

  getAll(): SecurityInvestigation[] {
    const map = this.load();
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  get(id: string): SecurityInvestigation | undefined {
    const map = this.load();
    return map.get(id);
  }

  saveInvestigation(inv: SecurityInvestigation) {
    const map = this.load();
    inv.updatedAt = new Date().toISOString();
    map.set(inv.id, inv);
    this.save(map);
  }

  delete(id: string): boolean {
    const map = this.load();
    const deleted = map.delete(id);
    if (deleted) this.save(map);
    return deleted;
  }

  rename(id: string, newTitle: string): boolean {
    const map = this.load();
    const inv = map.get(id);
    if (inv) {
      inv.title = newTitle;
      inv.updatedAt = new Date().toISOString();
      this.save(map);
      return true;
    }
    return false;
  }
}

export const cybersecurityStorage = new CybersecurityStorage();
