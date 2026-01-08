// applications/use-cases/process-batch.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructures/repositories/notification.repository';
import { SendNotificationService } from './send-notification.service';

@Injectable()
export class ProcessBatchService {
  private readonly logger = new Logger(ProcessBatchService.name);
  private readonly MAX_BATCH_SIZE = 50;

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly sendNotificationService: SendNotificationService,
  ) {}

  async execute(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    duration: number;
  }> {
    const startTime = Date.now();
    const batchId = `batch_${Date.now()}`;

    let successCount = 0;
    let failCount = 0;

    try {
      this.logger.debug(`🔍 [${batchId}] Fetching pending notifications...`);

      // 1. Fetch pending notifications
      const notifications = await this.notificationRepository.findPendingToSend(
        this.MAX_BATCH_SIZE,
      );

      if (notifications.length === 0) {
        this.logger.debug(`✅ [${batchId}] No notifications to process`);
        return {
          processed: 0,
          successful: 0,
          failed: 0,
          duration: Date.now() - startTime,
        };
      }

      this.logger.log(
        `📧 [${batchId}] Processing ${notifications.length} notification(s)...`,
      );

      // 2. Mark as processing (prevent duplicate processing)
      const notificationIds = notifications.map((n) => n.id);
      await this.notificationRepository.markAsProcessing(notificationIds);

      // 3. Process each notification
      for (const notification of notifications) {
        try {
          await this.sendNotificationService.execute(notification);
          successCount++;
        } catch (error) {
          failCount++;
          // Error already logged in SendNotificationService
        }
      }

      const duration = Date.now() - startTime;

      this.logger.log(
        `📊 [${batchId}] Completed in ${duration}ms: ` +
          `${successCount} sent, ${failCount} failed`,
      );

      return {
        processed: notifications.length,
        successful: successCount,
        failed: failCount,
        duration,
      };
    } catch (error) {
      this.logger.error(
        `❌ [${batchId}] Batch processing error:`,
        error.message,
      );
      throw error;
    }
  }
}
