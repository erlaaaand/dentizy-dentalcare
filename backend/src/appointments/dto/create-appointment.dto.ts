import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
    @IsNotEmpty()
    @IsNumber()
    patient_id: number;

    @IsNotEmpty()
    @IsNumber()
    doctor_id: number;

    @IsNotEmpty()
    @IsDateString() // Validasi bahwa input adalah string tanggal (contoh: "2025-09-15")
    tanggal_janji: string;

    @IsNotEmpty()
    @IsString() // Validasi jam, bisa lebih spesifik dengan Regex jika perlu
    jam_janji: string; // contoh: "09:00:00"

    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;
}