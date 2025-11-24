// backend/src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './interface/http/payments.controller';
import { PaymentsService } from './applications/orchestrator/payments.service';
import { Payment } from './domains/entities/payments.entity';
import { PaymentRepository } from './infrastructures/persistence/repositories/payment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
  exports: [PaymentsService, PaymentRepository],
})
export class PaymentsModule { }