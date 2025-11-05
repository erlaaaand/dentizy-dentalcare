import { 
    IsEmail, 
    IsNotEmpty, 
    IsOptional, 
    IsString, 
    Length, 
    Matches,
    IsEnum,
    IsDateString,
    MaxLength
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
    @IsNotEmpty({ message: 'Nama lengkap harus diisi' })
    @IsString()
    @MaxLength(250, { message: 'Nama lengkap maksimal 250 karakter' })
    @Transform(({ value }) => value?.trim())
    nama_lengkap: string;

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
        message: 'Format nomor HP tidak valid (contoh: 081234567890)' 
    })
    no_hp?: string;

    @IsOptional()
    @IsDateString()
    tanggal_lahir?: string;

    @IsOptional()
    @IsEnum(['L', 'P'], { message: 'Jenis kelamin harus L atau P' })
    jenis_kelamin?: 'L' | 'P';

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Alamat maksimal 500 karakter' })
    alamat?: string;
}