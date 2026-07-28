import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { startDashboardServer } from '../server/dashboardServer.js';
import { GitAnalyzerService } from '@nikelyh/gemcheck-application';
import { GitAdapter, SqliteConfigRepository } from '@nikelyh/gemcheck-infrastructure';
import { GIT_ANALYZER_THRESHOLDS } from '@nikelyh/gemcheck-domain';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GitCommandOptions {
  project: string;
  ci?: boolean;
  ui?: boolean;
  minHealthScore?: string;
}

export async function gitCommand(options: GitCommandOptions): Promise<void> {
  console.log(chalk.cyan('➤ Iniciando análisis evolutivo de Git...'));
  const spinner = ora('Extrayendo historial...').start();

  try {
    const gitAdapter = new GitAdapter();
    const isGit = await gitAdapter.isGitRepo(options.project);
    if (!isGit) {
      spinner.fail(chalk.yellow('[WARN] El proyecto no es un repositorio Git. Abortando.'));
      return;
    }

    const configRepo = new SqliteConfigRepository();
    const globalConfig = await configRepo.getConfig();
    const gitConfig = globalConfig?.git || GIT_ANALYZER_THRESHOLDS;
    
    const analyzer = new GitAnalyzerService(gitAdapter, gitConfig);
    const projectName = path.basename(options.project);
    
    spinner.text = 'Calculando Code Churn e Índice de Riesgo...';
    const report = await analyzer.analyze(options.project, projectName);

    saveGitReport(report);

    spinner.succeed(chalk.green('[OK] Análisis Git completado con éxito!'));
    console.log(chalk.blue(`Reporte guardado en ./reports/git-activity.json`));

    if (options.ci) {
      handleCiGuard(report, options.minHealthScore);
    } else if (options.ui) {
      const dashboardPath = path.resolve(__dirname, '../ui');
      startDashboardServer(dashboardPath, projectName, 'git');
    }

  } catch (error: unknown) {
    spinner.fail(chalk.red('[ERROR] El análisis Git ha fallado'));
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function saveGitReport(report: any): void {
  const reportsDir = path.join(process.cwd(), 'reports');
  const reportPath = path.join(reportsDir, 'git-activity.json');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
}

function handleCiGuard(report: any, minHealthScore?: string): void {
  const minScore = parseInt(minHealthScore || '80', 10);
  const currentScore = report.summary.teamHealthScore;
  
  console.log(chalk.bold(`\n[GUARD] MODO CI/CD ACTIVADO`));
  console.log(`Evaluando Team Health Score. Requerido: ${minScore} | Actual: ${currentScore}\n`);

  if (currentScore < minScore) {
    console.log(chalk.red.bold(`[FAIL] FALLO DE INTEGRACIÓN: El Team Health Score (${currentScore}) es inferior al mínimo requerido (${minScore}).`));
    console.log(chalk.red(`Por favor, resuelve los siguientes problemas antes de integrar:`));
    
    report.summary.healthIssues.forEach((issue: string) => {
      console.log(chalk.red(`  - ${issue}`));
    });
    
    process.exit(1);
  } else {
    console.log(chalk.green.bold(`[PASS] INTEGRACIÓN APROBADA: El flujo de trabajo del equipo cumple con los estándares de salud.`));
  }
}
