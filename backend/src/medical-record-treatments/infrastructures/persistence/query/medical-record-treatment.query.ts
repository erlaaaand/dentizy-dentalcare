// backend/src/medical-record-treatments/infrastructures/persistence/queries/medical-record-treatment.query.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MedicalRecordTreatment } from '../../../domains/entities/medical-record-treatments.entity';

export interface TreatmentStatistics {
    totalTreatments: number;
    totalRevenue: number;
    averagePrice: number;
}

export interface TreatmentByCategory {
    categoryId: number;
    categoryName: string;
    totalTreatments: number;
    totalRevenue: number;
}

@Injectable()
export class MedicalRecordTreatmentQuery {
    constructor(
        @InjectRepository(MedicalRecordTreatment)
        private readonly repository: Repository<MedicalRecordTreatment>,
    ) { }

    private createBaseQuery(): SelectQueryBuilder<MedicalRecordTreatment> {
        return this.repository
            .createQueryBuilder('mrt')
            .leftJoinAndSelect('mrt.treatment', 'treatment')
            .leftJoinAndSelect('treatment.category', 'category')
            .where('mrt.deletedAt IS NULL');
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<MedicalRecordTreatment[]> {
        return await this.createBaseQuery()
            .andWhere('mrt.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .orderBy('mrt.createdAt', 'DESC')
            .getMany();
    }

    async findByTreatmentId(treatmentId: number): Promise<MedicalRecordTreatment[]> {
        return await this.createBaseQuery()
            .andWhere('mrt.treatmentId = :treatmentId', { treatmentId })
            .orderBy('mrt.createdAt', 'DESC')
            .getMany();
    }

    async getStatisticsByMedicalRecordId(medicalRecordId: number): Promise<TreatmentStatistics> {
        const result = await this.repository
            .createQueryBuilder('mrt')
            .select('COUNT(mrt.id)', 'totalTreatments')
            .addSelect('COALESCE(SUM(mrt.total), 0)', 'totalRevenue')
            .addSelect('COALESCE(AVG(mrt.hargaSatuan), 0)', 'averagePrice')
            .where('mrt.medicalRecordId = :medicalRecordId', { medicalRecordId })
            .andWhere('mrt.deletedAt IS NULL')
            .getRawOne();

        return {
            totalTreatments: parseInt(result.totalTreatments) || 0,
            totalRevenue: parseFloat(result.totalRevenue) || 0,
            averagePrice: parseFloat(result.averagePrice) || 0,
        };
    }

    async getStatisticsByDateRange(startDate: Date, endDate: Date): Promise<TreatmentStatistics> {
        const result = await this.repository
            .createQueryBuilder('mrt')
            .select('COUNT(mrt.id)', 'totalTreatments')
            .addSelect('COALESCE(SUM(mrt.total), 0)', 'totalRevenue')
            .addSelect('COALESCE(AVG(mrt.hargaSatuan), 0)', 'averagePrice')
            .where('mrt.createdAt BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .andWhere('mrt.deletedAt IS NULL')
            .getRawOne();

        return {
            totalTreatments: parseInt(result.totalTreatments) || 0,
            totalRevenue: parseFloat(result.totalRevenue) || 0,
            averagePrice: parseFloat(result.averagePrice) || 0,
        };
    }

    async getTreatmentsByCategory(medicalRecordId?: number): Promise<TreatmentByCategory[]> {
        let query = this.repository
            .createQueryBuilder('mrt')
            .leftJoin('mrt.treatment', 'treatment')
            .leftJoin('treatment.category', 'category')
            .select('category.id', 'categoryId')
            .addSelect('category.namaKategori', 'categoryName')
            .addSelect('COUNT(mrt.id)', 'totalTreatments')
            .addSelect('COALESCE(SUM(mrt.total), 0)', 'totalRevenue')
            .where('mrt.deletedAt IS NULL')
            .groupBy('category.id')
            .addGroupBy('category.namaKategori');

        if (medicalRecordId) {
            query = query.andWhere('mrt.medicalRecordId = :medicalRecordId', { medicalRecordId });
        }

        const results = await query.getRawMany();

        return results.map(r => ({
            categoryId: r.categoryId,
            categoryName: r.categoryName,
            totalTreatments: parseInt(r.totalTreatments) || 0,
            totalRevenue: parseFloat(r.totalRevenue) || 0,
        }));
    }

    async getMostUsedTreatments(limit: number = 10): Promise<any[]> {
        return await this.repository
            .createQueryBuilder('mrt')
            .leftJoinAndSelect('mrt.treatment', 'treatment')
            .select('treatment.id', 'treatmentId')
            .addSelect('treatment.namaPerawatan', 'treatmentName')
            .addSelect('COUNT(mrt.id)', 'usageCount')
            .addSelect('SUM(mrt.jumlah)', 'totalQuantity')
            .addSelect('COALESCE(SUM(mrt.total), 0)', 'totalRevenue')
            .where('mrt.deletedAt IS NULL')
            .groupBy('treatment.id')
            .addGroupBy('treatment.namaPerawatan')
            .orderBy('usageCount', 'DESC')
            .limit(limit)
            .getRawMany();
    }

    async getRevenueByMonth(year: number): Promise<any[]> {
        return await this.repository
            .createQueryBuilder('mrt')
            .select('MONTH(mrt.createdAt)', 'month')
            .addSelect('COALESCE(SUM(mrt.total), 0)', 'revenue')
            .addSelect('COUNT(mrt.id)', 'treatmentCount')
            .where('YEAR(mrt.createdAt) = :year', { year })
            .andWhere('mrt.deletedAt IS NULL')
            .groupBy('MONTH(mrt.createdAt)')
            .orderBy('month', 'ASC')
            .getRawMany();
    }

    async getTotalDiscountByMedicalRecordId(medicalRecordId: number): Promise<number> {
        const result = await this.repository
            .createQueryBuilder('mrt')
            .select('COALESCE(SUM(mrt.diskon), 0)', 'totalDiscount')
            .where('mrt.medicalRecordId = :medicalRecordId', { medicalRecordId })
            .andWhere('mrt.deletedAt IS NULL')
            .getRawOne();

        return parseFloat(result?.totalDiscount || 0);
    }
}

// backend/src/medical-record-treatments/infrastructures/persistence/queries/index.ts
export * from './medical-record-treatment.query';