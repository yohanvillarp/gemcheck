import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import { JscodeshiftFixer } from '@nikelyh/gemcheck-infrastructure';
import { AutoFixUseCase } from '@nikelyh/gemcheck-application';

export async function runFix(ruleOrFile: string, options: { patch?: boolean; yes?: boolean }) {
  console.log(chalk.cyan(`➤ Iniciando Auto-Fixer de Gemcheck...`));

  const cwd = process.cwd();
  
  // Si no especifican regla, usamos var-to-let por defecto de momento
  let rule = 'var-to-let';
  let targetFiles: string[] = [];

  if (!ruleOrFile || ruleOrFile === 'var-to-let') {
    // Si queremos que aplique a todo el proyecto (src por defecto)
    // Para simplificar, buscaremos en src
    const srcDir = path.join(cwd, 'src');
    if (!fs.existsSync(srcDir)) {
      console.log(chalk.red(`[ERROR] No se encontró el directorio /src para escanear.`));
      return;
    }
    targetFiles = [srcDir]; 
  } else {
    // Si pasaron una ruta específica
    targetFiles = [path.resolve(cwd, ruleOrFile)];
  }

  if (!options.yes) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const actionText = options.patch ? 'generar un parche (.patch)' : 'sobreescribir los archivos';
    
    await new Promise<void>((resolve) => {
      rl.question(chalk.yellow(`¿Estás seguro que deseas aplicar el fix '${rule}' y ${actionText}? (Y/n): `), (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'n') {
          console.log(chalk.gray('Abortado.'));
          process.exit(0);
        }
        resolve();
      });
    });
  }

  const fixer = new JscodeshiftFixer();
  const useCase = new AutoFixUseCase(fixer);

  const results = await useCase.execute(rule, targetFiles, {
    patch: options.patch
  });

  console.log(chalk.green(`\n✔ [OK] Proceso completado!`));
  results.forEach(res => {
    if (res.success) {
      console.log(chalk.green(`  [ÉXITO] ${res.file}`));
      if (options.patch && res.output) {
        // En caso de parche, mostrar o guardarlo. 
        // jscodeshift -p lo imprime a stdout, así que output lo contiene.
        console.log(chalk.gray(res.output));
      }
    } else {
      console.log(chalk.red(`  [ERROR] ${res.file}`));
      console.log(chalk.red(`    ${res.error}`));
    }
  });
}
