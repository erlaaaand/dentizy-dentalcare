
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { Patient } from './domains/entities/patient.entity';
import { PatientsService } from './application/orchestrator/patients.service';
import { PatientsController } from './interface/http/patients.controller';
import { PatientRepository } from './infrastructure/persistence/repositories/patients.repository';
import { PatientQueryBuilder } from './infrastructure/persistence/query/patient-query.builder';
import { MedicalRecordNumberGenerator } from './infrastructure/generator/medical-record-number.generator';
import { PatientValidator } from './domains/validators/patient.validator';
import { PatientEventListener } from './infrastructure/listeners/patient.event-listener';
import { PatientCacheService } from './infrastructure/cache/patient-cache.service';
import { PatientMapper } from './domains/mappers/patient.mapper';
import { TransactionManager } from './infrastructure/transactions/transaction.manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]),

    // Cache configuration
    CacheModule.register({
      ttl: 300000, // 5 minutes in milliseconds
      max: 100, // maximum number of items in cache
    }),

    // Event emitter untuk real-time updates
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Rate limiting untuk search endpoint
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 30, // max 30 requests per minute
    }]),
  ],
  controllers: [PatientsController],
  providers: [
    PatientsService,
    PatientRepository,
    PatientQueryBuilder,
    MedicalRecordNumberGenerator,
    PatientValidator,
    PatientEventListener,
    PatientCacheService,
    PatientMapper,
    TransactionManager,
  ],
  exports: [PatientsService, PatientRepository],
})
export class PatientsModule { }