// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { MedicalRecordCreationService } from '../medical-record-creation.service';
import { CreateMedicalRecordDto } from '../../../applications/dto/create-medical-record.dto';
import { MedicalRecord } from '../../../domains/entities/medical-record.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../appointments/domains/entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { MedicalRecordMapper } from '../../../domains/mappers/medical-record.mappers';
import { MedicalRecordDomainService } from '../../../domains/services/medical-record-domain.service';
import { MedicalRecordAuthorizationService } from '../../../domains/services/medical-record-authorization.service';
import { MedicalRecordValidator } from '../../../domains/validators/medical-record.validator';
import { UserRole } from '../../../../roles/entities/role.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockUser = (
  id: number = 2,
  role: UserRole = UserRole.DOKTER,
): User =>
  ({
    id,
    nama_lengkap: 'Dr. Test',
    username: 'dr.test',
    roles: [{ id: 1, name: role, description: 'Test role' }],
  }) as User;

const createMockDto = (): CreateMedicalRecordDto => ({
  appointment_id: 10,
  user_id_staff: 2,
  subjektif: 'Pasien mengeluh sakit kepala',
  objektif: 'TD: 120/80',
  assessment: 'Tension headache',
  plan: 'Istirahat cukup',
});

const createMockAppointment = (): Appointment =>
  ({
    id: 10,
    patient_id: 3,
    doctor_id: 2,
    tanggal_janji: new Date(),
    status: AppointmentStatus.DIJADWALKAN,
    patient: { id: 3 } as any,
    doctor: { id: 2 } as any,
  }) as Appointment;

const createMockMedicalRecord = (): MedicalRecord => {
  const record = new MedicalRecord();
  return Object.assign(record, {
    id: 1,
    appointment_id: 10,
    doctor_id: 2,
    patient_id: 3,
    subjektif: 'Test',
    objektif: 'Test',
    assessment: 'Test',
    plan: 'Test',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    appointment: createMockAppointment(),
    doctor: createMockUser(2, UserRole.DOKTER),
    patient: createMockUser(3, UserRole.STAF),
  });
};

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordCreationService', () => {
  let service: MedicalRecordCreationService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let mapper: MedicalRecordMapper;
  let domainService: MedicalRecordDomainService;
  let authService: MedicalRecordAuthorizationService;
  let validator: MedicalRecordValidator;

  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  beforeEach(async () => {
    // Mock QueryRunner
    const mockManager = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockManager,
    } as any;

    // Mock DataSource
    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
      manager: {
        findOne: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordCreationService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: MedicalRecordMapper,
          useValue: {
            toEntity: jest.fn(),
          },
        },
        {
          provide: MedicalRecordDomainService,
          useValue: {
            validateAppointmentEligibility: jest.fn(),
            validateNoExistingRecord: jest.fn(),
            validateAllSOAPFields: jest.fn(),
            shouldUpdateAppointmentStatus: jest.fn(),
          },
        },
        {
          provide: MedicalRecordAuthorizationService,
          useValue: {
            validateCreatePermission: jest.fn(),
          },
        },
        {
          provide: MedicalRecordValidator,
          useValue: {
            validateAppointmentId: jest.fn(),
            validateUserId: jest.fn(),
            validateExists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MedicalRecordCreationService>(
      MedicalRecordCreationService,
    );
    dataSource = module.get<DataSource>(DataSource);
    mapper = module.get<MedicalRecordMapper>(MedicalRecordMapper);
    domainService = module.get<MedicalRecordDomainService>(
      MedicalRecordDomainService,
    );
    authService = module.get<MedicalRecordAuthorizationService>(
      MedicalRecordAuthorizationService,
    );
    validator = module.get<MedicalRecordValidator>(MedicalRecordValidator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================================
  // EXECUTE METHOD TESTS
  // ==========================================================================
  describe('execute', () => {
    it('should create medical record successfully', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      const savedRecord = Object.assign(
        new MedicalRecord(),
        createMockMedicalRecord(),
      );

      // Spy/loadRecordWithRelations (private method) → gunakan 'as any'
      jest
        .spyOn(service as any, 'loadRecordWithRelations')
        .mockResolvedValue(savedRecord);

      // Spy queryRunner.manager methods
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment) // fetchAppointment
        .mockResolvedValueOnce(null) // checkExistingRecord
        .mockResolvedValueOnce(savedRecord); // jika ada call lain

      // Spy create → cast any agar TS tidak complain
      jest
        .spyOn(queryRunner.manager, 'create' as any)
        .mockImplementation(() => savedRecord);

      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(savedRecord);

      // Spy mapper
      jest.spyOn(mapper, 'toEntity').mockReturnValue({
        appointment_id: dto.appointment_id,
        doctor_id: user.id,
      } as any);

      // Spy domainService
      jest
        .spyOn(domainService, 'shouldUpdateAppointmentStatus')
        .mockReturnValue(true);

      // Execute
      const result = await service.execute(dto, user);

      // Assertions
      expect(result).toBeDefined();
      expect(result.id).toBe(savedRecord.id);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should validate appointment ID', async () => {
      const dto = createMockDto();
      const user = createMockUser();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);

      await expect(service.execute(dto, user)).rejects.toThrow();

      expect(validator.validateAppointmentId).toHaveBeenCalledWith(
        dto.appointment_id,
      );
    });

    it('should validate user ID', async () => {
      const dto = createMockDto();
      const user = createMockUser();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);

      await expect(service.execute(dto, user)).rejects.toThrow();

      expect(validator.validateUserId).toHaveBeenCalledWith(user.id);
    });

    it('should throw NotFoundException when appointment not found', async () => {
      const dto = createMockDto();
      const user = createMockUser();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);

      await expect(service.execute(dto, user)).rejects.toThrow(
        NotFoundException,
      );

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should validate appointment eligibility', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(appointment);

      jest
        .spyOn(domainService, 'validateAppointmentEligibility')
        .mockImplementation(() => {
          throw new Error('Invalid appointment');
        });

      await expect(service.execute(dto, user)).rejects.toThrow();

      expect(domainService.validateAppointmentEligibility).toHaveBeenCalledWith(
        appointment,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should validate create permission', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(appointment);

      jest
        .spyOn(authService, 'validateCreatePermission')
        .mockImplementation(() => {
          throw new Error('No permission');
        });

      await expect(service.execute(dto, user)).rejects.toThrow();

      expect(authService.validateCreatePermission).toHaveBeenCalledWith(
        user,
        appointment,
      );
    });

    it('should check for existing medical record', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      const existingRecord = createMockMedicalRecord();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce(existingRecord);

      jest
        .spyOn(domainService, 'validateNoExistingRecord')
        .mockImplementation(() => {
          throw new ConflictException('Record exists');
        });

      await expect(service.execute(dto, user)).rejects.toThrow(
        ConflictException,
      );

      expect(domainService.validateNoExistingRecord).toHaveBeenCalledWith(
        existingRecord,
      );
    });

    it('should validate SOAP fields', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce(null);

      const entityData = { appointment_id: 10, doctor_id: 2 };
      jest.spyOn(mapper, 'toEntity').mockReturnValue(entityData as any);

      jest
        .spyOn(domainService, 'validateAllSOAPFields')
        .mockImplementation(() => {
          throw new Error('Invalid SOAP');
        });

      await expect(service.execute(dto, user)).rejects.toThrow();

      expect(domainService.validateAllSOAPFields).toHaveBeenCalled();
    });

    it('should update appointment status to SELESAI', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      const savedRecord = createMockMedicalRecord();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedRecord);

      jest
        .spyOn(queryRunner.manager, 'create' as any)
        .mockImplementation(() => savedRecord);

      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(savedRecord);

      jest.spyOn(mapper, 'toEntity').mockReturnValue({} as any);

      jest
        .spyOn(domainService, 'shouldUpdateAppointmentStatus')
        .mockReturnValue(true);

      await service.execute(dto, user);

      expect(domainService.shouldUpdateAppointmentStatus).toHaveBeenCalledWith(
        appointment,
      );
      expect(appointment.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should not update appointment status if already SELESAI', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      appointment.status = AppointmentStatus.SELESAI;
      const savedRecord = createMockMedicalRecord();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedRecord);

      jest
        .spyOn(queryRunner.manager, 'create' as any)
        .mockImplementation(() => savedRecord);

      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(savedRecord);

      jest.spyOn(mapper, 'toEntity').mockReturnValue({} as any);

      jest
        .spyOn(domainService, 'shouldUpdateAppointmentStatus')
        .mockReturnValue(false);

      await service.execute(dto, user);

      expect(domainService.shouldUpdateAppointmentStatus).toHaveBeenCalledWith(
        appointment,
      );
      // Status should remain SELESAI
      expect(appointment.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should rollback transaction on error', async () => {
      const dto = createMockDto();
      const user = createMockUser();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.execute(dto, user)).rejects.toThrow();

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should set patient_id from appointment', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      const savedRecord = createMockMedicalRecord();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedRecord);

      const entityData = { appointment_id: 10, doctor_id: 2 };
      jest.spyOn(mapper, 'toEntity').mockReturnValue(entityData as any);

      jest
        .spyOn(queryRunner.manager, 'create' as any)
        .mockImplementation(() => savedRecord);

      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(savedRecord);

      jest
        .spyOn(domainService, 'shouldUpdateAppointmentStatus')
        .mockReturnValue(false);

      await service.execute(dto, user);

      expect(entityData['patient_id']).toBe(appointment.patient_id);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle cancelled appointment', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      appointment.status = AppointmentStatus.DIBATALKAN;

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(appointment);

      jest
        .spyOn(domainService, 'validateAppointmentEligibility')
        .mockImplementation(() => {
          throw new ConflictException('Cannot create for cancelled');
        });

      await expect(service.execute(dto, user)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle user without permission', async () => {
      const dto = createMockDto();
      const user = createMockUser(3); // Different doctor
      const appointment = createMockAppointment(); // For doctor 2

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(appointment);

      jest
        .spyOn(authService, 'validateCreatePermission')
        .mockImplementation(() => {
          throw new Error('No permission');
        });

      await expect(service.execute(dto, user)).rejects.toThrow();
    });

    it('should handle duplicate record creation attempt', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      const existingRecord = createMockMedicalRecord();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce(existingRecord);

      jest
        .spyOn(domainService, 'validateNoExistingRecord')
        .mockImplementation(() => {
          throw new ConflictException('Record exists');
        });

      await expect(service.execute(dto, user)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ==========================================================================
  // TRANSACTION HANDLING
  // ==========================================================================
  describe('Transaction Handling', () => {
    it('should release connection even after commit', async () => {
      const dto = createMockDto();
      const user = createMockUser();
      const appointment = createMockAppointment();
      const savedRecord = createMockMedicalRecord();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValueOnce(appointment)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(savedRecord);

      jest
        .spyOn(queryRunner.manager, 'create' as any)
        .mockImplementation(() => savedRecord);

      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(savedRecord);

      jest.spyOn(mapper, 'toEntity').mockReturnValue({} as any);

      jest
        .spyOn(domainService, 'shouldUpdateAppointmentStatus')
        .mockReturnValue(false);

      await service.execute(dto, user);

      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should release connection even after rollback', async () => {
      const dto = createMockDto();
      const user = createMockUser();

      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockRejectedValue(new Error('Test error'));

      await expect(service.execute(dto, user)).rejects.toThrow();

      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
