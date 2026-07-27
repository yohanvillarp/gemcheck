import { IConfigRepository, GlobalConfig } from '@nikelyh/gemcheck-domain';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import os from 'os';
import fs from 'fs';

export class SqliteConfigRepository implements IConfigRepository {
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
      CREATE TABLE IF NOT EXISTS config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data_json TEXT NOT NULL
      )
    `);
  }

  async getConfig(): Promise<GlobalConfig | null> {
    const stmt = this.db.prepare(`
      SELECT data_json as dataJson
      FROM config
      WHERE id = 1
    `);
    
    const row = stmt.get() as { dataJson: string } | undefined;
    if (!row) {
      return null;
    }
    
    try {
      return JSON.parse(row.dataJson) as GlobalConfig;
    } catch (e) {
      return null;
    }
  }

  async saveConfig(config: GlobalConfig): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO config (id, data_json)
      VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json
    `);

    stmt.run(JSON.stringify(config));
  }

  async resetConfig(): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM config WHERE id = 1
    `);
    stmt.run();
  }
}
