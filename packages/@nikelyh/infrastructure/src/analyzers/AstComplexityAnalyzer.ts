import { 
  IComplexityAnalyzer, 
  ComplexityReport, 
  AnalyzerConfig,
  FileComplexity,
  FunctionComplexity
} from '@nikelyh/gemcheck-domain';
import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';

import { COMPLEXITY_NODES } from '../utils/astConstants.js';

export class AstComplexityAnalyzer implements IComplexityAnalyzer {
  async analyze(config: AnalyzerConfig): Promise<ComplexityReport> {
    const sourceDir = config.sourceDir || '{src,packages,lib,app}';
    const absoluteProjectPath = path.resolve(config.projectPath);
    
    const filePaths = this.findFiles(absoluteProjectPath, sourceDir);

    const fileComplexities: FileComplexity[] = [];
    let totalFunctions = 0;
    let highestMaxComplexity = -1;
    let highestComplexityFile = '';
    let highestComplexityFunction: { name: string, complexity: number, filePath: string } | null = null;

    for (const filePath of filePaths) {
      const sourceFile = ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf-8'),
        ts.ScriptTarget.Latest,
        true
      );

      const functions: FunctionComplexity[] = [];
      let maxComplexity = 0;
      let sumComplexity = 0;

      const visit = (node: ts.Node) => {
        if (
          ts.isFunctionDeclaration(node) ||
          ts.isMethodDeclaration(node) ||
          ts.isArrowFunction(node) ||
          ts.isFunctionExpression(node)
        ) {
          const name = this.getFunctionName(node, sourceFile);
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          const complexity = this.calculateComplexity(node);

          functions.push({ name, complexity, line });
          
          sumComplexity += complexity;
          if (complexity > maxComplexity) maxComplexity = complexity;

          if (complexity > highestMaxComplexity) {
            highestMaxComplexity = complexity;
            highestComplexityFile = filePath;
            highestComplexityFunction = { name, complexity, filePath };
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      if (functions.length > 0) {
        const avg = sumComplexity / functions.length;
        totalFunctions += functions.length;
        
        fileComplexities.push({
          filePath: path.relative(absoluteProjectPath, filePath),
          functions,
          maxComplexity,
          averageComplexity: avg
        });
      }
    }

    const overallAvg = fileComplexities.length > 0
      ? fileComplexities.reduce((acc, curr) => acc + curr.averageComplexity, 0) / fileComplexities.length
      : 0;

    return {
      projectId: path.basename(absoluteProjectPath),
      files: fileComplexities,
      totalFunctions,
      averageComplexity: overallAvg,
      highestComplexityFile: highestComplexityFile ? path.relative(absoluteProjectPath, highestComplexityFile) : '',
      highestComplexityFunction: highestComplexityFunction ? {
        name: (highestComplexityFunction as any).name,
        complexity: (highestComplexityFunction as any).complexity,
        filePath: (highestComplexityFunction as any).filePath ? path.relative(absoluteProjectPath, (highestComplexityFunction as any).filePath) : ''
      } : null
    };
  }

  private findFiles(dir: string, sourceDir: string): string[] {
    const results: string[] = [];
    const searchDirs = sourceDir.replace(/[{}]/g, '').split(',');
    
    const walk = (currentPath: string) => {
      if (!fs.existsSync(currentPath)) return;
      const stat = fs.statSync(currentPath);
      if (stat.isDirectory()) {
        if (currentPath.includes('node_modules') || currentPath.includes('dist') || currentPath.includes('.git') || currentPath.includes('build')) return;
        fs.readdirSync(currentPath).forEach(file => {
          walk(path.join(currentPath, file));
        });
      } else if (stat.isFile()) {
        if (currentPath.match(/\.(ts|tsx|js|jsx)$/)) {
          results.push(currentPath);
        }
      }
    };

    if (sourceDir.startsWith('{') && sourceDir.endsWith('}')) {
      for (const d of searchDirs) {
        walk(path.join(dir, d.trim()));
      }
    } else {
      walk(path.join(dir, sourceDir));
    }
    
    if (results.length === 0) {
       fs.readdirSync(dir).forEach(file => {
         const p = path.join(dir, file);
         if (fs.existsSync(p) && fs.statSync(p).isDirectory() && !p.includes('node_modules') && !p.includes('dist') && !p.includes('.git')) {
            walk(p);
         }
       });
    }

    return results;
  }

  private getFunctionName(node: ts.Node, sourceFile: ts.SourceFile): string {
    if (ts.isFunctionDeclaration(node) && node.name) return node.name.getText(sourceFile);
    if (ts.isMethodDeclaration(node) && node.name) return node.name.getText(sourceFile);
    if (ts.isFunctionExpression(node) && node.name) return node.name.getText(sourceFile);
    
    if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
      return node.parent.name.getText(sourceFile);
    }
    if (ts.isPropertyAssignment(node.parent) && node.parent.name) {
       return node.parent.name.getText(sourceFile);
    }

    return 'anonymous';
  }

  private calculateComplexity(node: ts.Node): number {
    let complexity = 1;
    
    const visit = (n: ts.Node) => {
      if (n !== node && (
        ts.isFunctionDeclaration(n) ||
        ts.isMethodDeclaration(n) ||
        ts.isArrowFunction(n) ||
        ts.isFunctionExpression(n)
      )) {
        return; // No sumar la complejidad de funciones anidadas al padre
      }

      if (COMPLEXITY_NODES.has(n.kind)) {
        complexity++;
      }
      ts.forEachChild(n, visit);
    };

    ts.forEachChild(node, visit);
    return complexity;
  }
}
