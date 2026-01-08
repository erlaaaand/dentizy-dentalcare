import { Injectable, Logger } from '@nestjs/common';
import { Appointment } from '../../../appointments/domains/entities/appointment.entity';

export interface ReminderInfo {
  canSchedule: boolean;
  reminderTime: Date | null;
  reason?: string;
}

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);
  private readonly REMINDER_HOURS_BEFORE = 24;
  private readonly REMINDER_SEND_HOUR = 9; // 9 AM

  /**
   * Calculate when to send reminder for an appointment
   * Returns null if reminder time would be in the past
   */
  calculateReminderTime(appointment: Appointment): Date | null {
    try {
      // Validate appointment date
      if (!appointment.tanggal_janji) {
        this.logger.error(`Appointment #${appointment.id} has no date`);
        return null;
      }

      // Validate time format
      if (!appointment.jam_janji || typeof appointment.jam_janji !== 'string') {
        this.logger.error(
          `Appointment #${appointment.id} has invalid time format`,
        );
        return null;
      }

      // Parse time string (format: "HH:mm")
      const timeParts = appointment.jam_janji.split(':');
      if (timeParts.length !== 2) {
        this.logger.error(
          `Appointment #${appointment.id} has malformed time: ${appointment.jam_janji}`,
        );
        return null;
      }

      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      // Validate time values
      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        this.logger.error(
          `Appointment #${appointment.id} has invalid time values: ${appointment.jam_janji}`,
        );
        return null;
      }

      // Create appointment date-time in UTC
      const appointmentDate = new Date(appointment.tanggal_janji);

      // Check if date is valid
      if (isNaN(appointmentDate.getTime())) {
        this.logger.error(`Appointment #${appointment.id} has invalid date`);
        return null;
      }

      // Calculate reminder time (1 day before at 9 AM UTC)
      const reminderTime = new Date(appointmentDate);
      reminderTime.setUTCDate(reminderTime.getUTCDate() - 1);
      reminderTime.setUTCHours(this.REMINDER_SEND_HOUR, 0, 0, 0);

      // Check if reminder time is in the past
      const now = new Date();
      if (reminderTime <= now) {
        this.logger.warn(
          `Cannot schedule past reminder for appointment #${appointment.id}. ` +
            `Reminder time: ${reminderTime.toISOString()}, Now: ${now.toISOString()}`,
        );
        return null;
      }

      return reminderTime;
    } catch (error) {
      this.logger.error('Error calculating reminder time:', error);
      return null;
    }
  }

  /**
   * Check if reminder should be scheduled for this appointment
   */
  shouldScheduleReminder(appointment: Appointment): boolean {
    const reminderTime = this.calculateReminderTime(appointment);
    return reminderTime !== null;
  }

  /**
   * Get detailed reminder scheduling information
   */
  getReminderInfo(appointment: Appointment): ReminderInfo {
    const reminderTime = this.calculateReminderTime(appointment);

    if (reminderTime) {
      return {
        canSchedule: true,
        reminderTime,
      };
    }

    return {
      canSchedule: false,
      reminderTime: null,
      reason: 'Reminder time would be in the past',
    };
  }
}
