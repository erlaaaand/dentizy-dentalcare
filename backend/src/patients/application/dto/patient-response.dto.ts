import { Expose, Type } from 'class-transformer';
import { Gender } from '../../domains/entities/patient.entity';

export class PatientResponseDto {
    @Expose()
    id: number;

    @Expose()
    nomor_rekam_medis: string;

    @Expose()
    nik: string;

    @Expose()
    nama_lengkap: string;

    @Expose()
    @Type(() => Date)
    tanggal_lahir: Date;

    @Expose()
    umur: number;

    @Expose()
    jenis_kelamin: Gender;

    @Expose()
    email: string;

    @Expose()
    no_hp: string;

    @Expose()
    alamat: string;

    @Expose()
    riwayat_alergi: string;

    @Expose()
    riwayat_penyakit: string;

    @Expose()
    catatan_khusus: string;

    @Expose()
    golongan_darah: string;

    @Expose()
    pekerjaan: string;

    @Expose()
    kontak_darurat_nama: string;

    @Expose()
    kontak_darurat_nomor: string;

    @Expose()
    kontak_darurat_relasi: string;

    @Expose()
    is_registered_online: boolean;

    @Expose()
    is_active: boolean;

    @Expose()
    is_new_patient: boolean;

    @Expose()
    @Type(() => Date)
    created_at: Date;

    @Expose()
    @Type(() => Date)
    updated_at: Date;
}