import { AuditResult } from '../entities/AuditResult.js';

export interface IReporter {
  report(result: AuditResult): Promise<void>;
}
