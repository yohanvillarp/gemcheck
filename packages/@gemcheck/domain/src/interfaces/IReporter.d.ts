import { AuditResult } from '../entities/AuditResult';
export interface IReporter {
    report(result: AuditResult): Promise<void>;
}
