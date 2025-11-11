import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SortField {
    NAMA_LENGKAP = 'nama_lengkap',
    NOMOR_REKAM_MEDIS = 'nomor_rekam_medis',
    TANGGAL_LAHIR = 'tanggal_lahir',
    CREATED_AT = 'created_at',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum JenisKelamin {
    L = 'L',
    P = 'P',
}

export class SearchPatientDto {
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Pencarian maksimal 255 karakter' })
    @Transform(({ value }) => {
        if (!value) return undefined;
        // Sanitize: remove dangerous characters
        return value
            .trim()
            .replace(/[<>'"]/g, '') // Remove potential XSS/SQL injection
            .substring(0, 255);
    })
    search?: string;

    // Pagination
    @IsOptional()
    @IsNumber({}, { message: 'Page harus berupa angka' })
    @Type(() => Number)
    @Min(1, { message: 'Page minimal 1' })
    page?: number = 1;

    @IsOptional()
    @IsNumber({}, { message: 'Limit harus berupa angka' })
    @Type(() => Number)
    @Min(1, { message: 'Limit minimal 1' })
    @Max(100, { message: 'Limit maksimal 100' })
    limit?: number = 10;

    // Sorting
    @IsOptional()
    @IsEnum(SortField, { message: 'Sort field tidak valid' })
    sortBy?: SortField;

    @IsOptional()
    @IsEnum(SortOrder, { message: 'Sort order harus asc atau desc' })
    sortOrder?: SortOrder = SortOrder.ASC;

    // Filters
    @IsOptional()
    @IsEnum(JenisKelamin, { message: 'Jenis kelamin harus L atau P' })
    jenis_kelamin?: JenisKelamin;

    @IsOptional()
    @IsNumber({}, { message: 'Umur minimal harus berupa angka' })
    @Type(() => Number)
    @Min(0, { message: 'Umur minimal tidak boleh negatif' })
    @Max(150, { message: 'Umur minimal maksimal 150' })
    umur_min?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Umur maksimal harus berupa angka' })
    @Type(() => Number)
    @Min(0, { message: 'Umur maksimal tidak boleh negatif' })
    @Max(150, { message: 'Umur maksimal maksimal 150' })
    umur_max?: number;

    @IsOptional()
    @IsDateString({}, { message: 'Format tanggal tidak valid (YYYY-MM-DD)' })
    tanggal_daftar_dari?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Format tanggal tidak valid (YYYY-MM-DD)' })
    tanggal_daftar_sampai?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Doctor ID harus berupa angka' })
    @Type(() => Number)
    @Min(1, { message: 'Doctor ID tidak valid' })
    doctor_id?: number;
}
