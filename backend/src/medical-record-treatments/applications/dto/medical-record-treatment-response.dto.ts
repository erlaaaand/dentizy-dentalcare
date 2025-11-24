// backend/src/medical-record-treatments/interface/http/dto/medical-record-treatment-response.dto.ts
export class MedicalRecordTreatmentResponseDto {
    id: number;
    medicalRecordId: number;
    treatmentId: number;
    jumlah: number;
    hargaSatuan: number;
    subtotal: number;
    diskon: number;
    total: number;
    keterangan?: string;
    createdAt: Date;
    updatedAt: Date;
    treatment?: {
        id: number;
        kodePerawatan: string;
        namaPerawatan: string;
        harga: number;
    };

    constructor(partial: Partial<MedicalRecordTreatmentResponseDto>) {
        Object.assign(this, partial);
    }
}