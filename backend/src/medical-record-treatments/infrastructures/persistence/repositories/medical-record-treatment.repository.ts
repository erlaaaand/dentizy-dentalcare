// backend/src/medical-record-treatments/infrastructures/persistence/repositories/medical-record-treatment.repository.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { MedicalRecordTreatment } from '../../../domains/entities/medical-record-treatments.entity';
import { CreateMedicalRecordTreatmentDto } from '../../../applications/dto/create-medical-record-treatment.dto';
import { UpdateMedicalRecordTreatmentDto } from '../../../applications/dto/update-medical-record-treatment.dto';
import { QueryMedicalRecordTreatmentDto } from '../../../applications/dto/query-medical-record-treatment.dto';

@Injectable()
export class MedicalRecordTreatmentRepository {
    constructor(
        @InjectRepository(MedicalRecordTreatment)
        private readonly repository: Repository<MedicalRecordTreatment>,
    ) { }

    async create(dto: CreateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatment> {
        const { jumlah, hargaSatuan, diskon = 0 } = dto;

        const subtotal = jumlah * hargaSatuan;
        const total = subtotal - diskon;

        const treatment = this.repository.create({
            ...dto,
            subtotal,
            total,
        });

        return await this.repository.save(treatment);
    }

    async findAll(query: QueryMedicalRecordTreatmentDto): Promise<{ data: MedicalRecordTreatment[]; total: number }> {
        const { medicalRecordId, treatmentId, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<MedicalRecordTreatment> = {};

        if (medicalRecordId) {
            where.medicalRecordId = medicalRecordId;
        }

        if (treatmentId) {
            where.treatmentId = treatmentId;
        }

        const [data, total] = await this.repository.findAndCount({
            where,
            relations: ['treatment', 'treatment.category'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return { data, total };
    }

    async findOne(id: number): Promise<MedicalRecordTreatment | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['treatment', 'treatment.category'],
        });
    }

    async findByMedicalRecordId(medicalRecordId: number): Promise<MedicalRecordTreatment[]> {
        return await this.repository.find({
            where: { medicalRecordId },
            relations: ['treatment', 'treatment.category'],
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: number, dto: UpdateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatment> {
        const existing = await this.findOne(id);
        if (!existing) {
            throw new NotFoundException(`Medical Record Treatment with ID ${id} not found`);
        }

        const jumlah = dto.jumlah ?? existing.jumlah;
        const hargaSatuan = dto.hargaSatuan ?? Number(existing.hargaSatuan);
        const diskon = dto.diskon ?? Number(existing.diskon);

        const subtotal = jumlah * hargaSatuan;
        const total = subtotal - diskon;

        await this.repository.update(id, {
            ...dto,
            subtotal,
            total,
        });

        const updated = await this.findOne(id);
        if (!updated) {
            throw new NotFoundException(`Medical Record Treatment with ID ${id} not found after update`);
        }

        return updated;
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async restore(id: number): Promise<void> {
        await this.repository.restore(id);
    }

    async getTotalByMedicalRecordId(medicalRecordId: number): Promise<number> {
        const result = await this.repository
            .createQueryBuilder('mrt')
            .select('SUM(mrt.total)', 'total')
            .where('mrt.medicalRecordId = :medicalRecordId', { medicalRecordId })
            .andWhere('mrt.deletedAt IS NULL')
            .getRawOne();

        return parseFloat(result?.total || 0);
    }

    async exists(id: number): Promise<boolean> {
        const count = await this.repository.count({ where: { id } });
        return count > 0;
    }

    /**
     * Get top treatments statistics
     */
    async getTopTreatments(limit: number = 10, startDate?: Date, endDate?: Date): Promise<any[]> {
        const query = this.repository
            .createQueryBuilder('mrt')
            .leftJoin('mrt.treatment', 'treatment')
            .select([
                'treatment.namaPerawatan AS treatmentName',
                'COUNT(mrt.id) AS usageCount',
                'SUM(mrt.subtotal) AS totalRevenue'
            ])
            .groupBy('treatment.id')
            .orderBy('usageCount', 'DESC')
            .limit(limit);

        if (startDate && endDate) {
            query.andWhere('mrt.created_at BETWEEN :startDate AND :endDate', { startDate, endDate });
        }

        return await query.getRawMany();
    }
}
