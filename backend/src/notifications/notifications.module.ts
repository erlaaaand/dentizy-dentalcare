// notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { Notification } from './domains/entities/notification.entity';

// Controllers
import { NotificationsController } from './interface/http/notifications.controller';

// Orchestrator
import { NotificationsService } from './applications/orchestrator/notifications.service';

// Use Cases
import { ScheduleReminderService } from './applications/use-cases/schedule-reminder.service';
import { CancelRemindersService } from './applications/use-cases/cancel-reminders.service';
import { SendNotificationService } from './applications/use-cases/send-notification.service';
import { ProcessBatchService } from './applications/use-cases/process-batch.service';
import { RetryFailedService } from './applications/use-cases/retry-failed.service';
import { GetNotificationsService } from './applications/use-cases/get-notifications.service';

// Domain Services
import { NotificationSchedulerService } from './domains/services/notification-scheduler.service';
import { NotificationValidatorService } from './domains/services/notification-validator.service';

// Infrastructure
import { NotificationRepository } from './infrastructures/repositories/notification.repository';
import { EmailChannelService } from './infrastructures/channels/email-channel.service';
import { NotificationCronService } from './infrastructures/jobs/notification-cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    ScheduleModule.forRoot(), // Enable cron jobs
  ],
  controllers: [NotificationsController],
  providers: [
    // Orchestrator
    NotificationsService,

    // Use Cases
    ScheduleReminderService,
    CancelRemindersService,
    SendNotificationService,
    ProcessBatchService,
    RetryFailedService,
    GetNotificationsService,

    // Domain Services
    NotificationSchedulerService,
    NotificationValidatorService,

    // Infrastructure
    NotificationRepository,
    EmailChannelService,
    NotificationCronService,
  ],
  exports: [
    NotificationsService, // Export for use in other modules (e.g., Appointments)
  ],
})
export class NotificationsModule {}
