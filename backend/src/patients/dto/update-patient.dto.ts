import { 
    IsOptional, 
    IsString, 
    IsEmail,
    Length,
    Matches,
    IsEnum,
    IsDateString,
    MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePatientDto {
    @IsOptional()
    @IsString()
    @MaxLength(250)
    @Transform(({ value }) => value?.trim())
    nama_lengkap?: string;

    @IsOptional()
    @IsString()
    @Length(16, 16, { message: 'NIK harus 16 digit' })
    @Matches(/^\d{16}$/, { message: 'NIK harus berupa 16 digit angka' })
    nik?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Format email tidak valid' })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(\+62|62|0)[0-9]{9,13}$/, { 
        message: 'Format nomor HP tidak valid' 
    })
    no_hp?: string;

    @IsOptional()
    @IsDateString()
    tanggal_lahir?: string;

    @IsOptional()
    @IsEnum(['L', 'P'])
    jenis_kelamin?: 'L' | 'P';

    @IsOptional()
    @IsString()
    @MaxLength(500)
    alamat?: string;
}