import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SearchPatientDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    search?: string; // Search by nama, NIK, or email

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 10;
}
