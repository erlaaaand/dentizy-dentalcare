import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Expose } from 'class-transformer';

// Sub-DTO Sederhana
class PatientSubsetDto {
    @ApiProperty()
    @Expose()
    id: number;

    @ApiProperty()
    @Expose()
    nama_lengkap: string;

    @ApiProperty()
    @Expose()
    nomor_rekam_medis: string;
}

class MedicalRecordSubsetDto {
    @ApiProperty()
    @Expose()
    id: number;
    // Tambahkan field lain jika perlu
}

export class PaymentResponseDto {
    @ApiProperty({ description: 'ID Pembayaran' })
    id: number;

    @ApiProperty({ description: 'ID Rekam Medis' })
    medicalRecordId: number;

    @ApiProperty({ description: 'ID Pasien' })
    patientId: number;

    @ApiProperty({ description: 'Nomor Invoice' })
    nomorInvoice: string;

    @ApiProperty({ description: 'Tanggal Pembayaran' })
    tanggalPembayaran: Date;

    @ApiProperty({ description: 'Total Biaya' })
    totalBiaya: number;

    @ApiProperty({ description: 'Total Diskon' })
    diskonTotal: number;

    @ApiProperty({ description: 'Total Akhir' })
    totalAkhir: number;

    @ApiProperty({ description: 'Jumlah yang Dibayar' })
    jumlahBayar: number;

    @ApiProperty({ description: 'Kembalian' })
    kembalian: number;

    @ApiProperty({ description: 'Metode Pembayaran' })
    metodePembayaran: string;

    @ApiProperty({ description: 'Status Pembayaran' })
    statusPembayaran: string;

    @ApiPropertyOptional({ description: 'Keterangan' })
    keterangan?: string;

    @ApiPropertyOptional({ description: 'ID Pembuat' })
    createdBy?: number;

    @ApiProperty({ description: 'Tanggal Dibuat' })
    createdAt: Date;

    @ApiProperty({ description: 'Tanggal Diupdate' })
    updatedAt: Date;

    // [FIX] Tambahkan properti relasi ini
    @ApiPropertyOptional({ type: PatientSubsetDto })
    @Type(() => PatientSubsetDto)
    patient?: PatientSubsetDto;

    @ApiPropertyOptional({ type: MedicalRecordSubsetDto })
    @Type(() => MedicalRecordSubsetDto)
    medicalRecord?: MedicalRecordSubsetDto;

    constructor(partial: Partial<PaymentResponseDto>) {
        Object.assign(this, partial);
    }
}