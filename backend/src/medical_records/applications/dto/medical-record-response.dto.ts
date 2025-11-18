import { AppointmentStatus } from '../../../appointments/domains/entities/appointment.entity';

export class MedicalRecordResponseDto {
    id: number;
    appointment_id: number;
    doctor_id: number;
    patient_id: number;
    subjektif: string | null;
    objektif: string | null;
    assessment: string | null;
    plan: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    umur_rekam: number;

    // Relations
    appointment?: {
        id: number;
        appointment_date: Date;
        status: AppointmentStatus;
        patient?: {
            id: number;
            nama_lengkap: string;
            no_rm: string;
        } | null;
    } | null;

    doctor?: {
        id: number;
        name: string;
    } | null;

    patient?: {
        id: number;
        nama_lengkap: string;
        no_rm: string;
        tanggal_lahir: Date;
    } | null;
}