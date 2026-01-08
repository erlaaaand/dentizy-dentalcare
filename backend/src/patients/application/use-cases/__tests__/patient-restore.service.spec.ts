// __tests__/applications/services/patient-restore.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { PatientRestoreService } from '../patient-restore.service';
import { PatientRepository } from '../../../infrastructure/persistence/repositories/patients.repository';
import { PatientCacheService } from '../../../infrastructure/cache/patient-cache.service';
import { Patient } from '../../../domains/entities/patient.entity';

// 2. MOCK DATA
const mockPatientId = 1;
const mockSoftDeletedPatient = {
  id: mockPatientId,
  nama_lengkap: 'John Doe Deleted',
  deleted_at: new Date(), // Menandakan ini soft deleted
} as Patient;

// 3. TEST SUITE
describe('PatientRestoreService', () => {
  let service: PatientRestoreService;
  let customRepository: any;
  let cacheService: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock Custom Repository
    customRepository = {
      findSoftDeletedById: jest.fn(),
      restore: jest.fn(),
    };

    // Mock Cache Service
    cacheService = {
      invalidatePatientCache: jest.fn(),
      invalidateListCaches: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientRestoreService,
        { provide: PatientRepository, useValue: customRepository },
        { provide: PatientCacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<PatientRestoreService>(PatientRestoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('execute', () => {
    // --- Scenario: Success ---
    it('should successfully restore a soft-deleted patient and invalidate cache', async () => {
      // Arrange
      customRepository.findSoftDeletedById.mockResolvedValue(
        mockSoftDeletedPatient,
      );
      customRepository.restore.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.execute(mockPatientId);

      // Assert
      // 1. Verify Finder
      expect(customRepository.findSoftDeletedById).toHaveBeenCalledWith(
        mockPatientId,
      );

      // 2. Verify Restore Action
      expect(customRepository.restore).toHaveBeenCalledWith(mockPatientId);

      // 3. Verify Cache Invalidation
      expect(cacheService.invalidatePatientCache).toHaveBeenCalledWith(
        mockPatientId,
      );
      expect(cacheService.invalidateListCaches).toHaveBeenCalled();

      // 4. Verify Response
      expect(result).toEqual({
        message: `Pasien ${mockSoftDeletedPatient.nama_lengkap} berhasil dipulihkan`,
      });
    });

    // --- Scenario: Not Found ---
    it('should throw NotFoundException if patient is not found or not deleted', async () => {
      // Arrange
      customRepository.findSoftDeletedById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(999)).rejects.toThrow(NotFoundException);
      await expect(service.execute(999)).rejects.toThrow(
        /tidak ditemukan atau tidak dihapus/,
      );

      // Verify operations stopped
      expect(customRepository.restore).not.toHaveBeenCalled();
      expect(cacheService.invalidatePatientCache).not.toHaveBeenCalled();
    });

    // --- Scenario: Database Error (Generic) ---
    it('should throw BadRequestException if restore operation fails', async () => {
      // Arrange
      customRepository.findSoftDeletedById.mockResolvedValue(
        mockSoftDeletedPatient,
      );
      // Simulasi error database saat restore
      customRepository.restore.mockRejectedValue(
        new Error('DB Constraint Error'),
      );

      // Act & Assert
      // Service harus membungkus error generik menjadi BadRequestException
      await expect(service.execute(mockPatientId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.execute(mockPatientId)).rejects.toThrow(
        'Gagal memulihkan pasien',
      );

      // Verify cache NOT invalidated on failure
      expect(cacheService.invalidatePatientCache).not.toHaveBeenCalled();
    });

    // --- Scenario: Error Re-throw ---
    it('should re-throw NotFoundException as-is without wrapping it in BadRequest', async () => {
      // Arrange
      // Simulasi: findSoftDeletedById melempar error, atau logika internal melempar NotFound
      customRepository.findSoftDeletedById.mockResolvedValue(null);

      try {
        await service.execute(mockPatientId);
      } catch (error) {
        // Assert
        // Pastikan error yang ditangkap adalah NotFoundException, BUKAN BadRequestException
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error).not.toBeInstanceOf(BadRequestException);
      }
    });
  });
});
