import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.resolve(__dirname, '../../dashboard/dist');
const destination = path.resolve(__dirname, '../dist/ui');

try {
  if (fs.existsSync(source)) {
    // fs.cpSync requiere Node 16.7.0+
    fs.cpSync(source, destination, { recursive: true });
    console.log(`[Gemcheck Build] Dashboard UI empaquetado en ${destination}`);
  } else {
    console.warn(`[Gemcheck Build WARN] No se encontró la carpeta del dashboard en ${source}. Asegúrate de construir @gemcheck/dashboard primero.`);
  }
} catch (error) {
  console.error('[Gemcheck Build ERROR] Fallo al copiar la interfaz:', error);
  process.exit(1);
}
