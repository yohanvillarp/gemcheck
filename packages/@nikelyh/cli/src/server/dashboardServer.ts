import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import open from 'open';
import express from 'express';
import { SqliteHistoryRepository, SqliteConfigRepository } from '@nikelyh/gemcheck-infrastructure';
import { GIT_ANALYZER_THRESHOLDS } from '@nikelyh/gemcheck-domain';
import { TriageUseCase, AutoFixUseCase } from '@nikelyh/gemcheck-application';
import { JscodeshiftFixer } from '@nikelyh/gemcheck-infrastructure';
import { exec } from 'child_process';

export function startDashboardServer(dashboardPath: string, projectName: string, mode?: 'git' | 'scan' | 'help' | 'config' | 'complexity') {
  const sqliteRepo = new SqliteHistoryRepository();
  const configRepo = new SqliteConfigRepository();
  const safeProjectName = path.basename(projectName);
  const dataJsonPath = path.join(process.cwd(), 'reports', `${safeProjectName}-audit.json`);
  
  if (!fs.existsSync(dashboardPath)) {
    console.warn(chalk.yellow('[WARN] No se encontró el dashboard. Debes hacer build en @nikelyh/gemcheck-dashboard primero.'));
    return;
  }

  const app = express();
  app.use(express.json());

  app.get('/api/history', async (req, res) => {
    try {
      const history = await sqliteRepo.getProjectHistory(projectName);
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching history' });
    }
  });

  app.get('/api/duplications', (req, res) => {
    try {
      const jscpdReportPath = path.join(process.cwd(), 'reports', 'jscpd-report.json');
      if (!fs.existsSync(jscpdReportPath)) {
        return res.status(404).json({ error: 'Reporte jscpd no encontrado' });
      }
      
      const reportContent = fs.readFileSync(jscpdReportPath, 'utf8');
      const report = JSON.parse(reportContent);
      
      const duplicates = Array.isArray(report.duplicates) ? report.duplicates : [];
      const topDuplicates = duplicates.sort((a: any, b: any) => (b.lines || 0) - (a.lines || 0)).slice(0, 50);

      res.json(topDuplicates);
    } catch (err) {
      console.error('[WARN] Error procesando /api/duplications:', err);
      res.status(500).json({ error: 'Error processing duplication details' });
    }
  });

  app.get('/api/git', (req, res) => {
    try {
      const gitReportPath = path.join(process.cwd(), 'reports', 'git-activity.json');
      if (!fs.existsSync(gitReportPath)) {
        return res.status(404).json({ error: 'Reporte Git no encontrado' });
      }
      const reportContent = fs.readFileSync(gitReportPath, 'utf8');
      res.type('json').send(reportContent);
    } catch (err) {
      res.status(500).json({ error: 'Error processing git details' });
    }
  });

  app.get('/api/complexity', (req, res) => {
    try {
      const compReportPath = path.join(process.cwd(), 'reports', 'complexity-report.json');
      if (!fs.existsSync(compReportPath)) {
        return res.status(404).json({ error: 'Reporte de complejidad no encontrado' });
      }
      const reportContent = fs.readFileSync(compReportPath, 'utf8');
      res.type('json').send(reportContent);
    } catch (err) {
      res.status(500).json({ error: 'Error processing complexity details' });
    }
  });

  app.get('/api/triage', async (req, res) => {
    try {
      if (!fs.existsSync(dataJsonPath)) {
        return res.status(404).json({ error: 'No data.json found. Run gemcheck scan first.' });
      }
      const gitReportPath = path.join(process.cwd(), 'reports', 'git-activity.json');
      if (!fs.existsSync(gitReportPath)) {
        return res.status(404).json({ error: 'Reporte de Git no encontrado. Ejecuta `gemcheck git` para habilitar el Triage Inteligente.' });
      }
      
      const auditData = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
      const gitReport = JSON.parse(fs.readFileSync(gitReportPath, 'utf8'));
      
      const config = await configRepo.getConfig();
      const activeConfig = config || { git: GIT_ANALYZER_THRESHOLDS, scan: {} };
      
      const triageUseCase = new TriageUseCase(activeConfig.git);
      const triageReport = triageUseCase.execute(auditData, gitReport);
      
      res.json(triageReport);
    } catch (err) {
      console.error('[WARN] Error en /api/triage:', err);
      res.status(500).json({ error: 'Error procesando el Triage Inteligente' });
    }
  });

  app.post('/api/fix', async (req, res) => {
    try {
      const { files, rule = 'var-to-let' } = req.body;
      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: 'Se requiere una lista de archivos.' });
      }

      const fixer = new JscodeshiftFixer();
      const useCase = new AutoFixUseCase(fixer);
      
      const absoluteFiles = files.map(f => path.resolve(process.cwd(), f));
      
      const results = await useCase.execute(rule, absoluteFiles);
      res.json({ results });
    } catch (err: any) {
      console.error('[WARN] Error en /api/fix:', err);
      res.status(500).json({ error: 'Error ejecutando el Auto-Fixer', details: err.message });
    }
  });

  app.post('/api/rescan', (req, res) => {
    try {
      // Ejecutamos el scan actualizando data.json
      exec('npx gemcheck scan', { cwd: process.cwd() }, (error, stdout, stderr) => {
        if (error) {
          console.error('[WARN] Error en rescan:', stderr);
          return res.status(500).json({ error: 'Error al re-escanear el proyecto' });
        }
        res.json({ success: true });
      });
    } catch (err: any) {
      console.error('[WARN] Error en /api/rescan:', err);
      res.status(500).json({ error: 'Error en servidor', details: err.message });
    }
  });

  app.get('/data.json', (req, res) => {
    if (!fs.existsSync(dataJsonPath)) {
      return res.status(404).json({ error: 'No data.json found. Run gemcheck scan first.' });
    }
    res.sendFile(dataJsonPath);
  });

  app.get('/api/config', async (req, res) => {
    try {
      const config = await configRepo.getConfig();
      const activeConfig = config || { git: GIT_ANALYZER_THRESHOLDS, scan: {} };
      res.json(activeConfig);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching config' });
    }
  });

  app.post('/api/config', async (req, res) => {
    try {
      await configRepo.saveConfig(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Error saving config' });
    }
  });

  app.post('/api/config/reset', async (req, res) => {
    try {
      await configRepo.resetConfig();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Error resetting config' });
    }
  });

  app.use(express.static(dashboardPath));
  
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(dashboardPath, 'index.html'));
  });

  const port = 3333;
  app.listen(port, () => {
    console.log(chalk.cyan(`\n[UI] Servidor del Dashboard iniciado en http://localhost:${port}`));
    console.log(chalk.cyan(`[UI] Abriendo navegador... (Presiona Ctrl+C para detener)`));
    const url = mode ? `http://localhost:${port}?mode=${mode}` : `http://localhost:${port}`;
    open(url);
  });
}
