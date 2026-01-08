// backend/src/payments/domains/events/payment-cancelled.event.ts
export class PaymentCancelledEvent {
  constructor(
    public readonly paymentId: number,
    public readonly medicalRecordId: number,
    public readonly nomorInvoice: string,
    public readonly totalAkhir: number,
    public readonly cancelledBy?: number,
  ) {}
}
