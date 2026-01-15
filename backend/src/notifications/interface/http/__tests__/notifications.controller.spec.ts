import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../../../applications/orchestrator/notifications.service';
import { NotificationCronService } from '../../../infrastructures/jobs/notification-cron.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../../auth/interface/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

// [DIPERBAIKI] Mengimpor DTO dan Enum yang diperlukan
import { QueryNotificationsDto } from '../../../applications/dto/query-notifications.dto';
import { NotificationStatsDto } from '../../../applications/dto/notification-stats.dto';
import { NotificationResponseDto } from '../../../applications/dto/notification-response.dto';
import {
  NotificationStatus,
  NotificationType,
} from '../../../domains/entities/notification.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  // ======================
  // MOCK ALL DEPENDENCIES
  // ======================

  const mockNotificationsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getStatistics: jest.fn(),
    getFailedNotifications: jest.fn(),
    retryNotification: jest.fn(),
    retryAllFailed: jest.fn(),
  };

  const mockCronService = {
    getJobStatus: jest.fn(),
    triggerManualProcessing: jest.fn(),
    stopAllJobs: jest.fn(),
    startAllJobs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: NotificationCronService, useValue: mockCronService },
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: ThrottlerGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ------------------------------------
  // TEST CASES UNTUK SETIAP ENDPOINT
  // ------------------------------------

  describe('findAll', () => {
    it('should return a list of notifications', async () => {
      // [DIPERBAIKI] Menggunakan Enum untuk query
      const query: QueryNotificationsDto = {
        page: 1,
        limit: 10,
        status: NotificationStatus.PENDING,
      };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      mockNotificationsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toBe(expectedResult);
      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getStatistics', () => {
    it('should return notification statistics', async () => {
      // [DIPERBAIKI] Menggunakan mock yang lengkap sesuai asumsi
      const stats: NotificationStatsDto = {
        total: 100,
        sent: 80,
        pending: 15,
        failed: 5,
        scheduled_today: 10,
        scheduled_this_week: 50,
      };
      mockNotificationsService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics();

      expect(result).toBe(stats);
      expect(mockNotificationsService.getStatistics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFailedNotifications', () => {
    it('should return a list of failed notifications with a specific limit', async () => {
      const limit = 20;
      // [DIPERBAIKI] Menggunakan Enum untuk status, bukan string
      const expectedResult: Partial<NotificationResponseDto>[] = [
        { id: 1, status: NotificationStatus.FAILED },
      ];
      mockNotificationsService.getFailedNotifications.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getFailedNotifications(limit);

      expect(result).toBe(expectedResult);
      expect(
        mockNotificationsService.getFailedNotifications,
      ).toHaveBeenCalledWith(limit);
    });
  });

  describe('getJobStatus', () => {
    it('should return cron job statuses', () => {
      const status = {
        reminder_job: { lastRun: new Date(), isRunning: false },
      };
      mockCronService.getJobStatus.mockReturnValue(status);

      const result = controller.getJobStatus();

      expect(result).toBe(status);
      expect(mockCronService.getJobStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single notification by ID', async () => {
      const id = 1;
      // [DIPERBAIKI] Menggunakan properti yang valid dari NotificationResponseDto
      const expectedResult: Partial<NotificationResponseDto> = {
        id: 1,
        type: NotificationType.EMAIL_REMINDER,
        status: NotificationStatus.SENT,
      };
      mockNotificationsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(result).toBe(expectedResult);
      expect(mockNotificationsService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('retryNotification', () => {
    it('should queue a single notification for retry', async () => {
      const id = 123;
      mockNotificationsService.retryNotification.mockResolvedValue(undefined);

      const result = await controller.retryNotification(id);

      expect(result).toEqual({
        message: `Notification #${id} queued for retry`,
      });
      expect(mockNotificationsService.retryNotification).toHaveBeenCalledWith(
        id,
      );
    });
  });

  describe('retryAllFailed', () => {
    it('should queue all failed notifications for retry with a limit', async () => {
      const limit = 50;
      const count = 5;
      mockNotificationsService.retryAllFailed.mockResolvedValue(count);

      const result = await controller.retryAllFailed(limit);

      expect(result).toEqual({
        message: `Successfully queued ${count} failed notification(s) for retry`,
        count,
      });
      expect(mockNotificationsService.retryAllFailed).toHaveBeenCalledWith(
        limit,
      );
    });
  });

  describe('triggerManualProcessing', () => {
    it('should trigger manual job processing', async () => {
      const jobResult = { triggered: true, jobsRun: 1 };
      mockCronService.triggerManualProcessing.mockResolvedValue(jobResult);

      const result = await controller.triggerManualProcessing();

      expect(result).toBe(jobResult);
      expect(mockCronService.triggerManualProcessing).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopAllJobs', () => {
    it('should stop all cron jobs', () => {
      mockCronService.stopAllJobs.mockReturnValue(undefined);

      const result = controller.stopAllJobs();

      expect(result).toEqual({ message: 'All notification cron jobs stopped' });
      expect(mockCronService.stopAllJobs).toHaveBeenCalledTimes(1);
    });
  });

  describe('startAllJobs', () => {
    it('should start all cron jobs', () => {
      mockCronService.startAllJobs.mockReturnValue(undefined);

      const result = controller.startAllJobs();

      expect(result).toEqual({ message: 'All notification cron jobs started' });
      expect(mockCronService.startAllJobs).toHaveBeenCalledTimes(1);
    });
  });
});
