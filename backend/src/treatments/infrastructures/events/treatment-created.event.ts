// backend/src/treatments/domains/events/treatment-created.event.ts
export class TreatmentCreatedEvent {
    constructor(
        public readonly treatmentId: number,
        public readonly kodePerawatan: string,
        public readonly namaPerawatan: string,
        public readonly categoryId: number,
        public readonly harga: number,
        public readonly createdAt: Date,
    ) { }
}