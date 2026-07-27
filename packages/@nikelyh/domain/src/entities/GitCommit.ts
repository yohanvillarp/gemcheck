export type RiskLevel = 'low' | 'medium' | 'high';

export interface GitFile {
  name: string;
  addedLines: number;
  deletedLines: number;
}

export interface GitTrend {
  date: string;
  addedLines: number;
  deletedLines: number;
  totalCommits: number;
  fixes: number;
  filesTouched: number;
}

export interface GitHotspot {
  file: string;
  commitsCount: number;
  fixesCount: number;
  addedLines: number;
  deletedLines: number;
  risk: {
    level: RiskLevel;
    score: number;
    reason: string;
  };
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  isFix: boolean;
  metrics: {
    addedLines: number;
    deletedLines: number;
    filesTouched: number;
  };
  files: GitFile[];
  risk: {
    level: RiskLevel;
    score: number;
    reason: string;
  };
}

export interface GitBusFactor {
  file: string;
  primaryAuthor: string;
  ownershipPercentage: number;
  totalCommits: number;
  totalAuthors: number;
  authors: { name: string; commits: number }[];
}

export interface GitCoupling {
  fileA: string;
  fileB: string;
  coChangeCount: number;
  totalCommitsA: number;
  totalCommitsB: number;
  couplingPercentage: number;
}

export interface GitAdvancedMetrics {
  defectDensity: number; // Fixes por cada 1,000 líneas
  commitAtomicity: {
    small: number; // 1-2 archivos
    medium: number; // 3-9 archivos
    large: number; // 10+ archivos
  };
  fridayFixes: number; // Porcentaje
  intersectionComplexity: { file: string; authorCount: number }[];
  abandonedFiles: { file: string; monthsSinceLastCommit: number }[];
}

export interface GitReport {
  projectName: string;
  projectPath: string;
  branch: string;
  commits: GitCommit[];
  hotspots: GitHotspot[];
  trends: GitTrend[];
  busFactor: GitBusFactor[];
  coupling: GitCoupling[];
  advanced: GitAdvancedMetrics;
  summary: {
    totalCommits: number;
    highRiskCommits: number;
    mediumRiskCommits: number;
    lowRiskCommits: number;
    teamHealthScore: number;
    teamHealthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    healthIssues: string[];
  };
}
