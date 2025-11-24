// backend/src/treatments/treatments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentsController } from './interface/http/treatments.controller';
import { TreatmentsService } from './applications/orchestrator/treatments.service';
import { Treatment } from './domains/entities/treatments.entity';
import { TreatmentRepository } from './infrastructures/persistence/repositories/treatment.repository';
import { TreatmentCategoriesModule } from '../treatment-categories/treatment-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Treatment]),
    TreatmentCategoriesModule,
  ],
  controllers: [TreatmentsController],
  providers: [TreatmentsService, TreatmentRepository],
  exports: [TreatmentsService, TreatmentRepository],
})
export class TreatmentsModule { }