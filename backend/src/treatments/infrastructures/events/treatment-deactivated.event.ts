// backend/src/treatments/domains/events/treatment-deactivated.event.ts
export class TreatmentDeactivatedEvent {
  constructor(
    public readonly treatmentId: number,
    public readonly kodePerawatan: string,
    public readonly deactivatedAt: Date,
  ) {}
}
