import { Module } from '@nestjs/common';
import { MedicalRecordTreatmentsController } from './interface/http/medical-record-treatments.controller';
import { MedicalRecordTreatmentsService } from './applications/orchestrator/medical-record-treatments.service';

@Module({
  controllers: [MedicalRecordTreatmentsController],
  providers: [MedicalRecordTreatmentsService]
})
export class MedicalRecordTreatmentsModule {}
