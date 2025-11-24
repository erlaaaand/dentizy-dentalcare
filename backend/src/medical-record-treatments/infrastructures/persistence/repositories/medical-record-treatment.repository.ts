// backend/src/medical-record-treatments/infrastructure/database/medical-record-treatment.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { MedicalRecordTreatment } from '../../../domains/entities/medical-record-treatments.entity';
import { CreateMedicalRecordTreatmentDto } from '../../../applications/dto/create-medical-record-treatment.dto';
import { UpdateMedicalRecordTreatmentDto } from '../../../applications/dto/update-medical-record-treatment.dto';
import { QueryMedicalRecordTreatmentDto } from '../../../applications/dto/query-medical-record-treatment.dto';
import { NotFoundException } from '@nestjs/common';

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

    async findOne(id: number): Promise<MedicalRecordTreatment> {
        const record = await this.repository.findOne({
            where: { id },
            relations: ['treatment', 'treatment.category'],
        });

        if (!record) {
            throw new NotFoundException(`Medical Record Treatment with ID ${id} not found`);
        }

        return record;
    }

    async findByMedicalRecordId(medicalRecordId: number): Promise<MedicalRecordTreatment[]> {
        return await this.repository.find({
            where: { medicalRecordId },
            relations: ['treatment', 'treatment.category'],
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: number, dto: UpdateMedicalRecordTreatmentDto): Promise<MedicalRecordTreatment> {
        const existing = await this.findOne(id); // dijamin tidak null

        const jumlah = dto.jumlah ?? existing.jumlah;
        const hargaSatuan = dto.hargaSatuan ?? existing.hargaSatuan;
        const diskon = dto.diskon ?? existing.diskon;

        const subtotal = jumlah * hargaSatuan;
        const total = subtotal - diskon;

        await this.repository.update(id, {
            ...dto,
            subtotal,
            total,
        });

        // return ulang data yang sudah update
        return await this.findOne(id);
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
}