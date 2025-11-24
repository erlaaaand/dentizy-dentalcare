// backend/src/medical-record-treatments/applications/orchestrator/medical-record-treatments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MedicalRecordTreatmentRepository } from '../../../medical-record-treatments/infrastructures/persistence/repositories/medical-record-treatment.repository';
import { TreatmentRepository } from '../../../treatments/infrastructures/persistence/repositories/treatment.repository';
import { CreateMedicalRecordTreatmentDto } from '../dto/create-medical-record-treatment.dto';
import { UpdateMedicalRecordTreatmentDto } from '../dto/update-medical-record-treatment.dto';
import { QueryMedicalRecordTreatmentDto } from '../dto/query-medical-record-treatment.dto';
import { MedicalRecordTreatmentResponseDto } from '../dto/medical-record-treatment-response.dto';

@Injectable()
export class MedicalRecordTreatmentsService {
    constructor(
        private readonly medicalRecordTreatmentRepository: MedicalRecordTreatmentRepository,
        private readonly treatmentRepository: TreatmentRepository,
    ) { }

    async create(dto: CreateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatmentResponseDto> {
        // Validate treatment exists
        const treatmentExists = await this.treatmentRepository.exists(dto.treatmentId);
        if (!treatmentExists) {
            throw new NotFoundException(`Perawatan dengan ID ${dto.treatmentId} tidak ditemukan`);
        }

        try {
            const medicalRecordTreatment = await this.medicalRecordTreatmentRepository.create(dto);
            return this.mapToResponseDto(medicalRecordTreatment);
        } catch (error) {
            throw new BadRequestException('Gagal menambahkan perawatan ke rekam medis');
        }
    }

    async findAll(query: QueryMedicalRecordTreatmentDto) {
        const { data, total } = await this.medicalRecordTreatmentRepository.findAll(query);
        const { page = 1, limit = 10 } = query;

        return {
            data: data.map((item) => this.mapToResponseDto(item)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number): Promise<MedicalRecordTreatmentResponseDto> {
        const medicalRecordTreatment = await this.medicalRecordTreatmentRepository.findOne(id);

        if (!medicalRecordTreatment) {
            throw new NotFoundException(`Data perawatan rekam medis dengan ID ${id} tidak ditemukan`);
        }

        return this.mapToResponseDto(medicalRecordTreatment);
    }

    async findByMedicalRecordId(medicalRecordId: number): Promise<MedicalRecordTreatmentResponseDto[]> {
        const treatments = await this.medicalRecordTreatmentRepository.findByMedicalRecordId(medicalRecordId);
        return treatments.map((item) => this.mapToResponseDto(item));
    }

    async update(id: number, dto: UpdateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatmentResponseDto> {
        const exists = await this.medicalRecordTreatmentRepository.findOne(id);

        if (!exists) {
            throw new NotFoundException(`Data perawatan rekam medis dengan ID ${id} tidak ditemukan`);
        }

        // Validate treatment if provided
        if (dto.treatmentId) {
            const treatmentExists = await this.treatmentRepository.exists(dto.treatmentId);
            if (!treatmentExists) {
                throw new NotFoundException(`Perawatan dengan ID ${dto.treatmentId} tidak ditemukan`);
            }
        }

        try {
            const medicalRecordTreatment = await this.medicalRecordTreatmentRepository.update(id, dto);
            return this.mapToResponseDto(medicalRecordTreatment);
        } catch (error) {
            throw new BadRequestException('Gagal mengupdate perawatan rekam medis');
        }
    }

    async remove(id: number): Promise<void> {
        const exists = await this.medicalRecordTreatmentRepository.findOne(id);

        if (!exists) {
            throw new NotFoundException(`Data perawatan rekam medis dengan ID ${id} tidak ditemukan`);
        }

        await this.medicalRecordTreatmentRepository.softDelete(id);
    }

    async getTotalByMedicalRecordId(medicalRecordId: number): Promise<number> {
        return await this.medicalRecordTreatmentRepository.getTotalByMedicalRecordId(medicalRecordId);
    }

    private mapToResponseDto(mrt: any): MedicalRecordTreatmentResponseDto {
        return new MedicalRecordTreatmentResponseDto({
            ...mrt,
            treatment: mrt.treatment ? {
                id: mrt.treatment.id,
                kodePerawatan: mrt.treatment.kodePerawatan,
                namaPerawatan: mrt.treatment.namaPerawatan,
                harga: mrt.treatment.harga,
            } : undefined,
        });
    }
}