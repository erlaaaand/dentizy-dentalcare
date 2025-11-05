import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from './entities/notification.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly mailerService: MailerService,
    ) { }

    /**
     * 🔥 IMPLEMENTASI: Membatalkan semua notifikasi yang terjadwal untuk appointment tertentu
     */
    async cancelRemindersFor(appointmentId: number): Promise<void> {
        const pendingNotifications = await this.notificationRepository.find({
            where: {
                appointment_id: appointmentId,
                status: NotificationStatus.PENDING,
            },
        });

        if (pendingNotifications.length > 0) {
            // Update status menjadi FAILED atau bisa dibuat status baru CANCELLED
            for (const notif of pendingNotifications) {
                notif.status = NotificationStatus.FAILED; // Atau buat enum CANCELLED jika perlu
                await this.notificationRepository.save(notif);
            }
            
            this.logger.log(`Membatalkan ${pendingNotifications.length} notifikasi untuk appointment #${appointmentId}`);
        }
    }

    async scheduleAppointmentReminder(appointment: Appointment): Promise<void> {
        const sendAt = new Date(appointment.tanggal_janji);
        sendAt.setDate(sendAt.getDate() - 1); // 1 hari sebelum

        const newNotification = this.notificationRepository.create({
            appointment_id: appointment.id,
            type: NotificationType.EMAIL_REMINDER,
            status: NotificationStatus.PENDING,
            send_at: sendAt,
        });

        await this.notificationRepository.save(newNotification);
        this.logger.log(`Pengingat dijadwalkan untuk janji temu #${appointment.id}`);
    }

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

            try {
                await this.mailerService.sendMail({
                    to: notif.appointment.patient.email,
                    subject: `Pengingat Janji Temu di Klinik Dentizy`,
                    html: `
                        <h3>Halo, ${notif.appointment.patient.nama_lengkap}!</h3>
                        <p>Ini adalah pengingat untuk janji temu Anda besok.</p>
                        <p>Detail Janji Temu:</p>
                        <ul>
                            <li>Tanggal: ${notif.appointment.tanggal_janji}</li>
                            <li>Jam: ${notif.appointment.jam_janji}</li>
                        </ul>
                        <p>Terima kasih.</p>
                    `,
                });

                notif.status = NotificationStatus.SENT;
                notif.sent_at = new Date();
                this.logger.log(`Pengingat untuk janji temu #${notif.appointment_id} berhasil dikirim.`);
            } catch (error) {
                notif.status = NotificationStatus.FAILED;
                this.logger.error(`Gagal mengirim pengingat untuk janji temu #${notif.appointment_id}`, error.stack);
            }

            await this.notificationRepository.save(notif);
        }
    }

    findAll(): Promise<Notification[]> {
        return this.notificationRepository.find();
    }
}