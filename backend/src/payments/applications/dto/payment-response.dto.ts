// backend/src/payments/interface/http/dto/payment-response.dto.ts
export class PaymentResponseDto {
    id: number;
    medicalRecordId: number;
    patientId: number;
    nomorInvoice: string;
    tanggalPembayaran: Date;
    totalBiaya: number;
    diskonTotal: number;
    totalAkhir: number;
    jumlahBayar: number;
    kembalian: number;
    metodePembayaran: string;
    statusPembayaran: string;
    keterangan?: string;
    createdBy?: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<PaymentResponseDto>) {
        Object.assign(this, partial);
    }
}