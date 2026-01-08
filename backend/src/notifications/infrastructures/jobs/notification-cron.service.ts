// infrastructures/jobs/notification-cron.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ProcessBatchService } from '../../applications/use-cases/process-batch.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationStatus } from '../../domains/entities/notification.entity';

@Injectable()
export class NotificationCronService implements OnModuleInit {
  private readonly logger = new Logger(NotificationCronService.name);
  private isProcessing = false;
  private readonly PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly STALE_CLEANUP_TIMEOUT = 10; // 10 minutes

  constructor(
    private readonly processBatchService: ProcessBatchService,
    private readonly notificationRepository: NotificationRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.logger.log('🔔 Notification Cron Service initialized');
    this.logScheduledJobs();
  }

  /**
   * Main cron job: Send pending notifications
   * Runs every minute
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'send-pending-notifications',
  })
  async handleSendPendingNotifications() {
    // Prevent concurrent execution
    if (this.isProcessing) {
      this.logger.debug('⏩ Skipping: Previous batch still processing');
      return;
    }

    this.isProcessing = true;
    const jobName = 'send-pending-notifications';

    try {
      this.logger.debug(`🔍 [${jobName}] Starting...`);

      // Process batch
      const result = await this.processBatchService.execute();

      if (result.processed > 0) {
        this.logger.log(
          `✅ [${jobName}] Processed ${result.processed} notifications ` +
            `in ${result.duration}ms (${result.successful} sent, ${result.failed} failed)`,
        );
      }
    } catch (error) {
      this.logger.error(`❌ [${jobName}] Error:`, error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Cleanup stale processing notifications
   * Runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'cleanup-stale-notifications',
  })
  async handleCleanupStale() {
    const jobName = 'cleanup-stale-notifications';

    try {
      this.logger.debug(`🧹 [${jobName}] Starting cleanup...`);

      // Find stale processing notifications
      const staleNotifications =
        await this.notificationRepository.findStaleProcessing(
          this.STALE_CLEANUP_TIMEOUT,
        );

      if (staleNotifications.length === 0) {
        this.logger.debug(`✅ [${jobName}] No stale notifications found`);
        return;
      }

      // Reset status to PENDING
      for (const notification of staleNotifications) {
        notification.status = NotificationStatus.PENDING;
        notification.sent_at = null;
        await this.notificationRepository.update(notification);
      }

      this.logger.warn(
        `⚠️ [${jobName}] Reset ${staleNotifications.length} stale notification(s) to PENDING`,
      );
    } catch (error) {
      this.logger.error(`❌ [${jobName}] Error:`, error.message);
    }
  }

  /**
   * Health check: Log statistics
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'notification-health-check',
  })
  async handleHealthCheck() {
    const jobName = 'notification-health-check';

    try {
      const stats = await this.notificationRepository.getStatistics();

      this.logger.log(
        `📊 [${jobName}] Statistics: ` +
          `Total: ${stats.total}, ` +
          `Pending: ${stats.pending}, ` +
          `Sent: ${stats.sent}, ` +
          `Failed: ${stats.failed}, ` +
          `Scheduled Today: ${stats.scheduled_today}`,
      );

      // Alert if too many failed
      if (stats.failed > 100) {
        this.logger.warn(
          `⚠️ [${jobName}] High number of failed notifications: ${stats.failed}`,
        );
      }
    } catch (error) {
      this.logger.error(`❌ [${jobName}] Error:`, error.message);
    }
  }

  /**
   * Log all scheduled jobs for debugging
   */
  private logScheduledJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();

    this.logger.log('📅 Scheduled Cron Jobs:');
    jobs.forEach((value, key) => {
      this.logger.log(
        `  - ${key}: ${(value as any).running ? '✅ Running' : '⏸️  Stopped'}`,
      );
    });
  }

  /**
   * Manually trigger notification processing (for testing)
   */
  async triggerManualProcessing(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    duration: number;
  }> {
    this.logger.log('🔧 Manual notification processing triggered');
    return this.processBatchService.execute();
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs(): void {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      value.stop();
      this.logger.warn(`⏸️  Stopped job: ${key}`);
    });
  }

  /**
   * Start all cron jobs
   */
  startAllJobs(): void {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      value.start();
      this.logger.log(`▶️  Started job: ${key}`);
    });
  }

  /**
   * Get job status
   */
  getJobStatus(): {
    name: string;
    running: boolean;
    nextRun: Date | string;
  }[] {
    const jobs = this.schedulerRegistry.getCronJobs();
    const status: any[] = [];

    jobs.forEach((value, key) => {
      status.push({
        name: key,
        running: (value as any).running ?? false,
        nextRun: (() => {
          const nd = (value as any).nextDate ? (value as any).nextDate() : null;
          return nd ? nd.toJSDate() : 'N/A';
        })(),
      });
    });

    return status;
  }
}
