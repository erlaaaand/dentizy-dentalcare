// backend/src/payments/infrastructures/persistence/transactions/payment-transaction.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { Payment } from '../../domains/entities/payments.entity';

@Injectable()
export class PaymentTransactionService {
    constructor(private readonly dataSource: DataSource) { }

    async executeInTransaction<T>(
        callback: (queryRunner: QueryRunner) => Promise<T>
    ): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await callback(queryRunner);
            await queryRunner.commitTransaction();
            return result;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async createPaymentWithRelatedUpdates(
        paymentData: Partial<Payment>,
        relatedUpdates: {
            medicalRecordUpdate?: any;
            inventoryUpdates?: any[];
        }
    ): Promise<Payment> {
        return await this.executeInTransaction(async (queryRunner) => {
            const paymentRepo = queryRunner.manager.getRepository(Payment);

            // Create payment
            const payment = paymentRepo.create(paymentData);
            const savedPayment = await paymentRepo.save(payment);

            // Update medical record if needed
            if (relatedUpdates.medicalRecordUpdate) {
                // TODO: Update medical record status
            }

            // Update inventory if needed
            if (relatedUpdates.inventoryUpdates) {
                // TODO: Update inventory quantities
            }

            return savedPayment;
        });
    }

    async cancelPaymentWithRefund(
        paymentId: number,
        refundData?: {
            refundAmount: number;
            refundMethod: string;
            refundNotes?: string;
        }
    ): Promise<Payment> {
        return await this.executeInTransaction(async (queryRunner) => {
            const paymentRepo = queryRunner.manager.getRepository(Payment);

            // Get payment
            const payment = await paymentRepo.findOne({ where: { id: paymentId } });
            if (!payment) {
                throw new Error('Payment not found');
            }

            // Update payment status
            payment.statusPembayaran = 'dibatalkan' as any;
            const updatedPayment = await paymentRepo.save(payment);

            // Process refund if needed
            if (refundData) {
                // TODO: Create refund record
            }

            // Revert medical record status
            // TODO: Update medical record

            return updatedPayment;
        });
    }

    async batchUpdatePaymentStatus(
        paymentIds: number[],
        newStatus: string
    ): Promise<Payment[]> {
        return await this.executeInTransaction(async (queryRunner) => {
            const paymentRepo = queryRunner.manager.getRepository(Payment);

            const payments = await paymentRepo.findByIds(paymentIds);

            payments.forEach(payment => {
                payment.statusPembayaran = newStatus as any;
            });

            return await paymentRepo.save(payments);
        });
    }
}