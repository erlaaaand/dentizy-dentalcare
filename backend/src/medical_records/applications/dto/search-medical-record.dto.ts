import { IsOptional, IsNumber, IsString, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../../../appointments/entities/appointment.entity';

export class SearchMedicalRecordDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    patient_id?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    doctor_id?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    appointment_id?: number;

    @IsOptional()
    @IsString()
    search?: string; // Search in SOAP fields

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @IsEnum(AppointmentStatus)
    appointment_status?: AppointmentStatus;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sort_by?: string = 'created_at';

    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sort_order?: 'ASC' | 'DESC' = 'DESC';
}