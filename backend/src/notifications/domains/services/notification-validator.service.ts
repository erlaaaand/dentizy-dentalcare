// domains/services/notification-validator.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import {
  Notification,
  NotificationStatus,
} from '../entities/notification.entity';
import { Appointment } from '../../../appointments/domains/entities/appointment.entity';

@Injectable()
export class NotificationValidatorService {
  /**
   * Validate notification can be sent
   */
  validateCanSend(notification: Notification): void {
    if (!notification.appointment?.patient?.email) {
      throw new BadRequestException(
        `Cannot send notification #${notification.id}: Patient has no email`,
      );
    }

    if (notification.status === NotificationStatus.SENT) {
      throw new BadRequestException(
        `Notification #${notification.id} already sent`,
      );
    }
  }

  /**
   * Validate notification can be retried
   */
  validateCanRetry(notification: Notification): void {
    if (notification.status !== NotificationStatus.FAILED) {
      throw new BadRequestException(
        `Notification #${notification.id} is not in FAILED status`,
      );
    }

    const MAX_RETRIES = 3;
    if (notification.retry_count >= MAX_RETRIES) {
      throw new BadRequestException(
        `Notification #${notification.id} has exceeded maximum retry attempts (${MAX_RETRIES})`,
      );
    }
  }

  /**
   * Validate appointment has required data
   */
  validateAppointment(appointment: Appointment): void {
    if (!appointment) {
      throw new BadRequestException('Appointment is required');
    }

    if (!appointment.patient?.email) {
      throw new BadRequestException('Patient email is required');
    }

    if (!appointment.tanggal_janji || !appointment.jam_janji) {
      throw new BadRequestException('Appointment date and time are required');
    }
  }
}
