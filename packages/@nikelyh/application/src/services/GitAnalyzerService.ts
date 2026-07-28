import { GitCommit, GitReport, RiskLevel, GitAnalyzerConfig, GitHotspot, GitBusFactor, GitCoupling, GitAdvancedMetrics } from '@nikelyh/gemcheck-domain';

export class GitAnalyzerService {
  constructor(private readonly gitAdapter: any, private readonly config: GitAnalyzerConfig) {}

  public async analyze(projectPath: string, projectName: string): Promise<GitReport> {
    const isGitRepo = await this.gitAdapter.isGitRepo(projectPath);
    if (!isGitRepo) {
      throw new Error('No es un repositorio Git.');
    }

    const branch = await this.gitAdapter.getCurrentBranch(projectPath);
    const commitsRaw = await this.gitAdapter.getRecentCommits(projectPath, 100);

    const commits: GitCommit[] = commitsRaw.map((raw: any) => {
      const isFix = raw.message.toLowerCase().includes('fix') || raw.message.toLowerCase().includes('bug');
      
      const risk = this.calculateRisk(raw.addedLines, raw.deletedLines, raw.filesTouched, isFix);

      return {
        hash: raw.hash,
        author: raw.author,
        date: raw.date,
        message: raw.message,
        isFix,
        metrics: {
          addedLines: raw.addedLines,
          deletedLines: raw.deletedLines,
          filesTouched: raw.filesTouched
        },
        files: raw.files || [],
        risk
      };
    });

    const hotspots = this.calculateHotspots(commits);
    const trends = this.calculateTrends(commits);
    const busFactor = this.calculateBusFactor(commits);
    const coupling = this.calculateCoupling(commits);
    const advanced = this.calculateAdvancedMetrics(commits);
    
    const { score, grade, issues } = this.calculateTeamHealth(hotspots, busFactor, coupling, advanced, commits);

    return {
      projectName,
      projectPath,
      branch,
      commits,
      hotspots,
      trends,
      busFactor,
      coupling,
      advanced,
      summary: {
        totalCommits: commits.length,
        highRiskCommits: commits.filter(c => c.risk.level === 'high').length,
        mediumRiskCommits: commits.filter(c => c.risk.level === 'medium').length,
        lowRiskCommits: commits.filter(c => c.risk.level === 'low').length,
        teamHealthScore: score,
        teamHealthGrade: grade,
        healthIssues: issues
      }
    };
  }

  private isIgnorableFile(fileName: string): boolean {
    const lowerName = fileName.toLowerCase();
    // Archivos de dependencias
    if (lowerName.includes('package-lock.json') || lowerName.includes('yarn.lock') || lowerName.includes('pnpm-lock.yaml') || lowerName.endsWith('package.json')) return true;
    // Archivos de configuración CI/CD
    if (lowerName.includes('.github/workflows/') || lowerName.includes('.gitlab-ci.yml') || lowerName.includes('jenkinsfile')) return true;
    // Documentación
    if (lowerName.endsWith('.md') || lowerName.endsWith('.txt')) return true;
    return false;
  }

  private calculateHotspots(commits: GitCommit[]) {
    const fileStats = new Map<string, any>();

    commits.forEach(commit => {
      commit.files.forEach(file => {
        if (this.isIgnorableFile(file.name)) return;

        if (!fileStats.has(file.name)) {
          fileStats.set(file.name, {
            file: file.name,
            commitsCount: 0,
            fixesCount: 0,
            addedLines: 0,
            deletedLines: 0
          });
        }
        
        const stats = fileStats.get(file.name);
        stats.commitsCount += 1;
        if (commit.isFix) stats.fixesCount += 1;
        stats.addedLines += file.addedLines;
        stats.deletedLines += file.deletedLines;
      });
    });

    return Array.from(fileStats.values()).map(stats => {
      let score = 0;
      let reason = 'Bajo riesgo. Archivo estable.';

      if (stats.commitsCount > this.config.HOTSPOTS.HIGH_COMMITS_THRESHOLD) score += 30;
      else if (stats.commitsCount > this.config.HOTSPOTS.MEDIUM_COMMITS_THRESHOLD) score += 15;

      if (stats.fixesCount > this.config.HOTSPOTS.HIGH_FIXES_THRESHOLD) score += 40;
      else if (stats.fixesCount > this.config.HOTSPOTS.MEDIUM_FIXES_THRESHOLD) score += 20;

      const churn = stats.addedLines + stats.deletedLines;
      if (churn > this.config.HOTSPOTS.HIGH_CHURN_THRESHOLD) score += 30;
      else if (churn > this.config.HOTSPOTS.MEDIUM_CHURN_THRESHOLD) score += 15;

      let level: RiskLevel = 'low';
      if (score >= this.config.HOTSPOTS.CRITICAL_SCORE) {
        level = 'high';
        reason = 'Punto Caliente: Archivo frecuentemente modificado, con múltiples arreglos (fixes) y alta agitación de código.';
      } else if (score >= this.config.HOTSPOTS.WARNING_SCORE) {
        level = 'medium';
        reason = 'Riesgo Medio: Cambios frecuentes o volumen de modificaciones considerable.';
      }

      return {
        ...stats,
        risk: { level, score: Math.min(score, 100), reason }
      };
    }).sort((a, b) => b.risk.score - a.risk.score);
  }

  private calculateTrends(commits: GitCommit[]) {
    const trendsMap = new Map<string, any>();

    commits.forEach(commit => {
      // commit.date viene en formato 'YYYY-MM-DD' gracias a --date=short
      const date = commit.date;
      
      if (!trendsMap.has(date)) {
        trendsMap.set(date, {
          date,
          addedLines: 0,
          deletedLines: 0,
          totalCommits: 0,
          fixes: 0,
          filesTouched: 0
        });
      }

      const trend = trendsMap.get(date);
      trend.totalCommits += 1;
      trend.addedLines += (commit.metrics.addedLines || 0);
      trend.deletedLines += (commit.metrics.deletedLines || 0);
      trend.filesTouched += (commit.files ? commit.files.length : 0);
      if (commit.isFix) {
        trend.fixes += 1;
      }
    });

    // Convertir a array y ordenar de más antiguo a más reciente
    return Array.from(trendsMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateBusFactor(commits: GitCommit[]) {
    const fileAuthors = new Map<string, Map<string, number>>();

    // Paso 1: Agrupar por archivo y luego por autor (contar commits)
    commits.forEach(commit => {
      const author = commit.author.split(' <')[0]; // Limpiar email, usar solo nombre
      
      // Ignorar bots conocidos
      if (author.toLowerCase().includes('bot') || author.toLowerCase().includes('github-actions')) {
        return;
      }
      
      commit.files.forEach(file => {
        // Ignorar archivos generados o de dependencias
        if (this.isIgnorableFile(file.name)) {
          return;
        }

        if (!fileAuthors.has(file.name)) {
          fileAuthors.set(file.name, new Map());
        }
        const authorsMap = fileAuthors.get(file.name)!;
        authorsMap.set(author, (authorsMap.get(author) || 0) + 1);
      });
    });

    // Paso 2: Procesar los datos de Bus Factor
    const busFactorList = Array.from(fileAuthors.entries()).map(([fileName, authorsMap]) => {
      const totalCommits = Array.from(authorsMap.values()).reduce((sum, count) => sum + count, 0);
      
      // Ordenar autores por cantidad de commits
      const sortedAuthors = Array.from(authorsMap.entries())
        .map(([name, count]) => ({ name, commits: count }))
        .sort((a, b) => b.commits - a.commits);

      const primaryAuthor = sortedAuthors[0];
      const ownershipPercentage = Math.round((primaryAuthor.commits / totalCommits) * 100);

      return {
        file: fileName,
        primaryAuthor: primaryAuthor.name,
        ownershipPercentage,
        totalCommits,
        totalAuthors: sortedAuthors.length,
        authors: sortedAuthors
      };
    });

    // Paso 3: Filtrar archivos críticos (alto bus factor)
    return busFactorList
      .filter(item => item.totalCommits >= this.config.BUS_FACTOR.MIN_COMMITS_TO_EVALUATE && item.ownershipPercentage >= this.config.BUS_FACTOR.CRITICAL_OWNERSHIP_PERCENTAGE)
      .sort((a, b) => b.totalCommits - a.totalCommits); // Ordenar por archivos más activos
  }

  private calculateCoupling(commits: GitCommit[]) {
    const fileCommitsCount = new Map<string, number>();
    const pairsMap = new Map<string, number>();

    commits.forEach(commit => {
      // Ignoramos commits muy grandes (refactors masivos, dependencias)
      if (commit.files.length > this.config.COUPLING.MAX_FILES_IN_COMMIT_TO_EVALUATE) return;

      // Filtrar archivos que no deben evaluarse para acoplamiento lógico
      const fileNames = commit.files
        .map(f => f.name)
        .filter(name => !this.isIgnorableFile(name))
        .sort();

      // Contar el total de commits individuales por archivo para calcular el porcentaje
      fileNames.forEach(name => {
        fileCommitsCount.set(name, (fileCommitsCount.get(name) || 0) + 1);
      });

      // Crear todos los pares posibles (n * (n-1) / 2)
      for (let i = 0; i < fileNames.length; i++) {
        for (let j = i + 1; j < fileNames.length; j++) {
          const pairKey = `${fileNames[i]}|||${fileNames[j]}`;
          pairsMap.set(pairKey, (pairsMap.get(pairKey) || 0) + 1);
        }
      }
    });

    const couplingList = Array.from(pairsMap.entries()).map(([pairKey, coChangeCount]) => {
      const [fileA, fileB] = pairKey.split('|||');
      const totalCommitsA = fileCommitsCount.get(fileA) || 0;
      const totalCommitsB = fileCommitsCount.get(fileB) || 0;

      // Porcentaje de acoplamiento. Si FileA se modificó 10 veces en total, y 9 de esas veces 
      // fue junto a FileB, el coupling de A hacia B es 90%. Tomamos el max para indicar riesgo.
      const couplingPercentage = Math.round(Math.max(
        (coChangeCount / totalCommitsA) * 100,
        (coChangeCount / totalCommitsB) * 100
      ));

      return {
        fileA,
        fileB,
        coChangeCount,
        totalCommitsA,
        totalCommitsB,
        couplingPercentage
      };
    });

    // Filtrar falsos positivos: 
    return couplingList
      .filter(c => c.coChangeCount >= this.config.COUPLING.MIN_CO_CHANGES && c.couplingPercentage >= this.config.COUPLING.MIN_COUPLING_PERCENTAGE)
      .sort((a, b) => b.couplingPercentage - a.couplingPercentage || b.coChangeCount - a.coChangeCount);
  }

  private calculateAdvancedMetrics(commits: GitCommit[]) {
    const state = {
      totalLinesChanged: 0,
      totalFixes: 0,
      small: 0, medium: 0, large: 0,
      totalFridayCommits: 0,
      fridayFixesCount: 0,
    };

    const fileAuthorsCount = new Map<string, Set<string>>();
    const fileLastCommitDate = new Map<string, Date>();

    commits.forEach(commit => this.processCommitForAdvancedMetrics(commit, state, fileAuthorsCount, fileLastCommitDate));

    const defectDensity = state.totalLinesChanged > 0 ? (state.totalFixes / (state.totalLinesChanged / 1000)) : 0;
    const fridayFixesPercentage = state.totalFridayCommits > 0 ? Math.round((state.fridayFixesCount / state.totalFridayCommits) * 100) : 0;

    const intersectionComplexity = this.getTopIntersectionComplexity(fileAuthorsCount);
    const abandonedFiles = this.getTopAbandonedFiles(fileLastCommitDate);

    return {
      defectDensity: Number(defectDensity.toFixed(2)),
      commitAtomicity: { small: state.small, medium: state.medium, large: state.large },
      fridayFixes: fridayFixesPercentage,
      intersectionComplexity,
      abandonedFiles
    };
  }

  private processCommitForAdvancedMetrics(commit: GitCommit, state: any, fileAuthorsCount: Map<string, Set<string>>, fileLastCommitDate: Map<string, Date>) {
    const isBot = commit.author.toLowerCase().includes('bot') || commit.author.toLowerCase().includes('github-actions');
    const authorName = commit.author.split(' <')[0];
    const commitDate = new Date(commit.date);

    state.totalLinesChanged += (commit.metrics.addedLines + commit.metrics.deletedLines);
    if (commit.isFix) state.totalFixes++;

    const filesCount = commit.files.length;
    if (filesCount <= this.config.ADVANCED.ATOMICITY_SMALL_MAX_FILES) state.small++;
    else if (filesCount <= this.config.ADVANCED.ATOMICITY_MEDIUM_MAX_FILES) state.medium++;
    else state.large++;

    if (commitDate.getDay() === 5) {
      state.totalFridayCommits++;
      if (commit.isFix) state.fridayFixesCount++;
    }

    if (!isBot) {
      commit.files.forEach(file => {
        if (this.isIgnorableFile(file.name)) return;

        if (!fileAuthorsCount.has(file.name)) fileAuthorsCount.set(file.name, new Set());
        fileAuthorsCount.get(file.name)!.add(authorName);

        const currentLastDate = fileLastCommitDate.get(file.name);
        if (!currentLastDate || commitDate > currentLastDate) {
          fileLastCommitDate.set(file.name, commitDate);
        }
      });
    }
  }

  private getTopIntersectionComplexity(fileAuthorsCount: Map<string, Set<string>>) {
    return Array.from(fileAuthorsCount.entries())
      .map(([file, authorsSet]) => ({ file, authorCount: authorsSet.size }))
      .filter(item => item.authorCount >= this.config.ADVANCED.MIN_AUTHORS_FOR_BOTTLENECK)
      .sort((a, b) => b.authorCount - a.authorCount)
      .slice(0, 5);
  }

  private getTopAbandonedFiles(fileLastCommitDate: Map<string, Date>) {
    const currentDate = new Date();
    return Array.from(fileLastCommitDate.entries())
      .map(([file, lastDate]) => {
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); 
        return { file, monthsSinceLastCommit: diffMonths };
      })
      .filter(item => item.monthsSinceLastCommit >= this.config.ADVANCED.MONTHS_TO_BE_ABANDONED)
      .sort((a, b) => b.monthsSinceLastCommit - a.monthsSinceLastCommit)
      .slice(0, 5);
  }

  private calculateRisk(addedLines: number, deletedLines: number, filesTouched: number, isFix: boolean): { level: RiskLevel; score: number; reason: string } {
    let score = 0;
    let reason = 'Bajo riesgo. Cambios granulares.';

    // Code Churn (Volumen de cambios)
    const churn = addedLines + deletedLines;
    if (churn > 500) score += 40;
    else if (churn > 100) score += 20;

    // Archivos tocados (Dispersión)
    if (filesTouched > 10) score += 40;
    else if (filesTouched > 5) score += 20;

    // Los fixes grandes suelen ser más riesgosos
    if (isFix && churn > 200) score += 20;

    let level: RiskLevel = 'low';
    if (score >= 60) {
      level = 'high';
      reason = 'Alto riesgo: Demasiada agitación de código o múltiples archivos modificados simultáneamente.';
    } else if (score >= 30) {
      level = 'medium';
      reason = 'Riesgo medio: Volumen moderado de cambios.';
    }

    return { level, score: Math.min(score, 100), reason };
  }

  private calculateTeamHealth(
    hotspots: GitHotspot[],
    busFactor: GitBusFactor[],
    coupling: GitCoupling[],
    advanced: GitAdvancedMetrics,
    commits: GitCommit[]
  ): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F'; issues: string[] } {
    let score = 100;
    const issues: string[] = [];

    const highRiskHotspots = hotspots.filter(h => h.risk.level === 'high');
    if (highRiskHotspots.length > 0) {
      const penalty = highRiskHotspots.length * this.config.HEALTH_PENALTIES.PER_HIGH_RISK_HOTSPOT;
      score -= penalty;
      const fileNames = highRiskHotspots.map(h => h.file).join(', ');
      issues.push(`Se perdieron ${penalty} pts: ${highRiskHotspots.length} archivo(s) son puntos calientes de alto riesgo (Hotspots). Archivos: ${fileNames}`);
    }

    if (busFactor.length > 0) {
      const penalty = busFactor.length * this.config.HEALTH_PENALTIES.PER_CRITICAL_BUS_FACTOR_FILE;
      score -= penalty;
      const fileNames = busFactor.map(b => b.file).join(', ');
      issues.push(`Se perdieron ${penalty} pts: ${busFactor.length} archivo(s) tienen un Bus Factor crítico (dependencia de 1 sola persona). Archivos: ${fileNames}`);
    }

    if (coupling.length > 0) {
      const penalty = coupling.length * this.config.HEALTH_PENALTIES.PER_HIGH_COUPLING_PAIR;
      score -= penalty;
      const pairs = coupling.map(c => `(${c.fileA} - ${c.fileB})`).join(', ');
      issues.push(`Se perdieron ${penalty} pts: Se detectaron ${coupling.length} par(es) de archivos con un acoplamiento lógico excesivo. Pares: ${pairs}`);
    }

    const totalCommitsCount = commits.length;
    if (totalCommitsCount > 0) {
      const largeCommitsPercentage = Math.round((advanced.commitAtomicity.large / totalCommitsCount) * 100);
      if (largeCommitsPercentage >= this.config.HEALTH_PENALTIES.LARGE_COMMITS_WARNING_PERCENTAGE) {
        score -= this.config.HEALTH_PENALTIES.LARGE_COMMITS_PENALTY;
        issues.push(`Se perdieron ${this.config.HEALTH_PENALTIES.LARGE_COMMITS_PENALTY} pts: El ${largeCommitsPercentage}% de los commits son masivos. Falta atomicidad.`);
      }
    }

    if (advanced.fridayFixes >= this.config.HEALTH_PENALTIES.FRIDAY_FIXES_WARNING_PERCENTAGE) {
      score -= this.config.HEALTH_PENALTIES.FRIDAY_FIXES_PENALTY;
      issues.push(`Se perdieron ${this.config.HEALTH_PENALTIES.FRIDAY_FIXES_PENALTY} pts: El ${advanced.fridayFixes}% de los arreglos se subieron un Viernes. Cuidado con la fatiga.`);
    }

    if (score < 0) score = 0;

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (score >= this.config.HEALTH_PENALTIES.GRADES.A) grade = 'A';
    else if (score >= this.config.HEALTH_PENALTIES.GRADES.B) grade = 'B';
    else if (score >= this.config.HEALTH_PENALTIES.GRADES.C) grade = 'C';
    else if (score >= this.config.HEALTH_PENALTIES.GRADES.D) grade = 'D';

    return { score, grade, issues };
  }
}
