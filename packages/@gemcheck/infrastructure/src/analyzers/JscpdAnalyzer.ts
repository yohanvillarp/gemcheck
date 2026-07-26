import { IAnalyzer, FileMetric } from '@gemcheck/domain';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export class JscpdAnalyzer implements IAnalyzer {
  async analyze(options: { projectPath: string }): Promise<{ fileMetrics: FileMetric[]; duplications: number }> {
    try {
      // Ejecutamos jscpd como proceso
      // Usamos el binario local instalado en node_modules
      const jscpdBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'jscpd');
      const command = `npx jscpd "${options.projectPath}" --reporters json --output ./reports --silent`;
      
      await execAsync(command);
      
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
