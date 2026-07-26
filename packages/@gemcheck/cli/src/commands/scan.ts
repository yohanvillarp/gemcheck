import chalk from 'chalk';
import ora from 'ora';
import { AuditOrchestrator, DeduplicatingHistoryRepository } from '@gemcheck/application';
import { LocalStaticAnalyzer, JsonReporter, SqliteHistoryRepository, JscpdAnalyzer, LocalDirectoryHasher } from '@gemcheck/infrastructure';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { startDashboardServer } from '../server/dashboardServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function scanCommand(options: any) {
  const sqliteRepo = new SqliteHistoryRepository();
  const orchestrator = new AuditOrchestrator(
    [new LocalStaticAnalyzer(), new JscpdAnalyzer()],
    new JsonReporter('./reports'),
    sqliteRepo,
    new LocalDirectoryHasher()
  );
    
  console.log(chalk.cyan('➤ Iniciando análisis de gemcheck...'));
  const spinner = ora('Analizando...').start();

  try {
    spinner.text = 'Procesando...';
    const result = await orchestrator.runAudit(options.project);

    spinner.succeed(chalk.green('[OK] Análisis completado con éxito!'));
    console.log(chalk.blue(`\nProyecto: ${result.projectName}`));
    console.log(chalk.blue(`TDR: ${result.metrics.tdr}%`));
    console.log(chalk.blue('Reportes guardados en ./reports'));

    if (options.ui) {
      const dashboardPath = path.resolve(__dirname, '../../../dashboard/dist');
      startDashboardServer(dashboardPath, result.projectName, 'scan');
    }

  } catch (error: any) {
    spinner.fail(chalk.red('[ERROR] El análisis ha fallado'));
    console.error(error.message);
    process.exit(1);
  }
}
