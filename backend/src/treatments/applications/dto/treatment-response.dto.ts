// backend/src/treatments/interface/http/dto/treatment-response.dto.ts
export class TreatmentResponseDto {
    id: number;
    categoryId: number;
    kodePerawatan: string;
    namaPerawatan: string;
    deskripsi?: string;
    harga: number;
    durasiEstimasi?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: {
        id: number;
        namaKategori: string;
    };

    constructor(partial: Partial<TreatmentResponseDto>) {
        Object.assign(this, partial);
    }
}