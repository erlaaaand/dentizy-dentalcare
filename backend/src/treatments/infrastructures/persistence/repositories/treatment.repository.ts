// backend/src/treatments/infrastructures/persistence/repositories/treatment.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, Between } from 'typeorm';
import { Treatment } from '../../../domains/entities/treatments.entity';
import { UpdateTreatmentDto } from '../../../applications/dto/update-treatment.dto';
import { QueryTreatmentDto } from '../../../applications/dto/query-treatment.dto';

export interface TreatmentFindAllResult {
  data: Treatment[];
  total: number;
}

export interface TreatmentStatistics {
  total: number;
  active: number;
  inactive: number;
  averagePrice: number;
}

export interface BulkPriceUpdate {
  id: number;
  harga: number;
}

@Injectable()
export class TreatmentRepository {
  constructor(
    @InjectRepository(Treatment)
    private readonly repository: Repository<Treatment>,
  ) {}

  // Menggunakan Partial<Treatment> agar kompatibel dengan output mapper
  async create(data: Partial<Treatment>): Promise<Treatment> {
    const treatment = this.repository.create(data);
    return await this.repository.save(treatment);
  }

  async findAll(query: QueryTreatmentDto): Promise<TreatmentFindAllResult> {
    const {
      search,
      categoryId,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Treatment> = {};

    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const queryBuilder = this.repository
      .createQueryBuilder('treatment')
      .leftJoinAndSelect('treatment.category', 'category')
      .where(where);

    if (search) {
      queryBuilder.andWhere(
        '(treatment.namaPerawatan LIKE :search OR treatment.kodePerawatan LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const sortField = `treatment.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

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

  async findByIds(ids: number[]): Promise<Treatment[]> {
    return await this.repository.find({
      where: { id: In(ids) },
      relations: ['category'],
    });
  }

  async findByCategory(categoryId: number): Promise<Treatment[]> {
    return await this.repository.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
      order: { namaPerawatan: 'ASC' },
    });
  }

  async findActiveTreatments(): Promise<Treatment[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ['category'],
      order: { namaPerawatan: 'ASC' },
    });
  }

  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<Treatment[]> {
    return await this.repository.find({
      where: {
        harga: Between(minPrice, maxPrice),
        isActive: true,
      },
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

  async hardDelete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async isKodeExists(
    kodePerawatan: string,
    excludeId?: number,
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('treatment')
      .where('treatment.kodePerawatan = :kodePerawatan', { kodePerawatan });

    if (excludeId !== undefined) {
      queryBuilder.andWhere('treatment.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async count(filters?: {
    categoryId?: number;
    isActive?: boolean;
  }): Promise<number> {
    const where: FindOptionsWhere<Treatment> = {};

    if (filters?.categoryId !== undefined) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await this.repository.count({ where });
  }

  async bulkUpdatePrices(updates: BulkPriceUpdate[]): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      for (const update of updates) {
        await manager.update(Treatment, update.id, { harga: update.harga });
      }
    });
  }

  async getTreatmentStatistics(): Promise<TreatmentStatistics> {
    const [total, active, avgResult] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { isActive: true } }),
      this.repository
        .createQueryBuilder('treatment')
        .select('AVG(treatment.harga)', 'average')
        .getRawOne<{ average: string | null }>(),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      averagePrice: parseFloat(avgResult?.average ?? '0'),
    };
  }
}
