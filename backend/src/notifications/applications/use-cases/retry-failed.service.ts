// applications/use-cases/retry-failed.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructures/repositories/notification.repository';
import { NotificationValidatorService } from '../../domains/services/notification-validator.service';
import { NotificationStatus } from '../../domains/entities/notification.entity';

@Injectable()
export class RetryFailedService {
    private readonly logger = new Logger(RetryFailedService.name);

    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly validator: NotificationValidatorService,
    ) { }

    async execute(notificationId: number): Promise<void> {
        try {
            // 1. Find notification
            const notification = await this.notificationRepository.findById(notificationId);

            if (!notification) {
                throw new NotFoundException(
                    `Notification #${notificationId} not found`
                );
            }

            // 2. Validate can retry
            this.validator.validateCanRetry(notification);

            // 3. Reset status and schedule for immediate retry
            notification.status = NotificationStatus.PENDING;
            notification.send_at = new Date();
            notification.error_message = null;

            await this.notificationRepository.update(notification);

            this.logger.log(
                `🔄 Notification #${notificationId} queued for retry ` +
                `(attempt ${notification.retry_count + 1})`
            );

        } catch (error) {
            this.logger.error(
                `❌ Error retrying notification #${notificationId}:`,
                error.message
            );
            throw error;
        }
    }

    async executeBatch(limit: number = 50): Promise<number> {
        try {
            this.logger.debug(`🔄 Retrying failed notifications (limit: ${limit})...`);

            const failedNotifications = await this.notificationRepository.findFailed(limit);

            let retriedCount = 0;

            for (const notification of failedNotifications) {
                try {
                    // Validate can retry
                    this.validator.validateCanRetry(notification);

                    // Reset and queue for retry
                    notification.status = NotificationStatus.PENDING;
                    notification.send_at = new Date();
                    notification.error_message = null;

                    await this.notificationRepository.update(notification);
                    retriedCount++;

                } catch (error) {
                    // Skip if can't retry (exceeded max attempts)
                    this.logger.debug(
                        `Skipping notification #${notification.id}: ${error.message}`
                    );
                }
            }

            this.logger.log(`🔄 Queued ${retriedCount} failed notification(s) for retry`);

            return retriedCount;

        } catch (error) {
            this.logger.error('❌ Error retrying failed notifications:', error.message);
            throw error;
        }
    }
}