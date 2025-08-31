import { IsOptional, IsString } from 'class-validator';

export class UpdatePatientDto {
    @IsOptional()
    @IsString()
    nama_lengkap?: string;

    @IsOptional()
    @IsString()
    nik?: string;
}