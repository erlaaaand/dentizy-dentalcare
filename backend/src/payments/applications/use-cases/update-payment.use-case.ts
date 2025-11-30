// backend/src/payments/applications/use-cases/update-payment.use-case.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentRepository } from '../../infrastructures/persistence/repositories/payment.repository';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';
import { PaymentMapper } from '../../domains/mappers/payment.mapper';
import { PaymentCalculatorService } from '../../domains/services/payment-calculator.service';
import { PaymentValidatorService } from '../../domains/services/payment-validator.service';
import { PaymentUpdatedEvent } from '../../infrastructures/events/payment-updated.event';
import { PaymentCompletedEvent } from '../../infrastructures/events/payment-completed.event';
import { StatusPembayaran } from '../../domains/entities/payments.entity';

@Injectable()
export class UpdatePaymentUseCase {
    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly paymentMapper: PaymentMapper,
        private readonly calculatorService: PaymentCalculatorService,
        private readonly validatorService: PaymentValidatorService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(id: number, dto: UpdatePaymentDto, updatedBy?: number): Promise<PaymentResponseDto> {
        const payment = await this.paymentRepository.findOne(id);

        if (!payment) {
            throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
        }

        // Validate for update
        this.validatorService.validateForUpdate(payment);

        const previousStatus = payment.statusPembayaran;

        // Recalculate if payment amounts changed
        if (dto.jumlahBayar !== undefined || dto.totalBiaya !== undefined || dto.diskonTotal !== undefined) {
            const totalBiaya = dto.totalBiaya ?? payment.totalBiaya;
            const diskonTotal = dto.diskonTotal ?? payment.diskonTotal;
            const jumlahBayar = dto.jumlahBayar ?? payment.jumlahBayar;

            this.validatorService.validatePaymentData({
                totalBiaya: Number(totalBiaya),
                diskonTotal: Number(diskonTotal),
                jumlahBayar: Number(jumlahBayar),
            });

            const calculation = this.calculatorService.calculate(
                Number(totalBiaya),
                Number(diskonTotal),
                Number(jumlahBayar),
                payment.statusPembayaran,
            );

            dto.statusPembayaran = calculation.statusPembayaran;
        }

        // Update payment
        const updatedPayment = await this.paymentRepository.update(id, dto, updatedBy);
        const response = this.paymentMapper.toResponseDto(updatedPayment);

        // Emit updated event
        this.eventEmitter.emit(
            'payment.updated',
            new PaymentUpdatedEvent(
                updatedPayment.id,
                previousStatus,
                updatedPayment.statusPembayaran,
                updatedBy,
            ),
        );

        // Emit completed event if status changed to completed
        if (
            previousStatus !== StatusPembayaran.LUNAS &&
            updatedPayment.statusPembayaran === StatusPembayaran.LUNAS
        ) {
            this.eventEmitter.emit(
                'payment.completed',
                new PaymentCompletedEvent(
                    updatedPayment.id,
                    updatedPayment.medicalRecordId,
                    updatedPayment.patientId,
                    updatedPayment.nomorInvoice,
                    Number(updatedPayment.totalAkhir),
                    updatedPayment.updatedAt,
                ),
            );
        }

        return response;
    }
}