// backend/src/medical-record-treatments/interface/http/dto/query-medical-record-treatment.dto.ts
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMedicalRecordTreatmentDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    medicalRecordId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    treatmentId?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}