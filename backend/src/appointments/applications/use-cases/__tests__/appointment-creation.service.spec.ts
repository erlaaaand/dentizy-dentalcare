import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { AppointmentCreationService } from '../appointment-creation.service';
import { AppointmentsRepository } from '../../../infrastructures/persistence/repositories/appointments.repository';
import { AppointmentCreateValidator } from '../../../domains/validators/appointment-create.validator';
import { AppointmentTimeValidator } from '../../../domains/validators/appointment-time.validator';
import { AppointmentConflictValidator } from '../../../domains/validators/appointment-conflict.validator';
import { AppointmentDomainService } from '../../../domains/services/appointment-domain.service';
import { TransactionManager } from '../../../infrastructures/transactions/transaction.manager';
import { CreateAppointmentDto } from '../../dto/create-appointment.dto';
import {
  Appointment,
  AppointmentStatus,
} from '../../../domains/entities/appointment.entity';

describe('AppointmentCreationService', () => {
  let service: AppointmentCreationService;
  let mockRepository: jest.Mocked<AppointmentsRepository>;
  let mockCreateValidator: jest.Mocked<AppointmentCreateValidator>;
  let mockTimeValidator: jest.Mocked<AppointmentTimeValidator>;
  let mockConflictValidator: jest.Mocked<AppointmentConflictValidator>;
  let mockDomainService: jest.Mocked<AppointmentDomainService>;
  let mockTransactionManager: jest.Mocked<TransactionManager>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

  // Mock QueryRunner
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {},
  };

  // Mock Data
  const mockPatient = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockDoctor = {
    id: 2,
    name: 'Dr. Smith',
    specialty: 'General',
  };

  const mockAppointment: Appointment = {
    id: 1,
    patient_id: 1,
    doctor_id: 2,
    tanggal_janji: new Date('2025-11-20'),
    jam_janji: '10:00',
    status: AppointmentStatus.DIJADWALKAN,
    patient: mockPatient as any,
    doctor: mockDoctor as any,
    keluhan: 'Demam',
    medical_record: null as any,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCreateAppointmentDto: CreateAppointmentDto = {
    patient_id: 1,
    doctor_id: 2,
    tanggal_janji: '2025-11-20',
    jam_janji: '10:00',
    keluhan: 'Demam',
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mocks
    mockRepository = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      findPatientByIdInTransaction: jest.fn(),
      findDoctorByIdInTransaction: jest.fn(),
      saveInTransaction: jest.fn(),
    } as any;

    mockCreateValidator = {
      validateCreateAppointment: jest.fn(),
    } as any;

    mockTimeValidator = {
      validateAppointmentTime: jest.fn(),
      calculateBufferWindow: jest.fn().mockReturnValue({
        bufferStart: '09:45',
        bufferEnd: '10:15',
      }),
    } as any;

    mockConflictValidator = {
      validateNoConflict: jest.fn(),
    } as any;

    mockDomainService = {
      createAppointmentEntity: jest.fn(),
      shouldScheduleReminder: jest.fn().mockReturnValue(true),
    } as any;

    mockTransactionManager = {
      executeInTransaction: jest.fn(),
    } as any;

    mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentCreationService,
        { provide: AppointmentsRepository, useValue: mockRepository },
        { provide: AppointmentCreateValidator, useValue: mockCreateValidator },
        { provide: AppointmentTimeValidator, useValue: mockTimeValidator },
        {
          provide: AppointmentConflictValidator,
          useValue: mockConflictValidator,
        },
        { provide: AppointmentDomainService, useValue: mockDomainService },
        { provide: TransactionManager, useValue: mockTransactionManager },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AppointmentCreationService>(
      AppointmentCreationService,
    );
  });

  describe('execute', () => {
    it('should successfully create an appointment and emit event', async () => {
      // Arrange
      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          return await callback(qr);
        },
      );

      mockRepository.findPatientByIdInTransaction.mockResolvedValue(
        mockPatient as any,
      );
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(
        mockDoctor as any,
      );
      mockDomainService.createAppointmentEntity.mockReturnValue(
        mockAppointment,
      );
      mockRepository.saveInTransaction.mockResolvedValue(mockAppointment);

      // Act
      const result = await service.execute(mockCreateAppointmentDto);

      // Assert
      expect(result).toEqual(mockAppointment);
      expect(mockRepository.createQueryRunner).toHaveBeenCalled();
      expect(mockRepository.findPatientByIdInTransaction).toHaveBeenCalledWith(
        mockQueryRunner,
        mockCreateAppointmentDto.patient_id,
      );
      expect(mockRepository.findDoctorByIdInTransaction).toHaveBeenCalledWith(
        mockQueryRunner,
        mockCreateAppointmentDto.doctor_id,
      );
      expect(
        mockCreateValidator.validateCreateAppointment,
      ).toHaveBeenCalledWith(
        mockPatient,
        mockCreateAppointmentDto.patient_id,
        mockDoctor,
        mockCreateAppointmentDto.doctor_id,
      );
      expect(mockTimeValidator.validateAppointmentTime).toHaveBeenCalled();
      expect(mockConflictValidator.validateNoConflict).toHaveBeenCalled();
      expect(mockRepository.saveInTransaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'appointment.created',
        expect.objectContaining({
          appointment: mockAppointment,
          shouldScheduleReminder: true,
        }),
      );
    });

    it('should emit event with shouldScheduleReminder=false if domain service returns false', async () => {
      // Arrange
      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          return await callback(qr);
        },
      );

      mockRepository.findPatientByIdInTransaction.mockResolvedValue(
        mockPatient as any,
      );
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(
        mockDoctor as any,
      );
      mockDomainService.createAppointmentEntity.mockReturnValue(
        mockAppointment,
      );
      mockRepository.saveInTransaction.mockResolvedValue(mockAppointment);
      mockDomainService.shouldScheduleReminder.mockReturnValue(false); // ← Return false

      // Act
      const result = await service.execute(mockCreateAppointmentDto);

      // Assert
      expect(result).toEqual(mockAppointment);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'appointment.created',
        expect.objectContaining({
          appointment: mockAppointment,
          shouldScheduleReminder: false,
        }),
      );
    });

    it('should throw NotFoundException and rollback when patient not found', async () => {
      // Arrange
      const expectedError = new NotFoundException(
        `Pasien dengan ID #${mockCreateAppointmentDto.patient_id} tidak ditemukan`,
      );

      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          try {
            return await callback(qr);
          } catch (error) {
            await mockQueryRunner.rollbackTransaction();
            throw error;
          }
        },
      );

      // Patient tidak ditemukan
      mockRepository.findPatientByIdInTransaction.mockResolvedValue(null);
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(
        mockDoctor as any,
      );

      // Validator akan throw error
      mockCreateValidator.validateCreateAppointment.mockImplementation(() => {
        throw expectedError;
      });

      // Act & Assert
      await expect(service.execute(mockCreateAppointmentDto)).rejects.toThrow(
        expectedError,
      );

      // Verify
      expect(mockRepository.findPatientByIdInTransaction).toHaveBeenCalled();
      expect(
        mockCreateValidator.validateCreateAppointment,
      ).toHaveBeenCalledWith(
        null,
        mockCreateAppointmentDto.patient_id,
        mockDoctor,
        mockCreateAppointmentDto.doctor_id,
      );
      expect(mockRepository.saveInTransaction).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException and rollback when doctor not found', async () => {
      // Arrange
      const expectedError = new NotFoundException(
        `Dokter dengan ID #${mockCreateAppointmentDto.doctor_id} tidak ditemukan`,
      );

      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          try {
            return await callback(qr);
          } catch (error) {
            await mockQueryRunner.rollbackTransaction();
            throw error;
          }
        },
      );

      // Patient ditemukan, Doctor tidak ditemukan
      mockRepository.findPatientByIdInTransaction.mockResolvedValue(
        mockPatient as any,
      );
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(null);

      // Validator akan throw error
      mockCreateValidator.validateCreateAppointment.mockImplementation(() => {
        throw expectedError;
      });

      // Act & Assert
      await expect(service.execute(mockCreateAppointmentDto)).rejects.toThrow(
        expectedError,
      );

      // Verify
      expect(mockRepository.findPatientByIdInTransaction).toHaveBeenCalled();
      expect(mockRepository.findDoctorByIdInTransaction).toHaveBeenCalled();
      expect(
        mockCreateValidator.validateCreateAppointment,
      ).toHaveBeenCalledWith(
        mockPatient,
        mockCreateAppointmentDto.patient_id,
        null,
        mockCreateAppointmentDto.doctor_id,
      );
      expect(mockRepository.saveInTransaction).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw validation error and rollback when createValidator fails', async () => {
      // Arrange
      const expectedError = new Error('Validation failed');

      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          try {
            return await callback(qr);
          } catch (error) {
            await mockQueryRunner.rollbackTransaction();
            throw error;
          }
        },
      );

      mockRepository.findPatientByIdInTransaction.mockResolvedValue(
        mockPatient as any,
      );
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(
        mockDoctor as any,
      );
      mockCreateValidator.validateCreateAppointment.mockImplementation(() => {
        throw expectedError;
      });

      // Act & Assert
      await expect(service.execute(mockCreateAppointmentDto)).rejects.toThrow(
        expectedError,
      );

      // Verify
      expect(mockCreateValidator.validateCreateAppointment).toHaveBeenCalled();
      expect(mockRepository.saveInTransaction).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw validation error and rollback when timeValidator fails', async () => {
      // Arrange
      const expectedError = new Error('Invalid appointment time');

      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          try {
            return await callback(qr);
          } catch (error) {
            await mockQueryRunner.rollbackTransaction();
            throw error;
          }
        },
      );

      mockRepository.findPatientByIdInTransaction.mockResolvedValue(
        mockPatient as any,
      );
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(
        mockDoctor as any,
      );
      mockTimeValidator.validateAppointmentTime.mockImplementation(() => {
        throw expectedError;
      });

      // Act & Assert
      await expect(service.execute(mockCreateAppointmentDto)).rejects.toThrow(
        expectedError,
      );

      // Verify
      expect(mockTimeValidator.validateAppointmentTime).toHaveBeenCalled();
      expect(mockRepository.saveInTransaction).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw conflict error and rollback when conflictValidator fails', async () => {
      // Arrange
      const expectedError = new Error('Appointment conflict detected');

      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          try {
            return await callback(qr);
          } catch (error) {
            await mockQueryRunner.rollbackTransaction();
            throw error;
          }
        },
      );

      mockRepository.findPatientByIdInTransaction.mockResolvedValue(
        mockPatient as any,
      );
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(
        mockDoctor as any,
      );
      mockConflictValidator.validateNoConflict.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.execute(mockCreateAppointmentDto)).rejects.toThrow(
        expectedError,
      );

      // Verify
      expect(mockConflictValidator.validateNoConflict).toHaveBeenCalled();
      expect(mockRepository.saveInTransaction).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw database error and rollback when saveInTransaction fails', async () => {
      // Arrange
      const expectedError = new Error('Database error');

      mockTransactionManager.executeInTransaction.mockImplementation(
        async (qr, callback) => {
          try {
            return await callback(qr);
          } catch (error) {
            await mockQueryRunner.rollbackTransaction();
            throw error;
          }
        },
      );

      mockRepository.findPatientByIdInTransaction.mockResolvedValue(
        mockPatient as any,
      );
      mockRepository.findDoctorByIdInTransaction.mockResolvedValue(
        mockDoctor as any,
      );
      mockDomainService.createAppointmentEntity.mockReturnValue(
        mockAppointment,
      );
      mockRepository.saveInTransaction.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(service.execute(mockCreateAppointmentDto)).rejects.toThrow(
        expectedError,
      );

      // Verify
      expect(mockRepository.saveInTransaction).toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
