import { AuditResult, IAnalyzer, IReporter, TdrCalculator } from '@nikelyh/gemcheck-domain';

export class ScanAuditUseCase {
  private tdrCalculator: TdrCalculator;

  constructor(
    private analyzers: IAnalyzer[],
    private reporter: IReporter,
    private _historyRepo?: any // eslint-disable-line no-unused-vars
  ) {
    this.tdrCalculator = new TdrCalculator();
  }

  async execute(projectPath: string): Promise<AuditResult> {
    console.log('Procesando: ');
    
    // Ejecutamos todos los analizadores en paralelo
    const results = await Promise.all(
      this.analyzers.map(analyzer => analyzer.analyze({ projectPath }))
    );

    const allFileMetrics = [];
    let maxDuplications = 0;

    for (const res of results) {
      if (res.fileMetrics && res.fileMetrics.length > 0) {
        allFileMetrics.push(...res.fileMetrics);
      }
      if (res.duplications !== undefined && res.duplications > maxDuplications) {
        maxDuplications = res.duplications;
      }
    }

    const finalMetrics = this.tdrCalculator.calculate(allFileMetrics, maxDuplications);

    const auditResult = new AuditResult(
      projectPath,
      finalMetrics,
      new Date(),
      allFileMetrics
    );

    await this.reporter.report(auditResult);

    
    return auditResult;
  }
}
