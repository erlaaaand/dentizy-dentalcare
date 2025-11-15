import { AppointmentStatus } from "src/appointments/domains/entities/appointment.entity";

export class FindAllMedicalRecordQueryDto {
    patientId?: number;
    doctorId?: number;
    appointmentId?: number;
    search?: string;

    startDate?: Date;
    endDate?: Date;

    status?: AppointmentStatus;

    page?: number;
    limit?: number;

    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
