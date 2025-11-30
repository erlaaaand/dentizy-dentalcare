// backend/src/treatments/domains/events/treatment-activated.event.ts
export class TreatmentActivatedEvent {
    constructor(
        public readonly treatmentId: number,
        public readonly kodePerawatan: string,
        public readonly activatedAt: Date,
    ) { }
}