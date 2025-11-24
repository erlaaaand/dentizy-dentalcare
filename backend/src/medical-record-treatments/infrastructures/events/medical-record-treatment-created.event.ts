// backend/src/medical-record-treatments/infrastructures/events/medical-record-treatment-created.event.ts
export class MedicalRecordTreatmentCreatedEvent {
    constructor(
        public readonly medicalRecordTreatmentId: number,
        public readonly medicalRecordId: number,
        public readonly treatmentId: number,
        public readonly total: number,
        public readonly createdAt: Date,
    ) {}
}
