// backend/src/treatments/interface/http/dto/create-treatment.dto.ts
import { IsString, IsInt, IsOptional, IsBoolean, IsNumber, MaxLength, Min } from 'class-validator';

export class CreateTreatmentDto {
    @IsInt()
    categoryId: number;

    @IsString()
    @MaxLength(50)
    kodePerawatan: string;

    @IsString()
    @MaxLength(250)
    namaPerawatan: string;

    @IsOptional()
    @IsString()
    deskripsi?: string;

    @IsNumber()
    @Min(0)
    harga: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    durasiEstimasi?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}