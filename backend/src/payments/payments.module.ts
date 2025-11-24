import { Module } from '@nestjs/common';
import { PaymentsController } from './interface/http/payments.controller';
import { PaymentsService } from './applications/orchestrator/payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
