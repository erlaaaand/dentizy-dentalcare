/**
 * Domain Event: Medical Record Deleted
 * Triggered when a medical record is soft-deleted or hard-deleted
 */
export class MedicalRecordDeletedEvent {
    constructor(
        public readonly medicalRecordId: number,
        public readonly appointmentId: number,
        public readonly patientId: number,
        public readonly doctorId: number,
        public readonly deletedBy: number,
        public readonly timestamp: Date = new Date(),
        public readonly deletionType: 'soft' | 'hard' = 'soft',
        public readonly reason?: string,
        public readonly metadata?: {
            recordAge: number; // days since creation
            wasComplete: boolean;
            appointmentStatus: string;
        }
    ) { }

    /**
     * Get event name for logging/routing
     */
    static get eventName(): string {
        return 'medical_record.deleted';
    }

    /**
     * Get event version for event sourcing
     */
    static get eventVersion(): string {
        return '1.0.0';
    }

    /**
     * Serialize event to JSON
     */
    toJSON(): Record<string, any> {
        return {
            eventName: MedicalRecordDeletedEvent.eventName,
            eventVersion: MedicalRecordDeletedEvent.eventVersion,
            medicalRecordId: this.medicalRecordId,
            appointmentId: this.appointmentId,
            patientId: this.patientId,
            doctorId: this.doctorId,
            deletedBy: this.deletedBy,
            timestamp: this.timestamp.toISOString(),
            deletionType: this.deletionType,
            reason: this.reason,
            metadata: this.metadata,
        };
    }

    /**
     * Create event from JSON
     */
    static fromJSON(json: Record<string, any>): MedicalRecordDeletedEvent {
        return new MedicalRecordDeletedEvent(
            json.medicalRecordId,
            json.appointmentId,
            json.patientId,
            json.doctorId,
            json.deletedBy,
            new Date(json.timestamp),
            json.deletionType,
            json.reason,
            json.metadata
        );
    }

    /**
     * Get human-readable description
     */
    getDescription(): string {
        const type = this.deletionType === 'hard' ? 'permanently deleted' : 'deleted';
        const reasonPart = this.reason ? ` Reason: ${this.reason}` : '';
        return `Medical record #${this.medicalRecordId} ${type} by user #${this.deletedBy}.${reasonPart}`;
    }

    /**
     * Check if this is a permanent deletion
     */
    isPermanent(): boolean {
        return this.deletionType === 'hard';
    }

    /**
     * Check if record can be restored
     */
    isRestorable(): boolean {
        return this.deletionType === 'soft';
    }

    /**
     * Get severity level for logging
     */
    getSeverity(): 'info' | 'warning' | 'critical' {
        if (this.deletionType === 'hard') {
            return 'critical';
        }
        return this.metadata?.wasComplete ? 'warning' : 'info';
    }
}