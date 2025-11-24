// backend/src/treatment-categories/interface/http/dto/create-treatment-category.dto.ts
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateTreatmentCategoryDto {
    @IsString()
    @MaxLength(100)
    namaKategori: string;

    @IsOptional()
    @IsString()
    deskripsi?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}