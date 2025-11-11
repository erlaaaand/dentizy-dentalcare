import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientQueryBuilder } from './utils/patient-query.builder';
import { MedicalRecordNumberGenerator } from './utils/medical-record-number.generator';
import { PatientValidator } from './utils/patient.validator';
import { TransactionManager } from './utils/transaction.manager';

@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  controllers: [PatientsController],
  providers: [
    PatientsService,
    PatientQueryBuilder,
    MedicalRecordNumberGenerator,
    PatientValidator,
    TransactionManager,
  ],
  exports: [PatientsService],
})
export class PatientsModule { }