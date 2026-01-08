// backend/src/treatments/domains/events/treatment-updated.event.ts
export class TreatmentUpdatedEvent {
  constructor(
    public readonly treatmentId: number,
    public readonly changes: Partial<{
      kodePerawatan: string;
      namaPerawatan: string;
      categoryId: number;
      harga: number;
      durasiEstimasi: number;
      isActive: boolean;
    }>,
    public readonly updatedAt: Date,
  ) {}
}
