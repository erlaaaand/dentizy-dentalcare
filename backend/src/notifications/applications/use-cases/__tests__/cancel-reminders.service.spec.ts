// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CancelRemindersService } from '../cancel-reminders.service';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';

// 2. MOCK DATA
const mockAppointmentId = 123;
const mockCancelledCount = 3;
const mockZeroCancelledCount = 0;

const mockError = new Error('Database connection failed');

// Mock Repository
const mockNotificationRepository = {
  cancelForAppointment: jest.fn(),
};

// Mock Logger
const mockLogger = {
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

// 3. TEST SUITE
describe('CancelRemindersService', () => {
  // 4. SETUP AND TEARDOWN
  let service: CancelRemindersService;
  let notificationRepository: NotificationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelRemindersService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<CancelRemindersService>(CancelRemindersService);
    notificationRepository = module.get<NotificationRepository>(NotificationRepository);

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

    it('should call repository with correct appointment ID', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockCancelledCount);

      // Act
      await service.execute(mockAppointmentId);

      // Assert
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledWith(mockAppointmentId);
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledTimes(1);
    });

    it('should return the count of cancelled notifications', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockCancelledCount);

      // Act
      const result = await service.execute(mockAppointmentId);

      // Assert
      expect(result).toBe(mockCancelledCount);
    });
  });

  // 6. SUB-GROUP TESTS
  describe('Success Scenarios', () => {
    it('should log success message when notifications are cancelled', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockCancelledCount);

      // Act
      await service.execute(mockAppointmentId);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📧 Cancelled ${mockCancelledCount} notification(s) for appointment #${mockAppointmentId}`
      );
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log debug message when no notifications are cancelled', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockZeroCancelledCount);

      // Act
      await service.execute(mockAppointmentId);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `No pending notifications found for appointment #${mockAppointmentId}`
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should return zero when no notifications are cancelled', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockZeroCancelledCount);

      // Act
      const result = await service.execute(mockAppointmentId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle different appointment IDs correctly', async () => {
      // Arrange
      const appointmentIds = [1, 999, 12345, 0, -1];
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act & Assert
      for (const appointmentId of appointmentIds) {
        await service.execute(appointmentId);
        expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledWith(appointmentId);
        jest.clearAllMocks();
      }
    });

    it('should handle different cancellation counts correctly', async () => {
      // Arrange
      const cancellationCounts = [1, 5, 10, 100];
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act & Assert
      for (const count of cancellationCounts) {
        mockNotificationRepository.cancelForAppointment.mockResolvedValue(count);
        const result = await service.execute(mockAppointmentId);
        expect(result).toBe(count);

        if (count > 0) {
          expect(mockLogger.log).toHaveBeenCalledWith(
            `📧 Cancelled ${count} notification(s) for appointment #${mockAppointmentId}`
          );
        } else {
          expect(mockLogger.debug).toHaveBeenCalledWith(
            `No pending notifications found for appointment #${mockAppointmentId}`
          );
        }
        jest.clearAllMocks();
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should log error and rethrow when repository throws an error', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.execute(mockAppointmentId)).rejects.toThrow(mockError);

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Error cancelling reminders for appointment #${mockAppointmentId}:`,
        mockError.message
      );
    });

    it('should preserve original error stack trace', async () => {
      // Arrange
      const originalError = new Error('Original database error');
      originalError.stack = 'Error stack trace';
      mockNotificationRepository.cancelForAppointment.mockRejectedValue(originalError);

      // Act & Assert
      await expect(service.execute(mockAppointmentId)).rejects.toThrow(originalError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Error cancelling reminders for appointment #${mockAppointmentId}:`,
        originalError.message
      );
    });

    it('should handle different types of errors', async () => {
      // Arrange
      const errors = [
        new Error('Database timeout'),
        new TypeError('Invalid type'),
        new Error('Network error'),
      ];

      // Act & Assert
      for (const error of errors) {
        mockNotificationRepository.cancelForAppointment.mockRejectedValue(error);

        await expect(service.execute(mockAppointmentId)).rejects.toThrow(error);

        expect(mockLogger.error).toHaveBeenCalledWith(
          `❌ Error cancelling reminders for appointment #${mockAppointmentId}:`,
          error.message
        );

        jest.clearAllMocks();
      }
    });
  });

  describe('Integration Behavior Tests', () => {
    it('should not call logger methods if repository call is successful', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockCancelledCount);

      // Act
      await service.execute(mockAppointmentId);

      // Assert
      expect(mockLogger.error).not.toHaveBeenCalled();
      // Either log or debug should be called, but not both
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should not call success log methods if repository call fails', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.execute(mockAppointmentId)).rejects.toThrow();

      // Assert
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it('should maintain method signature and return type', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockCancelledCount);

      // Act
      const result = await service.execute(mockAppointmentId);

      // Assert
      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero appointment ID', async () => {
      // Arrange
      const zeroAppointmentId = 0;
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act
      await service.execute(zeroAppointmentId);

      // Assert
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledWith(zeroAppointmentId);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `📧 Cancelled 1 notification(s) for appointment #${zeroAppointmentId}`
      );
    });

    it('should handle negative appointment ID', async () => {
      // Arrange
      const negativeAppointmentId = -1;
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act
      await service.execute(negativeAppointmentId);

      // Assert
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledWith(negativeAppointmentId);
    });

    it('should handle very large appointment ID', async () => {
      // Arrange
      const largeAppointmentId = 999999999;
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act
      await service.execute(largeAppointmentId);

      // Assert
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledWith(largeAppointmentId);
    });

    it('should handle floating point appointment ID by truncating', async () => {
      // Arrange
      const floatAppointmentId = 123.45;
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act
      await service.execute(floatAppointmentId);

      // Assert
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledWith(floatAppointmentId);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid successive calls', async () => {
      // Arrange
      const rapidCalls = 10;
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act
      const promises = Array(rapidCalls).fill(0).map((_, index) =>
        service.execute(index + 1)
      );

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(rapidCalls);
      results.forEach(result => {
        expect(result).toBe(1);
      });
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledTimes(rapidCalls);
    });

    it('should not log multiple times for the same operation', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(mockCancelledCount);

      // Act
      await service.execute(mockAppointmentId);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledTimes(0);
      expect(mockLogger.error).toHaveBeenCalledTimes(0);
    });
  });

  describe('Dependency Interaction Tests', () => {
    it('should depend on NotificationRepository', () => {
      expect(notificationRepository).toBeDefined();
      expect(notificationRepository.cancelForAppointment).toBeDefined();
    });

    it('should use the same repository instance for all calls', async () => {
      // Arrange
      mockNotificationRepository.cancelForAppointment.mockResolvedValue(1);

      // Act
      await service.execute(1);
      await service.execute(2);
      await service.execute(3);

      // Assert
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenCalledTimes(3);
      // All calls should use the same mock instance
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenNthCalledWith(1, 1);
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenNthCalledWith(2, 2);
      expect(mockNotificationRepository.cancelForAppointment).toHaveBeenNthCalledWith(3, 3);
    });

    it('should handle repository method returning different values sequentially', async () => {
      // Arrange
      const sequentialValues = [2, 0, 5, 1, 0];
      sequentialValues.forEach(value => {
        mockNotificationRepository.cancelForAppointment.mockResolvedValueOnce(value);
      });

      // Act & Assert
      for (let i = 0; i < sequentialValues.length; i++) {
        const result = await service.execute(i + 1);
        expect(result).toBe(sequentialValues[i]);
      }
    });
  });
});