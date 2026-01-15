// backend/src/payments/domains/events/payment-completed.event.ts
export class PaymentCompletedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly medicalRecordId: string,
    public readonly patientId: string,
    public readonly nomorInvoice: string,
    public readonly totalAkhir: number,
    public readonly completedAt: Date,
  ) {}
}
