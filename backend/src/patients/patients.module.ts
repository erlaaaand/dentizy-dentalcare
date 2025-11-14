
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { Patient } from './entities/patient.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientRepository } from './repositories/patients.repository';
import { PatientQueryBuilder } from './utils/patient-query.builder';
import { MedicalRecordNumberGenerator } from './utils/medical-record-number.generator';
import { PatientValidator } from './utils/patient.validator';
import { PatientEventListener } from './listeners/patient-event.listener';
import { PatientCacheService } from './services/patient-cache.service';
import { PatientMapper } from './utils/patient.mapper';
import { TransactionManager } from './utils/transaction.manager';

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