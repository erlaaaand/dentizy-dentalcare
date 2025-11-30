// backend/src/treatments/applications/mappers/treatment-category.mapper.ts
import { Injectable } from '@nestjs/common';

export interface TreatmentCategoryDto {
    id: number;
    namaKategori: string;
    kodeKategori?: string;
}

@Injectable()
export class TreatmentCategoryMapper {
    toDto(category: any): TreatmentCategoryDto {
        return {
            id: category.id,
            namaKategori: category.namaKategori,
            kodeKategori: category.kodeKategori,
        };
    }
}