import { AnalyzerConfig, AnalyzerResult, IAnalyzer, FileMetric } from '@gemcheck/domain';
import * as tsParser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import * as path from 'path';
import * as fs from 'fs';

export class LocalStaticAnalyzer implements IAnalyzer {
  async analyze(config: AnalyzerConfig): Promise<AnalyzerResult> {
    console.log(`Ejecutando Análisis Estático Local (ESLint) para ${config.projectPath}...`);

    const eslint = new ESLint({
      cwd: config.projectPath,
      overrideConfigFile: true,
      errorOnUnmatchedPattern: false,
      overrideConfig: [
        {
          ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/.vite/**', '**/coverage/**']
        },
        {
          files: ['**/*.ts', '**/*.js', '**/*.tsx', '**/*.jsx'],
          languageOptions: {
            parser: tsParser,
            parserOptions: {
              ecmaVersion: 'latest',
              sourceType: 'module',
              ecmaFeatures: {
                jsx: true
              }
            },
          },
          rules: {
            // Reglas de Complejidad y Mantenibilidad
            'complexity': ['warn', { max: 1 }], 
            'max-depth': ['warn', { max: 4 }],
            'max-lines': ['warn', { max: 300 }],
            'max-params': ['warn', { max: 4 }],
            'max-nested-callbacks': ['warn', { max: 3 }],
            
            // Reglas de Seguridad y Limpieza
            'no-eval': 'warn',
            'no-implied-eval': 'warn',
            'no-var': 'warn',
            'prefer-const': 'warn',
            'eqeqeq': ['warn', 'always'],
            'no-unused-vars': 'warn',
            'no-console': 'warn'
          },
        },
      ],
    });

    // Modificamos el target para incluir TSX/JSX
    const targetPath = config.sourceDir
      ? path.join(config.sourceDir, '**/*.{ts,js,tsx,jsx}').replace(/\\/g, '/')
      : '**/*.{ts,js,tsx,jsx}';

    const results = await eslint.lintFiles([targetPath]);
    const fileMetrics: FileMetric[] = [];

    for (const result of results) {
      let debtMinutes = 0;
      let codeSmells = 0;
      const complexity: number[] = [];

      for (const message of result.messages) {
        // Ignoramos warnings de parseo irrecuperables
        if (message.fatal) continue;

        codeSmells++;
        
        switch (message.ruleId) {
          case 'complexity':
            // Extraer la complejidad real reportada
            const match = message.message.match(/complexity of (\d+)/);
            if (match && match[1]) {
              const score = parseInt(match[1], 10);
              complexity.push(score);
              // +10 min de deuda por cada punto de exceso sobre 15 (umbral sano)
              if (score > 15) {
                debtMinutes += (score - 15) * 10;
              }
            }
            break;
          case 'max-depth':
            debtMinutes += 10;
            break;
          case 'max-lines':
            debtMinutes += 30;
            break;
          case 'max-params':
          case 'max-nested-callbacks':
            debtMinutes += 15;
            break;
          case 'no-eval':
          case 'no-implied-eval':
            debtMinutes += 60; // Penalización severa SQALE
            break;
          case 'no-var':
          case 'prefer-const':
            debtMinutes += 5;
            break;
          case 'eqeqeq':
          case 'no-unused-vars':
          case 'no-console':
            debtMinutes += 10;
            break;
          default:
            debtMinutes += 5; // Default para cualquier otra regla
            break;
        }
      }

      // Contar líneas de código reales
      let linesOfCode = 0;
      if (fs.existsSync(result.filePath)) {
        const fileContent = fs.readFileSync(result.filePath, 'utf-8');
        linesOfCode = fileContent.split('\n').filter(line => line.trim().length > 0).length;
      }

      // Evitar archivos vacíos en la métrica base si no tienen complejidad
      if (complexity.length === 0) {
        complexity.push(1);
      }

      fileMetrics.push({
        filePath: result.filePath,
        linesOfCode,
        codeSmells,
        debtMinutes,
        complexity
      });
    }

    return { fileMetrics };
  }
}
