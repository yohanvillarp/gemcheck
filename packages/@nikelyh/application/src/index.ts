export * from './services/AuditOrchestrator.js';
export * from './services/GitAnalyzerService.js';
export { DeduplicatingHistoryRepository } from './services/DeduplicatingHistoryRepository.js';
export { ScanAuditUseCase } from './use-cases/ScanAuditUseCase.js';
export { AnalyzeComplexityUseCase } from './use-cases/AnalyzeComplexityUseCase.js';
export { TriageUseCase } from './use-cases/TriageUseCase.js';
export { AutoFixUseCase, FixerAdapter } from './use-cases/AutoFixUseCase.js';
