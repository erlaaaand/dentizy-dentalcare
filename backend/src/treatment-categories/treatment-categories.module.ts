import { Module } from '@nestjs/common';
import { TreatmentCategoriesController } from './interface/http/treatment-categories.controller';
import { TreatmentCategoriesService } from './applications/orchestrator/treatment-categories.service';

@Module({
  controllers: [TreatmentCategoriesController],
  providers: [TreatmentCategoriesService]
})
export class TreatmentCategoriesModule {}
