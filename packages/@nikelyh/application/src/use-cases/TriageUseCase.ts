import { AuditResult, GitReport, TriageReport, TriageItem, GitAnalyzerConfig } from '@nikelyh/gemcheck-domain';

export class TriageUseCase {
  constructor(private readonly config: GitAnalyzerConfig) {}

  public execute(auditData: AuditResult, gitReport: GitReport): TriageReport {
    const astWeight = this.config.TRIAGE?.AST_DEBT_WEIGHT || 40;
    const gitWeight = this.config.TRIAGE?.GIT_RISK_WEIGHT || 60;

    const hotspotsMap = new Map<string, any>();
    if (gitReport?.hotspots) {
      gitReport.hotspots.forEach((h: any) => hotspotsMap.set(h.file.replace(/\\/g, '/'), h));
    }

    const triageList: TriageItem[] = (auditData.fileMetrics || []).map(metric => {
      // Normalizar ruta AST para cruzarla con Git
      let relativePath = metric.filePath.replace(/\\/g, '/');
      if (auditData.projectName && relativePath.includes(auditData.projectName)) {
        const parts = relativePath.split(auditData.projectName);
        relativePath = parts[1] || relativePath;
      }
      if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);

      const gitData = hotspotsMap.get(relativePath);
      const gitRiskScore = gitData ? gitData.risk.score : 0;
      
      // Normalizar la deuda a un score sobre 100 (asumimos que 60 mins de deuda ya es un 100 en score para la fórmula)
      const debtScore = Math.min((metric.debtMinutes / 60) * 100, 100);

      const priorityScore = Math.round((debtScore * (astWeight / 100)) + (gitRiskScore * (gitWeight / 100)));

      return {
        file: relativePath,
        debtMinutes: metric.debtMinutes,
        gitRiskScore,
        priorityScore,
        commitsCount: gitData?.commitsCount || 0,
        fixesCount: gitData?.fixesCount || 0
      };
    }).filter(t => t.priorityScore > 0)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5); // Top 5

    return {
      projectName: auditData.projectName,
      topFiles: triageList,
      generatedAt: new Date(),
      weightsApplied: {
        ast: astWeight,
        git: gitWeight
      }
    };
  }
}
