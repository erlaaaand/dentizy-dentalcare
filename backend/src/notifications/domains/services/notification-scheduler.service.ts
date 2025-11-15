// domains/services/notification-scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Appointment } from '../../../appointments/domains/entities/appointment.entity';

@Injectable()
export class NotificationSchedulerService {
    private readonly logger = new Logger(NotificationSchedulerService.name);
    private readonly REMINDER_HOURS_BEFORE = 24; // 1 day before
    private readonly REMINDER_SEND_HOUR = 9; // Send at 9 AM

    /**
     * Calculate when to send reminder
     */
    calculateReminderTime(appointment: Appointment): Date | null {
        try {
            // Parse appointment date and time
            const appointmentDateTime = new Date(appointment.tanggal_janji);
            const [hours, minutes] = appointment.jam_janji.split(':').map(Number);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            // Calculate reminder time (1 day before at 9 AM)
            const reminderTime = new Date(appointmentDateTime);
            reminderTime.setDate(reminderTime.getDate() - 1);
            reminderTime.setHours(this.REMINDER_SEND_HOUR, 0, 0, 0);

            // Validate: Don't schedule past reminders
            const now = new Date();
            if (reminderTime <= now) {
                this.logger.warn(
                    `Cannot schedule past reminder for appointment #${appointment.id}. ` +
                    `Reminder time: ${reminderTime.toISOString()}, Now: ${now.toISOString()}`
                );
                return null;
            }

            return reminderTime;
        } catch (error) {
            this.logger.error(`Error calculating reminder time:`, error);
            return null;
        }
    }

    /**
     * Check if appointment should have a reminder
     */
    shouldScheduleReminder(appointment: Appointment): boolean {
        const reminderTime = this.calculateReminderTime(appointment);
        return reminderTime !== null;
    }

    /**
     * Get readable reminder info
     */
    getReminderInfo(appointment: Appointment): {
        canSchedule: boolean;
        reminderTime: Date | null;
        reason?: string;
    } {
        const reminderTime = this.calculateReminderTime(appointment);

        if (!reminderTime) {
            return {
                canSchedule: false,
                reminderTime: null,
                reason: 'Reminder time would be in the past'
            };
        }

        return {
            canSchedule: true,
            reminderTime
        };
    }
}