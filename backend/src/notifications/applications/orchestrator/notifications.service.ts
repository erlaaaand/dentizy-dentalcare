// applications/orchestrator/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ScheduleReminderService } from '../use-cases/schedule-reminder.service';
import { CancelRemindersService } from '../use-cases/cancel-reminders.service';
import { GetNotificationsService } from '../use-cases/get-notifications.service';
import { RetryFailedService } from '../use-cases/retry-failed.service';
import { Appointment } from '../../../appointments/domains/entities/appointment.entity';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationStatsDto } from '../dto/notification-stats.dto';

/**
 * Notifications Service - Orchestrator
 * Delegates to specific use cases
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly scheduleReminderService: ScheduleReminderService,
    private readonly cancelRemindersService: CancelRemindersService,
    private readonly getNotificationsService: GetNotificationsService,
    private readonly retryFailedService: RetryFailedService,
  ) {}

  /**
   * Schedule reminder for appointment
   */
  async scheduleAppointmentReminder(appointment: Appointment): Promise<void> {
    return this.scheduleReminderService.execute(appointment);
  }

  /**
   * Cancel reminders for appointment
   */
  async cancelRemindersFor(appointmentId: number): Promise<number> {
    return this.cancelRemindersService.execute(appointmentId);
  }

  /**
   * Get all notifications with pagination and filters
   */
  async findAll(query: QueryNotificationsDto): Promise<{
    data: NotificationResponseDto[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.getNotificationsService.findAll(query);
  }

  /**
   * Get notification by ID
   */
  async findOne(id: number): Promise<NotificationResponseDto> {
    return this.getNotificationsService.findOne(id);
  }

  /**
   * Get notification statistics
   */
  async getStatistics(): Promise<NotificationStatsDto> {
    return this.getNotificationsService.getStatistics();
  }

  /**
   * Get failed notifications
   */
  async getFailedNotifications(
    limit: number = 50,
  ): Promise<NotificationResponseDto[]> {
    return this.getNotificationsService.getFailedNotifications(limit);
  }

  /**
   * Retry single failed notification
   */
  async retryNotification(notificationId: number): Promise<void> {
    return this.retryFailedService.execute(notificationId);
  }

  /**
   * Retry all failed notifications
   */
  async retryAllFailed(limit: number = 50): Promise<number> {
    return this.retryFailedService.executeBatch(limit);
  }
}
