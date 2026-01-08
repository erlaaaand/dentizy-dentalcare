// backend/src/payments/domains/events/payment-created.event.ts
export class PaymentCreatedEvent {
  constructor(
    public readonly paymentId: number,
    public readonly medicalRecordId: number,
    public readonly patientId: number,
    public readonly nomorInvoice: string,
    public readonly totalAkhir: number,
    public readonly statusPembayaran: string,
    public readonly createdBy?: number,
  ) {}
}
