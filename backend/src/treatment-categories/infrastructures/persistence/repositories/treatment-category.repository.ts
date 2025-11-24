// backend/src/treatment-categories/infrastructure/database/treatment-category.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { TreatmentCategory } from '../../../domains/entities/treatment-categories.entity';
import { CreateTreatmentCategoryDto } from '../../../applications/dto/create-treatment-category.dto';
import { UpdateTreatmentCategoryDto } from '../../../applications/dto/update-treatment-category.dto';
import { QueryTreatmentCategoryDto } from '../../../applications/dto/query-treatment-category.dto';

@Injectable()
export class TreatmentCategoryRepository {
    constructor(
        @InjectRepository(TreatmentCategory)
        private readonly repository: Repository<TreatmentCategory>,
    ) { }

    async create(dto: CreateTreatmentCategoryDto): Promise<TreatmentCategory> {
        const category = this.repository.create(dto);
        return await this.repository.save(category);
    }

    async findAll(query: QueryTreatmentCategoryDto): Promise<{ data: TreatmentCategory[]; total: number }> {
        const { search, isActive, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<TreatmentCategory> = {};

        if (search) {
            where.namaKategori = Like(`%${search}%`);
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await this.repository.findAndCount({
            where,
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return { data, total };
    }

    async findOne(id: number): Promise<TreatmentCategory | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['treatments'],
        });
    }

    async update(id: number, dto: UpdateTreatmentCategoryDto): Promise<TreatmentCategory | null> {
        await this.repository.update(id, dto);
        return await this.findOne(id);
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async restore(id: number): Promise<void> {
        await this.repository.restore(id);
    }

    async exists(id: number): Promise<boolean> {
        const count = await this.repository.count({ where: { id } });
        return count > 0;
    }
}