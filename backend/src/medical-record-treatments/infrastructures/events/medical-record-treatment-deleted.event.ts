// backend/src/medical-record-treatments/infrastructures/events/medical-record-treatment-deleted.event.ts
export class MedicalRecordTreatmentDeletedEvent {
  constructor(
    public readonly medicalRecordTreatmentId: number,
    public readonly medicalRecordId: number,
    public readonly deletedAt: Date,
  ) {}
}
