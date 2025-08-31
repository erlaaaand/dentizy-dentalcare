import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from './entities/notification.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    /**
     * Fungsi ini dipanggil oleh modul lain (misal: AppointmentsService)
     * untuk membuat jadwal pengingat.
     */
    async scheduleAppointmentReminder(appointment: Appointment): Promise<void> {
        // Atur pengingat untuk dikirim 1 hari sebelum janji temu
        const sendAt = new Date(appointment.created_at); // Asumsi kolom tanggal janji ada di appointment
        sendAt.setDate(sendAt.getDate() - 1);

        const newNotification = this.notificationRepository.create({
            appointment_id: appointment.id,
            type: NotificationType.EMAIL_REMINDER,
            status: NotificationStatus.PENDING,
            send_at: sendAt,
        });

        await this.notificationRepository.save(newNotification);
        this.logger.log(`Pengingat dijadwalkan untuk janji temu #${appointment.id}`);
    }

    /**
     * Fungsi CRON JOB.
     * Akan berjalan setiap menit untuk memeriksa apakah ada pengingat yang harus dikirim.
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCronSendReminders() {
        this.logger.log('Menjalankan tugas pengecekan pengingat...');

        const notificationsToSend = await this.notificationRepository.find({
            where: {
                status: NotificationStatus.PENDING,
                send_at: LessThanOrEqual(new Date()),
            },
            relations: ['appointment', 'appointment.patient'],
        });

        if (notificationsToSend.length === 0) {
            this.logger.log('Tidak ada pengingat untuk dikirim saat ini.');
            return;
        }

        for (const notif of notificationsToSend) {
            this.logger.log(`Mengirim pengingat untuk janji temu #${notif.appointment_id}...`);

            // --- Di sinilah logika pengiriman email Anda berada ---
            // Contoh: await this.emailService.sendReminder(notif.appointment.patient.email, ...);

            // Setelah email terkirim, update statusnya
            notif.status = NotificationStatus.SENT;
            notif.sent_at = new Date();
            await this.notificationRepository.save(notif);

            this.logger.log(`Pengingat untuk janji temu #${notif.appointment_id} berhasil dikirim.`);
        }
    }

    /**
     * Fungsi sederhana untuk melihat semua notifikasi (untuk admin)
     */
    findAll(): Promise<Notification[]> {
        return this.notificationRepository.find();
    }
}