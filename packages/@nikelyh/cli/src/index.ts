import { program } from 'commander';
import chalk from 'chalk';
import { scanCommand } from './commands/scan.js';
import { gitCommand } from './commands/git.js';
import { helpCommand } from './commands/help.js';
import { configCommand } from './commands/config.js';

export default async function main() {
  program
    .name('gemcheck')
    .description('Software Quality Audit Tool')
    .version('0.1.0');

  program
    .command('scan')
    .description('Run audit')
    .option('--project <name>', 'Project path', process.cwd())
    .option('--ui', 'Launch visual dashboard', false)
    .action(scanCommand);

  program
    .command('git')
    .description('Run git evolutionary and risk analysis')
    .option('--project <name>', 'Project path', process.cwd())
    .option('--ui', 'Launch visual dashboard', false)
    .option('--ci', 'Run in CI/CD mode (blocks on failure)', false)
    .option('--min-health-score <number>', 'Minimum health score to pass CI', '80')
    .action(gitCommand);

  program
    .command('help')
    .description('Show gemcheck documentation')
    .option('--ui', 'Launch visual documentation dashboard', false)
    .action(helpCommand);

  program
    .command('config')
    .description('Manage global configuration')
    .option('--ui', 'Launch visual configuration dashboard', false)
    .action(configCommand);

  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});
