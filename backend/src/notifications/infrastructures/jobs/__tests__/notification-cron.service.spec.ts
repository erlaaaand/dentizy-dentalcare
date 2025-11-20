// __tests__/infrastructures/jobs/notification-cron.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { NotificationCronService } from '../../../infrastructures/jobs/notification-cron.service';
import { ProcessBatchService } from '../../../applications/use-cases/process-batch.service';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';
import { NotificationStatus } from '../../../domains/entities/notification.entity';

// 2. MOCK DATA & SERVICES

// Mock implementasi untuk CronJob (dari 'cron')
const mockCronJob = {
    start: jest.fn(),
    stop: jest.fn(),
    running: true,
    nextDate: jest.fn(() => ({
        toJSDate: () => new Date('2025-11-19T02:03:00.000Z'), // Waktu run selanjutnya
    })),
};

const mockSchedulerRegistry = {
    getCronJobs: jest.fn(() => new Map([
        ['send-pending-notifications', mockCronJob as unknown as CronJob],
        ['cleanup-stale-notifications', mockCronJob as unknown as CronJob],
        ['notification-health-check', mockCronJob as unknown as CronJob],
    ])),
};

const mockProcessBatchService = {
    execute: jest.fn(),
};

const mockNotificationRepository = {
    findStaleProcessing: jest.fn(),
    update: jest.fn(),
    getStatistics: jest.fn(),
};

const mockLogger = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};

const mockNotification = {
    id: 'n1',
    status: NotificationStatus.SENT,
    sent_at: new Date(Date.now() - 15 * 60 * 1000), // Stale (15 menit lalu)
} as any;

const mockStats = {
    total: 100,
    pending: 10,
    sent: 80,
    failed: 10,
    scheduled_today: 50,
};

// 3. TEST SUITE
describe('NotificationCronService', () => {
    let service: NotificationCronService;

    // 4. SETUP AND TEARDOWN
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationCronService,
                { provide: ProcessBatchService, useValue: mockProcessBatchService },
                { provide: NotificationRepository, useValue: mockNotificationRepository },
                { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
                { provide: Logger, useValue: mockLogger },
            ],
        }).compile();

        service = module.get<NotificationCronService>(NotificationCronService);
        // Ensure the service uses the mock logger
        (service as any).logger = mockLogger;

        // Reset semua mock sebelum setiap tes
        jest.clearAllMocks();
        // Reset state isProcessing
        (service as any).isProcessing = false;
        // Pastikan getCronJobs mengembalikan Map dengan mockCronJob
        (mockSchedulerRegistry.getCronJobs as jest.Mock).mockReturnValue(new Map([
            ['send-pending-notifications', { ...mockCronJob, nextDate: mockCronJob.nextDate, running: true } as unknown as CronJob],
            ['cleanup-stale-notifications', { ...mockCronJob, nextDate: mockCronJob.nextDate, running: true } as unknown as CronJob],
            ['notification-health-check', { ...mockCronJob, nextDate: mockCronJob.nextDate, running: true } as unknown as CronJob],
        ]));
    });

    // onModuleInit tests
    it('should log scheduled jobs on module initialization', () => {
        // Arrange (logScheduledJobs dipanggil di onModuleInit)
        service.onModuleInit();

        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith('🔔 Notification Cron Service initialized');
        expect(mockLogger.log).toHaveBeenCalledWith('📅 Scheduled Cron Jobs:');
        // Memastikan logScheduledJobs dipanggil dan jobs terlog
        expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('send-pending-notifications: ✅ Running'));
    });

    // 5. EXECUTE METHOD TESTS (Cron Jobs)
    
    // Subgroup: handleSendPendingNotifications (CronExpression.EVERY_MINUTE)
    describe('handleSendPendingNotifications', () => {
        const jobName = 'send-pending-notifications';

        it('should execute processBatchService and log success', async () => {
            // Arrange
            const mockResult = { processed: 5, successful: 4, failed: 1, duration: 150 };
            mockProcessBatchService.execute.mockResolvedValue(mockResult);

            // Act
            await service.handleSendPendingNotifications();

            // Assert
            expect(mockProcessBatchService.execute).toHaveBeenCalledTimes(1);
            expect(mockLogger.log).toHaveBeenCalledWith(
                `✅ [${jobName}] Processed 5 notifications in 150ms (4 sent, 1 failed)`
            );
            expect((service as any).isProcessing).toBe(false); // Pastikan state di-reset
        });

        it('should skip execution if isProcessing is true (prevent concurrent execution)', async () => {
            // Arrange
            (service as any).isProcessing = true;

            // Act
            await service.handleSendPendingNotifications();

            // Assert
            expect(mockProcessBatchService.execute).not.toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith('⏩ Skipping: Previous batch still processing');
            expect((service as any).isProcessing).toBe(true);
        });
        
        it('should handle errors during batch processing and reset state', async () => {
            // Arrange
            const processingError = new Error('Database connection failed');
            mockProcessBatchService.execute.mockRejectedValue(processingError);

            // Act
            await service.handleSendPendingNotifications();

            // Assert
            expect(mockProcessBatchService.execute).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).toHaveBeenCalledWith(
                `❌ [${jobName}] Error:`, processingError.message
            );
            expect((service as any).isProcessing).toBe(false); // Pastikan state di-reset
        });

        it('should not log processed message if 0 notifications were processed', async () => {
            // Arrange
            const mockResult = { processed: 0, successful: 0, failed: 0, duration: 5 };
            mockProcessBatchService.execute.mockResolvedValue(mockResult);
            
            // Act
            await service.handleSendPendingNotifications();
            
            // Assert
            expect(mockProcessBatchService.execute).toHaveBeenCalledTimes(1);
            // Hanya debug log yang dipanggil, bukan log sukses
            expect(mockLogger.log).not.toHaveBeenCalled(); 
        });
    });

    // Subgroup: handleCleanupStale (CronExpression.EVERY_5_MINUTES)
    describe('handleCleanupStale', () => {
        const jobName = 'cleanup-stale-notifications';

        it('should reset stale PROCESSING notifications to PENDING', async () => {
            // Arrange
            mockNotificationRepository.findStaleProcessing.mockResolvedValue([mockNotification, { ...mockNotification, id: 'n2' }]);

            // Act
            await service.handleCleanupStale();

            // Assert
            expect(mockNotificationRepository.findStaleProcessing).toHaveBeenCalledWith(
                (service as any).STALE_CLEANUP_TIMEOUT
            );
            expect(mockNotificationRepository.update).toHaveBeenCalledTimes(2);
            // Periksa bahwa status dan sent_at di-reset
            expect(mockNotificationRepository.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 'n1',
                    status: NotificationStatus.PENDING,
                    sent_at: null,
                })
            );
            expect(mockLogger.warn).toHaveBeenCalledWith(
                `⚠️ [${jobName}] Reset 2 stale notification(s) to PENDING`
            );
        });

        it('should log debug if no stale notifications are found', async () => {
            // Arrange
            mockNotificationRepository.findStaleProcessing.mockResolvedValue([]);

            // Act
            await service.handleCleanupStale();

            // Assert
            expect(mockNotificationRepository.findStaleProcessing).toHaveBeenCalledTimes(1);
            expect(mockNotificationRepository.update).not.toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith(`✅ [${jobName}] No stale notifications found`);
        });

        it('should log error if repository throws an error', async () => {
            // Arrange
            const repoError = new Error('Stale lookup failed');
            mockNotificationRepository.findStaleProcessing.mockRejectedValue(repoError);

            // Act
            await service.handleCleanupStale();

            // Assert
            expect(mockLogger.error).toHaveBeenCalledWith(
                `❌ [${jobName}] Error:`, repoError.message
            );
            expect(mockNotificationRepository.update).not.toHaveBeenCalled();
        });
    });

    // Subgroup: handleHealthCheck (CronExpression.EVERY_HOUR)
    describe('handleHealthCheck', () => {
        const jobName = 'notification-health-check';

        it('should log statistics and log info when failed count is normal', async () => {
            // Arrange
            mockNotificationRepository.getStatistics.mockResolvedValue(mockStats); // Failed: 10

            // Act
            await service.handleHealthCheck();

            // Assert
            expect(mockNotificationRepository.getStatistics).toHaveBeenCalledTimes(1);
            expect(mockLogger.log).toHaveBeenCalledWith(
                `📊 [${jobName}] Statistics: Total: 100, Pending: 10, Sent: 80, Failed: 10, Scheduled Today: 50`
            );
            // Tidak ada peringatan karena failed < 100
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it('should log a warning if failed count is high (> 100)', async () => {
            // Arrange
            const highFailedStats = { ...mockStats, failed: 101 };
            mockNotificationRepository.getStatistics.mockResolvedValue(highFailedStats);

            // Act
            await service.handleHealthCheck();

            // Assert
            expect(mockLogger.log).toHaveBeenCalled(); // Log normal stats
            expect(mockLogger.warn).toHaveBeenCalledWith(
                `⚠️ [${jobName}] High number of failed notifications: 101`
            );
        });

        it('should log error if repository throws an error', async () => {
            // Arrange
            const statsError = new Error('Stats aggregation failed');
            mockNotificationRepository.getStatistics.mockRejectedValue(statsError);

            // Act
            await service.handleHealthCheck();

            // Assert
            expect(mockLogger.error).toHaveBeenCalledWith(
                `❌ [${jobName}] Error:`, statsError.message
            );
        });
    });

    // Subgroup: Manual Triggers and Status Checks
    describe('Utility Methods', () => {
        // triggerManualProcessing
        it('should manually trigger processing via processBatchService', async () => {
            // Arrange
            const mockResult = { processed: 5, successful: 5, failed: 0, duration: 100 };
            mockProcessBatchService.execute.mockResolvedValue(mockResult);

            // Act
            const result = await service.triggerManualProcessing();

            // Assert
            expect(mockLogger.log).toHaveBeenCalledWith('🔧 Manual notification processing triggered');
            expect(mockProcessBatchService.execute).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockResult);
        });

        // stopAllJobs
        it('should stop all registered cron jobs', () => {
            // Act
            service.stopAllJobs();

            // Assert
            expect(mockSchedulerRegistry.getCronJobs).toHaveBeenCalledTimes(1);
            // Job stop harus dipanggil sebanyak jumlah jobs (3)
            expect(mockCronJob.stop).toHaveBeenCalledTimes(3);
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Stopped job: send-pending-notifications'));
        });

        // startAllJobs
        it('should start all registered cron jobs', () => {
            // Act
            service.startAllJobs();

            // Assert
            expect(mockSchedulerRegistry.getCronJobs).toHaveBeenCalledTimes(1);
            // Job start harus dipanggil sebanyak jumlah jobs (3)
            expect(mockCronJob.start).toHaveBeenCalledTimes(3);
            expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Started job: send-pending-notifications'));
        });

        // getJobStatus
        it('should return the status of all registered jobs', () => {
            // Arrange
            const expectedNextRunDate = new Date('2025-11-19T02:03:00.000Z');

            // Act
            const status = service.getJobStatus();

            // Assert
            expect(mockSchedulerRegistry.getCronJobs).toHaveBeenCalledTimes(1);
            expect(status).toHaveLength(3);
            expect(status[0]).toEqual({
                name: 'send-pending-notifications',
                running: true,
                nextRun: expectedNextRunDate,
            });
            expect(status[2]).toEqual(expect.objectContaining({
                name: 'notification-health-check',
                running: true,
            }));
            // Pastikan nextDate dipanggil di CronJob mock
            expect(mockCronJob.nextDate).toHaveBeenCalledTimes(3);
        });
    });
});