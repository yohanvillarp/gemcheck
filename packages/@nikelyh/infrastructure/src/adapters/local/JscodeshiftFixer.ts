import * as path from 'path';
import { execSync } from 'child_process';
import * as fs from 'fs';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FixOptions {
  dryRun?: boolean;
  patch?: boolean;
}

export class JscodeshiftFixer {
  private readonly transformsDir: string;

  constructor() {
    this.transformsDir = path.join(__dirname, 'transforms');
  }

  public fix(rule: string, targetPath: string, options: FixOptions = {}): string | null {
    const transformFile = path.join(this.transformsDir, `${rule}.js`); // Will be compiled to .js
    
    // We expect the typescript transform to be compiled to JS during the build.
    // Wait, let's use the .ts transform using jscodeshift's built-in tsx parser if we call it via CLI.
    // Actually, jscodeshift needs to be run using its CLI bin.
    
    const tsTransformFile = path.join(this.transformsDir, `${rule}.ts`);
    const jsTransformFile = path.join(this.transformsDir, `${rule}.js`);
    
    const scriptToRun = fs.existsSync(jsTransformFile) ? jsTransformFile : tsTransformFile;

    if (!fs.existsSync(scriptToRun)) {
      throw new Error(`Transform rule '${rule}' not found at ${scriptToRun}`);
    }

    const jscodeshiftBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'jscodeshift');
    const runnerCommand = fs.existsSync(jscodeshiftBin) ? jscodeshiftBin : 'npx jscodeshift';

    let cmd = `${runnerCommand} -t "${scriptToRun}" "${targetPath}" --parser=tsx`;

    if (options.dryRun || options.patch) {
      cmd += ` -d -p`;
    }

    try {
      const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
      return output;
    } catch (err: any) {
      throw new Error(`Error running jscodeshift: ${err.message}\n${err.stdout}`);
    }
  }
}
