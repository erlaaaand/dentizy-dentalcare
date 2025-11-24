// backend/src/treatments/infrastructure/database/treatment.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Treatment } from '../../../domains/entities/treatments.entity';
import { CreateTreatmentDto } from '../../../applications/dto/create-treatment.dto';
import { UpdateTreatmentDto } from '../../../applications/dto/update-treatment.dto';
import { QueryTreatmentDto } from '../../../applications/dto/query-treatment.dto';

@Injectable()
export class TreatmentRepository {
    constructor(
        @InjectRepository(Treatment)
        private readonly repository: Repository<Treatment>,
    ) { }

    async create(dto: CreateTreatmentDto): Promise<Treatment> {
        const treatment = this.repository.create(dto);
        return await this.repository.save(treatment);
    }

    async findAll(query: QueryTreatmentDto): Promise<{ data: Treatment[]; total: number }> {
        const { search, categoryId, isActive, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<Treatment> = {};

        if (search) {
            where.namaPerawatan = Like(`%${search}%`);
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        const [data, total] = await this.repository.findAndCount({
            where,
            relations: ['category'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return { data, total };
    }

    async findOne(id: number): Promise<Treatment | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['category'],
        });
    }

    async findByKode(kodePerawatan: string): Promise<Treatment | null> {
        return await this.repository.findOne({
            where: { kodePerawatan },
            relations: ['category'],
        });
    }

    async update(id: number, dto: UpdateTreatmentDto): Promise<Treatment | null> {
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

    async isKodeExists(kodePerawatan: string, excludeId?: number): Promise<boolean> {
        const where: any = { kodePerawatan };
        if (excludeId) {
            where.id = { $ne: excludeId };
        }
        const count = await this.repository.count({ where });
        return count > 0;
    }
}