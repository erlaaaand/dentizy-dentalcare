import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { MedicalRecordDeletionService } from '../medical-record-deletion.service';
import { MedicalRecord } from '../../../domains/entities/medical-record.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { MedicalRecordAuthorizationService } from '../../../domains/services/medical-record-authorization.service';
import { MedicalRecordValidator } from '../../../domains/validators/medical-record.validator';

describe('MedicalRecordDeletionService', () => {
  let service: MedicalRecordDeletionService;
  let repository: Repository<MedicalRecord>;
  let authService: MedicalRecordAuthorizationService;
  let validator: MedicalRecordValidator;

  // ==================== MOCK DATA ====================
  const mockKepalaKlinik: User = {
    id: 1,
    nama_lengkap: 'Kepala Klinik',
    roles: [{ id: 1, name: UserRole.KEPALA_KLINIK }],
  } as User;

  const mockDokter: User = {
    id: 2,
    nama_lengkap: 'Dr. Test',
    roles: [{ id: 2, name: UserRole.DOKTER }],
  } as User;

  const mockMedicalRecord: MedicalRecord = {
    id: 1,
    appointment_id: 1,
    patient_id: 1,
    doctor_id: 1,
    subjektif: 'Test',
    objektif: 'Test',
    assessment: 'Test',
    plan: 'Test',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    appointment: {} as any,
    patient: {} as any,
    doctor: {} as any,
  } as MedicalRecord;

  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordDeletionService,
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: {
            findOne: jest.fn(),
            softRemove: jest.fn(),
            remove: jest.fn(),
            recover: jest.fn(),
          },
        },
        {
          provide: MedicalRecordAuthorizationService,
          useValue: {
            validateDeletePermission: jest.fn(),
            getRoleSummary: jest.fn().mockReturnValue('KEPALA_KLINIK'),
          },
        },
        {
          provide: MedicalRecordValidator,
          useValue: {
            validateId: jest.fn(),
            validateUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MedicalRecordDeletionService>(
      MedicalRecordDeletionService,
    );
    repository = module.get<Repository<MedicalRecord>>(
      getRepositoryToken(MedicalRecord),
    );
    authService = module.get<MedicalRecordAuthorizationService>(
      MedicalRecordAuthorizationService,
    );
    validator = module.get<MedicalRecordValidator>(MedicalRecordValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== EXECUTE (SOFT DELETE) TESTS ====================
  describe('execute (soft delete)', () => {
    it('should soft delete medical record successfully', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockKepalaKlinik);

      expect(repository.softRemove).toHaveBeenCalledWith(mockMedicalRecord);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('successfully deleted'),
      );
    });

    it('should validate ID before deletion', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockKepalaKlinik);

      expect(validator.validateId).toHaveBeenCalledWith(1);
    });

    it('should validate user ID before deletion', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockKepalaKlinik);

      expect(validator.validateUserId).toHaveBeenCalledWith(
        mockKepalaKlinik.id,
      );
    });

    it('should check authorization before deletion', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockKepalaKlinik);

      expect(authService.validateDeletePermission).toHaveBeenCalledWith(
        mockKepalaKlinik,
      );
    });

    it('should throw NotFoundException when record not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.execute(999, mockKepalaKlinik)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when non-Kepala Klinik tries to delete', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest
        .spyOn(authService, 'validateDeletePermission')
        .mockImplementation(() => {
          throw new Error('Forbidden');
        });

      await expect(service.execute(1, mockDokter)).rejects.toThrow('Forbidden');
    });

    it('should log deletion warning with user details', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await service.execute(1, mockKepalaKlinik);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deleting medical record'),
      );
    });

    it('should include patient ID in log', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await service.execute(1, mockKepalaKlinik);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('patient #1'),
      );
    });

    it('should load relations before deletion', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockKepalaKlinik);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['appointment', 'patient', 'doctor'],
      });
    });
  });

  // ==================== HARD DELETE TESTS ====================
  describe('hardDelete', () => {
    it('should permanently delete medical record', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockMedicalRecord);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await service.hardDelete(1, mockKepalaKlinik);

      expect(repository.remove).toHaveBeenCalledWith(mockMedicalRecord);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('PERMANENTLY DELETED'),
      );
    });

    it('should validate authorization for hard delete', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockMedicalRecord);

      await service.hardDelete(1, mockKepalaKlinik);

      expect(authService.validateDeletePermission).toHaveBeenCalledWith(
        mockKepalaKlinik,
      );
    });

    it('should include soft-deleted records in search', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockMedicalRecord);

      await service.hardDelete(1, mockKepalaKlinik);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
    });

    it('should throw when record not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.hardDelete(999, mockKepalaKlinik)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log HARD DELETE warning', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockMedicalRecord);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await service.hardDelete(1, mockKepalaKlinik);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('HARD DELETE'),
      );
    });

    it('should log permanent deletion confirmation', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockMedicalRecord);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await service.hardDelete(1, mockKepalaKlinik);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('PERMANENTLY DELETED'),
      );
    });
  });

  // ==================== RESTORE TESTS ====================
  describe('restore', () => {
    it('should restore soft-deleted record', async () => {
      const deletedRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      });
      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedRecord);
      jest.spyOn(repository, 'recover').mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      const result = await service.restore(1, mockKepalaKlinik);

      expect(result).toBeDefined();
      expect(repository.recover).toHaveBeenCalledWith(deletedRecord);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('restored medical record'),
      );
    });

    it('should validate authorization for restore', async () => {
      const deletedRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      });
      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedRecord);
      jest.spyOn(repository, 'recover').mockResolvedValue(mockMedicalRecord);

      await service.restore(1, mockKepalaKlinik);

      expect(authService.validateDeletePermission).toHaveBeenCalledWith(
        mockKepalaKlinik,
      );
    });

    it('should include soft-deleted records in search', async () => {
      const deletedRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      });
      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedRecord);
      jest.spyOn(repository, 'recover').mockResolvedValue(mockMedicalRecord);

      await service.restore(1, mockKepalaKlinik);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
    });

    it('should throw when record not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.restore(999, mockKepalaKlinik)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when record is not deleted', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      await expect(service.restore(1, mockKepalaKlinik)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log restoration with user details', async () => {
      const deletedRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      });
      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedRecord);
      jest.spyOn(repository, 'recover').mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.restore(1, mockKepalaKlinik);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('User 1 restored'),
      );
    });
  });

  // ==================== AUTHORIZATION TESTS ====================
  describe('Authorization', () => {
    it('should allow only Kepala Klinik to delete', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockKepalaKlinik);

      expect(authService.validateDeletePermission).toHaveBeenCalledWith(
        mockKepalaKlinik,
      );
    });

    it('should deny Dokter from deleting', async () => {
      jest
        .spyOn(authService, 'validateDeletePermission')
        .mockImplementation(() => {
          throw new Error('Only Kepala Klinik can delete');
        });

      await expect(service.execute(1, mockDokter)).rejects.toThrow(
        'Only Kepala Klinik can delete',
      );
    });

    it('should deny Staf from deleting', async () => {
      const stafUser = {
        ...mockDokter,
        roles: [{ id: 3, name: UserRole.STAF }],
      } as User;
      jest
        .spyOn(authService, 'validateDeletePermission')
        .mockImplementation(() => {
          throw new Error('Only Kepala Klinik can delete');
        });

      await expect(service.execute(1, stafUser)).rejects.toThrow(
        'Only Kepala Klinik can delete',
      );
    });
  });

  // ==================== ERROR HANDLING TESTS ====================
  describe('Error Handling', () => {
    it('should handle database errors during soft delete', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest
        .spyOn(repository, 'softRemove')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.execute(1, mockKepalaKlinik)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle database errors during hard delete', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest
        .spyOn(repository, 'remove')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.hardDelete(1, mockKepalaKlinik)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle database errors during restore', async () => {
      const deletedRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      });
      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedRecord);
      jest
        .spyOn(repository, 'recover')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.restore(1, mockKepalaKlinik)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle validation errors', async () => {
      jest.spyOn(validator, 'validateId').mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      await expect(service.execute(-1, mockKepalaKlinik)).rejects.toThrow(
        'Invalid ID',
      );
    });
  });

  // ==================== EDGE CASES TESTS ====================
  describe('Edge Cases', () => {
    it('should handle deletion of already deleted record', async () => {
      const deletedRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      });
      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedRecord);
      jest.spyOn(repository, 'softRemove').mockResolvedValue(deletedRecord);

      await service.execute(1, mockKepalaKlinik);

      expect(repository.softRemove).toHaveBeenCalled();
    });

    it('should handle record with null relations', async () => {
      const recordWithoutRelations = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        appointment: undefined,
        patient: undefined,
        doctor: undefined,
      });
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(recordWithoutRelations);
      jest
        .spyOn(repository, 'softRemove')
        .mockResolvedValue(recordWithoutRelations);

      await service.execute(1, mockKepalaKlinik);

      expect(repository.softRemove).toHaveBeenCalled();
    });

    it('should handle ID of 0', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.execute(0, mockKepalaKlinik)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle very large ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.execute(999999, mockKepalaKlinik)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
