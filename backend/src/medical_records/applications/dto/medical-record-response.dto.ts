import { AppointmentStatus } from '../../../appointments/entities/appointment.entity';

export class MedicalRecordResponseDto {
    id: number;
    appointment_id: number;
    doctor_id: number;
    patient_id: number;
    subjektif: string;
    objektif: string;
    assessment: string;
    plan: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
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
        };
    };

    doctor?: {
        id: number;
        name: string;
    };

    patient?: {
        id: number;
        nama_lengkap: string;
        no_rm: string;
        tanggal_lahir: Date;
    };
}