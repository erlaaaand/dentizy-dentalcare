import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppointmentsModule } from '../appointments.module';

// Entities
import { Appointment } from '../domains/entities/appointment.entity';
import { Patient } from '../../patients/domains/entities/patient.entity';
import { User } from '../../users/domains/entities/user.entity';

// Services & Providers
import { AppointmentsService } from '../applications/orchestrator/appointments.service';
import { AppointmentsController } from '../interface/http/appointments.controller';

describe('AppointmentsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forFeature([Appointment, Patient, User]),
        AppointmentsModule,
      ],
    })
      // Mock seluruh database agar tidak beneran konek DB
      .overrideProvider(TypeOrmModule)
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should resolve AppointmentsService', () => {
    const service = module.get<AppointmentsService>(AppointmentsService);
    expect(service).toBeDefined();
  });

  it('should resolve AppointmentsController', () => {
    const controller = module.get<AppointmentsController>(AppointmentsController);
    expect(controller).toBeDefined();
  });
});
