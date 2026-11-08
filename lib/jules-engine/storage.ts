import fs from 'fs';
import path from 'path';
import { JulesSession } from './types';
import { Logger } from '../logger';

export class SessionStorage {
  private memoryStore: Map<string, JulesSession> = new Map();
  private storageFilePath: string;

  constructor() {
    this.storageFilePath = path.join(process.cwd(), '.medusa-sessions.json');
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
      Logger.warn('Failed to load sessions from disk, starting with clean store', { error: err.message });
    }
  }

  private flushToDisk() {
    try {
      const list = Array.from(this.memoryStore.values());
      fs.writeFileSync(this.storageFilePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err: any) {
      Logger.warn('Failed to persist sessions to disk', { error: err.message });
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
}
