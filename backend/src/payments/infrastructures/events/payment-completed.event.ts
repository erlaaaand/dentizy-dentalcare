// backend/src/payments/domains/events/payment-completed.event.ts
export class PaymentCompletedEvent {
  constructor(
    public readonly paymentId: number,
    public readonly medicalRecordId: number,
    public readonly patientId: number,
    public readonly nomorInvoice: string,
    public readonly totalAkhir: number,
    public readonly completedAt: Date,
  ) {}
}
