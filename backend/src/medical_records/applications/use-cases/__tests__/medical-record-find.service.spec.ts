import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { MedicalRecordFindService } from '../medical-record-find.service';
import { MedicalRecord } from '../../../domains/entities/medical-record.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { MedicalRecordAuthorizationService } from '../../../domains/services/medical-record-authorization.service';
import { MedicalRecordValidator } from '../../../domains/validators/medical-record.validator';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

describe('MedicalRecordFindService', () => {
  let service: MedicalRecordFindService;
  let repository: Repository<MedicalRecord>;
  let authService: MedicalRecordAuthorizationService;
  let validator: MedicalRecordValidator;
  let mockQueryBuilder: any;

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

  const mockStaf: User = {
    id: 3,
    nama_lengkap: 'Staf Test',
    roles: [{ id: 3, name: UserRole.STAF }],
  } as User;

  const mockMedicalRecord: MedicalRecord = {
    id: 1,
    appointment_id: 1,
    patient_id: 1,
    doctor_id: 2,
    subjektif: 'Test',
    objektif: 'Test',
    assessment: 'Test',
    plan: 'Test',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    appointment: {
      id: 1,
      doctor_id: 2,
      status: AppointmentStatus.SELESAI,
    } as any,
  } as MedicalRecord;

  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    mockQueryBuilder = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordFindService,
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: MedicalRecordAuthorizationService,
          useValue: {
            validateViewPermission: jest.fn(),
            getRoleSummary: jest.fn().mockReturnValue('DOKTER'),
            isKepalaKlinik: jest.fn(),
            isDokter: jest.fn(),
            isStaf: jest.fn(),
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

    service = module.get<MedicalRecordFindService>(MedicalRecordFindService);
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

  // ==================== EXECUTE METHOD TESTS ====================
  describe('execute', () => {
    it('should find medical record by ID', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, mockDokter);

      expect(result).toEqual(mockMedicalRecord);
      expect(validator.validateId).toHaveBeenCalledWith(1);
      expect(validator.validateUserId).toHaveBeenCalledWith(mockDokter.id);
    });

    it('should throw NotFoundException when record not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.execute(999, mockDokter)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create query with all relations', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.appointment',
        'appointment',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.patient',
        'patient',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointment.doctor',
        'appointmentDoctor',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'appointmentDoctor.roles',
        'doctorRoles',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'record.doctor',
        'doctor',
      );
    });

    it('should filter by record ID', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('record.id = :id', {
        id: 1,
      });
    });

    it('should validate view permission after fetching', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(authService.validateViewPermission).toHaveBeenCalledWith(
        mockDokter,
        mockMedicalRecord,
      );
    });

    it('should log access with user details', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockDokter);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('accessed medical record #1'),
      );
    });
  });

  // ==================== AUTHORIZATION FILTER TESTS ====================
  describe('Authorization Filtering', () => {
    it('should not apply filter for Kepala Klinik', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockKepalaKlinik);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('doctor_id'),
        expect.any(Object),
      );
    });

    it('should apply Dokter filter for their own records', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('doctor_id'),
        expect.objectContaining({ userId: mockDokter.id }),
      );
    });

    it('should apply Staf filter for non-cancelled records', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(false);
      jest.spyOn(authService, 'isStaf').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockStaf);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('appointment.status'),
        expect.objectContaining({ cancelled: AppointmentStatus.DIBATALKAN }),
      );
    });

    it('should deny access for unknown roles', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(false);
      jest.spyOn(authService, 'isStaf').mockReturnValue(false);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.execute(1, { ...mockDokter, roles: [] } as User),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('1 = 0');
    });
  });

  // ==================== ROLE-SPECIFIC ACCESS TESTS ====================
  describe('Role-Specific Access', () => {
    it('should allow Kepala Klinik to access any record', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, mockKepalaKlinik);

      expect(result).toBeDefined();
    });

    it('should allow Dokter to access their own patient records', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, mockDokter);

      expect(result).toBeDefined();
    });

    it('should allow Dokter to access records they created', async () => {
      const recordCreatedByDokter = {
        ...mockMedicalRecord,
        doctor_id: mockDokter.id,
      };
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(recordCreatedByDokter);

      const result = await service.execute(1, mockDokter);

      expect(result).toBeDefined();
    });

    it('should allow Staf to access non-cancelled records', async () => {
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(false);
      jest.spyOn(authService, 'isStaf').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, mockStaf);

      expect(result).toBeDefined();
    });
  });

  // ==================== VALIDATION TESTS ====================
  describe('Validation', () => {
    it('should validate ID format', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(validator.validateId).toHaveBeenCalledWith(1);
    });

    it('should validate user ID', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(validator.validateUserId).toHaveBeenCalledWith(mockDokter.id);
    });

    it('should throw when ID validation fails', async () => {
      jest.spyOn(validator, 'validateId').mockImplementation(() => {
        throw new Error('Invalid ID');
      });

      await expect(service.execute(-1, mockDokter)).rejects.toThrow(
        'Invalid ID',
      );
    });

    it('should throw when user ID validation fails', async () => {
      jest.spyOn(validator, 'validateUserId').mockImplementation(() => {
        throw new Error('Invalid user ID');
      });

      await expect(service.execute(1, mockDokter)).rejects.toThrow(
        'Invalid user ID',
      );
    });
  });

  // ==================== ERROR HANDLING TESTS ====================
  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      mockQueryBuilder.getOne.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.execute(1, mockDokter)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle authorization errors', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);
      jest
        .spyOn(authService, 'validateViewPermission')
        .mockImplementation(() => {
          throw new Error('Forbidden');
        });

      await expect(service.execute(1, mockDokter)).rejects.toThrow('Forbidden');
    });

    it('should provide helpful error message when not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.execute(999, mockDokter)).rejects.toThrow(
        'Rekam medis dengan ID #999 tidak ditemukan atau Anda tidak memiliki akses',
      );
    });
  });

  // ==================== LOGGING TESTS ====================
  describe('Logging', () => {
    it('should log successful access', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockDokter);

      expect(logSpy).toHaveBeenCalled();
    });

    it('should include user ID in log', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockDokter);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`User ${mockDokter.id}`),
      );
    });

    it('should include role summary in log', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);
      jest.spyOn(authService, 'getRoleSummary').mockReturnValue('DOKTER');
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockDokter);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('(DOKTER)'));
    });

    it('should include record ID in log', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockDokter);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('medical record #1'),
      );
    });
  });

  // ==================== EDGE CASES TESTS ====================
  describe('Edge Cases', () => {
    it('should handle ID of 0', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.execute(0, mockDokter)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle very large IDs', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.execute(999999, mockDokter)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle user with multiple roles', async () => {
      const multiRoleUser = {
        ...mockDokter,
        roles: [
          { id: 1, name: UserRole.DOKTER },
          { id: 2, name: UserRole.STAF },
        ],
      } as User;
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, multiRoleUser);

      expect(result).toBeDefined();
    });

    it('should handle record with null appointment', async () => {
      const recordWithoutAppointment = {
        ...mockMedicalRecord,
        appointment: null,
      };
      mockQueryBuilder.getOne.mockResolvedValue(recordWithoutAppointment);

      await expect(service.execute(1, mockDokter)).rejects.toThrow();
    });

    it('should handle cancelled appointment for Staf', async () => {
      const cancelledRecord = {
        ...mockMedicalRecord,
        appointment: {
          ...mockMedicalRecord.appointment,
          status: AppointmentStatus.DIBATALKAN,
        },
      };
      jest.spyOn(authService, 'isKepalaKlinik').mockReturnValue(false);
      jest.spyOn(authService, 'isDokter').mockReturnValue(false);
      jest.spyOn(authService, 'isStaf').mockReturnValue(true);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.execute(1, mockStaf)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ==================== QUERY BUILDER TESTS ====================
  describe('Query Builder', () => {
    it('should build query correctly', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('record');
    });

    it('should add all necessary joins', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(5);
    });

    it('should apply where clause for ID', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockDokter);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('record.id = :id', {
        id: 1,
      });
    });
  });
});
