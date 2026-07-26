import { AuditResult, IAnalyzer, IReporter, IHistoryRepository, ISourceHasher } from '@gemcheck/domain';
import { ScanAuditUseCase } from '../use-cases/ScanAuditUseCase.js';
import path from 'path';

export class AuditOrchestrator {
  private scanUseCase: ScanAuditUseCase;

  constructor(
    private analyzers: IAnalyzer[],
    private reporter: IReporter,
    private historyRepo?: IHistoryRepository,
    private hasher?: ISourceHasher
  ) {
    this.scanUseCase = new ScanAuditUseCase(analyzers, reporter, historyRepo);
  }

  async runAudit(projectPath: string): Promise<AuditResult> {
    const projectName = path.basename(projectPath);
    let currentHash = '';

    if (this.hasher && this.historyRepo) {
      currentHash = await this.hasher.hashDirectory(projectPath);
      const history = await this.historyRepo.getProjectHistory(projectPath);
      const lastRecord = history.length > 0 ? history[history.length - 1] : null;

      if (lastRecord && lastRecord.hashSignature === currentHash) {
        console.log('\x1b[33m%s\x1b[0m', '⚡ [CACHÉ] No se detectaron cambios en el código. Cargando reporte anterior...');
        return Object.assign(
          new AuditResult(projectName, { tdr: 0, totalLinesOfCode: 0, technicalDebtInMinutes: 0, mcCabe: [], maintainabilityIndex: 0, duplications: 0 }, new Date(), []),
          JSON.parse(lastRecord.dataJson)
        );
      }
    }

    // Ejecutamos análisis real porque no hay caché o hubo cambios
    const result = await this.scanUseCase.execute(projectPath);

    // Si tenemos hasher, actualizamos el registro en la DB con el hashSignature
    if (this.historyRepo) {
      await this.historyRepo.saveAudit(result, currentHash);
    }

    return result;
  }
}

