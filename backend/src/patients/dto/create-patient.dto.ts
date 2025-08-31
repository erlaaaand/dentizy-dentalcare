import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePatientDto {
    @IsNotEmpty()
    @IsString()
    nama_lengkap: string;

    @IsOptional() // NIK boleh kosong saat pertama kali daftar
    @IsString()
    nik: string;

    // nomor_rekam_medis tidak ada di sini karena akan di-generate otomatis oleh service.
}