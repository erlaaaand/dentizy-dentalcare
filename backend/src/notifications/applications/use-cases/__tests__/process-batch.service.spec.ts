// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ProcessBatchService } from '../process-batch.service';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';
import { SendNotificationService } from '../send-notification.service';
import { NotificationStatus, NotificationType } from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockPendingNotifications = [
  {
    id: 1,
    appointment_id: 100,
    type: NotificationType.EMAIL_REMINDER,
    status: NotificationStatus.PENDING,
    send_at: new Date('2024-01-15T10:00:00.000Z'),
    sent_at: null,
    created_at: new Date('2024-01-14T09:00:00.000Z'),
    updated_at: new Date('2024-01-14T09:00:00.000Z')
  },
  {
    id: 2,
    appointment_id: 101,
    type: NotificationType.EMAIL_REMINDER,
    status: NotificationStatus.PENDING,
    send_at: new Date('2024-01-15T11:00:00.000Z'),
    sent_at: null,
    created_at: new Date('2024-01-14T10:00:00.000Z'),
    updated_at: new Date('2024-01-14T10:00:00.000Z')
  },
  {
    id: 3,
    appointment_id: 102,
    type: NotificationType.EMAIL_REMINDER,
    status: NotificationStatus.PENDING,
    send_at: new Date('2024-01-15T12:00:00.000Z'),
    sent_at: null,
    created_at: new Date('2024-01-14T11:00:00.000Z'),
    updated_at: new Date('2024-01-14T11:00:00.000Z')
  }
];

const mockEmptyNotifications: any[] = [];

const mockLargeBatchNotifications = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  appointment_id: 100 + i,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z')
}));

const mockError = new Error('Database connection failed');
const mockSendError = new Error('Failed to send notification');

const mockBatchResult = {
  processed: 3,
  successful: 2,
  failed: 1,
  duration: expect.any(Number)
};

const mockEmptyResult = {
  processed: 0,
  successful: 0,
  failed: 0,
  duration: expect.any(Number)
};

// Mock Repository
const mockNotificationRepository = {
  findPendingToSend: jest.fn(),
  markAsProcessing: jest.fn(),
};

// Mock SendNotificationService
const mockSendNotificationService = {
  execute: jest.fn(),
};

// Mock Logger
const mockLogger = {
  debug: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
};

// 3. TEST SUITE
describe('ProcessBatchService', () => {
  // 4. SETUP AND TEARDOWN
  let service: ProcessBatchService;
  let notificationRepository: NotificationRepository;
  let sendNotificationService: SendNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessBatchService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        {
          provide: SendNotificationService,
          useValue: mockSendNotificationService,
        },
      ],
    }).compile();

    service = module.get<ProcessBatchService>(ProcessBatchService);
    notificationRepository = module.get<NotificationRepository>(NotificationRepository);
    sendNotificationService = module.get<SendNotificationService>(SendNotificationService);

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

    it('should have MAX_BATCH_SIZE constant', () => {
      expect(service['MAX_BATCH_SIZE']).toBe(50);
    });

    it('should return correct result structure', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual({
        processed: expect.any(Number),
        successful: expect.any(Number),
        failed: expect.any(Number),
        duration: expect.any(Number),
      });
    });
  });

  // 6. SUB-GROUP TESTS
  describe('Empty Batch Scenarios', () => {
    it('should handle empty notification list', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockEmptyNotifications);

      // Act
      const result = await service.execute();

      // Assert
      expect(result).toEqual(mockEmptyResult);
      expect(mockNotificationRepository.findPendingToSend).toHaveBeenCalledWith(50);
      expect(mockNotificationRepository.markAsProcessing).not.toHaveBeenCalled();
      expect(mockSendNotificationService.execute).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('No notifications to process'));
    });

    it('should log appropriate message for empty batch', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockEmptyNotifications);

      // Act
      await service.execute();

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('No notifications to process'));
      expect(mockLogger.log).not.toHaveBeenCalledWith(expect.stringContaining('Processing'));
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Successful Batch Processing', () => {
    it('should fetch pending notifications with correct batch size', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      expect(mockNotificationRepository.findPendingToSend).toHaveBeenCalledWith(50);
    });

    it('should mark notifications as processing before sending', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      expect(mockNotificationRepository.markAsProcessing).toHaveBeenCalledWith([1, 2, 3]);
      expect(mockNotificationRepository.markAsProcessing).toHaveBeenCalledTimes(1);
    });

    it('should process all notifications in the batch', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      expect(mockSendNotificationService.execute).toHaveBeenCalledTimes(3);
      expect(mockSendNotificationService.execute).toHaveBeenCalledWith(mockPendingNotifications[0]);
      expect(mockSendNotificationService.execute).toHaveBeenCalledWith(mockPendingNotifications[1]);
      expect(mockSendNotificationService.execute).toHaveBeenCalledWith(mockPendingNotifications[2]);
    });

    it('should count successful and failed notifications correctly', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);

      // First succeeds, second fails, third succeeds
      mockSendNotificationService.execute
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(mockSendError)
        .mockResolvedValueOnce(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should mark notifications as processing to prevent duplicates', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert — memastikan urutan eksekusi
      const markCallOrder =
        mockNotificationRepository.markAsProcessing.mock.invocationCallOrder[0];
      const executeCallOrder =
        mockSendNotificationService.execute.mock.invocationCallOrder[0];

      expect(markCallOrder).toBeLessThan(executeCallOrder);

      // Assert argumen
      expect(mockNotificationRepository.markAsProcessing).toHaveBeenCalledWith(
        mockPendingNotifications.map(n => n.id)
      );
    });

    it('should include batch ID in log messages', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringMatching(/\[batch_\d+\] Fetching pending notifications/));
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/\[batch_\d+\] Processing/));
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/\[batch_\d+\] Completed/));
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when fetching pending notifications', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.execute()).rejects.toThrow(mockError);

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Batch processing error:'),
        mockError.message
      );
    });

    it('should handle errors when marking as processing', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.execute()).rejects.toThrow(mockError);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Batch processing error:'),
        mockError.message
      );
      expect(mockSendNotificationService.execute).not.toHaveBeenCalled();
    });

    it('should continue processing when individual notification fails', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);

      // All notifications fail
      mockSendNotificationService.execute.mockRejectedValue(mockSendError);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(3);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(3);
      expect(mockSendNotificationService.execute).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure scenarios', async () => {
      // Arrange
      const notifications = [...mockPendingNotifications,
      { ...mockPendingNotifications[0], id: 4 },
      { ...mockPendingNotifications[0], id: 5 }
      ];

      mockNotificationRepository.findPendingToSend.mockResolvedValue(notifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);

      // Pattern: success, fail, success, fail, success
      mockSendNotificationService.execute
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(mockSendError)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(mockSendError)
        .mockResolvedValueOnce(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(5);
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(2);
    });

    it('should not log individual send errors (handled in SendNotificationService)', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockRejectedValue(mockSendError);

      // Act
      await service.execute();

      // Assert
      // Only batch completion log should be present, not individual error logs
      expect(mockLogger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Batch processing error:')
      );
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('0 sent, 3 failed'));
    });
  });

  describe('Batch Size Limits', () => {
    it('should respect MAX_BATCH_SIZE when fetching notifications', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockLargeBatchNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      expect(mockNotificationRepository.findPendingToSend).toHaveBeenCalledWith(50);
      expect(mockSendNotificationService.execute).toHaveBeenCalledTimes(50);
    });

    it('should handle maximum batch size correctly', async () => {
      // Arrange
      const maxBatch = Array.from({ length: 50 }, (_, i) => ({
        ...mockPendingNotifications[0],
        id: i + 1
      }));

      mockNotificationRepository.findPendingToSend.mockResolvedValue(maxBatch);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(50);
      expect(result.successful).toBe(50);
      expect(result.failed).toBe(0);
    });

    it('should handle batches smaller than MAX_BATCH_SIZE', async () => {
      // Arrange
      const smallBatch = mockPendingNotifications.slice(0, 2);
      mockNotificationRepository.findPendingToSend.mockResolvedValue(smallBatch);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(2);
      expect(mockNotificationRepository.findPendingToSend).toHaveBeenCalledWith(50);
    });
  });

  describe('Performance and Timing', () => {
    it('should measure processing duration correctly', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should include duration in completion log', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringMatching(/Completed in \d+ms:/)
      );
    });

    it('should handle very fast processing', async () => {
      // Arrange
      const singleNotification = [mockPendingNotifications[0]];
      mockNotificationRepository.findPendingToSend.mockResolvedValue(singleNotification);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.processed).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
    });
  });

  describe('Concurrent Processing Safety', () => {
    it('should mark notifications as processing to prevent duplicates', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      const markCallOrder =
        mockNotificationRepository.markAsProcessing.mock.invocationCallOrder[0];

      const executeCallOrder =
        mockSendNotificationService.execute.mock.invocationCallOrder[0];

      expect(markCallOrder).toBeLessThan(executeCallOrder);

      expect(mockNotificationRepository.markAsProcessing).toHaveBeenCalledWith(
        mockPendingNotifications.map(n => n.id)
      );
    });

    it('should extract correct notification IDs for marking', async () => {
      // Arrange
      const notificationsWithDifferentIds = [
        { ...mockPendingNotifications[0], id: 100 },
        { ...mockPendingNotifications[1], id: 200 },
        { ...mockPendingNotifications[2], id: 300 }
      ];

      mockNotificationRepository.findPendingToSend.mockResolvedValue(notificationsWithDifferentIds);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert
      expect(mockNotificationRepository.markAsProcessing).toHaveBeenCalledWith([100, 200, 300]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single notification batch', async () => {
      // Arrange
      const singleNotification = [mockPendingNotifications[0]];
      mockNotificationRepository.findPendingToSend.mockResolvedValue(singleNotification);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should handle all notifications failing', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockRejectedValue(mockSendError);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(3);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(3);
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('0 sent, 3 failed'));
    });

    it('should handle all notifications succeeding', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const result = await service.execute();

      // Assert
      expect(result.processed).toBe(3);
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('3 sent, 0 failed'));
    });
  });

  describe('Integration Behavior', () => {
    it('should call dependencies in correct order', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend.mockResolvedValue(mockPendingNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      await service.execute();

      // Assert call order
      const findPendingCallOrder = mockNotificationRepository.findPendingToSend.mock.invocationCallOrder[0];
      const markAsProcessingCallOrder = mockNotificationRepository.markAsProcessing.mock.invocationCallOrder[0];
      const firstSendCallOrder = mockSendNotificationService.execute.mock.invocationCallOrder[0];

      expect(findPendingCallOrder).toBeLessThan(markAsProcessingCallOrder);
      expect(markAsProcessingCallOrder).toBeLessThan(firstSendCallOrder);
    });

    it('should maintain batch isolation between executions', async () => {
      // Arrange
      mockNotificationRepository.findPendingToSend
        .mockResolvedValueOnce(mockPendingNotifications)
        .mockResolvedValueOnce(mockEmptyNotifications);
      mockNotificationRepository.markAsProcessing.mockResolvedValue(undefined);
      mockSendNotificationService.execute.mockResolvedValue(undefined);

      // Act
      const firstResult = await service.execute();
      const secondResult = await service.execute();

      // Assert
      expect(firstResult.processed).toBe(3);
      expect(secondResult.processed).toBe(0);
      expect(mockNotificationRepository.findPendingToSend).toHaveBeenCalledTimes(2);
    });
  });
});