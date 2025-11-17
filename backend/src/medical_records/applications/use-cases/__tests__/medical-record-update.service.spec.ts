// ============================================================================
// IMPORTS
// ============================================================================
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MedicalRecordUpdateService } from '../medical-record-update.service';
import { UpdateMedicalRecordDto } from '../../../applications/dto/update-medical-record.dto';
import { MedicalRecord } from '../../../domains/entities/medical-record.entity';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { MedicalRecordMapper } from '../../../domains/mappers/medical-record.mappers';
import { MedicalRecordDomainService } from '../../../domains/services/medical-record-domain.service';
import { MedicalRecordAuthorizationService } from '../../../domains/services/medical-record-authorization.service';
import { MedicalRecordValidator } from '../../../domains/validators/medical-record.validator';
import { UserRole } from '../../../../roles/entities/role.entity';

// ============================================================================
// MOCK DATA
// ============================================================================
const createMockUser = (id: number = 2): User => ({
  id,
  nama_lengkap: 'Dr. Test',
  username: 'dr.test',
  roles: [{ id: 1, name: UserRole.DOKTER, description: 'Doctor' }],
} as User);

const createMockUpdateDto = (): UpdateMedicalRecordDto => ({
  subjektif: 'Updated subjektif',
  objektif: 'Updated objektif',
  assessment: 'Updated assessment',
  plan: 'Updated plan',
});

const createMockMedicalRecord = (): MedicalRecord => ({
  id: 1,
  appointment_id: 10,
  doctor_id: 2,
  patient_id: 3,
  subjektif: 'Old subjektif',
  objektif: 'Old objektif',
  assessment: 'Old assessment',
  plan: 'Old plan',
  created_at: new Date(),
  updated_at: new Date(),
  appointment: {
    id: 10,
    doctor_id: 2,
    status: AppointmentStatus.DIJADWALKAN,
  } as Appointment,
} as MedicalRecord);

// ============================================================================
// TEST SUITE
// ============================================================================
describe('MedicalRecordUpdateService', () => {
  let service: MedicalRecordUpdateService;
  let dataSource: DataSource;
  let mapper: MedicalRecordMapper;
  let domainService: MedicalRecordDomainService;
  let authService: MedicalRecordAuthorizationService;
  let validator: MedicalRecordValidator;

  // Mock transaction
  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTransaction = jest.fn();

  // ==========================================================================
  // SETUP AND TEARDOWN
  // ==========================================================================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordUpdateService,
        {
          provide: DataSource,
          useValue: {
            transaction: mockTransaction,
          },
        },
        {
          provide: MedicalRecordMapper,
          useValue: {
            toUpdateEntity: jest.fn(),
          },
        },
        {
          provide: MedicalRecordDomainService,
          useValue: {
            validateAppointmentForUpdate: jest.fn(),
            validateUpdateHasChanges: jest.fn(),
            validateAllSOAPFields: jest.fn(),
            mergeUpdateData: jest.fn(),
            shouldUpdateAppointmentStatus: jest.fn(),
          },
        },
        {
          provide: MedicalRecordAuthorizationService,
          useValue: {
            validateUpdatePermission: jest.fn(),
            getRoleSummary: jest.fn().mockReturnValue('DOKTER'),
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

    service = module.get<MedicalRecordUpdateService>(MedicalRecordUpdateService);
    dataSource = module.get<DataSource>(DataSource);
    mapper = module.get<MedicalRecordMapper>(MedicalRecordMapper);
    domainService = module.get<MedicalRecordDomainService>(MedicalRecordDomainService);
    authService = module.get<MedicalRecordAuthorizationService>(MedicalRecordAuthorizationService);
    validator = module.get<MedicalRecordValidator>(MedicalRecordValidator);

    // Reset mocks
    mockTransaction.mockImplementation(async (callback) => {
      return await callback(mockManager);
    });
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
    it('should update medical record successfully', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const updateData = { subjektif: 'Updated' };
      const mergedRecord = { ...existingRecord, ...updateData };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(mergedRecord);

      mockManager.save.mockResolvedValue(mergedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue(updateData as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(mergedRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      const result = await service.execute(id, dto, user);

      expect(result).toBeDefined();
      expect(validator.validateId).toHaveBeenCalledWith(id);
      expect(validator.validateUserId).toHaveBeenCalledWith(user.id);
      expect(mockManager.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when record not found', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();

      mockManager.findOne.mockResolvedValue(null);

      await expect(service.execute(id, dto, user))
        .rejects.toThrow(NotFoundException);
    });

    it('should validate ID', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();

      mockManager.findOne.mockResolvedValue(null);

      await expect(service.execute(id, dto, user)).rejects.toThrow();

      expect(validator.validateId).toHaveBeenCalledWith(id);
    });

    it('should validate user ID', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();

      mockManager.findOne.mockResolvedValue(null);

      await expect(service.execute(id, dto, user)).rejects.toThrow();

      expect(validator.validateUserId).toHaveBeenCalledWith(user.id);
    });

    it('should validate update permission', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();

      mockManager.findOne.mockResolvedValue(existingRecord);

      jest.spyOn(authService, 'validateUpdatePermission')
        .mockImplementation(() => {
          throw new Error('No permission');
        });

      await expect(service.execute(id, dto, user)).rejects.toThrow();

      expect(authService.validateUpdatePermission)
        .toHaveBeenCalledWith(user, existingRecord);
    });

    it('should validate appointment for update', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();

      mockManager.findOne.mockResolvedValue(existingRecord);

      jest.spyOn(domainService, 'validateAppointmentForUpdate')
        .mockImplementation(() => {
          throw new Error('Invalid appointment');
        });

      await expect(service.execute(id, dto, user)).rejects.toThrow();

      expect(domainService.validateAppointmentForUpdate)
        .toHaveBeenCalledWith(existingRecord.appointment);
    });

    it('should map update DTO to entity', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const updateData = { subjektif: 'Updated' };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(existingRecord);

      mockManager.save.mockResolvedValue(existingRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue(updateData as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(existingRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      await service.execute(id, dto, user);

      expect(mapper.toUpdateEntity).toHaveBeenCalledWith(dto);
    });

    it('should validate update has changes', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const updateData = {};

      mockManager.findOne.mockResolvedValue(existingRecord);
      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue(updateData as any);

      jest.spyOn(domainService, 'validateUpdateHasChanges')
        .mockImplementation(() => {
          throw new Error('No changes');
        });

      await expect(service.execute(id, dto, user)).rejects.toThrow();

      expect(domainService.validateUpdateHasChanges)
        .toHaveBeenCalledWith(updateData);
    });

    it('should validate SOAP fields', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const updateData = { subjektif: 'Updated' };

      mockManager.findOne.mockResolvedValue(existingRecord);
      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue(updateData as any);

      jest.spyOn(domainService, 'validateAllSOAPFields')
        .mockImplementation(() => {
          throw new Error('Invalid SOAP');
        });

      await expect(service.execute(id, dto, user)).rejects.toThrow();

      expect(domainService.validateAllSOAPFields)
        .toHaveBeenCalledWith(updateData);
    });

    it('should merge update data with existing record', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const updateData = { subjektif: 'Updated' };
      const mergedRecord = { ...existingRecord, ...updateData };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(mergedRecord);

      mockManager.save.mockResolvedValue(mergedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue(updateData as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(mergedRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      await service.execute(id, dto, user);

      expect(domainService.mergeUpdateData)
        .toHaveBeenCalledWith(existingRecord, updateData);
    });

    it('should save updated record', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const mergedRecord = { ...existingRecord };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(mergedRecord);

      mockManager.save.mockResolvedValue(mergedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue({} as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(mergedRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      await service.execute(id, dto, user);

      expect(mockManager.save).toHaveBeenCalledWith(MedicalRecord, mergedRecord);
    });

    it('should update appointment status to SELESAI', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const mergedRecord = { ...existingRecord };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(mergedRecord);

      mockManager.save.mockResolvedValue(mergedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue({} as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(mergedRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(true);

      await service.execute(id, dto, user);

      expect(existingRecord.appointment.status).toBe(AppointmentStatus.SELESAI);
      expect(mockManager.save).toHaveBeenCalledWith(Appointment, existingRecord.appointment);
    });

    it('should not update appointment status if already SELESAI', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      existingRecord.appointment.status = AppointmentStatus.SELESAI;
      const mergedRecord = { ...existingRecord };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(mergedRecord);

      mockManager.save.mockResolvedValue(mergedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue({} as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(mergedRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      await service.execute(id, dto, user);

      expect(existingRecord.appointment.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should reload record with relations after save', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const savedRecord = { ...existingRecord, id: 1 };
      const reloadedRecord = { ...savedRecord };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(reloadedRecord);

      mockManager.save.mockResolvedValue(savedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue({} as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(existingRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      const result = await service.execute(id, dto, user);

      expect(result).toBe(reloadedRecord);
      expect(mockManager.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if record not found after reload', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const savedRecord = { ...existingRecord, id: 1 };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(null);

      mockManager.save.mockResolvedValue(savedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue({} as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(existingRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      await expect(service.execute(id, dto, user))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================
  describe('Edge Cases', () => {
    it('should handle partial updates (only subjektif)', async () => {
      const id = 1;
      const dto: UpdateMedicalRecordDto = {
        subjektif: 'Updated subjektif only',
      };
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      const updateData = { subjektif: 'Updated subjektif only' };
      const mergedRecord = { ...existingRecord, ...updateData };

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(mergedRecord);

      mockManager.save.mockResolvedValue(mergedRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue(updateData as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(mergedRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      const result = await service.execute(id, dto, user);

      expect(result.subjektif).toBe('Updated subjektif only');
    });

    it('should handle user without permission updating record', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser(999); // Different user
      const existingRecord = createMockMedicalRecord();

      mockManager.findOne.mockResolvedValue(existingRecord);

      jest.spyOn(authService, 'validateUpdatePermission')
        .mockImplementation(() => {
          throw new Error('No permission');
        });

      await expect(service.execute(id, dto, user)).rejects.toThrow();
    });

    it('should handle cancelled appointment', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();
      existingRecord.appointment.status = AppointmentStatus.DIBATALKAN;

      mockManager.findOne.mockResolvedValue(existingRecord);

      jest.spyOn(domainService, 'validateAppointmentForUpdate')
        .mockImplementation(() => {
          throw new Error('Cannot update cancelled');
        });

      await expect(service.execute(id, dto, user)).rejects.toThrow();
    });
  });

  // ==========================================================================
  // TRANSACTION HANDLING
  // ==========================================================================
  describe('Transaction Handling', () => {
    it('should run in transaction', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();
      const existingRecord = createMockMedicalRecord();

      mockManager.findOne
        .mockResolvedValueOnce(existingRecord)
        .mockResolvedValueOnce(existingRecord);

      mockManager.save.mockResolvedValue(existingRecord);

      jest.spyOn(mapper, 'toUpdateEntity').mockReturnValue({} as any);
      jest.spyOn(domainService, 'mergeUpdateData').mockReturnValue(existingRecord);
      jest.spyOn(domainService, 'shouldUpdateAppointmentStatus').mockReturnValue(false);

      await service.execute(id, dto, user);

      expect(mockTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const id = 1;
      const dto = createMockUpdateDto();
      const user = createMockUser();

      mockManager.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.execute(id, dto, user)).rejects.toThrow();
    });
  });
});