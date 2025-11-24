// backend/src/treatment-categories/treatment-categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentCategoriesController } from './interface/http/treatment-categories.controller';
import { TreatmentCategoriesService } from './applications/orchestrator/treatment-categories.service';
import { TreatmentCategory } from '../treatment-categories/domains/entities/treatment-categories.entity';
import { TreatmentCategoryRepository } from './infrastructures/persistence/repositories/treatment-category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TreatmentCategory])],
  controllers: [TreatmentCategoriesController],
  providers: [TreatmentCategoriesService, TreatmentCategoryRepository],
  exports: [TreatmentCategoriesService, TreatmentCategoryRepository],
})
export class TreatmentCategoriesModule { }