import { AnalyzerConfig, AnalyzerResult, IAnalyzer, FileMetric, FunctionComplexity } from '@nikelyh/gemcheck-domain';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

import { COMPLEXITY_NODES } from '../../utils/astConstants.js';

export class AstStructuralAnalyzer implements IAnalyzer {
  async analyze(config: AnalyzerConfig): Promise<AnalyzerResult> {
    console.log(`Ejecutando Análisis Estructural (AST) para ${config.projectPath}...`);

    const sourceDir = config.sourceDir || '{src,packages,lib,app,cli}';
    const absoluteProjectPath = path.resolve(config.projectPath);
    
    const filePaths = this.findFiles(absoluteProjectPath, sourceDir);
    const fileMetrics: FileMetric[] = [];

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) continue;
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      const sourceFile = ts.createSourceFile(
        filePath,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );

      const metrics = this.calculateStructuralMetrics(sourceFile, fileContent);
      
      fileMetrics.push({
        filePath: path.relative(absoluteProjectPath, filePath),
        linesOfCode: metrics.linesOfCode,
        codeSmells: metrics.codeSmells,
        debtMinutes: metrics.debtMinutes,
        complexity: metrics.complexities
      });
    }

    return { fileMetrics };
  }

  private calculateStructuralMetrics(sourceFile: ts.SourceFile, fileContent: string): { 
    linesOfCode: number, 
    codeSmells: number, 
    debtMinutes: number, 
    complexities: number[] 
  } {
    const state = { codeSmells: 0, debtMinutes: 0, complexities: [] as number[] };
    
    const linesOfCode = fileContent.split('\n').filter(line => line.trim().length > 0).length;
    if (linesOfCode > 500) {
      state.codeSmells++;
      state.debtMinutes += 30;
    }

    this.analyzeMetricsForNode(sourceFile, 0, 0, state);

    if (state.complexities.length === 0) {
      state.complexities.push(1);
    }

    return { linesOfCode, codeSmells: state.codeSmells, debtMinutes: state.debtMinutes, complexities: state.complexities };
  }

  private analyzeMetricsForNode(node: ts.Node, currentDepth: number, currentCallbackDepth: number, state: any): void {
    this.checkVarUsage(node, state);
    this.checkEvalUsage(node, state);
    
    const nextCallbackDepth = this.checkFunctionStats(node, currentCallbackDepth, state);
    const nextDepth = this.checkBlockDepth(node, currentDepth, state);

    ts.forEachChild(node, child => this.analyzeMetricsForNode(child, nextDepth, nextCallbackDepth, state));
  }

  private checkVarUsage(node: ts.Node, state: any): void {
    if (ts.isVariableDeclarationList(node) && (node.flags & ts.NodeFlags.BlockScoped) === 0) {
      state.codeSmells++;
      state.debtMinutes += 5;
    }
  }

  private checkEvalUsage(node: ts.Node, state: any): void {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'eval') {
      state.codeSmells++;
      state.debtMinutes += 60;
    }
  }

  private checkFunctionStats(node: ts.Node, currentCbDepth: number, state: any): number {
    let nextCbDepth = currentCbDepth;
    
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      const paramCount = node.parameters ? node.parameters.length : 0;
      if (paramCount > 4) {
        state.codeSmells++;
        state.debtMinutes += 15;
      }

      if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
        nextCbDepth++;
        if (nextCbDepth > 3) {
           state.codeSmells++;
           state.debtMinutes += 15;
        }
      }

      const complexity = this.calculateComplexity(node);
      state.complexities.push(complexity);
      if (complexity > 15) {
        state.codeSmells++;
        state.debtMinutes += (complexity - 15) * 10;
      }
    }
    return nextCbDepth;
  }

  private checkBlockDepth(node: ts.Node, currentDepth: number, state: any): number {
    let nextDepth = currentDepth;
    if (ts.isBlock(node) && !ts.isFunctionDeclaration(node.parent) && !ts.isMethodDeclaration(node.parent) && !ts.isArrowFunction(node.parent) && !ts.isFunctionExpression(node.parent)) {
      nextDepth++;
      if (nextDepth > 4) {
         state.codeSmells++;
         state.debtMinutes += 10;
      }
    }
    return nextDepth;
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
}
