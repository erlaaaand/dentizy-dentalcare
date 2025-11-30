// backend/src/treatments/applications/orchestrator/treatments.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { TreatmentRepository } from '../../infrastructures/persistence/repositories/treatment.repository';
import { TreatmentCategoryRepository } from '../../../treatment-categories/infrastructures/persistence/repositories/treatment-category.repository';
import { CreateTreatmentDto } from '../dto/create-treatment.dto';
import { UpdateTreatmentDto } from '../dto/update-treatment.dto';
import { QueryTreatmentDto } from '../dto/query-treatment.dto';
import { TreatmentResponseDto } from '../dto/treatment-response.dto';

@Injectable()
export class TreatmentsService {
    constructor(
        private readonly treatmentRepository: TreatmentRepository,
        private readonly categoryRepository: TreatmentCategoryRepository,
    ) { }

    async create(dto: CreateTreatmentDto): Promise<TreatmentResponseDto> {
        // Validate category exists
        const categoryExists = await this.categoryRepository.exists(dto.categoryId);
        if (!categoryExists) {
            throw new NotFoundException(`Kategori dengan ID ${dto.categoryId} tidak ditemukan`);
        }

        try {
            const treatment = await this.treatmentRepository.create(dto);
            return this.mapToResponseDto(treatment);
        } catch (error) {
            throw new BadRequestException('Gagal membuat perawatan');
        }
    }

    async findAll(query: QueryTreatmentDto) {
        const { data, total } = await this.treatmentRepository.findAll(query);
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

    async findOne(id: number): Promise<TreatmentResponseDto> {
        const treatment = await this.treatmentRepository.findOne(id);

        if (!treatment) {
            throw new NotFoundException(`Perawatan dengan ID ${id} tidak ditemukan`);
        }

        return this.mapToResponseDto(treatment);
    }

    async findByKode(kodePerawatan: string): Promise<TreatmentResponseDto> {
        const treatment = await this.treatmentRepository.findByKode(kodePerawatan);

        if (!treatment) {
            throw new NotFoundException(`Perawatan dengan kode ${kodePerawatan} tidak ditemukan`);
        }

        return this.mapToResponseDto(treatment);
    }

    async update(id: number, dto: UpdateTreatmentDto): Promise<TreatmentResponseDto> {
        const exists = await this.treatmentRepository.exists(id);

        if (!exists) {
            throw new NotFoundException(`Perawatan dengan ID ${id} tidak ditemukan`);
        }

        // Validate category if provided
        if (dto.categoryId) {
            const categoryExists = await this.categoryRepository.exists(dto.categoryId);
            if (!categoryExists) {
                throw new NotFoundException(`Kategori dengan ID ${dto.categoryId} tidak ditemukan`);
            }
        }

        // Check if kode already exists (excluding current record)
        // if (dto.kodePerawatan) {
        //     const kodeExists = await this.treatmentRepository.isKodeExists(dto.kodePerawatan, id);
        //     if (kodeExists) {
        //         throw new ConflictException(`Kode perawatan ${dto.kodePerawatan} sudah digunakan`);
        //     }
        // }

        try {
            const treatment = await this.treatmentRepository.update(id, dto);
            return this.mapToResponseDto(treatment);
        } catch (error) {
            throw new BadRequestException('Gagal mengupdate perawatan');
        }
    }

    async remove(id: number): Promise<void> {
        const exists = await this.treatmentRepository.exists(id);

        if (!exists) {
            throw new NotFoundException(`Perawatan dengan ID ${id} tidak ditemukan`);
        }

        await this.treatmentRepository.softDelete(id);
    }

    async restore(id: number): Promise<TreatmentResponseDto> {
        await this.treatmentRepository.restore(id);
        const treatment = await this.treatmentRepository.findOne(id);

        if (!treatment) {
            throw new NotFoundException(`Perawatan dengan ID ${id} tidak ditemukan`);
        }

        return this.mapToResponseDto(treatment);
    }

    private mapToResponseDto(treatment: any): TreatmentResponseDto {
        return new TreatmentResponseDto({
            ...treatment,
            category: treatment.category ? {
                id: treatment.category.id,
                namaKategori: treatment.category.namaKategori,
            } : undefined,
        });
    }
}