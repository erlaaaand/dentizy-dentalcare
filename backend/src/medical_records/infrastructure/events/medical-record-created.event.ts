/**
 * Domain Event: Medical Record Created
 * Triggered when a new medical record is created
 */
export class MedicalRecordCreatedEvent {
    constructor(
        public readonly medicalRecordId: number,
        public readonly appointmentId: number,
        public readonly patientId: number,
        public readonly doctorId: number,
        public readonly createdBy: number,
        public readonly timestamp: Date = new Date(),
        public readonly metadata?: {
            hasSubjektif: boolean;
            hasObjektif: boolean;
            hasAssessment: boolean;
            hasPlan: boolean;
            isComplete: boolean;
        }
    ) { }

    /**
     * Get event name for logging/routing
     */
    static get eventName(): string {
        return 'medical_record.created';
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
            eventName: MedicalRecordCreatedEvent.eventName,
            eventVersion: MedicalRecordCreatedEvent.eventVersion,
            medicalRecordId: this.medicalRecordId,
            appointmentId: this.appointmentId,
            patientId: this.patientId,
            doctorId: this.doctorId,
            createdBy: this.createdBy,
            timestamp: this.timestamp.toISOString(),
            metadata: this.metadata,
        };
    }

    /**
     * Create event from JSON
     */
    static fromJSON(json: Record<string, any>): MedicalRecordCreatedEvent {
        return new MedicalRecordCreatedEvent(
            json.medicalRecordId,
            json.appointmentId,
            json.patientId,
            json.doctorId,
            json.createdBy,
            new Date(json.timestamp),
            json.metadata
        );
    }

    /**
     * Get human-readable description
     */
    getDescription(): string {
        return `Medical record #${this.medicalRecordId} created for patient #${this.patientId} by doctor #${this.doctorId}`;
    }
}