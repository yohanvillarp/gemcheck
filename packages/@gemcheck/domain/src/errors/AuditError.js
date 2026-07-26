export class AuditError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuditError';
    }
}
