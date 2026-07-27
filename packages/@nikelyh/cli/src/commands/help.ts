import chalk from 'chalk';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { startDashboardServer } from '../server/dashboardServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function helpCommand(options: any) {
  if (options.ui) {
    const dashboardPath = path.resolve(__dirname, '../ui');
    console.log(chalk.cyan('➤ Lanzando Documentación Interactiva...'));
    startDashboardServer(dashboardPath, 'Documentación Gemcheck', 'help');
    return;
  }

  console.log(`
${chalk.bold.blue('gemcheck')} - Software Quality Audit Tool

${chalk.bold('Uso:')}
  $ gemcheck <comando> [opciones]

${chalk.bold('Comandos Principales:')}
  ${chalk.green('scan')}    Analiza el código fuente del proyecto buscando deuda técnica,
            duplicación de código y problemas de mantenibilidad.
  ${chalk.green('git')}     Analiza el historial evolutivo, identificando cuellos de
            botella (Bus Factor), hotspots y acoplamiento lógico.
  ${chalk.green('help')}    Muestra este manual de ayuda o lanza la interfaz web interactiva.

${chalk.bold('Opciones Globales:')}
  ${chalk.yellow('--ui')}                Lanza el dashboard visual interactivo en el navegador.
  ${chalk.yellow('--project <path>')}    Define la ruta del proyecto a analizar (por defecto: actual).

${chalk.bold('Modo CI/CD (Solo para el comando git):')}
  ${chalk.yellow('--ci')}                            Activa el modo guardián. No lanza UI y falla (exit 1) 
                                si no se cumple con la salud mínima.
  ${chalk.yellow('--min-health-score <number>')}     Define la nota mínima aceptable de salud de equipo
                                (por defecto: 80).

${chalk.bold('Ejemplos:')}
  $ gemcheck scan --ui
  $ gemcheck git --project ./mi-repo
  $ gemcheck git --ci --min-health-score 85
  $ gemcheck help --ui
`);
}
