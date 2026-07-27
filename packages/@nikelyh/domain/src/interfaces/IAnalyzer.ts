import { FileMetric } from '../entities/AuditResult.js';

export interface AnalyzerConfig {
  projectPath: string;
  sourceDir?: string;
}

export interface AnalyzerResult {
  fileMetrics: FileMetric[];
  duplications?: number;
}

export interface IAnalyzer {
  analyze(config: AnalyzerConfig): Promise<AnalyzerResult>;
}
