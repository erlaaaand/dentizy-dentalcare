// __tests__/applications/services/patient-deletion.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PatientDeletionService } from '../patient-deletion.service';
import { Patient } from '../../../domains/entities/patient.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../appointments/domains/entities/appointment.entity'; // Asumsi path entity
import { PatientRepository } from '../../../infrastructure/persistence/repositories/patients.repository';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';
import { PatientDeletedEvent } from '../../../infrastructure/events/patient-deleted.event';

// 2. MOCK DATA
const mockPatientId = 1;
const mockPatientName = 'Budi Santoso';

const mockAppointmentPast: Partial<Appointment> = {
  id: 101,
  status: AppointmentStatus.SELESAI,
};
const mockAppointmentCancelled: Partial<Appointment> = {
  id: 102,
  status: AppointmentStatus.DIBATALKAN,
};
const mockAppointmentScheduled: Partial<Appointment> = {
  id: 103,
  status: AppointmentStatus.DIJADWALKAN,
};

// Pasien aman untuk dihapus (tidak ada appointment atau statusnya selesai/batal)
const mockPatientSafe: Partial<Patient> = {
  id: mockPatientId,
  nama_lengkap: mockPatientName,
  appointments: [
    mockAppointmentPast as Appointment,
    mockAppointmentCancelled as Appointment,
  ],
};

// Pasien yang TIDAK BISA dihapus (ada yang dijadwalkan)
const mockPatientConflictScheduled: Partial<Patient> = {
  id: 2,
  nama_lengkap: 'Siti Konflik',
  appointments: [mockAppointmentScheduled as Appointment],
};

// 3. TEST SUITE
describe('PatientDeletionService', () => {
  let service: PatientDeletionService;
  let typeOrmRepository: any;
  let customRepository: any;
  let cacheService: any;
  let eventEmitter: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Reset mocks
    typeOrmRepository = {
      findOne: jest.fn(),
    };

    customRepository = {
      softDelete: jest.fn(),
    };

    cacheService = {
      invalidatePatientCache: jest.fn(),
      invalidateListCaches: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientDeletionService,
        // Mock Standard TypeORM Repository (digunakan untuk findOne)
        {
          provide: getRepositoryToken(Patient),
          useValue: typeOrmRepository,
        },
        // Mock Custom Repository (digunakan untuk softDelete)
        {
          provide: PatientRepository,
          useValue: customRepository,
        },
        { provide: PatientCacheService, useValue: cacheService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PatientDeletionService>(PatientDeletionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Success Scenario)

  describe('execute (Success)', () => {
    it('should successfully soft delete a patient with no active appointments', async () => {
      // Arrange
      typeOrmRepository.findOne.mockResolvedValue(mockPatientSafe);
      customRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.execute(mockPatientId);

      // Assert
      // 1. Check Finding Logic
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPatientId },
        relations: ['appointments'],
      });

      // 2. Check Deletion Logic
      expect(customRepository.softDelete).toHaveBeenCalledWith(mockPatientId);

      // 3. Check Event Emission
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'patient.deleted',
        expect.any(PatientDeletedEvent),
      );
      // Verify Event Payload
      const eventPayload = eventEmitter.emit.mock.calls[0][1];
      expect(eventPayload.patientId).toBe(mockPatientId);
      expect(eventPayload.patientName).toBe(mockPatientName);

      // 4. Check Cache Invalidation
      expect(cacheService.invalidatePatientCache).toHaveBeenCalledWith(
        mockPatientId,
      );
      expect(cacheService.invalidateListCaches).toHaveBeenCalled();

      // 5. Check Return Message
      expect(result).toEqual({
        message: `Pasien ${mockPatientName} berhasil dihapus`,
      });
    });
  });

  // 6. SUB-GROUP TESTS (Edge Cases & Errors)

  describe('Validation Failures', () => {
    it('should throw NotFoundException if patient does not exist', async () => {
      // Arrange
      typeOrmRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(999)).rejects.toThrow(NotFoundException);

      // Ensure delete logic not called
      expect(customRepository.softDelete).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if patient has "dijadwalkan" appointment', async () => {
      // Arrange
      typeOrmRepository.findOne.mockResolvedValue(mockPatientConflictScheduled);

      // Act & Assert
      await expect(service.execute(2)).rejects.toThrow(ConflictException);
      await expect(service.execute(2)).rejects.toThrow('janji temu aktif');

      expect(customRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('System Failures', () => {
    it('should throw BadRequestException if softDelete fails (Database Error)', async () => {
      // Arrange
      typeOrmRepository.findOne.mockResolvedValue(mockPatientSafe);
      // Simulate DB Error during deletion
      const dbError = new Error('Database connection lost');
      customRepository.softDelete.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.execute(mockPatientId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.execute(mockPatientId)).rejects.toThrow(
        'Gagal menghapus pasien',
      );

      // Verify side effects did NOT happen
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(cacheService.invalidatePatientCache).not.toHaveBeenCalled();
    });

    it('should re-throw NotFoundException or ConflictException as is (not wrapping in BadRequest)', async () => {
      // Test untuk memastikan blok catch(error) di service tidak menelan Exception spesifik

      // Case 1: NotFound re-throw
      typeOrmRepository.findOne.mockResolvedValue(null);
      await expect(service.execute(999)).rejects.toThrow(NotFoundException); // Should NOT be BadRequest

      // Case 2: Conflict re-throw
      typeOrmRepository.findOne.mockResolvedValue(mockPatientConflictScheduled);
      await expect(service.execute(2)).rejects.toThrow(ConflictException); // Should NOT be BadRequest
    });
  });
});
