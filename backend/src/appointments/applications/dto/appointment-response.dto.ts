import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../../domains/entities/appointment.entity';

/**
 * Response DTO untuk Appointment
 */
export class AppointmentResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    patient_id: number;

    @ApiProperty({ example: 2 })
    doctor_id: number;

    @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.DIJADWALKAN })
    status: AppointmentStatus;

    @ApiProperty({ example: '2024-11-20', type: Date })
    tanggal_janji: Date;

    @ApiProperty({ example: '09:00:00' })
    jam_janji: string;

    @ApiPropertyOptional({ example: 'Sakit gigi berlubang' })
    keluhan?: string;

    @ApiProperty({ type: Date })
    created_at: Date;

    @ApiProperty({ type: Date })
    updated_at: Date;

    // Optional relations
    @ApiPropertyOptional({
        description: 'Patient information',
        type: 'object',
        properties: {
            id: { type: 'number' },
            nama_lengkap: { type: 'string' },
            nomor_rekam_medis: { type: 'string' },
            email: { type: 'string' },
            nomor_telepon: { type: 'string' },
        },
    })
    patient?: {
        id: number;
        nama_lengkap: string;
        nomor_rekam_medis: string;
        email?: string;
        nomor_telepon?: string;
    };

    @ApiPropertyOptional({
        description: 'Doctor information',
        type: 'object',
        properties: {
            id: { type: 'number' },
            nama_lengkap: { type: 'string' },
            email: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
        },
    })
    doctor?: {
        id: number;
        nama_lengkap: string;
        roles?: string[];
    };

    @ApiPropertyOptional({
        description: 'Medical record if exists',
        type: 'object',
        properties: {
            id: { type: 'number' },
            diagnosa: { type: 'string' },
            terapi: { type: 'string' },
        },
    })
    medical_record?: {
        id: number;
        appointment_id: number;
        subjektif: string | null;
        objektif: string | null;
        assessment: string | null;
        plan: string | null;
        created_at: Date;
        updated_at: Date;
        patient_id: number;
        doctor_id: number | null;
    };
}

/**
 * Paginated response untuk list appointments
 */
export class PaginatedAppointmentResponseDto {
    @ApiProperty({ type: [AppointmentResponseDto] })
    data: AppointmentResponseDto[];

    @ApiProperty({ example: 100 })
    count: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 10 })
    totalPages: number;
}