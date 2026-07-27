import chalk from 'chalk';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { startDashboardServer } from '../server/dashboardServer.js';
import { SqliteConfigRepository } from '@gemcheck/infrastructure';
import { GIT_ANALYZER_THRESHOLDS } from '@gemcheck/domain';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function configCommand(options: any) {
  if (options.ui) {
    const dashboardPath = path.resolve(__dirname, '../ui');
    // Using a placeholder projectName because the config UI is global, not project-specific.
    // DashboardServer currently expects a projectName to construct paths, but config doesn't need it.
    startDashboardServer(dashboardPath, 'global-config', 'config');
  } else {
    try {
      const configRepo = new SqliteConfigRepository();
      const globalConfig = await configRepo.getConfig();
      const activeConfig = globalConfig || { git: GIT_ANALYZER_THRESHOLDS, scan: {} };

      console.log(chalk.cyan.bold('\n⚙️ Configuración Global de Gemcheck:\n'));
      console.log(JSON.stringify(activeConfig, null, 2));
      console.log(chalk.gray(`\nTip: Para editar la configuración visualmente, utiliza: `) + chalk.white.bold(`gemcheck config --ui\n`));
    } catch (err) {
      console.error(chalk.red('Error leyendo la configuración:'), err);
    }
  }
}
