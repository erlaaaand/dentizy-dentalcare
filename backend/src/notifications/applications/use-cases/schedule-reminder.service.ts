import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructures/repositories/notification.repository';
import { NotificationSchedulerService } from '../../domains/services/notification-scheduler.service';
import { NotificationValidatorService } from '../../domains/services/notification-validator.service';
import { Appointment } from '../../../appointments/domains/entities/appointment.entity';
import { NotificationType, NotificationStatus } from '../../domains/entities/notification.entity';

@Injectable()
export class ScheduleReminderService {
    private readonly logger = new Logger(ScheduleReminderService.name);

    constructor(
        private readonly notificationRepository: NotificationRepository,
        private readonly scheduler: NotificationSchedulerService,
        private readonly validator: NotificationValidatorService,
    ) { }

    async execute(appointment: Appointment): Promise<void> {
        try {
            // 1. Validate appointment
            this.validator.validateAppointment(appointment);

            // 2. Calculate reminder time
            const reminderTime = this.scheduler.calculateReminderTime(appointment);

            if (!reminderTime) {
                this.logger.warn(
                    `⚠️ Cannot schedule reminder for appointment #${appointment.id}: ` +
                    `Reminder time would be in the past`
                );
                return;
            }

            // 3. Create notification
            await this.notificationRepository.create({
                appointment_id: appointment.id,
                type: NotificationType.EMAIL_REMINDER,
                status: NotificationStatus.PENDING,
                send_at: reminderTime,
            });

            this.logger.log(
                `📅 Reminder scheduled for appointment #${appointment.id} ` +
                `at ${reminderTime.toISOString()}`
            );

        } catch (error) {
            this.logger.error(
                `❌ Error scheduling reminder for appointment #${appointment.id}:`,
                error.message
            );
            throw error;
        }
    }
}