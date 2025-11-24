import { Module } from '@nestjs/common';
import { TreatmentsController } from './interface/http/treatments.controller';
import { TreatmentsService } from './applications/orchestrator/treatments.service';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService]
})
export class TreatmentsModule {}
