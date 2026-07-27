import { IAnalyzer, FileMetric } from '@nikelyh/gemcheck-domain';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execFileAsync = promisify(execFile);

export class JscpdAnalyzer implements IAnalyzer {
  async analyze(options: { projectPath: string }): Promise<{ fileMetrics: FileMetric[]; duplications: number }> {
    try {
      // Ejecutamos jscpd como proceso
      // Usamos execFile con npx para invocar jscpd de forma segura pasando parámetros como array
      const binName = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      await execFileAsync(binName, ['jscpd', options.projectPath, '--reporters', 'json', '--output', './reports', '--silent']);
      
      // jscpd genera un archivo jscpd-report.json en ./reports
      const reportPath = path.resolve(process.cwd(), 'reports', 'jscpd-report.json');
      const fs = await import('fs/promises');
      const reportContent = await fs.readFile(reportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      const dupPercent = report.statistics?.total?.percentage || 0;
      
      return {
        fileMetrics: [],
        duplications: dupPercent
      };
    } catch (error) {
      console.warn('[JscpdAnalyzer] Error analizando duplicación:', error);
      return {
        fileMetrics: [],
        duplications: 0
      };
    }
  }
}
