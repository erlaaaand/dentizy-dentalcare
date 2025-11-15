// applications/use-cases/send-notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructures/repositories/notification.repository';
import { EmailChannelService } from '../../infrastructures/channels/email-channel.service';
import { NotificationValidatorService } from '../../domains/services/notification-validator.service';
import { Notification, NotificationType } from '../../domains/entities/notification.entity';

@Injectable()
export class SendNotificationService {
    private readonly logger = new Logger(SendNotificationService.name);

    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly emailChannel: EmailChannelService,
        private readonly validator: NotificationValidatorService,
    ) { }

    async execute(notification: Notification): Promise<void> {
        try {
            // 1. Validate can send
            this.validator.validateCanSend(notification);

            // 2. Send based on type
            switch (notification.type) {
                case NotificationType.EMAIL_REMINDER:
                    await this.sendEmailReminder(notification);
                    break;

                case NotificationType.SMS_REMINDER:
                    // TODO: Implement SMS channel
                    throw new Error('SMS channel not implemented yet');

                case NotificationType.WHATSAPP_CONFIRMATION:
                    // TODO: Implement WhatsApp channel
                    throw new Error('WhatsApp channel not implemented yet');

                default:
                    throw new Error(`Unknown notification type: ${notification.type}`);
            }

            // 3. Mark as sent
            await this.notificationRepository.markAsSent(notification.id);

            this.logger.log(
                `✅ Notification #${notification.id} sent successfully for appointment #${notification.appointment_id}`
            );

        } catch (error) {
            // Mark as failed with error message
            await this.notificationRepository.markAsFailed(
                notification.id,
                error.message
            );

            this.logger.error(
                `❌ Failed to send notification #${notification.id}:`,
                error.message
            );

            throw error;
        }
    }

    private async sendEmailReminder(notification: Notification): Promise<void> {
        const emailData = this.emailChannel.generateReminderEmail(notification);
        await this.emailChannel.sendEmail(emailData);
    }
}