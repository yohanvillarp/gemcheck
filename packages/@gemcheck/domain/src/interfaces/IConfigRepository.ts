import { GitAnalyzerConfig } from '../config/GitAnalyzerThresholds.js';

export interface GlobalConfig {
  git: GitAnalyzerConfig;
  scan: any;
}

export interface IConfigRepository {
  getConfig(): Promise<GlobalConfig | null>;
  saveConfig(config: GlobalConfig): Promise<void>;
  resetConfig(): Promise<void>;
}
