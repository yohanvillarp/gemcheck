import chalk from 'chalk';
import ora from 'ora';
import { AnalyzeComplexityUseCase } from '@nikelyh/gemcheck-application';
import { AstComplexityAnalyzer } from '@nikelyh/gemcheck-infrastructure';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { startDashboardServer } from '../server/dashboardServer.js';
import { ComplexityReport } from '@nikelyh/gemcheck-domain';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ComplexityCommandOptions {
  project: string;
  ui?: boolean;
}

export async function complexityCommand(options: ComplexityCommandOptions): Promise<void> {
  const analyzer = new AstComplexityAnalyzer();
  const useCase = new AnalyzeComplexityUseCase(analyzer);
    
  console.log(chalk.cyan('➤ Iniciando análisis de complejidad ciclomática...'));
  const spinner = ora('Analizando funciones...').start();

  try {
    const result = await useCase.execute({ projectPath: options.project });
    spinner.succeed(chalk.green('[OK] Análisis completado con éxito!'));
    
    printComplexityResult(result);
    saveComplexityReport(result);

    if (options.ui) {
      const dashboardPath = path.resolve(__dirname, '../ui');
      startDashboardServer(dashboardPath, result.projectId, 'complexity');
    }
  } catch (error: unknown) {
    spinner.fail(chalk.red('[ERROR] El análisis ha fallado'));
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function printComplexityResult(result: ComplexityReport): void {
  console.log(chalk.blue(`\nProyecto: ${result.projectId}`));
  console.log(chalk.blue(`Funciones analizadas: ${result.totalFunctions}`));
  console.log(chalk.blue(`Complejidad Promedio: ${result.averageComplexity.toFixed(2)}`));
  
  if (result.highestComplexityFunction) {
    console.log(chalk.yellow(`\n[ALERTA] Función más compleja:`));
    console.log(chalk.yellow(`- Nombre: ${result.highestComplexityFunction.name}`));
    console.log(chalk.yellow(`- Archivo: ${result.highestComplexityFunction.filePath}`));
    console.log(chalk.red(`- Complejidad: ${result.highestComplexityFunction.complexity} (Recomendado: < 10)`));
  }
}

function saveComplexityReport(result: ComplexityReport): void {
  const reportsDir = path.join(process.cwd(), 'reports');
  const reportPath = path.join(reportsDir, 'complexity-report.json');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
}
