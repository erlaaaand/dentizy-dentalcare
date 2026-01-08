import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AppointmentCreatedEvent,
  AppointmentCancelledEvent,
  AppointmentCompletedEvent,
  AppointmentUpdatedEvent,
  AppointmentDeletedEvent,
} from '../events';
import { NotificationsService } from '../../../notifications/applications/orchestrator/notifications.service';

/**
 * Event listener untuk appointment events
 * Handle side effects seperti notifications, logging, analytics
 */
@Injectable()
export class AppointmentEventListener {
  private readonly logger = new Logger(AppointmentEventListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Handle appointment created event
   * Schedule reminder notification
   */
  @OnEvent('appointment.created')
  async handleAppointmentCreated(event: AppointmentCreatedEvent) {
    this.logger.log(`📅 Appointment created: #${event.appointment.id}`);

    if (event.shouldScheduleReminder) {
      try {
        await this.notificationsService.scheduleAppointmentReminder(
          event.appointment,
        );
        this.logger.log(
          `📧 Reminder scheduled for appointment #${event.appointment.id}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Failed to schedule reminder: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  /**
   * Handle appointment cancelled event
   * Cancel reminder notifications
   */
  @OnEvent('appointment.cancelled')
  async handleAppointmentCancelled(event: AppointmentCancelledEvent) {
    this.logger.log(
      `❌ Appointment cancelled: #${event.appointment.id} by user #${event.cancelledBy}`,
    );

    try {
      await this.notificationsService.cancelRemindersFor(event.appointment.id);
      this.logger.log(
        `📧 Reminders cancelled for appointment #${event.appointment.id}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to cancel reminders: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle appointment completed event
   * Log completion, dapat diperluas untuk analytics
   */
  @OnEvent('appointment.completed')
  async handleAppointmentCompleted(event: AppointmentCompletedEvent) {
    this.logger.log(
      `✅ Appointment completed: #${event.appointment.id} by user #${event.completedBy}`,
    );

    // Future: Send completion notification
    // Future: Update statistics
    // Future: Trigger medical record creation reminder
  }

  /**
   * Handle appointment updated event
   * Reschedule reminder jika waktu berubah
   */
  @OnEvent('appointment.updated')
  async handleAppointmentUpdated(event: AppointmentUpdatedEvent) {
    this.logger.log(`🔄 Appointment updated: #${event.appointment.id}`);

    if (event.isTimeUpdated) {
      try {
        // Cancel old reminder
        await this.notificationsService.cancelRemindersFor(
          event.appointment.id,
        );

        // Schedule new reminder if applicable
        if (
          event.appointment.patient?.email &&
          event.appointment.patient?.is_registered_online
        ) {
          await this.notificationsService.scheduleAppointmentReminder(
            event.appointment,
          );
          this.logger.log(
            `📧 Reminder rescheduled for appointment #${event.appointment.id}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `❌ Failed to reschedule reminder: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  /**
   * Handle appointment deleted event
   * Cancel reminders and cleanup
   */
  @OnEvent('appointment.deleted')
  async handleAppointmentDeleted(event: AppointmentDeletedEvent) {
    this.logger.log(
      `🗑️ Appointment deleted: #${event.appointmentId} by user #${event.deletedBy}`,
    );

    try {
      await this.notificationsService.cancelRemindersFor(event.appointmentId);
      this.logger.log(
        `📧 Reminders cancelled for deleted appointment #${event.appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to cancel reminders: ${error.message}`,
        error.stack,
      );
    }
  }
}
