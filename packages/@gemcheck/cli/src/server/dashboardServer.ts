import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import open from 'open';
import { SqliteHistoryRepository, SqliteConfigRepository } from '@gemcheck/infrastructure';
import { GIT_ANALYZER_THRESHOLDS } from '@gemcheck/domain';

export function startDashboardServer(dashboardPath: string, projectName: string, mode?: 'git' | 'scan' | 'help' | 'config') {
  const sqliteRepo = new SqliteHistoryRepository();
  const configRepo = new SqliteConfigRepository();
  const safeProjectName = path.basename(projectName);
  const dataJsonPath = path.join(process.cwd(), 'reports', `${safeProjectName}-audit.json`);
  
  if (!fs.existsSync(dashboardPath)) {
    console.warn(chalk.yellow('[WARN] No se encontró el dashboard. Debes hacer build en @gemcheck/dashboard primero.'));
    return;
  }

  const server = http.createServer(async (req, res) => {
    const url = req.url || '/';
    const pathname = url.split('?')[0];
    let filePath = dashboardPath + (pathname === '/' ? '/index.html' : pathname);
    
    // Endpoint para historial
    if (pathname === '/api/history') {
      try {
        const history = await sqliteRepo.getProjectHistory(projectName);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(history));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Error fetching history' }));
      }
      return;
    }

    // Endpoint para detalles de duplicación
    if (pathname === '/api/duplications') {
      try {
        const jscpdReportPath = path.join(process.cwd(), 'reports', 'jscpd-report.json');
        if (!fs.existsSync(jscpdReportPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Reporte jscpd no encontrado' }));
          return;
        }
        
        const reportContent = fs.readFileSync(jscpdReportPath, 'utf8');
        const report = JSON.parse(reportContent);
        
        const duplicates = Array.isArray(report.duplicates) ? report.duplicates : [];
        const sortedDuplicates = duplicates.sort((a: any, b: any) => (b.lines || 0) - (a.lines || 0));
        const topDuplicates = sortedDuplicates.slice(0, 50);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(topDuplicates));
      } catch (err) {
        console.error('[WARN] Error procesando /api/duplications:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Error processing duplication details' }));
      }
      return;
    }

    // Endpoint para Git
    if (pathname === '/api/git') {
      try {
        const gitReportPath = path.join(process.cwd(), 'reports', 'git-activity.json');
        if (!fs.existsSync(gitReportPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Reporte Git no encontrado' }));
          return;
        }
        const reportContent = fs.readFileSync(gitReportPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(reportContent);
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Error processing git details' }));
      }
      return;
    }

    // Servir el data.json
    if (pathname === '/data.json') {
      filePath = dataJsonPath;
    }

    // Endpoints de configuración
    if (pathname === '/api/config') {
      if (req.method === 'GET') {
        try {
          const config = await configRepo.getConfig();
          const activeConfig = config || { git: GIT_ANALYZER_THRESHOLDS, scan: {} };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(activeConfig));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Error fetching config' }));
        }
        return;
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const config = JSON.parse(body);
            await configRepo.saveConfig(config);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Error saving config' }));
          }
        });
        return;
      }
    }

    if (pathname === '/api/config/reset' && req.method === 'POST') {
      try {
        await configRepo.resetConfig();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Error resetting config' }));
      }
      return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (pathname === '/data.json') {
          // Si piden data.json pero no existe, devolver error claro
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'No data.json found. Run gemcheck scan first.' }));
        } else {
          res.writeHead(500);
          res.end('Error interno: ' + error.code + ' ..\n');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  const port = 3333;
  server.listen(port, () => {
    console.log(chalk.cyan(`\n[UI] Servidor del Dashboard iniciado en http://localhost:${port}`));
    console.log(chalk.cyan(`[UI] Abriendo navegador... (Presiona Ctrl+C para detener)`));
    const url = mode ? `http://localhost:${port}?mode=${mode}` : `http://localhost:${port}`;
    open(url);
  });
}
