// backend/src/treatment-categories/applications/orchestrator/treatment-categories.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TreatmentCategoryRepository } from '../../infrastructures/persistence/repositories/treatment-category.repository';
import { CreateTreatmentCategoryDto } from '../dto/create-treatment-category.dto';
import { UpdateTreatmentCategoryDto } from '../dto/update-treatment-category.dto';
import { QueryTreatmentCategoryDto } from '../dto/query-treatment-category.dto';
import { TreatmentCategoryResponseDto } from '../dto/treatment-category-response.dto';

@Injectable()
export class TreatmentCategoriesService {
    constructor(
        private readonly treatmentCategoryRepository: TreatmentCategoryRepository,
    ) { }

    async create(dto: CreateTreatmentCategoryDto): Promise<TreatmentCategoryResponseDto> {
        try {
            const category = await this.treatmentCategoryRepository.create(dto);
            return new TreatmentCategoryResponseDto(category);
        } catch (error) {
            throw new BadRequestException('Gagal membuat kategori perawatan');
        }
    }

    async findAll(query: QueryTreatmentCategoryDto) {
        const { data, total } = await this.treatmentCategoryRepository.findAll(query);
        const { page = 1, limit = 10 } = query;

        return {
            data: data.map((item) => new TreatmentCategoryResponseDto(item)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number): Promise<TreatmentCategoryResponseDto> {
        const category = await this.treatmentCategoryRepository.findOne(id);

        if (!category) {
            throw new NotFoundException(`Kategori perawatan dengan ID ${id} tidak ditemukan`);
        }

        return new TreatmentCategoryResponseDto(category);
    }

    async update(id: number, dto: UpdateTreatmentCategoryDto): Promise<TreatmentCategoryResponseDto> {
        const exists = await this.treatmentCategoryRepository.exists(id);

        if (!exists) {
            throw new NotFoundException(`Kategori perawatan dengan ID ${id} tidak ditemukan`);
        }

        try {
            const category = await this.treatmentCategoryRepository.update(id, dto);
            return new TreatmentCategoryResponseDto(category);
        } catch (error) {
            throw new BadRequestException('Gagal mengupdate kategori perawatan');
        }
    }

    async remove(id: number): Promise<void> {
        const exists = await this.treatmentCategoryRepository.exists(id);

        if (!exists) {
            throw new NotFoundException(`Kategori perawatan dengan ID ${id} tidak ditemukan`);
        }

        await this.treatmentCategoryRepository.softDelete(id);
    }

    async restore(id: number): Promise<TreatmentCategoryResponseDto> {
        await this.treatmentCategoryRepository.restore(id);
        const category = await this.treatmentCategoryRepository.findOne(id);

        if (!category) {
            throw new NotFoundException(`Kategori perawatan dengan ID ${id} tidak ditemukan`);
        }

        return new TreatmentCategoryResponseDto(category);
    }
}