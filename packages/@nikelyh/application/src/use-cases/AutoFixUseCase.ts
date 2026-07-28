import { AnalyzerResult } from '@nikelyh/gemcheck-domain';

export interface FixerAdapter {
  fix(rule: string, targetPath: string, options?: { dryRun?: boolean; patch?: boolean }): string | null;
}

export class AutoFixUseCase {
  constructor(private readonly fixerAdapter: FixerAdapter) {}

  public async execute(rule: string, targetFiles: string[], options: { dryRun?: boolean; patch?: boolean; confirm?: boolean } = {}): Promise<any[]> {
    const results = [];
    
    // Si la opción rule es 'var-to-let' o es dinámica.
    for (const file of targetFiles) {
      try {
        const output = this.fixerAdapter.fix(rule, file, { 
          dryRun: options.dryRun, 
          patch: options.patch 
        });
        
        results.push({
          file,
          success: true,
          output
        });
      } catch (err: any) {
        results.push({
          file,
          success: false,
          error: err.message
        });
      }
    }

    return results;
  }
}
