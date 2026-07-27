import { AuditResult } from '../entities/AuditResult.js';

export interface HistoryRecord {
  id: number;
  projectName: string;
  tdr: number;
  hashSignature: string;
  timestamp: string;
  dataJson: string; // The full AuditResult serialized
}

export interface IHistoryRepository {
  /**
   * Guarda un nuevo resultado de auditoría en el historial
   */
  saveAudit(result: AuditResult, hashSignature?: string): Promise<void>;

  /**
   * Obtiene el historial de auditorías de un proyecto específico
   * ordenado desde el más antiguo al más reciente
   */
  getProjectHistory(projectName: string): Promise<HistoryRecord[]>;
}
