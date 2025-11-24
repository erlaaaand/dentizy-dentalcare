// backend/src/treatment-categories/interface/http/dto/treatment-category-response.dto.ts
export class TreatmentCategoryResponseDto {
    id: number;
    namaKategori: string;
    deskripsi?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<TreatmentCategoryResponseDto | null>) {
        Object.assign(this, partial);
    }
}