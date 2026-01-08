// applications/use-cases/cancel-reminders.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructures/repositories/notification.repository';

@Injectable()
export class CancelRemindersService {
  private readonly logger = new Logger(CancelRemindersService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(appointmentId: number): Promise<number> {
    try {
      const cancelledCount =
        await this.notificationRepository.cancelForAppointment(appointmentId);

      if (cancelledCount > 0) {
        this.logger.log(
          `📧 Cancelled ${cancelledCount} notification(s) for appointment #${appointmentId}`,
        );
      } else {
        this.logger.debug(
          `No pending notifications found for appointment #${appointmentId}`,
        );
      }

      return cancelledCount;
    } catch (error) {
      this.logger.error(
        `❌ Error cancelling reminders for appointment #${appointmentId}:`,
        error.message,
      );
      throw error;
    }
  }
}
