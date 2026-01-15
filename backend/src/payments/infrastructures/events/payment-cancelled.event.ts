// backend/src/payments/domains/events/payment-cancelled.event.ts
export class PaymentCancelledEvent {
  constructor(
    public readonly paymentId: string,
    public readonly medicalRecordId: string,
    public readonly nomorInvoice: string,
    public readonly totalAkhir: number,
    public readonly cancelledBy?: string,
  ) {}
}
