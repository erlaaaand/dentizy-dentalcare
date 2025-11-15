import { IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto {
    @IsOptional()
    @IsString()
    subjektif?: string;

    @IsOptional()
    @IsString()
    objektif?: string;

    @IsOptional()
    @IsString()
    assessment?: string;

    @IsOptional()
    @IsString()
    plan?: string;
}