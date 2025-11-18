import { IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto {
    @IsOptional()
    @IsString()
    subjektif?: string | null;

    @IsOptional()
    @IsString()
    objektif?: string | null;

    @IsOptional()
    @IsString()
    assessment?: string | null;

    @IsOptional()
    @IsString()
    plan?: string | null;
}