import { Injectable } from '@nestjs/common';
import { MedicalRecord } from '../entities/medical-record.entity';
import { CreateMedicalRecordDto } from '../../applications/dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../../applications/dto/update-medical-record.dto';
import { MedicalRecordResponseDto } from '../../applications/dto/medical-record-response.dto';

@Injectable()
export class MedicalRecordMapper {
    /**
     * Map Entity to Response DTO
     */
    toResponseDto(entity: MedicalRecord): MedicalRecordResponseDto {
        const response = new MedicalRecordResponseDto();

        response.id = entity.id;
        response.appointment_id = entity.appointment_id;
        response.doctor_id = entity.doctor_id;
        response.patient_id = entity.patient_id;
        response.subjektif = entity.subjektif;
        response.objektif = entity.objektif;
        response.assessment = entity.assessment;
        response.plan = entity.plan;
        response.created_at = entity.created_at;
        response.updated_at = entity.updated_at;
        response.deleted_at = entity.deleted_at;
        response.umur_rekam = Math.floor(
            (new Date().getTime() - entity.created_at.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Map relations if loaded
        if (entity.appointment) {
            response.appointment = {
                id: entity.appointment.id,
                appointment_date: entity.appointment.tanggal_janji,
                status: entity.appointment.status,
                patient: entity.appointment.patient ? {
                    id: entity.appointment.patient.id,
                    nama_lengkap: entity.appointment.patient.nama_lengkap,
                    no_rm: entity.appointment.patient.nomor_rekam_medis,
                } : undefined,
            };
        }

        if (entity.doctor) {
            response.doctor = {
                id: entity.doctor.id,
                name: entity.doctor.nama_lengkap,
            };
        }

        if (entity.patient) {
            response.patient = {
                id: entity.patient.id,
                nama_lengkap: entity.patient.nama_lengkap,
                no_rm: entity.patient.nomor_rekam_medis,
                tanggal_lahir: entity.patient.tanggal_lahir,
            };
        }

        return response;
    }

    /**
     * Map array of entities to response DTOs
     */
    toResponseDtoArray(entities: MedicalRecord[]): MedicalRecordResponseDto[] {
        return entities.map(entity => this.toResponseDto(entity));
    }

    /**
     * Map CreateDto to Entity (for new creation)
     */
    toEntity(dto: CreateMedicalRecordDto, userId: number): Partial<MedicalRecord> {
        return {
            appointment_id: dto.appointment_id,
            doctor_id: userId,
            subjektif: dto.subjektif?.trim() || undefined,
            objektif: dto.objektif?.trim() || undefined,
            assessment: dto.assessment?.trim() || undefined,
            plan: dto.plan?.trim() || undefined,
        };
    }

    /**
     * Map UpdateDto to Entity (for updates)
     */
    toUpdateEntity(dto: UpdateMedicalRecordDto): Partial<MedicalRecord> {
        const updateData: Partial<MedicalRecord> = {};

        if (dto.subjektif !== undefined) {
            updateData.subjektif = dto.subjektif?.trim() || undefined;
        }
        if (dto.objektif !== undefined) {
            updateData.objektif = dto.objektif?.trim() || undefined;
        }
        if (dto.assessment !== undefined) {
            updateData.assessment = dto.assessment?.trim() || undefined;
        }
        if (dto.plan !== undefined) {
            updateData.plan = dto.plan?.trim() || undefined;
        }

        return updateData;
    }

    /**
     * Create minimal response (without relations)
     */
    toMinimalResponse(entity: MedicalRecord): Partial<MedicalRecordResponseDto> {
        return {
            id: entity.id,
            appointment_id: entity.appointment_id,
            subjektif: entity.subjektif,
            objektif: entity.objektif,
            assessment: entity.assessment,
            plan: entity.plan,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        };
    }
}