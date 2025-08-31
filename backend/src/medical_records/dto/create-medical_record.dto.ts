import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
    @IsNotEmpty()
    @IsNumber()
    appointment_id: number;

    @IsNotEmpty()
    @IsNumber()
    user_id_staff: number; // ID staf/dokter yang mencatat

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