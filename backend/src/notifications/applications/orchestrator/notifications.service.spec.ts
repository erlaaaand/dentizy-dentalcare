import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { ScheduleReminderService } from '../use-cases/schedule-reminder.service';
import { CancelRemindersService } from '../use-cases/cancel-reminders.service';
import { GetNotificationsService } from '../use-cases/get-notifications.service';
import { RetryFailedService } from '../use-cases/retry-failed.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  // Mock Dependencies
  const mockScheduleReminderService = {
    execute: jest.fn(),
  };

  const mockCancelRemindersService = {
    execute: jest.fn(),
  };

  const mockGetNotificationsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getStatistics: jest.fn(),
    getFailedNotifications: jest.fn(),
  };

  const mockRetryFailedService = {
    execute: jest.fn(),
    executeBatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: ScheduleReminderService, useValue: mockScheduleReminderService },
        { provide: CancelRemindersService, useValue: mockCancelRemindersService },
        { provide: GetNotificationsService, useValue: mockGetNotificationsService },
        { provide: RetryFailedService, useValue: mockRetryFailedService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===============================================================
  // scheduleAppointmentReminder
  // ===============================================================
  it('should call scheduleReminderService.execute() when scheduling reminder', async () => {
    const appointment: any = { id: 1 };

    await service.scheduleAppointmentReminder(appointment);

    expect(mockScheduleReminderService.execute).toHaveBeenCalledWith(appointment);
  });

  // ===============================================================
  // cancelRemindersFor
  // ===============================================================
  it('should call cancelRemindersService.execute() when cancelling reminders', async () => {
    mockCancelRemindersService.execute.mockResolvedValue(3);

    const result = await service.cancelRemindersFor(10);

    expect(result).toBe(3);
    expect(mockCancelRemindersService.execute).toHaveBeenCalledWith(10);
  });

  // ===============================================================
  // findAll
  // ===============================================================
  it('should call getNotificationsService.findAll()', async () => {
    const query: any = { page: 1, limit: 10 };
    const mockData = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };

    mockGetNotificationsService.findAll.mockResolvedValue(mockData);

    const result = await service.findAll(query);

    expect(result).toEqual(mockData);
    expect(mockGetNotificationsService.findAll).toHaveBeenCalledWith(query);
  });

  // ===============================================================
  // findOne
  // ===============================================================
  it('should call getNotificationsService.findOne()', async () => {
    const mockItem = { id: 1 };
    mockGetNotificationsService.findOne.mockResolvedValue(mockItem);

    const result = await service.findOne(1);

    expect(result).toEqual(mockItem);
    expect(mockGetNotificationsService.findOne).toHaveBeenCalledWith(1);
  });

  // ===============================================================
  // getStatistics
  // ===============================================================
  it('should call getNotificationsService.getStatistics()', async () => {
    const mockStats = { total: 10 };
    mockGetNotificationsService.getStatistics.mockResolvedValue(mockStats);

    const result = await service.getStatistics();

    expect(result).toEqual(mockStats);
    expect(mockGetNotificationsService.getStatistics).toHaveBeenCalled();
  });

  // ===============================================================
  // getFailedNotifications
  // ===============================================================
  it('should call getNotificationsService.getFailedNotifications()', async () => {
    const mockFails = [{ id: 1 }, { id: 2 }];
    mockGetNotificationsService.getFailedNotifications.mockResolvedValue(mockFails);

    const result = await service.getFailedNotifications(20);

    expect(result).toEqual(mockFails);
    expect(mockGetNotificationsService.getFailedNotifications).toHaveBeenCalledWith(20);
  });

  // ===============================================================
  // retryNotification
  // ===============================================================
  it('should call retryFailedService.execute()', async () => {
    await service.retryNotification(5);

    expect(mockRetryFailedService.execute).toHaveBeenCalledWith(5);
  });

  // ===============================================================
  // retryAllFailed
  // ===============================================================
  it('should call retryFailedService.executeBatch()', async () => {
    mockRetryFailedService.executeBatch.mockResolvedValue(7);

    const result = await service.retryAllFailed(100);

    expect(result).toBe(7);
    expect(mockRetryFailedService.executeBatch).toHaveBeenCalledWith(100);
  });
});
