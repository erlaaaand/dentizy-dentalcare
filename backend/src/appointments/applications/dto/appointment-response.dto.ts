import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../../domains/entities/appointment.entity';

// --- SUB-DTOs (Objek Kecil untuk Relasi) ---
// Didefinisikan terpisah agar rapi dan bisa dipakai ulang

class AppointmentPatientDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Budi Santoso' })
    nama_lengkap: string;

    @ApiProperty({ example: 'RM-123456' })
    nomor_rekam_medis: string;

    // [BARU] Tambahkan NIK untuk verifikasi
    @ApiPropertyOptional({ example: '3201123456789001' })
    nik?: string;

    // [BARU] Tambahkan status aktif untuk indikator
    @ApiPropertyOptional({ example: false })
    is_active?: boolean;

    @ApiPropertyOptional({ example: 'budi@example.com' })
    email?: string;

    @ApiPropertyOptional({ example: '08123456789' })
    nomor_telepon?: string;
}

class AppointmentDoctorDto {
    @ApiProperty({ example: 101 })
    id: number;

    @ApiProperty({ example: 'dr. Tirta' })
    nama_lengkap: string;

    @ApiPropertyOptional({ example: ['dokter_umum', 'admin'] })
    roles?: string[];
}

class AppointmentMedicalRecordDto {
    @ApiProperty({ example: 50 })
    id: number;

    @ApiProperty({ example: 1 })
    appointment_id: number;

    // Menggunakan format SOAP sesuai type definition Anda sebelumnya
    @ApiPropertyOptional({ description: 'Subjective (Keluhan Pasien)', example: 'Sakit kepala berdenyut' })
    subjektif: string | null;

    @ApiPropertyOptional({ description: 'Objective (Pemeriksaan Fisik)', example: 'Tensi 120/80' })
    objektif: string | null;

    @ApiPropertyOptional({ description: 'Assessment (Diagnosa)', example: 'Migrain' })
    assessment: string | null;

    @ApiPropertyOptional({ description: 'Plan (Rencana Pengobatan)', example: 'Paracetamol 3x1' })
    plan: string | null;

    @ApiProperty({ type: Date })
    created_at: Date;

    @ApiProperty({ type: Date })
    updated_at: Date;
}

// --- MAIN DTO ---

/**
 * Response DTO untuk Appointment
 */
export class AppointmentResponseDto {
    @ApiProperty({ description: 'ID unik appointment', example: 1 })
    id: number;

    @ApiProperty({ description: 'ID Pasien', example: 1 })
    patient_id: number;

    @ApiProperty({ description: 'ID Dokter', example: 2 })
    doctor_id: number;

    @ApiProperty({
        description: 'Status appointment saat ini',
        enum: AppointmentStatus,
        example: AppointmentStatus.DIJADWALKAN
    })
    status: AppointmentStatus;

    @ApiProperty({ description: 'Tanggal kunjungan', example: '2024-11-20', type: Date })
    tanggal_janji: Date;

    @ApiProperty({ description: 'Jam kunjungan', example: '09:00:00' })
    jam_janji: string;

    @ApiPropertyOptional({ description: 'Keluhan awal saat mendaftar', example: 'Sakit gigi berlubang' })
    keluhan?: string;

    @ApiProperty({ type: Date })
    created_at: Date;

    @ApiProperty({ type: Date })
    updated_at: Date;

    // --- RELATIONS ---
    // Sekarang kita cukup memanggil Class yang sudah dibuat di atas

    @ApiPropertyOptional({ type: AppointmentPatientDto })
    patient?: AppointmentPatientDto | null;

    @ApiPropertyOptional({ type: AppointmentDoctorDto })
    doctor?: AppointmentDoctorDto;

    @ApiPropertyOptional({ type: AppointmentMedicalRecordDto })
    medical_record?: AppointmentMedicalRecordDto;
}

/**
 * Paginated response untuk list appointments
 */
export class PaginatedAppointmentResponseDto {
    // isArray: true memberitahu swagger bahwa ini adalah list
    @ApiProperty({ type: [AppointmentResponseDto] })
    data: AppointmentResponseDto[];

    @ApiProperty({ description: 'Total data keseluruhan', example: 100 })
    count: number;

    @ApiProperty({ description: 'Halaman saat ini', example: 1 })
    page: number;

    @ApiProperty({ description: 'Jumlah data per halaman', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Total halaman tersedia', example: 10 })
    totalPages: number;
}