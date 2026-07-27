export declare class AuditResult {
    projectName: string;
    metrics: Metrics;
    timestamp: Date;
    constructor(projectName: string, metrics: Metrics, timestamp: Date);
}
export interface Metrics {
    tdr: number;
    mcCabe: number[];
    maintainabilityIndex: number;
    duplications: number;
}
