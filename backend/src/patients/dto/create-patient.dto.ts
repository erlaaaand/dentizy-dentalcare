import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    IsEnum,
    IsDateString,
    MaxLength,
    MinLength,
    IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../entities/patient.entity';

export class CreatePatientDto {
    @ApiProperty({ example: 'Dr. John Doe', description: 'Nama lengkap pasien' })
    @IsNotEmpty({ message: 'Nama lengkap harus diisi' })
    @IsString()
    @MinLength(3, { message: 'Nama lengkap minimal 3 karakter' })
    @MaxLength(250, { message: 'Nama lengkap maksimal 250 karakter' })
    @Transform(({ value }) => value?.trim())
    nama_lengkap: string;

    @ApiPropertyOptional({ example: '3201234567890123', description: 'NIK 16 digit' })
    @IsOptional()
    @IsString()
    @Length(16, 16, { message: 'NIK harus 16 digit' })
    @Matches(/^\d{16}$/, { message: 'NIK harus berupa 16 digit angka' })
    nik?: string;

    @ApiPropertyOptional({ example: 'john.doe@email.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Format email tidak valid' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @ApiPropertyOptional({ example: '081234567890' })
    @IsOptional()
    @IsString()
    @Matches(/^(\+62|62|0)[0-9]{9,13}$/, {
        message: 'Format nomor HP tidak valid (contoh: 081234567890)',
    })
    no_hp?: string;

    @ApiPropertyOptional({ example: '1990-01-15' })
    @IsOptional()
    @IsDateString({}, { message: 'Format tanggal tidak valid (YYYY-MM-DD)' })
    tanggal_lahir?: string;

    @ApiPropertyOptional({ enum: Gender })
    @IsOptional()
    @IsEnum(Gender, { message: 'Jenis kelamin harus L atau P' })
    jenis_kelamin?: Gender;

    @ApiPropertyOptional({ example: 'Jl. Sudirman No. 123' })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Alamat maksimal 500 karakter' })
    alamat?: string;

    @ApiPropertyOptional({ example: 'Alergi penisilin' })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Riwayat alergi maksimal 1000 karakter' })
    riwayat_alergi?: string;

    @ApiPropertyOptional({ example: 'Diabetes, Hipertensi' })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Riwayat penyakit maksimal 1000 karakter' })
    riwayat_penyakit?: string;

    @ApiPropertyOptional({ example: 'Pasien takut jarum' })
    @IsOptional()
    @IsString()
    @MaxLength(1000, { message: 'Catatan khusus maksimal 1000 karakter' })
    catatan_khusus?: string;
}