// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { RetryFailedService } from '../retry-failed.service';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';
import { NotificationValidatorService } from '../../../domains/services/notification-validator.service';
import {
  NotificationStatus,
  NotificationType,
} from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockNotificationId = 123;
const mockFailedNotification = {
  id: mockNotificationId,
  appointment_id: 100,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.FAILED,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
  retry_count: 2,
  error_message: 'Network timeout',
  appointment: {
    id: 100,
    tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
    jam_janji: '10:00',
    patient: {
      id: 500,
      nama_lengkap: 'John Doe',
      email: 'john.doe@example.com',
    },
    doctor: {
      id: 300,
      nama_lengkap: 'Dr. Smith',
    },
  },
};

const mockFailedNotifications = [
  {
    ...mockFailedNotification,
    id: 1,
    retry_count: 1,
    error_message: 'First error',
  },
  {
    ...mockFailedNotification,
    id: 2,
    retry_count: 0,
    error_message: 'Second error',
  },
  {
    ...mockFailedNotification,
    id: 3,
    retry_count: 3,
    error_message: 'Third error',
  },
];

const mockEmptyFailedNotifications: any[] = [];

const mockNonFailedNotification = {
  ...mockFailedNotification,
  status: NotificationStatus.SENT, // Not failed
};

const mockMaxRetryNotification = {
  ...mockFailedNotification,
  retry_count: 5, // Exceeds max retries
};

const mockError = new Error('Database connection failed');
const mockValidationError = new Error('Max retry attempts exceeded');

// Mock Repository
const mockNotificationRepository = {
  findById: jest.fn(),
  findFailed: jest.fn(),
  update: jest.fn(),
};

// Mock Validator
const mockNotificationValidator = {
  validateCanRetry: jest.fn(),
};

// Mock Logger
const mockLogger = {
  debug: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
};

// 3. TEST SUITE
describe('RetryFailedService', () => {
  // 4. SETUP AND TEARDOWN
  let service: RetryFailedService;
  let notificationRepository: NotificationRepository;
  let validator: NotificationValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryFailedService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        {
          provide: NotificationValidatorService,
          useValue: mockNotificationValidator,
        },
      ],
    }).compile();

    service = module.get<RetryFailedService>(RetryFailedService);
    notificationRepository = module.get<NotificationRepository>(
      NotificationRepository,
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
  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have both execute and executeBatch methods', () => {
      expect(service.execute).toBeDefined();
      expect(service.executeBatch).toBeDefined();
    });
  });

  // 6. SUB-GROUP TESTS
  describe('execute() Method - Single Retry', () => {
    describe('Success Scenarios', () => {
      it('should find notification by ID', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.execute(mockNotificationId);

        // Assert
        expect(mockNotificationRepository.findById).toHaveBeenCalledWith(
          mockNotificationId,
        );
        expect(mockNotificationRepository.findById).toHaveBeenCalledTimes(1);
      });

      it('should validate notification can be retried', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.execute(mockNotificationId);

        // Assert
        expect(mockNotificationValidator.validateCanRetry).toHaveBeenCalledWith(
          mockFailedNotification,
        );
        expect(
          mockNotificationValidator.validateCanRetry,
        ).toHaveBeenCalledTimes(1);
      });

      it('should reset notification status and schedule for immediate retry', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.execute(mockNotificationId);

        // Assert
        expect(mockNotificationRepository.update).toHaveBeenCalledWith({
          ...mockFailedNotification,
          status: NotificationStatus.PENDING,
          send_at: expect.any(Date),
          error_message: null,
        });
      });

      it('should set send_at to current time', async () => {
        // Arrange
        const beforeCall = Date.now();
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.execute(mockNotificationId);

        // Assert
        const updatedNotification =
          mockNotificationRepository.update.mock.calls[0][0];
        const sendAtTime = updatedNotification.send_at.getTime();
        expect(sendAtTime).toBeGreaterThanOrEqual(beforeCall);
        expect(sendAtTime).toBeLessThanOrEqual(Date.now());
      });

      it('should log success message with retry count', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.execute(mockNotificationId);

        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          `🔄 Notification #${mockNotificationId} queued for retry (attempt ${mockFailedNotification.retry_count + 1})`,
        );
      });

      it('should handle different notification IDs', async () => {
        // Arrange
        const notificationIds = [1, 999, 0, -1, 12345];
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act & Assert
        for (const id of notificationIds) {
          const notification = { ...mockFailedNotification, id };
          mockNotificationRepository.findById.mockResolvedValue(notification);

          await service.execute(id);

          expect(mockNotificationRepository.findById).toHaveBeenCalledWith(id);
          jest.clearAllMocks();
        }
      });
    });

    describe('Error Scenarios', () => {
      it('should throw NotFoundException when notification not found', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(service.execute(mockNotificationId)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.execute(mockNotificationId)).rejects.toThrow(
          `Notification #${mockNotificationId} not found`,
        );
      });

      it('should throw validation error when cannot retry', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockImplementation(() => {
          throw mockValidationError;
        });

        // Act & Assert
        await expect(service.execute(mockNotificationId)).rejects.toThrow(
          mockValidationError,
        );

        // Assert
        expect(mockNotificationRepository.update).not.toHaveBeenCalled();
      });

      it('should log error and rethrow when repository find fails', async () => {
        // Arrange
        mockNotificationRepository.findById.mockRejectedValue(mockError);

        // Act & Assert
        await expect(service.execute(mockNotificationId)).rejects.toThrow(
          mockError,
        );

        // Assert error logging
        expect(mockLogger.error).toHaveBeenCalledWith(
          `❌ Error retrying notification #${mockNotificationId}:`,
          mockError.message,
        );
      });

      it('should log error and rethrow when repository update fails', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockRejectedValue(mockError);

        // Act & Assert
        await expect(service.execute(mockNotificationId)).rejects.toThrow(
          mockError,
        );

        // Assert error logging
        expect(mockLogger.error).toHaveBeenCalledWith(
          `❌ Error retrying notification #${mockNotificationId}:`,
          mockError.message,
        );
      });
    });

    describe('Validation Integration', () => {
      it('should call validator before updating notification', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.execute(mockNotificationId);

        // Assert call order
        const findCallOrder =
          mockNotificationRepository.findById.mock.invocationCallOrder[0];
        const validateCallOrder =
          mockNotificationValidator.validateCanRetry.mock
            .invocationCallOrder[0];
        const updateCallOrder =
          mockNotificationRepository.update.mock.invocationCallOrder[0];

        expect(findCallOrder).toBeLessThan(validateCallOrder);
        expect(validateCallOrder).toBeLessThan(updateCallOrder);
      });

      it('should not update notification if validation fails', async () => {
        // Arrange
        mockNotificationRepository.findById.mockResolvedValue(
          mockFailedNotification,
        );
        mockNotificationValidator.validateCanRetry.mockImplementation(() => {
          throw mockValidationError;
        });

        // Act & Assert
        await expect(service.execute(mockNotificationId)).rejects.toThrow();

        // Assert
        expect(mockNotificationRepository.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('executeBatch() Method - Batch Retry', () => {
    describe('Success Scenarios', () => {
      it('should fetch failed notifications with default limit', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.executeBatch();

        // Assert
        expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(50);
      });

      it('should fetch failed notifications with custom limit', async () => {
        // Arrange
        const customLimit = 100;
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.executeBatch(customLimit);

        // Assert
        expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(
          customLimit,
        );
      });

      it('should process all valid failed notifications', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        const result = await service.executeBatch();

        // Assert
        expect(mockNotificationRepository.update).toHaveBeenCalledTimes(3);
        expect(result).toBe(3);
      });

      it('should reset each notification correctly', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.executeBatch();

        // Assert
        mockFailedNotifications.forEach((notification, index) => {
          const updatedNotification =
            mockNotificationRepository.update.mock.calls[index][0];
          expect(updatedNotification.status).toBe(NotificationStatus.PENDING);
          expect(updatedNotification.send_at).toBeInstanceOf(Date);
          expect(updatedNotification.error_message).toBeNull();
        });
      });

      it('should log debug and success messages', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        await service.executeBatch();

        // Assert
        expect(mockLogger.debug).toHaveBeenCalledWith(
          `🔄 Retrying failed notifications (limit: 50)...`,
        );
        expect(mockLogger.log).toHaveBeenCalledWith(
          `🔄 Queued 3 failed notification(s) for retry`,
        );
      });

      it('should return count of successfully retried notifications', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        const result = await service.executeBatch();

        // Assert
        expect(result).toBe(3);
        expect(typeof result).toBe('number');
      });
    });

    describe('Partial Processing Scenarios', () => {
      it('should skip notifications that cannot be retried', async () => {
        // Arrange
        const mixedNotifications = [
          mockFailedNotifications[0], // valid
          { ...mockFailedNotifications[1], status: NotificationStatus.SENT }, // invalid status
          mockFailedNotifications[2], // valid
        ];

        mockNotificationRepository.findFailed.mockResolvedValue(
          mixedNotifications,
        );
        mockNotificationValidator.validateCanRetry
          .mockReturnValueOnce(undefined) // First valid
          .mockImplementationOnce(() => {
            // Second invalid
            throw new Error('Notification already sent');
          })
          .mockReturnValueOnce(undefined); // Third valid

        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        const result = await service.executeBatch();

        // Assert
        expect(result).toBe(2); // Only 2 successfully retried
        expect(mockNotificationRepository.update).toHaveBeenCalledTimes(2);
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Skipping notification #2: Notification already sent',
        );
      });

      it('should handle empty failed notifications list', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockEmptyFailedNotifications,
        );

        // Act
        const result = await service.executeBatch();

        // Assert
        expect(result).toBe(0);
        expect(mockNotificationRepository.update).not.toHaveBeenCalled();
        expect(mockLogger.log).toHaveBeenCalledWith(
          '🔄 Queued 0 failed notification(s) for retry',
        );
      });

      it('should continue processing when individual notification update fails', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update
          .mockResolvedValueOnce(undefined) // First success
          .mockRejectedValueOnce(mockError) // Second fails
          .mockResolvedValueOnce(undefined); // Third success

        // Act
        const result = await service.executeBatch();

        // Assert
        expect(result).toBe(2); // 2 out of 3 succeeded
        expect(mockNotificationRepository.update).toHaveBeenCalledTimes(3);
      });

      it('should handle all notifications being invalid for retry', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockImplementation(() => {
          throw mockValidationError;
        });

        // Act
        const result = await service.executeBatch();

        // Assert
        expect(result).toBe(0);
        expect(mockNotificationRepository.update).not.toHaveBeenCalled();
        expect(mockLogger.log).toHaveBeenCalledWith(
          '🔄 Queued 0 failed notification(s) for retry',
        );
      });
    });

    describe('Error Scenarios', () => {
      it('should log error and rethrow when repository findFailed fails', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockRejectedValue(mockError);

        // Act & Assert
        await expect(service.executeBatch()).rejects.toThrow(mockError);

        // Assert error logging
        expect(mockLogger.error).toHaveBeenCalledWith(
          '❌ Error retrying failed notifications:',
          mockError.message,
        );
      });

      it('should handle different types of validation errors gracefully', async () => {
        // Arrange
        const validationErrors = [
          new Error('Max retry attempts exceeded'),
          new Error('Notification already sent'),
          new Error('Invalid notification state'),
        ];

        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );

        // Each notification fails with different validation error
        mockNotificationValidator.validateCanRetry
          .mockImplementationOnce(() => {
            throw validationErrors[0];
          })
          .mockImplementationOnce(() => {
            throw validationErrors[1];
          })
          .mockImplementationOnce(() => {
            throw validationErrors[2];
          });

        // Act
        const result = await service.executeBatch();

        // Assert
        expect(result).toBe(0);
        expect(mockLogger.debug).toHaveBeenCalledTimes(4);
        validationErrors.forEach((error, index) => {
          expect(mockLogger.debug).toHaveBeenCalledWith(
            `Skipping notification #${mockFailedNotifications[index].id}: ${error.message}`,
          );
        });
      });
    });

    describe('Batch Size and Limits', () => {
      it('should handle different batch limits', async () => {
        // Arrange
        const limits = [10, 25, 50, 100, 500];
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act & Assert
        for (const limit of limits) {
          await service.executeBatch(limit);
          expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(
            limit,
          );
          jest.clearAllMocks();
        }
      });

      it('should handle zero limit', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        const result = await service.executeBatch(0);

        // Assert
        expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(0);
        expect(result).toBe(3); // Still processes found notifications
      });

      it('should handle negative limit', async () => {
        // Arrange
        mockNotificationRepository.findFailed.mockResolvedValue(
          mockFailedNotifications,
        );
        mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
        mockNotificationRepository.update.mockResolvedValue(undefined);

        // Act
        const result = await service.executeBatch(-10);

        // Assert
        expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(-10);
        expect(result).toBe(3);
      });
    });
  });

  describe('Cross-Method Consistency', () => {
    it('should use same validation logic in both methods', async () => {
      // Arrange
      const notification = mockFailedNotifications[0];
      mockNotificationRepository.findById.mockResolvedValue(notification);
      mockNotificationRepository.findFailed.mockResolvedValue([notification]);
      mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
      mockNotificationRepository.update.mockResolvedValue(undefined);

      // Act
      await service.execute(notification.id);
      await service.executeBatch();

      // Assert
      expect(mockNotificationValidator.validateCanRetry).toHaveBeenCalledWith(
        notification,
      );
      expect(mockNotificationValidator.validateCanRetry).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should apply same reset logic in both methods', async () => {
      // Arrange
      const notification = mockFailedNotifications[0];
      mockNotificationRepository.findById.mockResolvedValue(notification);
      mockNotificationRepository.findFailed.mockResolvedValue([notification]);
      mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
      mockNotificationRepository.update.mockResolvedValue(undefined);

      // Act
      await service.execute(notification.id);
      await service.executeBatch();

      // Assert
      const singleUpdateCall =
        mockNotificationRepository.update.mock.calls[0][0];
      const batchUpdateCall =
        mockNotificationRepository.update.mock.calls[1][0];

      expect(singleUpdateCall.status).toBe(NotificationStatus.PENDING);
      expect(batchUpdateCall.status).toBe(NotificationStatus.PENDING);
      expect(singleUpdateCall.error_message).toBeNull();
      expect(batchUpdateCall.error_message).toBeNull();
      expect(singleUpdateCall.send_at).toBeInstanceOf(Date);
      expect(batchUpdateCall.send_at).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle notification with null error_message', async () => {
      // Arrange
      const notificationWithNullError = {
        ...mockFailedNotification,
        error_message: null,
      };
      mockNotificationRepository.findById.mockResolvedValue(
        notificationWithNullError,
      );
      mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
      mockNotificationRepository.update.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotificationId);

      // Assert
      const updatedNotification =
        mockNotificationRepository.update.mock.calls[0][0];
      expect(updatedNotification.error_message).toBeNull();
    });

    it('should handle notification with high retry_count', async () => {
      // Arrange
      const highRetryNotification = {
        ...mockFailedNotification,
        retry_count: 10,
      };
      mockNotificationRepository.findById.mockResolvedValue(
        highRetryNotification,
      );
      mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
      mockNotificationRepository.update.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotificationId);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `🔄 Notification #${mockNotificationId} queued for retry (attempt 11)`,
      );
    });

    it('should handle very large batch sizes', async () => {
      // Arrange
      const largeBatch = Array.from({ length: 1000 }, (_, i) => ({
        ...mockFailedNotification,
        id: i + 1,
      }));
      mockNotificationRepository.findFailed.mockResolvedValue(largeBatch);
      mockNotificationValidator.validateCanRetry.mockReturnValue(undefined);
      mockNotificationRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await service.executeBatch(1000);

      // Assert
      expect(result).toBe(1000);
      expect(mockNotificationRepository.update).toHaveBeenCalledTimes(1000);
    });
  });
});
