import { FileMetric, Metrics } from '../entities/AuditResult.js';

export class TdrCalculator {
  // Esfuerzo base por línea de código según SQALE / SonarQube
  private readonly DEVELOPMENT_COST_PER_LOC_MINUTES = 30;

  public calculate(files: FileMetric[], duplications: number = 0): Metrics {
    let totalLinesOfCode = 0;
    let technicalDebtInMinutes = 0;
    let codeSmells = 0;
    const mcCabe: number[] = [];

    for (const file of files) {
      totalLinesOfCode += file.linesOfCode;
      technicalDebtInMinutes += file.debtMinutes;
      codeSmells += file.codeSmells;
      mcCabe.push(...file.complexity);
    }

    const totalDevelopmentCost = totalLinesOfCode * this.DEVELOPMENT_COST_PER_LOC_MINUTES;

    let tdr = 0;
    if (totalDevelopmentCost > 0) {
      tdr = (technicalDebtInMinutes / totalDevelopmentCost) * 100;
    }

    // Redondeo a 2 decimales
    tdr = Math.round(tdr * 100) / 100;

    // Penalización por duplicación: Si duplications > 5%, empieza a restar severamente
    const duplicationPenalty = duplications > 5 ? (duplications - 5) * 2 : 0;
    const maintainabilityIndex = Math.max(0, Math.round(100 - tdr - duplicationPenalty));

    return {
      tdr,
      totalLinesOfCode,
      technicalDebtInMinutes,
      mcCabe,
      maintainabilityIndex,
      duplications: Math.round(duplications * 100) / 100,
    };
  }
}
