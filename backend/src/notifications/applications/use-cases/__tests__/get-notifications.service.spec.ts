// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { GetNotificationsService } from '../get-notifications.service';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';
import { NotificationMapper } from '../../../domains/mappers/notification.mapper';
import { QueryNotificationsDto } from '../../dto/query-notifications.dto';
import { NotificationResponseDto } from '../../dto/notification-response.dto';
import { NotificationStatsDto } from '../../dto/notification-stats.dto';
import { NotificationStatus, NotificationType } from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockQuery: QueryNotificationsDto = {
  page: 1,
  limit: 10,
  status: NotificationStatus.PENDING,
  type: NotificationType.EMAIL_REMINDER
};

const mockNotificationEntity = {
  id: 1,
  appointment_id: 100,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
  appointment: {
    id: 100,
    tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
    jam_janji: '10:00',
    patient: {
      id: 500,
      nama_lengkap: 'John Doe',
      email: 'john.doe@example.com'
    },
    doctor: {
      id: 300,
      nama_lengkap: 'Dr. Smith'
    }
  }
};

const mockNotificationResponse: NotificationResponseDto = {
  id: 1,
  appointment_id: 100,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
  appointment: {
    id: 100,
    tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
    jam_janji: '10:00',
    patient: {
      id: 500,
      nama_lengkap: 'John Doe',
      email: 'john.doe@example.com'
    },
    doctor: {
      id: 300,
      nama_lengkap: 'Dr. Smith'
    }
  }
};

const mockRepositoryFindAllResult = {
  data: [mockNotificationEntity, { ...mockNotificationEntity, id: 2 }],
  meta: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1
  }
};

const mockStats: NotificationStatsDto = {
  total: 100,
  pending: 20,
  sent: 75,
  failed: 5,
  scheduled_today: 10,       // <-- Field Baru
  scheduled_this_week: 30,
  by_type: [
    { type: NotificationType.EMAIL_REMINDER, count: 40 },
    { type: NotificationType.EMAIL_REMINDER, count: 35 },
    { type: NotificationType.EMAIL_REMINDER, count: 25 }
  ]
};

const mockFailedNotifications = [
  { ...mockNotificationEntity, id: 1, status: NotificationStatus.FAILED },
  { ...mockNotificationEntity, id: 2, status: NotificationStatus.FAILED }
];

const mockError = new Error('Database connection failed');

// Mock Repository
const mockNotificationRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  getStatistics: jest.fn(),
  findFailed: jest.fn(),
};

// Mock Mapper
const mockNotificationMapper = {
  toResponseDto: jest.fn(),
  toResponseDtoArray: jest.fn(),
};

// Mock Logger
const mockLogger = {
  debug: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
};

// 3. TEST SUITE
describe('GetNotificationsService', () => {
  // 4. SETUP AND TEARDOWN
  let service: GetNotificationsService;
  let notificationRepository: NotificationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetNotificationsService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<GetNotificationsService>(GetNotificationsService);
    notificationRepository = module.get<NotificationRepository>(NotificationRepository);

    // Mock the logger
    Object.defineProperty(service, 'logger', {
      value: mockLogger,
      writable: true,
    });

    // Mock the mapper
    jest.spyOn(NotificationMapper, 'toResponseDto').mockImplementation(mockNotificationMapper.toResponseDto);
    jest.spyOn(NotificationMapper, 'toResponseDtoArray').mockImplementation(mockNotificationMapper.toResponseDtoArray);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // 5. EXECUTE METHOD TESTS
  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all methods defined', () => {
      expect(service.findAll).toBeDefined();
      expect(service.findOne).toBeDefined();
      expect(service.getStatistics).toBeDefined();
      expect(service.getFailedNotifications).toBeDefined();
    });
  });

  // 6. SUB-GROUP TESTS
  describe('findAll() Method', () => {
    it('should call repository findAll with correct query', async () => {
      // Arrange
      mockNotificationRepository.findAll.mockResolvedValue(mockRepositoryFindAllResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([mockNotificationResponse]);

      // Act
      await service.findAll(mockQuery);

      // Assert
      expect(mockNotificationRepository.findAll).toHaveBeenCalledWith(mockQuery);
      expect(mockNotificationRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should log debug message with query', async () => {
      // Arrange
      mockNotificationRepository.findAll.mockResolvedValue(mockRepositoryFindAllResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([mockNotificationResponse]);

      // Act
      await service.findAll(mockQuery);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Finding notifications with query: ${JSON.stringify(mockQuery)}`
      );
    });

    it('should transform entities to response DTOs', async () => {
      // Arrange
      mockNotificationRepository.findAll.mockResolvedValue(mockRepositoryFindAllResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([mockNotificationResponse]);

      // Act
      const result = await service.findAll(mockQuery);

      // Assert
      expect(NotificationMapper.toResponseDtoArray).toHaveBeenCalledWith(mockRepositoryFindAllResult.data);
      expect(result.data).toEqual([mockNotificationResponse]);
    });

    it('should return correct pagination metadata', async () => {
      // Arrange
      mockNotificationRepository.findAll.mockResolvedValue(mockRepositoryFindAllResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([mockNotificationResponse]);

      // Act
      const result = await service.findAll(mockQuery);

      // Assert
      expect(result.meta).toEqual(mockRepositoryFindAllResult.meta);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should handle empty result set', async () => {
      // Arrange
      const emptyResult = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
      mockNotificationRepository.findAll.mockResolvedValue(emptyResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([]);

      // Act
      const result = await service.findAll(mockQuery);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should handle different query parameters', async () => {
      // Arrange
      const queries = [
        { page: 1, limit: 10 },
        { status: NotificationStatus.SENT },
        { type: NotificationType.EMAIL_REMINDER },
        { page: 2, limit: 20, status: NotificationStatus.PENDING, type: NotificationType.EMAIL_REMINDER }
      ];

      mockNotificationRepository.findAll.mockResolvedValue(mockRepositoryFindAllResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([mockNotificationResponse]);

      // Act & Assert
      for (const query of queries) {
        await service.findAll(query);
        expect(mockNotificationRepository.findAll).toHaveBeenCalledWith(query);
        jest.clearAllMocks();
      }
    });

    it('should log error and rethrow when repository fails', async () => {
      // Arrange
      mockNotificationRepository.findAll.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.findAll(mockQuery)).rejects.toThrow(mockError);

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching notifications:',
        mockError.message
      );
    });
  });

  describe('findOne() Method', () => {
    it('should call repository findById with correct ID', async () => {
      // Arrange
      const notificationId = 1;
      mockNotificationRepository.findById.mockResolvedValue(mockNotificationEntity);
      mockNotificationMapper.toResponseDto.mockReturnValue(mockNotificationResponse);

      // Act
      await service.findOne(notificationId);

      // Assert
      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should transform entity to response DTO', async () => {
      // Arrange
      const notificationId = 1;
      mockNotificationRepository.findById.mockResolvedValue(mockNotificationEntity);
      mockNotificationMapper.toResponseDto.mockReturnValue(mockNotificationResponse);

      // Act
      const result = await service.findOne(notificationId);

      // Assert
      expect(NotificationMapper.toResponseDto).toHaveBeenCalledWith(mockNotificationEntity);
      expect(result).toEqual(mockNotificationResponse);
    });

    it('should throw NotFoundException when notification not found', async () => {
      // Arrange
      const notificationId = 999;
      mockNotificationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(notificationId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(notificationId)).rejects.toThrow(
        `Notification #${notificationId} not found`
      );
    });

    it('should log error and rethrow when repository fails', async () => {
      // Arrange
      const notificationId = 1;
      mockNotificationRepository.findById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.findOne(notificationId)).rejects.toThrow(mockError);

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error fetching notification #${notificationId}:`,
        mockError.message
      );
    });

    it('should handle different notification IDs', async () => {
      // Arrange
      const notificationIds = [1, 999, 0, -1, 12345];
      mockNotificationRepository.findById.mockResolvedValue(mockNotificationEntity);
      mockNotificationMapper.toResponseDto.mockReturnValue(mockNotificationResponse);

      // Act & Assert
      for (const id of notificationIds) {
        await service.findOne(id);
        expect(mockNotificationRepository.findById).toHaveBeenCalledWith(id);
        jest.clearAllMocks();
      }
    });
  });

  describe('getStatistics() Method', () => {
    it('should call repository getStatistics', async () => {
      // Arrange
      mockNotificationRepository.getStatistics.mockResolvedValue(mockStats);

      // Act
      await service.getStatistics();

      // Assert
      expect(mockNotificationRepository.getStatistics).toHaveBeenCalled();
      expect(mockNotificationRepository.getStatistics).toHaveBeenCalledTimes(1);
    });

    it('should log debug and success messages', async () => {
      // Arrange
      mockNotificationRepository.getStatistics.mockResolvedValue(mockStats);

      // Act
      await service.getStatistics();

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith('Getting notification statistics');
      expect(mockLogger.log).toHaveBeenCalledWith('📊 Notification statistics retrieved');
    });

    it('should return statistics data', async () => {
      // Arrange
      mockNotificationRepository.getStatistics.mockResolvedValue(mockStats);

      // Act
      const result = await service.getStatistics();

      // Assert
      expect(result).toEqual(mockStats);
      expect(result.total).toBe(100);
      expect(result.pending).toBe(20);
      expect(result.sent).toBe(75);
      expect(result.failed).toBe(5);
      expect(result.by_type).toHaveLength(3);
    });

    it('should handle empty statistics', async () => {
      // Arrange
      const emptyStats: NotificationStatsDto = {
        total: 0,
        pending: 0,
        sent: 0,
        failed: 0,
        scheduled_today: 0,      // <-- Field Baru
        scheduled_this_week: 0,
        by_type: []
      };
      mockNotificationRepository.getStatistics.mockResolvedValue(emptyStats);

      // Act
      const result = await service.getStatistics();

      // Assert
      expect(result).toEqual(emptyStats);
      expect(result.total).toBe(0);
    });

    it('should log error and rethrow when repository fails', async () => {
      // Arrange
      mockNotificationRepository.getStatistics.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.getStatistics()).rejects.toThrow(mockError);

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error getting notification statistics:',
        mockError.message
      );
    });
  });

  describe('getFailedNotifications() Method', () => {
    it('should call repository findFailed with default limit', async () => {
      // Arrange
      mockNotificationRepository.findFailed.mockResolvedValue(mockFailedNotifications);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue(mockFailedNotifications.map(n => ({ ...n })));

      // Act
      await service.getFailedNotifications();

      // Assert
      expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(50);
      expect(mockNotificationRepository.findFailed).toHaveBeenCalledTimes(1);
    });

    it('should call repository findFailed with custom limit', async () => {
      // Arrange
      const customLimit = 100;
      mockNotificationRepository.findFailed.mockResolvedValue(mockFailedNotifications);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue(mockFailedNotifications.map(n => ({ ...n })));

      // Act
      await service.getFailedNotifications(customLimit);

      // Assert
      expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(customLimit);
    });

    it('should transform entities to response DTOs', async () => {
      // Arrange
      mockNotificationRepository.findFailed.mockResolvedValue(mockFailedNotifications);
      const responseDtos = mockFailedNotifications.map(n => ({ ...n }));
      mockNotificationMapper.toResponseDtoArray.mockReturnValue(responseDtos);

      // Act
      const result = await service.getFailedNotifications();

      // Assert
      expect(NotificationMapper.toResponseDtoArray).toHaveBeenCalledWith(mockFailedNotifications);
      expect(result).toEqual(responseDtos);
      expect(result).toHaveLength(2);
    });

    it('should handle empty failed notifications', async () => {
      // Arrange
      mockNotificationRepository.findFailed.mockResolvedValue([]);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([]);

      // Act
      const result = await service.getFailedNotifications();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle different limit values', async () => {
      // Arrange
      const limits = [10, 25, 50, 100, 500];
      mockNotificationRepository.findFailed.mockResolvedValue(mockFailedNotifications);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue(mockFailedNotifications.map(n => ({ ...n })));

      // Act & Assert
      for (const limit of limits) {
        await service.getFailedNotifications(limit);
        expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(limit);
        jest.clearAllMocks();
      }
    });

    it('should log error and rethrow when repository fails', async () => {
      // Arrange
      mockNotificationRepository.findFailed.mockRejectedValue(mockError);

      // Act & Assert
      await expect(service.getFailedNotifications()).rejects.toThrow(mockError);

      // Assert error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error getting failed notifications:',
        mockError.message
      );
    });
  });

  describe('Error Handling Consistency', () => {
    it('should handle different types of errors consistently', async () => {
      // Arrange
      const errors = [
        new Error('Database timeout'),
        new TypeError('Invalid type'),
        new Error('Network error'),
      ];

      mockNotificationRepository.findAll.mockRejectedValue(new Error());
      mockNotificationRepository.findById.mockRejectedValue(new Error());
      mockNotificationRepository.getStatistics.mockRejectedValue(new Error());
      mockNotificationRepository.findFailed.mockRejectedValue(new Error());

      // Act & Assert
      for (const error of errors) {
        mockNotificationRepository.findAll.mockRejectedValue(error);
        await expect(service.findAll(mockQuery)).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalled();

        mockNotificationRepository.findById.mockRejectedValue(error);
        await expect(service.findOne(1)).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalled();

        mockNotificationRepository.getStatistics.mockRejectedValue(error);
        await expect(service.getStatistics()).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalled();

        mockNotificationRepository.findFailed.mockRejectedValue(error);
        await expect(service.getFailedNotifications()).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalled();

        jest.clearAllMocks();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values in findAll query', async () => {
      // Arrange
      const queryWithNulls = {
        page: null,
        limit: null,
        status: null,
        type: null
      };
      mockNotificationRepository.findAll.mockResolvedValue(mockRepositoryFindAllResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([mockNotificationResponse]);

      // Act
      await service.findAll(queryWithNulls as any);

      // Assert
      expect(mockNotificationRepository.findAll).toHaveBeenCalledWith(queryWithNulls);
    });

    it('should handle zero ID in findOne', async () => {
      // Arrange
      mockNotificationRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(0)).rejects.toThrow(NotFoundException);
    });

    it('should handle negative limit in getFailedNotifications', async () => {
      // Arrange
      mockNotificationRepository.findFailed.mockResolvedValue(mockFailedNotifications);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue(mockFailedNotifications.map(n => ({ ...n })));

      // Act
      await service.getFailedNotifications(-10);

      // Assert
      expect(mockNotificationRepository.findFailed).toHaveBeenCalledWith(-10);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle multiple concurrent requests', async () => {
      // Arrange
      mockNotificationRepository.findAll.mockResolvedValue(mockRepositoryFindAllResult);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue([mockNotificationResponse]);
      mockNotificationRepository.findById.mockResolvedValue(mockNotificationEntity);
      mockNotificationMapper.toResponseDto.mockReturnValue(mockNotificationResponse);
      mockNotificationRepository.getStatistics.mockResolvedValue(mockStats);
      mockNotificationRepository.findFailed.mockResolvedValue(mockFailedNotifications);
      mockNotificationMapper.toResponseDtoArray.mockReturnValue(mockFailedNotifications.map(n => ({ ...n })));

      // Act
      const promises = [
        service.findAll(mockQuery),
        service.findOne(1),
        service.getStatistics(),
        service.getFailedNotifications()
      ];

      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(4);
      expect(mockNotificationRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.getStatistics).toHaveBeenCalledTimes(1);
      expect(mockNotificationRepository.findFailed).toHaveBeenCalledTimes(1);
    });
  });
});