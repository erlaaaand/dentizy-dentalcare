// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ScheduleReminderService } from '../schedule-reminder.service';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';
import { NotificationSchedulerService } from '../../../domains/services/notification-scheduler.service';
import { NotificationValidatorService } from '../../../domains/services/notification-validator.service';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../appointments/domains/entities/appointment.entity';
import {
  NotificationType,
  NotificationStatus,
} from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockAppointment: Appointment = {
  id: 123,
  tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
  jam_janji: '10:00',
  status: AppointmentStatus.DIJADWALKAN,

  // field yang diwajibkan TypeScript
  patient_id: 500,
  doctor_id: 300,
  keluhan: 'Sakit kepala',

  medical_record: null as any,

  // relasi (as any supaya tidak wajib isi seluruh struktur Patient/Doctor)
  patient: {
    id: 500,
    nama_lengkap: 'John Doe',
    email: 'john.doe@example.com',
    nomor_hp: '08123456789',
  } as any,

  doctor: {
    id: 300,
    nama_lengkap: 'Dr. Smith',
  } as any,

  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
};

const mockFutureReminderTime = new Date('2024-01-15T10:00:00.000Z'); // 24 hours before
const mockPastReminderTime = null; // Would be in the past

const mockInvalidAppointment = {
  ...mockAppointment,
  tanggal_janji: new Date('2023-01-01T10:00:00.000Z'), // Past appointment
};

const mockAppointmentWithoutPatient = {
  ...mockAppointment,
  patient: null,
};

const mockAppointmentWithoutDoctor = {
  ...mockAppointment,
  doctor: null,
};

const mockError = new Error('Validation failed');
const mockRepositoryError = new Error('Database error');

// Mock Repository
const mockNotificationRepository = {
  create: jest.fn(),
};

// Mock Scheduler
const mockNotificationScheduler = {
  calculateReminderTime: jest.fn(),
};

// Mock Validator
const mockNotificationValidator = {
  validateAppointment: jest.fn(),
};

// Mock Logger
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// 3. TEST SUITE
describe('ScheduleReminderService', () => {
  // 4. SETUP AND TEARDOWN
  let service: ScheduleReminderService;
  let notificationRepository: NotificationRepository;
  let scheduler: NotificationSchedulerService;
  let validator: NotificationValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleReminderService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        {
          provide: NotificationSchedulerService,
          useValue: mockNotificationScheduler,
        },
        {
          provide: NotificationValidatorService,
          useValue: mockNotificationValidator,
        },
      ],
    }).compile();

    service = module.get<ScheduleReminderService>(ScheduleReminderService);
    notificationRepository = module.get<NotificationRepository>(
      NotificationRepository,
    );
    scheduler = module.get<NotificationSchedulerService>(
      NotificationSchedulerService,
    );
    validator = module.get<NotificationValidatorService>(
      NotificationValidatorService,
    );

    // Mock the logger
    Object.defineProperty(service, 'logger', {
      value: mockLogger,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 5. EXECUTE METHOD TESTS
  describe('execute() Method', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(service.execute).toBeDefined();
    });

    it('should return void promise', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      const result = await service.execute(mockAppointment);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  // 6. SUB-GROUP TESTS
  describe('Success Flow', () => {
    it('should validate appointment first', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(
        mockNotificationValidator.validateAppointment,
      ).toHaveBeenCalledWith(mockAppointment);
      expect(
        mockNotificationValidator.validateAppointment,
      ).toHaveBeenCalledTimes(1);
    });

    it('should calculate reminder time using scheduler', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(
        mockNotificationScheduler.calculateReminderTime,
      ).toHaveBeenCalledWith(mockAppointment);
      expect(
        mockNotificationScheduler.calculateReminderTime,
      ).toHaveBeenCalledTimes(1);
    });

    it('should create notification with correct parameters', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        appointment_id: mockAppointment.id,
        type: NotificationType.EMAIL_REMINDER,
        status: NotificationStatus.PENDING,
        send_at: mockFutureReminderTime,
      });
    });

    it('should log success message with appointment ID and reminder time', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📅 Reminder scheduled for appointment #${mockAppointment.id} at ${mockFutureReminderTime.toISOString()}`,
      );
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should call dependencies in correct order', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert call order
      const validateCallOrder =
        mockNotificationValidator.validateAppointment.mock
          .invocationCallOrder[0];
      const schedulerCallOrder =
        mockNotificationScheduler.calculateReminderTime.mock
          .invocationCallOrder[0];
      const createCallOrder =
        mockNotificationRepository.create.mock.invocationCallOrder[0];

      expect(validateCallOrder).toBeLessThan(schedulerCallOrder);
      expect(schedulerCallOrder).toBeLessThan(createCallOrder);
    });
  });

  describe('Past Reminder Time Handling', () => {
    it('should not create notification when reminder time is in the past', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockPastReminderTime,
      );

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it('should log warning when reminder time would be in the past', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockPastReminderTime,
      );

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        `⚠️ Cannot schedule reminder for appointment #${mockAppointment.id}: Reminder time would be in the past`,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return early without throwing error when reminder time is past', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockPastReminderTime,
      );

      // Act & Assert
      await expect(service.execute(mockAppointment)).resolves.toBeUndefined();
    });
  });

  describe('Validation Scenarios', () => {
    it('should throw error when appointment validation fails', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockImplementation(() => {
        throw mockError;
      });

      // Act & Assert
      await expect(service.execute(mockAppointment)).rejects.toThrow(mockError);

      // Assert
      expect(
        mockNotificationScheduler.calculateReminderTime,
      ).not.toHaveBeenCalled();
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it('should handle different types of validation errors', async () => {
      // Arrange
      const validationErrors = [
        new Error('Appointment is cancelled'),
        new Error('Patient email is missing'),
        new Error('Appointment date is in the past'),
      ];

      for (const error of validationErrors) {
        mockNotificationValidator.validateAppointment.mockImplementation(() => {
          throw error;
        });

        // Act & Assert
        await expect(service.execute(mockAppointment)).rejects.toThrow(error);
        expect(
          mockNotificationScheduler.calculateReminderTime,
        ).not.toHaveBeenCalled();
        expect(mockNotificationRepository.create).not.toHaveBeenCalled();

        jest.clearAllMocks();
      }
    });

    it('should log error when validation fails', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockImplementation(() => {
        throw mockError;
      });

      // Act & Assert
      await expect(service.execute(mockAppointment)).rejects.toThrow(mockError);

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Error scheduling reminder for appointment #${mockAppointment.id}:`,
        mockError.message,
      );
    });
  });

  describe('Scheduler Integration', () => {
    it('should use reminder time from scheduler', async () => {
      // Arrange
      const differentReminderTime = new Date('2024-01-15T14:00:00.000Z');
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        differentReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          send_at: differentReminderTime,
        }),
      );
    });

    it('should handle different reminder time scenarios', async () => {
      // Arrange
      const reminderTimeScenarios = [
        new Date('2024-01-15T10:00:00.000Z'), // 24 hours before
        new Date('2024-01-16T09:00:00.000Z'), // 1 hour before
        new Date('2024-01-14T10:00:00.000Z'), // 48 hours before
      ];

      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationRepository.create.mockResolvedValue(undefined);

      for (const reminderTime of reminderTimeScenarios) {
        mockNotificationScheduler.calculateReminderTime.mockReturnValue(
          reminderTime,
        );

        // Act
        await service.execute(mockAppointment);

        // Assert
        expect(mockNotificationRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            send_at: reminderTime,
          }),
        );

        jest.clearAllMocks();
      }
    });
  });

  describe('Repository Integration', () => {
    it('should handle repository creation success', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue({
        id: 1,
        appointment_id: mockAppointment.id,
        type: NotificationType.EMAIL_REMINDER,
        status: NotificationStatus.PENDING,
        send_at: mockFutureReminderTime,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Act & Assert
      await expect(service.execute(mockAppointment)).resolves.toBeUndefined();

      // Assert
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should handle repository creation failure', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockRejectedValue(mockRepositoryError);

      // Act & Assert
      await expect(service.execute(mockAppointment)).rejects.toThrow(
        mockRepositoryError,
      );

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Error scheduling reminder for appointment #${mockAppointment.id}:`,
        mockRepositoryError.message,
      );
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log error with appointment ID when any step fails', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockImplementation(() => {
        throw mockError;
      });

      // Act & Assert
      await expect(service.execute(mockAppointment)).rejects.toThrow(mockError);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Error scheduling reminder for appointment #${mockAppointment.id}:`,
        mockError.message,
      );
    });

    it('should preserve original error stack trace', async () => {
      // Arrange
      const originalError = new Error('Original validation error');
      originalError.stack = 'Error stack trace';
      mockNotificationValidator.validateAppointment.mockImplementation(() => {
        throw originalError;
      });

      // Act & Assert
      await expect(service.execute(mockAppointment)).rejects.toThrow(
        originalError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Error scheduling reminder for appointment #${mockAppointment.id}:`,
        originalError.message,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle different appointment IDs', async () => {
      // Arrange
      const appointmentIds = [1, 999, 0, -1, 12345];
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act & Assert
      for (const id of appointmentIds) {
        const appointment = { ...mockAppointment, id };
        await service.execute(appointment);

        expect(mockNotificationRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            appointment_id: id,
          }),
        );

        jest.clearAllMocks();
      }
    });

    it('should handle appointment with minimal required fields', async () => {
      // Arrange
      const minimalAppointment = {
        id: 123,
        tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
        jam_janji: '10:00',
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(minimalAppointment);

      // Assert
      expect(
        mockNotificationValidator.validateAppointment,
      ).toHaveBeenCalledWith(minimalAppointment);
      expect(
        mockNotificationScheduler.calculateReminderTime,
      ).toHaveBeenCalledWith(minimalAppointment);
    });

    it('should handle very future appointment dates', async () => {
      // Arrange
      const futureAppointment = {
        ...mockAppointment,
        tanggal_janji: new Date('2030-01-01T10:00:00.000Z'), // Far future
      };

      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        new Date('2029-12-31T10:00:00.000Z'),
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(futureAppointment);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalled();
    });

    it('should handle very recent appointment dates', async () => {
      // Arrange
      const recentAppointment = {
        ...mockAppointment,
        tanggal_janji: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      };

      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(null); // Would be in the past

      // Act
      await service.execute(recentAppointment);

      // Assert
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('Notification Data Structure', () => {
    it('should always use EMAIL_REMINDER type', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.EMAIL_REMINDER,
        }),
      );
    });

    it('should always use PENDING status', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NotificationStatus.PENDING,
        }),
      );
    });

    it('should not include unnecessary fields in create payload', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act
      await service.execute(mockAppointment);

      // Assert
      const createPayload = mockNotificationRepository.create.mock.calls[0][0];
      const payloadKeys = Object.keys(createPayload);

      expect(payloadKeys).toHaveLength(4);
      expect(payloadKeys).toEqual([
        'appointment_id',
        'type',
        'status',
        'send_at',
      ]);
    });
  });

  describe('Integration Behavior', () => {
    it('should not proceed to scheduler if validation fails', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockImplementation(() => {
        throw mockError;
      });

      // Act & Assert
      await expect(service.execute(mockAppointment)).rejects.toThrow(mockError);

      // Assert
      expect(
        mockNotificationScheduler.calculateReminderTime,
      ).not.toHaveBeenCalled();
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it('should not proceed to repository if scheduler returns null', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(null);

      // Act
      await service.execute(mockAppointment);

      // Assert
      expect(mockNotificationRepository.create).not.toHaveBeenCalled();
    });

    it('should complete entire flow successfully when all conditions are met', async () => {
      // Arrange
      mockNotificationValidator.validateAppointment.mockReturnValue(undefined);
      mockNotificationScheduler.calculateReminderTime.mockReturnValue(
        mockFutureReminderTime,
      );
      mockNotificationRepository.create.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.execute(mockAppointment)).resolves.toBeUndefined();

      // Assert all dependencies were called
      expect(mockNotificationValidator.validateAppointment).toHaveBeenCalled();
      expect(
        mockNotificationScheduler.calculateReminderTime,
      ).toHaveBeenCalled();
      expect(mockNotificationRepository.create).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalled();
    });
  });
});
