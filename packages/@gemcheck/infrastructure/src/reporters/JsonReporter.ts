import { IReporter, AuditResult } from '@gemcheck/domain';
import * as fs from 'fs';
import * as path from 'path';

export class JsonReporter implements IReporter {
  constructor(private outputDir: string = './reports') {}

  async report(result: AuditResult): Promise<void> {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const safeProjectName = path.basename(result.projectName);
    const filename = `${safeProjectName}-audit.json`;
    const filepath = path.join(this.outputDir, filename);

    const json = JSON.stringify(result, null, 2);
    fs.writeFileSync(filepath, json);

    console.log(`[INFO] Reporte guardado en: ${filepath}`);
  }
}
