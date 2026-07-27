export interface FileMetric {
  filePath: string;
  linesOfCode: number;
  codeSmells: number;
  debtMinutes: number;
  complexity: number[];
}

export interface Metrics {
  tdr: number;
  totalLinesOfCode: number;
  technicalDebtInMinutes: number;
  mcCabe: number[];
  maintainabilityIndex: number;
  duplications: number;
}

export interface AuditData {
  projectName: string;
  metrics: Metrics;
  timestamp: string;
  fileMetrics?: FileMetric[];
}
