import { exec } from 'child_process';
import * as util from 'util';
import * as path from 'path';

const execAsync = util.promisify(exec);

export class GitAdapter {
  public async isGitRepo(projectPath: string): Promise<boolean> {
    try {
      await execAsync('git rev-parse --is-inside-work-tree', { cwd: projectPath });
      return true;
    } catch {
      return false;
    }
  }

  public async getCurrentBranch(projectPath: string): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  public async getRecentCommits(projectPath: string, limit: number = 100): Promise<any[]> {
    try {
      // Formato: hash|author|date|message
      // --numstat da las lineas añadidas y borradas por archivo
      const command = `git log -n ${limit} --pretty=format:"%H|%an|%ad|%s" --date=short --numstat`;
      const { stdout } = await execAsync(command, { cwd: projectPath, maxBuffer: 1024 * 1024 * 10 });
      
      const commits: any[] = [];
      let currentCommit: any = null;

      const lines = stdout.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;

        if (line.includes('|') && line.split('|')[0].length >= 7) {
          // Nueva cabecera de commit (el hash al menos tiene 7 caracteres)
          const parts = line.split('|');
          if (parts.length >= 4) {
            currentCommit = {
              hash: parts[0],
              author: parts[1],
              date: parts[2],
              message: parts.slice(3).join('|'),
              addedLines: 0,
              deletedLines: 0,
              filesTouched: 0,
              files: [] // <-- Nuevo
            };
            commits.push(currentCommit);
          }
        } else if (currentCommit) {
          // Línea de numstat: added deleted filename
          const statParts = line.trim().split(/\s+/);
          if (statParts.length >= 3) {
            const added = parseInt(statParts[0], 10) || 0; // - para binarios
            const deleted = parseInt(statParts[1], 10) || 0;
            const fileName = statParts.slice(2).join(' '); // en caso de espacios
            
            if (!isNaN(added)) currentCommit.addedLines += added;
            if (!isNaN(deleted)) currentCommit.deletedLines += deleted;
            currentCommit.filesTouched += 1;
            
            currentCommit.files.push({
              name: fileName,
              addedLines: added,
              deletedLines: deleted
            });
          }
        }
      }

      return commits;
    } catch (error) {
      console.error('Error fetching git history:', error);
      return [];
    }
  }
}
