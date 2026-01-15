// __tests__/applications/services/patient-update.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PatientUpdateService } from '../patient-update.service';
import { Patient } from '../../../domains/entities/patient.entity';
import { UpdatePatientDto } from '../../dto/update-patient.dto';
import { PatientResponseDto } from '../../dto/patient-response.dto';
import { PatientValidator } from '../../../domains/validators/patient.validator';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';
import { PatientMapper } from '../../../domains/mappers/patient.mapper';
import { PatientUpdatedEvent } from '../../../infrastructure/events/patient-updated.event';

// 2. MOCK DATA
const mockPatientId = 1;
const mockExistingPatient = {
  id: mockPatientId,
  nama_lengkap: 'Budi Lama',
  nik: '1234567890123456',
  tanggal_lahir: new Date('1990-01-01'),
  created_at: new Date(),
} as Patient;

const mockUpdateDto: UpdatePatientDto = {
  nama_lengkap: 'Budi Baru',
  no_hp: '08123456789',
};

const mockUpdatedPatient = {
  ...mockExistingPatient,
  ...mockUpdateDto,
  updated_at: new Date(),
} as Patient;

const mockResponseDto = {
  id: mockPatientId,
  nama_lengkap: 'Budi Baru',
} as PatientResponseDto;

// 3. TEST SUITE
describe('PatientUpdateService', () => {
  let service: PatientUpdateService;
  let repository: any; // Mock Repository
  let validator: any;
  let cacheService: any;
  let mapper: any;
  let eventEmitter: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Initialize Mocks
    repository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    validator = {
      validateUpdate: jest.fn(),
    };

    cacheService = {
      invalidatePatientCache: jest.fn(),
      invalidateListCaches: jest.fn(),
    };

    mapper = {
      toResponseDto: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientUpdateService,
        { provide: getRepositoryToken(Patient), useValue: repository },
        { provide: PatientValidator, useValue: validator },
        { provide: PatientCacheService, useValue: cacheService },
        { provide: PatientMapper, useValue: mapper },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PatientUpdateService>(PatientUpdateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Happy Path)

  describe('execute', () => {
    it('should successfully update patient, emit event, and clear cache', async () => {
      // Arrange
      repository.findOneBy.mockResolvedValue({ ...mockExistingPatient }); // Clone object to avoid reference issues
      validator.validateUpdate.mockResolvedValue(undefined);
      repository.save.mockResolvedValue(mockUpdatedPatient);
      mapper.toResponseDto.mockReturnValue(mockResponseDto);

      // Act
      const result = await service.execute(mockPatientId, mockUpdateDto);

      // Assert
      // 1. Find
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockPatientId });

      // 2. Validate
      expect(validator.validateUpdate).toHaveBeenCalledWith(
        mockPatientId,
        mockUpdateDto,
      );

      // 3. Save (Object.assign logic check implicitly via save arg)
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          nama_lengkap: 'Budi Baru',
          id: mockPatientId,
        }),
      );

      // 4. Events & Side Effects
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'patient.updated',
        expect.any(PatientUpdatedEvent),
      );

      // 5. Cache Invalidation
      expect(cacheService.invalidatePatientCache).toHaveBeenCalledWith(
        mockPatientId,
      );
      expect(cacheService.invalidateListCaches).toHaveBeenCalled();

      // 6. Result
      expect(result).toEqual(mockResponseDto);
    });
  });

  // 6. SUB-GROUP TESTS (Logic Branches & Errors)

  describe('Date Transformation Logic', () => {
    it('should convert tanggal_lahir string to Date object', async () => {
      // Arrange
      const dtoWithDate = { ...mockUpdateDto, tanggal_lahir: '2000-12-31' };
      const patientEntity = { ...mockExistingPatient };

      repository.findOneBy.mockResolvedValue(patientEntity);
      repository.save.mockImplementation((p) => Promise.resolve(p)); // Return what was passed
      mapper.toResponseDto.mockReturnValue({});

      // Act
      await service.execute(mockPatientId, dtoWithDate);

      // Assert
      const saveCallArg = repository.save.mock.calls[0][0];
      expect(saveCallArg.tanggal_lahir).toBeInstanceOf(Date);
      expect(saveCallArg.tanggal_lahir.toISOString()).toContain('2000-12-31');
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException if patient does not exist', async () => {
      // Arrange
      repository.findOneBy.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(999, mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );

      // Ensure process stopped
      expect(repository.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should re-throw ConflictException from validator', async () => {
      // Arrange
      repository.findOneBy.mockResolvedValue(mockExistingPatient);
      validator.validateUpdate.mockRejectedValue(
        new ConflictException('NIK duplicate'),
      );

      // Act & Assert
      await expect(
        service.execute(mockPatientId, mockUpdateDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.execute(mockPatientId, mockUpdateDto),
      ).rejects.toThrow('NIK duplicate');

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should wrap generic database errors into BadRequestException', async () => {
      // Arrange
      repository.findOneBy.mockResolvedValue(mockExistingPatient);
      // Simulate DB error
      repository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(
        service.execute(mockPatientId, mockUpdateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.execute(mockPatientId, mockUpdateDto),
      ).rejects.toThrow('Gagal mengupdate data pasien');
    });

    it('should re-throw BadRequestException (e.g. from business logic) as is', async () => {
      // Arrange
      repository.findOneBy.mockResolvedValue(mockExistingPatient);
      validator.validateUpdate.mockRejectedValue(
        new BadRequestException('Invalid logic'),
      );

      // Act & Assert
      await expect(
        service.execute(mockPatientId, mockUpdateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.execute(mockPatientId, mockUpdateDto),
      ).rejects.toThrow('Invalid logic');
      // Ensure it does NOT throw "Gagal mengupdate data pasien" wrapper
    });
  });
});
