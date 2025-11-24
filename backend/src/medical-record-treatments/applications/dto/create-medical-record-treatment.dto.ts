// backend/src/medical-record-treatments/interface/http/dto/create-medical-record-treatment.dto.ts
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMedicalRecordTreatmentDto {
    @IsInt()
    medicalRecordId: number;

    @IsInt()
    treatmentId: number;

    @IsInt()
    @Min(1)
    jumlah: number;

    @IsNumber()
    @Min(0)
    hargaSatuan: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    diskon?: number;

    @IsOptional()
    @IsString()
    keterangan?: string;
}





