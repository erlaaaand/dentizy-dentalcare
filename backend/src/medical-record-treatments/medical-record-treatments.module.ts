// backend/src/medical-record-treatments/medical-record-treatments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordTreatmentsController } from './interface/http/medical-record-treatments.controller';
import { MedicalRecordTreatmentsService } from './applications/orchestrator/medical-record-treatments.service';
import { MedicalRecordTreatment } from './domains/entities/medical-record-treatments.entity';
import { MedicalRecordTreatmentRepository } from './infrastructures/persistence/repositories/medical-record-treatment.repository';
import { TreatmentsModule } from '../treatments/treatments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecordTreatment]),
    TreatmentsModule,
  ],
  controllers: [MedicalRecordTreatmentsController],
  providers: [MedicalRecordTreatmentsService, MedicalRecordTreatmentRepository],
  exports: [MedicalRecordTreatmentsService, MedicalRecordTreatmentRepository],
})
export class MedicalRecordTreatmentsModule { }