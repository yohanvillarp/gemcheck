export interface TriageItem {
  file: string;
  debtMinutes: number;
  gitRiskScore: number;
  priorityScore: number;
  commitsCount: number;
  fixesCount: number;
}

export interface TriageReport {
  projectName: string;
  topFiles: TriageItem[];
  generatedAt: Date;
  weightsApplied: {
    ast: number;
    git: number;
  };
}
