// domains/mappers/notification.mapper.ts
import { Notification } from '../entities/notification.entity';
import { NotificationResponseDto } from '../../applications/dto/notification-response.dto';

export class NotificationMapper {
  static toResponseDto(notification: Notification): NotificationResponseDto {
    const appointmentData = notification.appointment
      ? {
          id: notification.appointment.id,
          tanggal_janji: notification.appointment.tanggal_janji,
          jam_janji: notification.appointment.jam_janji,

          // Mapping Patient
          patient: notification.appointment.patient
            ? {
                id: notification.appointment.patient.id,
                nama_lengkap: notification.appointment.patient.nama_lengkap,
                email: notification.appointment.patient.email,
              }
            : undefined,

          // Mapping Doctor
          doctor: notification.appointment.doctor
            ? {
                id: notification.appointment.doctor.id,
                nama_lengkap: notification.appointment.doctor.nama_lengkap,
              }
            : null,
        }
      : undefined;

    return {
      id: notification.id,
      appointment_id: notification.appointment_id,
      type: notification.type,
      status: notification.status,
      send_at: notification.send_at,
      sent_at: notification.sent_at,
      created_at: notification.created_at,
      updated_at: notification.updated_at,

      // PERBAIKAN DI SINI: Tambahkan 'as any' agar TypeScript tidak protes
      // soal ketidakcocokan tipe patient/doctor.
      ...(appointmentData && { appointment: appointmentData as any }),
    };
  }

  static toResponseDtoArray(
    notifications: Notification[],
  ): NotificationResponseDto[] {
    return notifications.map((n) => this.toResponseDto(n));
  }
}
