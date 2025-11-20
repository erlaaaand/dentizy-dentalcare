// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

import { PatientCreationService } from '../patient-creation.service';
import { Patient } from '../../../domains/entities/patient.entity';
import { CreatePatientDto } from '../../dto/create-patient.dto';
import { PatientResponseDto } from '../../dto/patient-response.dto';

// Dependencies
import { MedicalRecordNumberGenerator } from '../../../infrastructure/generator/medical-record-number.generator';
import { PatientValidator } from '../../../domains/validators/patient.validator';
import { TransactionManager } from '../../../infrastructure/transactions/transaction.manager';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';
import { PatientMapper } from '../../../domains/mappers/patient.mapper';
import { PatientCreatedEvent } from '../../../infrastructure/events/patient-created.event';

// 2. MOCK DATA
const mockDto: CreatePatientDto = {
  nama_lengkap: 'Budi Santoso',
  nik: '1234567890123456',
  tanggal_lahir: expect.any(Date),
  no_hp: '08123456789',
  alamat: 'Jl. Test',
  email: 'budi@test.com',
};

const mockPatientEntity = {
  id: 1,
  ...mockDto,
  nomor_rekam_medis: 'RM-202311-001',
  tanggal_lahir: new Date('1990-01-01'),
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
} as Patient;

const mockResponseDto = {
  id: 1,
  nama_lengkap: 'Budi Santoso',
  nomor_rekam_medis: 'RM-202311-001',
} as PatientResponseDto;

// 3. TEST SUITE
describe('PatientCreationService', () => {
  let service: PatientCreationService;

  // Mocks for Dependencies
  let mockRecordGenerator: any;
  let mockValidator: any;
  let mockTransactionManager: any;
  let mockCacheService: any;
  let mockMapper: any;
  let mockEventEmitter: any;

  // Mock Special untuk QueryRunner (TypeORM Transaction)
  const mockQueryRunner = {
    manager: {
      create: jest.fn(),
      save: jest.fn(),
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Reset semua mock
    jest.clearAllMocks();

    mockRecordGenerator = { generate: jest.fn() };
    mockValidator = { validateCreate: jest.fn() };
    mockCacheService = { invalidateListCaches: jest.fn() };
    mockMapper = { toResponseDto: jest.fn() };
    mockEventEmitter = { emit: jest.fn() };

    // PENTING: Mock Transaction Manager Logic
    mockTransactionManager = {
      // Simulasi: Saat executeWithRetry dipanggil, langsung jalankan callback-nya
      // dan berikan mockQueryRunner sebagai argumen ke callback tsb.
      executeWithRetry: jest.fn().mockImplementation(async (callback) => {
        return callback(mockQueryRunner);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientCreationService,
        {
          provide: getRepositoryToken(Patient),
          useValue: { create: jest.fn(), save: jest.fn() }, // Repository utama (jarang dipakai lgsg krn via transaction)
        },
        { provide: MedicalRecordNumberGenerator, useValue: mockRecordGenerator },
        { provide: PatientValidator, useValue: mockValidator },
        { provide: TransactionManager, useValue: mockTransactionManager },
        { provide: PatientCacheService, useValue: mockCacheService },
        { provide: PatientMapper, useValue: mockMapper },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PatientCreationService>(PatientCreationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('execute', () => {
    it('should successfully create a patient, emit event, and clear cache', async () => {
      // Arrange
      mockValidator.validateCreate.mockResolvedValue(undefined);
      mockRecordGenerator.generate.mockResolvedValue('RM-202311-001');

      // Mock QueryRunner behavior inside transaction
      mockQueryRunner.manager.create.mockReturnValue(mockPatientEntity);
      mockQueryRunner.manager.save.mockResolvedValue(mockPatientEntity);

      mockMapper.toResponseDto.mockReturnValue(mockResponseDto);

      // Act
      const result = await service.execute(mockDto);

      // Assert
      // 1. Check Transaction Flow
      expect(mockTransactionManager.executeWithRetry).toHaveBeenCalled();

      // 2. Check Logic inside Transaction
      expect(mockValidator.validateCreate).toHaveBeenCalledWith(mockDto);
      expect(mockRecordGenerator.generate).toHaveBeenCalled();
      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(Patient, expect.objectContaining({
        ...mockDto,
        nomor_rekam_medis: 'RM-202311-001',
        is_active: true,
      }));
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(mockPatientEntity);

      // 3. Check Side Effects (Outside Transaction)
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'patient.created',
        expect.any(PatientCreatedEvent)
      );
      // Memastikan payload event benar
      const eventPayload = mockEventEmitter.emit.mock.calls[0][1];
      expect(eventPayload.patient).toEqual(mockPatientEntity);

      expect(mockCacheService.invalidateListCaches).toHaveBeenCalled();

      // 4. Check Result
      expect(mockMapper.toResponseDto).toHaveBeenCalledWith(mockPatientEntity);
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw error if validation fails and NOT save patient', async () => {
      // Arrange
      const validationError = new Error('NIK already exists');
      mockValidator.validateCreate.mockRejectedValue(validationError);

      // Act & Assert
      await expect(service.execute(mockDto)).rejects.toThrow('NIK already exists');

      // Verify flow stops at validation
      expect(mockValidator.validateCreate).toHaveBeenCalled();
      expect(mockRecordGenerator.generate).not.toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).not.toHaveBeenCalled();

      // Verify no side effects
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockCacheService.invalidateListCaches).not.toHaveBeenCalled();
    });

    it('should throw error if record generation fails', async () => {
      // Arrange
      mockValidator.validateCreate.mockResolvedValue(undefined);
      mockRecordGenerator.generate.mockRejectedValue(new Error('Generator Error'));

      // Act & Assert
      await expect(service.execute(mockDto)).rejects.toThrow('Generator Error');
      expect(mockQueryRunner.manager.save).not.toHaveBeenCalled();
    });

    it('should propagate database save errors correctly', async () => {
      // Arrange
      mockValidator.validateCreate.mockResolvedValue(undefined);
      mockRecordGenerator.generate.mockResolvedValue('RM-001');
      mockQueryRunner.manager.create.mockReturnValue(mockPatientEntity);
      // Simulasi error database (misal constraint violation yg lolos validator)
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(service.execute(mockDto)).rejects.toThrow('DB Error');

      // Ensure side effects did NOT happen
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockCacheService.invalidateListCaches).not.toHaveBeenCalled();
    });
  });
});