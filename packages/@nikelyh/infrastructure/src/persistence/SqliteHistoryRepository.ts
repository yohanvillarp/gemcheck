import { IHistoryRepository, HistoryRecord } from '@nikelyh/gemcheck-domain';
import { AuditResult } from '@nikelyh/gemcheck-domain';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import os from 'os';
import fs from 'fs';

export class SqliteHistoryRepository implements IHistoryRepository {
  private db: DatabaseSync;

  constructor() {
    const gemcheckDir = path.join(os.homedir(), '.gemcheck');
    if (!fs.existsSync(gemcheckDir)) {
      fs.mkdirSync(gemcheckDir, { recursive: true });
    }

    const dbPath = path.join(gemcheckDir, 'gemcheck.db');
    this.db = new DatabaseSync(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL,
        tdr REAL NOT NULL,
        hash_signature TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        data_json TEXT NOT NULL
      )
    `);
  }

  async saveAudit(result: AuditResult, hashSignature: string = ''): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO audits (project_name, tdr, hash_signature, timestamp, data_json)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      result.projectName,
      result.metrics.tdr,
      hashSignature,
      result.timestamp instanceof Date ? result.timestamp.toISOString() : String(result.timestamp),
      JSON.stringify(result)
    );
  }

  async getProjectHistory(projectName: string): Promise<HistoryRecord[]> {
    const stmt = this.db.prepare(`
      SELECT id, project_name as projectName, tdr, hash_signature as hashSignature, timestamp, data_json as dataJson
      FROM audits
      WHERE project_name = ?
      ORDER BY timestamp ASC
    `);
    
    const rows = stmt.all(projectName);
    return rows as any as HistoryRecord[];
  }
}
