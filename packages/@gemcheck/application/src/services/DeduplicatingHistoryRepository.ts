import { IHistoryRepository, HistoryRecord, AuditResult } from '@gemcheck/domain';
import * as crypto from 'crypto';

export class DeduplicatingHistoryRepository implements IHistoryRepository {
  constructor(private innerRepository: IHistoryRepository) {}

  async saveAudit(result: AuditResult): Promise<void> {
    // 1. Calcular el hash del reporte (ignorando la fecha)
    const hash = this.calculateHash(result);
    
    // 2. Obtener el último escaneo de la base de datos
    const history = await this.innerRepository.getProjectHistory(result.projectName);
    const lastRecord = history.length > 0 ? history[history.length - 1] : null;

    // 3. Comparar hashes
    if (lastRecord && lastRecord.hashSignature === hash) {
      console.log('✅ [Deduplicator] No hay cambios en el código desde el último escaneo. Ignorando inserción.');
      return; // Comportamiento 1: Ignorar por completo
    }

    // 4. Si hay cambios o es el primero, delegar al repositorio interno
    // Pasamos el hash para que lo guarde. (Nota: saveAudit en IHistoryRepository no toma hash como parámetro oficial
    // pero podemos hacer un cast o guardarlo en el result temporalmente).
    // Como IHistoryRepository.saveAudit(result) no acepta 2 parámetros en la firma base, 
    // lo pasaremos directamente si usamos una interfaz extendida, pero lo ideal es guardarlo a través del inner.
    // Hack limpio: el innerRepository es SqliteHistoryRepository que sí acepta 2 parámetros.
    if (typeof (this.innerRepository as any).saveAudit === 'function') {
      await (this.innerRepository as any).saveAudit(result, hash);
    } else {
      await this.innerRepository.saveAudit(result);
    }
  }

  async getProjectHistory(projectName: string): Promise<HistoryRecord[]> {
    return this.innerRepository.getProjectHistory(projectName);
  }

  private calculateHash(result: AuditResult): string {
    // Creamos un objeto copia omitiendo el timestamp
    const dataToHash = {
      projectName: result.projectName,
      metrics: result.metrics,
      fileMetrics: result.fileMetrics
    };
    
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(dataToHash));
    return hash.digest('hex');
  }
}
