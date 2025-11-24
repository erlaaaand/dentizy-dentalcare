// backend/src/medical-record-treatments/infrastructures/events/medical-record-treatment-updated.event.ts
export class MedicalRecordTreatmentUpdatedEvent {
    constructor(
        public readonly medicalRecordTreatmentId: number,
        public readonly medicalRecordId: number,
        public readonly treatmentId: number,
        public readonly total: number,
        public readonly updatedAt: Date,
    ) { }
}