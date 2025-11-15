/**
 * Domain Event: Medical Record Updated
 * Triggered when a medical record is updated
 */
export class MedicalRecordUpdatedEvent {
    constructor(
        public readonly medicalRecordId: number,
        public readonly appointmentId: number,
        public readonly patientId: number,
        public readonly doctorId: number,
        public readonly updatedBy: number,
        public readonly timestamp: Date = new Date(),
        public readonly changes?: {
            subjektif?: { old: string; new: string };
            objektif?: { old: string; new: string };
            assessment?: { old: string; new: string };
            plan?: { old: string; new: string };
        },
        public readonly metadata?: {
            fieldsUpdated: string[];
            isNowComplete: boolean;
            wasComplete: boolean;
        }
    ) { }

    /**
     * Get event name for logging/routing
     */
    static get eventName(): string {
        return 'medical_record.updated';
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
            eventName: MedicalRecordUpdatedEvent.eventName,
            eventVersion: MedicalRecordUpdatedEvent.eventVersion,
            medicalRecordId: this.medicalRecordId,
            appointmentId: this.appointmentId,
            patientId: this.patientId,
            doctorId: this.doctorId,
            updatedBy: this.updatedBy,
            timestamp: this.timestamp.toISOString(),
            changes: this.changes,
            metadata: this.metadata,
        };
    }

    /**
     * Create event from JSON
     */
    static fromJSON(json: Record<string, any>): MedicalRecordUpdatedEvent {
        return new MedicalRecordUpdatedEvent(
            json.medicalRecordId,
            json.appointmentId,
            json.patientId,
            json.doctorId,
            json.updatedBy,
            new Date(json.timestamp),
            json.changes,
            json.metadata
        );
    }

    /**
     * Get human-readable description
     */
    getDescription(): string {
        const fieldsUpdated = this.metadata?.fieldsUpdated?.join(', ') || 'unknown fields';
        return `Medical record #${this.medicalRecordId} updated by user #${this.updatedBy}. Updated fields: ${fieldsUpdated}`;
    }

    /**
     * Check if specific field was updated
     */
    wasFieldUpdated(fieldName: string): boolean {
        return this.metadata?.fieldsUpdated?.includes(fieldName) || false;
    }

    /**
     * Get count of updated fields
     */
    getUpdatedFieldsCount(): number {
        return this.metadata?.fieldsUpdated?.length || 0;
    }
}