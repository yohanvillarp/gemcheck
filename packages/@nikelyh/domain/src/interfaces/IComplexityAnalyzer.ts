import { ComplexityReport } from '../entities/ComplexityReport.js';
import { AnalyzerConfig } from './IAnalyzer.js';

export interface IComplexityAnalyzer {
  analyze(config: AnalyzerConfig): Promise<ComplexityReport>;
}
