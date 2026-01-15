import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { MedicalRecordAppointmentFinderService } from '../medical-record-appointment-finder.service';
import { MedicalRecord } from '../../../domains/entities/medical-record.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';
import { MedicalRecordAuthorizationService } from '../../../domains/services/medical-record-authorization.service';
import { MedicalRecordValidator } from '../../../domains/validators/medical-record.validator';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

describe('MedicalRecordAppointmentFinderService', () => {
  let service: MedicalRecordAppointmentFinderService;
  let repository: Repository<MedicalRecord>;
  let authService: MedicalRecordAuthorizationService;
  let validator: MedicalRecordValidator;

  // ==================== MOCK DATA ====================
  const mockUser: User = {
    id: 1,
    nama_lengkap: 'Dr. Test',
    roles: [{ id: 1, name: UserRole.DOKTER }],
  } as User;

  const mockMedicalRecord: MedicalRecord = {
    id: 1,
    appointment_id: 1,
    patient_id: 1,
    doctor_id: 1,
    subjektif: 'Test subjektif',
    objektif: 'Test objektif',
    assessment: 'Test assessment',
    plan: 'Test plan',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    appointment: {
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      status: AppointmentStatus.SELESAI,
      patient: {
        id: 1,
        nama_lengkap: 'Patient Test',
      },
      doctor: {
        id: 1,
        name: 'Dr. Test',
        roles: [{ id: 1, name: UserRole.DOKTER }],
      },
    },
  } as any;

  // ==================== SETUP AND TEARDOWN ====================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordAppointmentFinderService,
        {
          provide: getRepositoryToken(MedicalRecord),
          useValue: {
            findOne: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: MedicalRecordAuthorizationService,
          useValue: {
            validateViewPermission: jest.fn(),
            getRoleSummary: jest.fn().mockReturnValue('DOKTER'),
          },
        },
        {
          provide: MedicalRecordValidator,
          useValue: {
            validateAppointmentId: jest.fn(),
            validateUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MedicalRecordAppointmentFinderService>(
      MedicalRecordAppointmentFinderService,
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

  // ==================== EXECUTE METHOD TESTS ====================
  describe('execute', () => {
    it('should find medical record by appointment ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, mockUser);

      expect(result).toEqual(mockMedicalRecord);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { appointment_id: 1 },
        relations: [
          'appointment',
          'appointment.patient',
          'appointment.doctor',
          'appointment.doctor.roles',
          'doctor',
          'patient',
        ],
      });
    });

    it('should return null when no record found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      const result = await service.execute(1, mockUser);

      expect(result).toBeNull();
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('No medical record found'),
      );
    });

    it('should validate appointment ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockUser);

      expect(validator.validateAppointmentId).toHaveBeenCalledWith(1);
    });

    it('should validate user ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockUser);

      expect(validator.validateUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it('should validate user has permission to view', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockUser);

      expect(authService.validateViewPermission).toHaveBeenCalledWith(
        mockUser,
        mockMedicalRecord,
      );
    });

    it('should log access when record is found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockUser);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('accessed medical record'),
      );
    });

    it('should include user role in log', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockUser);

      expect(authService.getRoleSummary).toHaveBeenCalledWith(mockUser);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('DOKTER'));
    });

    it('should include all required relations', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: expect.arrayContaining([
            'appointment',
            'appointment.patient',
            'appointment.doctor',
            'appointment.doctor.roles',
            'doctor',
            'patient',
          ]),
        }),
      );
    });
  });

  // ==================== EXISTS METHOD TESTS ====================
  describe('exists', () => {
    it('should return true when record exists', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);

      const result = await service.exists(1);

      expect(result).toBe(true);
      expect(repository.count).toHaveBeenCalledWith({
        where: { appointment_id: 1 },
      });
    });

    it('should return false when record does not exist', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(0);

      const result = await service.exists(1);

      expect(result).toBe(false);
    });

    it('should validate appointment ID', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(0);

      await service.exists(1);

      expect(validator.validateAppointmentId).toHaveBeenCalledWith(1);
    });

    it('should return true when multiple records exist', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(2);

      const result = await service.exists(1);

      expect(result).toBe(true);
    });

    it('should handle different appointment IDs', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);

      await service.exists(999);

      expect(repository.count).toHaveBeenCalledWith({
        where: { appointment_id: 999 },
      });
    });
  });

  // ==================== AUTHORIZATION TESTS ====================
  describe('Authorization', () => {
    it('should allow Kepala Klinik to view any record', async () => {
      const kepalaKlinik = {
        ...mockUser,
        roles: [{ id: 1, name: UserRole.KEPALA_KLINIK }],
      } as User;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, kepalaKlinik);

      expect(result).toBeDefined();
      expect(authService.validateViewPermission).toHaveBeenCalled();
    });

    it('should allow Dokter to view their own records', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, mockUser);

      expect(result).toBeDefined();
    });

    it('should allow Staf to view records', async () => {
      const stafUser = {
        ...mockUser,
        roles: [{ id: 1, name: UserRole.STAF }],
      } as User;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, stafUser);

      expect(result).toBeDefined();
    });

    it('should throw when user lacks permission', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest
        .spyOn(authService, 'validateViewPermission')
        .mockImplementation(() => {
          throw new Error('Forbidden');
        });

      await expect(service.execute(1, mockUser)).rejects.toThrow('Forbidden');
    });
  });

  // ==================== ERROR HANDLING TESTS ====================
  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.execute(1, mockUser)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle validation errors', async () => {
      jest.spyOn(validator, 'validateAppointmentId').mockImplementation(() => {
        throw new Error('Invalid appointment ID');
      });

      await expect(service.execute(-1, mockUser)).rejects.toThrow(
        'Invalid appointment ID',
      );
    });

    it('should handle authorization errors', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest
        .spyOn(authService, 'validateViewPermission')
        .mockImplementation(() => {
          throw new Error('Unauthorized');
        });

      await expect(service.execute(1, mockUser)).rejects.toThrow(
        'Unauthorized',
      );
    });

    it('should handle count errors in exists method', async () => {
      jest
        .spyOn(repository, 'count')
        .mockRejectedValue(new Error('Count failed'));

      await expect(service.exists(1)).rejects.toThrow('Count failed');
    });
  });

  // ==================== LOGGING TESTS ====================
  describe('Logging', () => {
    it('should log when no record is found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockUser);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('No medical record found for appointment #1'),
      );
    });

    it('should log successful access with user and record details', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockUser);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /User \d+ \(.*\) accessed medical record #\d+ via appointment #\d+/,
        ),
      );
    });

    it('should include role summary in log message', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);
      jest.spyOn(authService, 'getRoleSummary').mockReturnValue('DOKTER');
      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.execute(1, mockUser);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('(DOKTER)'));
    });
  });

  // ==================== EDGE CASES TESTS ====================
  describe('Edge Cases', () => {
    it('should handle appointment ID of 0', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.execute(0, mockUser);

      expect(validator.validateAppointmentId).toHaveBeenCalledWith(0);
      expect(result).toBeNull();
    });

    it('should handle large appointment IDs', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.execute(999999, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { appointment_id: 999999 },
        }),
      );
    });

    it('should handle user with multiple roles', async () => {
      const multiRoleUser = {
        ...mockUser,
        roles: [
          { id: 1, name: UserRole.DOKTER },
          { id: 2, name: UserRole.STAF },
        ],
      } as User;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      const result = await service.execute(1, multiRoleUser);

      expect(result).toBeDefined();
      expect(authService.validateViewPermission).toHaveBeenCalled();
    });

    it('should handle deleted medical records', async () => {
      const deletedRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        deleted_at: new Date(),
      });

      jest.spyOn(repository, 'findOne').mockResolvedValue(deletedRecord);

      const result = await service.execute(1, mockUser);

      expect(result).toEqual(deletedRecord);
    });

    it('should handle record without all relations', async () => {
      const partialRecord = Object.assign(new MedicalRecord(), {
        ...mockMedicalRecord,
        appointment: null,
        doctor: null,
        patient: null,
      });
      jest.spyOn(repository, 'findOne').mockResolvedValue(partialRecord);
      const result = await service.execute(1, mockUser);
      expect(result).toEqual(partialRecord);
    });
  });

  // ==================== PERFORMANCE TESTS ====================
  describe('Performance', () => {
    it('should use single query with all relations', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockMedicalRecord);

      await service.execute(1, mockUser);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should not load unnecessary data in exists check', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(1);

      await service.exists(1);

      expect(repository.count).toHaveBeenCalledWith({
        where: { appointment_id: 1 },
      });
      expect(repository.findOne).not.toHaveBeenCalled();
    });
  });
});
