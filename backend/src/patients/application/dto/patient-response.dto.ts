import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../domains/entities/patient.entity';

export class PatientResponseDto {
  @ApiProperty({ description: 'ID unik pasien', example: 101 })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nomor rekam medis pasien',
    example: 'RM-2025-0001',
  })
  @Expose()
  nomor_rekam_medis: string;

  @ApiProperty({
    description: 'Nomor Induk Kependudukan',
    example: '3201123456789001',
  })
  @Expose()
  nik: string;

  @ApiProperty({
    description: 'Nama lengkap pasien',
    example: 'Rina Ayu Lestari',
  })
  @Expose()
  nama_lengkap: string;

  @ApiProperty({
    description: 'Tanggal lahir pasien',
    example: '1998-05-12',
    type: String,
    format: 'date',
  })
  @Expose()
  @Type(() => Date)
  tanggal_lahir: Date;

  @ApiProperty({ description: 'Umur pasien dalam tahun', example: 27 })
  @Expose()
  umur: number;

  @ApiProperty({
    description: 'Jenis kelamin pasien',
    enum: Gender,
    example: Gender.FEMALE,
  })
  @Expose()
  jenis_kelamin: Gender;

  @ApiProperty({
    description: 'Email pasien',
    example: 'rina.lestari@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Nomor handphone pasien',
    example: '081234567890',
  })
  @Expose()
  no_hp: string;

  @ApiProperty({
    description: 'Alamat lengkap pasien',
    example: 'Jl. Merpati No. 12, Bandung',
  })
  @Expose()
  alamat: string;

  @ApiProperty({
    description: 'Riwayat alergi yang dimiliki pasien',
    example: 'Alergi obat penicillin',
  })
  @Expose()
  riwayat_alergi: string;

  @ApiProperty({
    description: 'Riwayat penyakit pasien',
    example: 'Asma sejak kecil',
  })
  @Expose()
  riwayat_penyakit: string;

  @ApiProperty({
    description: 'Catatan medis khusus yang perlu diperhatikan',
    example: 'Hipertensi ringan',
  })
  @Expose()
  catatan_khusus: string;

  @ApiProperty({ description: 'Golongan darah pasien', example: 'O+' })
  @Expose()
  golongan_darah: string;

  @ApiProperty({ description: 'Pekerjaan pasien', example: 'Guru SD' })
  @Expose()
  pekerjaan: string;

  @ApiProperty({ description: 'Nama kontak darurat', example: 'Andi Setiawan' })
  @Expose()
  kontak_darurat_nama: string;

  @ApiProperty({ description: 'Nomor kontak darurat', example: '081234567891' })
  @Expose()
  kontak_darurat_nomor: string;

  @ApiProperty({
    description: 'Relasi kontak darurat dengan pasien',
    example: 'Suami',
  })
  @Expose()
  kontak_darurat_relasi: string;

  @ApiProperty({
    description: 'Status apakah pasien terdaftar online',
    example: true,
  })
  @Expose()
  is_registered_online: boolean;

  @ApiProperty({ description: 'Status aktif pasien', example: true })
  @Expose()
  is_active: boolean;

  @ApiProperty({
    description: 'Menandakan apakah pasien baru pertama kali mendaftar',
    example: false,
  })
  @Expose()
  is_new_patient: boolean;

  @ApiProperty({
    description: 'Tanggal dibuatnya data pasien',
    example: '2025-01-20T10:30:00.000Z',
  })
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({
    description: 'Tanggal terakhir data pasien diperbarui',
    example: '2025-02-01T12:00:00.000Z',
  })
  @Expose()
  @Type(() => Date)
  updated_at: Date;
}

export interface PaginatedPatients {
  data: PatientResponseDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
