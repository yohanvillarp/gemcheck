import { IAnalyzer, AnalyzerConfig, AnalyzerResult } from '@nikelyh/gemcheck-domain';

export class SonarQubeAdapter implements IAnalyzer {
  async analyze(config: AnalyzerConfig): Promise<AnalyzerResult> {
    console.log(`Running SonarQube analysis for ${config.projectPath}...`);
    
    // Dummy metrics for now
    return {
      fileMetrics: [] // Stub for now
    };
  }
}
