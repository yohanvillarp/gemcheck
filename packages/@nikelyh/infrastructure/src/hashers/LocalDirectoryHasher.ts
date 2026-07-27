import { ISourceHasher } from '@nikelyh/gemcheck-domain';
// @ts-ignore
import { hashElement } from 'folder-hash';

export class LocalDirectoryHasher implements ISourceHasher {
  async hashDirectory(projectPath: string): Promise<string> {
    try {
      const options = {
        folders: { exclude: ['.*', 'node_modules', 'dist', 'build', 'reports'] },
        files: { include: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json'] }
      };

      const hash = await hashElement(projectPath, options);
      return hash.hash;
    } catch (error) {
      console.warn('[LocalDirectoryHasher] No se pudo calcular el hash del directorio:', error);
      return Date.now().toString(); // Fallback para que siempre re-analice si hay error
    }
  }
}
