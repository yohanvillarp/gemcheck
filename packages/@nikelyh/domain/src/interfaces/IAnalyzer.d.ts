import { Metrics } from '../entities/AuditResult';
export interface AnalyzerConfig {
    projectPath: string;
    sourceDir?: string;
}
export interface AnalyzerResult {
    metrics: Metrics;
}
export interface IAnalyzer {
    analyze(config: AnalyzerConfig): Promise<AnalyzerResult>;
}
