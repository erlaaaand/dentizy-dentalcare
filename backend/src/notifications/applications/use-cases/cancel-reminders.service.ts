// applications/use-cases/cancel-reminders.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructures/repositories/notification.repository';

@Injectable()
export class CancelRemindersService {
  private readonly logger = new Logger(CancelRemindersService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) { }

  /**
   * Cancel reminders for a specific appointment
   * @param appointmentId UUID String
   * @returns number of cancelled notifications
   */
  // [FIX] Ubah Return Type menjadi Promise<number> karena mengembalikan jumlah (count)
  async execute(appointmentId: string): Promise<number> {
    try {
      // Pastikan repository method 'cancelForAppointment' menerima parameter string (UUID)
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
      // [FIX] Type-safe error handling (menghindari penggunaan any implisit)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `❌ Error cancelling reminders for appointment #${appointmentId}: ${errorMessage}`,
      );
      throw error;
    }
  }
}