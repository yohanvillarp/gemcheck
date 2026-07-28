import { 
  IComplexityAnalyzer, 
  ComplexityReport, 
  AnalyzerConfig
} from '@nikelyh/gemcheck-domain';

export class AnalyzeComplexityUseCase {
  constructor(
    private complexityAnalyzer: IComplexityAnalyzer
  ) {}

  async execute(config: AnalyzerConfig): Promise<ComplexityReport> {
    try {
      const report = await this.complexityAnalyzer.analyze(config);
      return report;
    } catch (error) {
      throw new Error(`Error en AnalyzeComplexityUseCase: ${(error as Error).message}`);
    }
  }
}
