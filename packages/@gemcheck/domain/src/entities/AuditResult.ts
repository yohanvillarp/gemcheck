export class AuditResult {
  constructor(
    public projectName: string,
    public metrics: Metrics,
    public timestamp: Date,
    public fileMetrics: FileMetric[] = []
  ) {}
}

export interface Metrics {
  tdr: number; // Porcentaje de deuda (ej. 5.5%)
  totalLinesOfCode: number;
  technicalDebtInMinutes: number;
  mcCabe: number[]; // Se mantiene para compatibilidad o desglose global
  maintainabilityIndex: number;
  duplications: number;
}

export interface FileMetric {
  filePath: string;
  linesOfCode: number;
  codeSmells: number;
  debtMinutes: number;
  complexity: number[];
}
