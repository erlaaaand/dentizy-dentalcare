// backend/src/payments/infrastructure/database/payment.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Payment } from '../../../domains/entities/payments.entity';
import { CreatePaymentDto } from '../../../applications/dto/create-payment.dto';
import { UpdatePaymentDto } from '../../../applications/dto/update-payment.dto';
import { QueryPaymentDto } from '../../../applications/dto/query-payment.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class PaymentRepository {
    constructor(
        @InjectRepository(Payment)
        private readonly repository: Repository<Payment>,
    ) { }

    async create(dto: CreatePaymentDto): Promise<Payment> {
        const { totalBiaya, diskonTotal = 0, jumlahBayar } = dto;

        const totalAkhir = totalBiaya - diskonTotal;
        const kembalian = jumlahBayar - totalAkhir;

        // Generate nomor invoice
        const nomorInvoice = await this.generateNomorInvoice();

        const payment = this.repository.create({
            ...dto,
            nomorInvoice,
            totalAkhir,
            kembalian: kembalian > 0 ? kembalian : 0,
        });

        return await this.repository.save(payment);
    }

    async findAll(query: QueryPaymentDto): Promise<{ data: Payment[]; total: number }> {
        const {
            medicalRecordId,
            patientId,
            statusPembayaran,
            metodePembayaran,
            startDate,
            endDate,
            page = 1,
            limit = 10,
        } = query;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<Payment> = {};

        if (medicalRecordId) {
            where.medicalRecordId = medicalRecordId;
        }

        if (patientId) {
            where.patientId = patientId;
        }

        if (statusPembayaran) {
            where.statusPembayaran = statusPembayaran;
        }

        if (metodePembayaran) {
            where.metodePembayaran = metodePembayaran;
        }

        if (startDate && endDate) {
            where.tanggalPembayaran = Between(new Date(startDate), new Date(endDate));
        }

        const [data, total] = await this.repository.findAndCount({
            where,
            skip,
            take: limit,
            order: { tanggalPembayaran: 'DESC', createdAt: 'DESC' },
        });

        return { data, total };
    }

    async findOne(id: number): Promise<Payment> {
        const payment = await this.repository.findOne({
            where: { id },
            relations: ['medicalRecord'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return payment;
    }

    async findByNomorInvoice(nomorInvoice: string): Promise<Payment | null> {
        return await this.repository.findOne({
            where: { nomorInvoice },
        });
    }

    async findByMedicalRecordId(medicalRecordId: number): Promise<Payment | null> {
        return await this.repository.findOne({
            where: { medicalRecordId },
        });
    }

    async update(id: number, dto: UpdatePaymentDto): Promise<Payment> {
        const existing = await this.findOne(id);

        if (!existing) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        const totalBiaya = dto.totalBiaya ?? existing.totalBiaya;
        const diskonTotal = dto.diskonTotal ?? existing.diskonTotal;
        const jumlahBayar = dto.jumlahBayar ?? existing.jumlahBayar;

        const totalAkhir = totalBiaya - diskonTotal;
        const kembalian = Math.max(0, jumlahBayar - totalAkhir);

        await this.repository.update(id, {
            ...dto,
            totalAkhir,
            kembalian,
        });

        return await this.findOne(id); // pasti tidak null karena sudah dicek
    }

    async softDelete(id: number): Promise<void> {
        await this.repository.softDelete(id);
    }

    async restore(id: number): Promise<void> {
        await this.repository.restore(id);
    }

    private async generateNomorInvoice(): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const prefix = `INV/${year}${month}${day}`;

        const lastPayment = await this.repository
            .createQueryBuilder('payment')
            .where('payment.nomorInvoice LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('payment.nomorInvoice', 'DESC')
            .getOne();

        let sequence = 1;
        if (lastPayment) {
            const parts = lastPayment.nomorInvoice.split('/');
            const lastSequence = parts[parts.length - 1] || '0000'; // fallback aman
            sequence = parseInt(lastSequence, 10) + 1;
        }

        return `${prefix}/${String(sequence).padStart(4, '0')}`;
    }

    async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
        const query = this.repository
            .createQueryBuilder('payment')
            .select('SUM(payment.totalAkhir)', 'total')
            .where('payment.statusPembayaran = :status', { status: 'lunas' })
            .andWhere('payment.deletedAt IS NULL');

        if (startDate && endDate) {
            query.andWhere('payment.tanggalPembayaran BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }

        const result = await query.getRawOne();
        return parseFloat(result?.total || 0);
    }
}