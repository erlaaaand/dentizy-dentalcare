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
    private isProcessing = false; // ✅ FIX: Simple lock untuk prevent race condition

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly mailerService: MailerService,
    ) { }

    /**
     * 🔥 IMPLEMENTASI: Membatalkan semua notifikasi yang terjadwal untuk appointment tertentu
     */
    async cancelRemindersFor(appointmentId: number): Promise<void> {
        try {
            const pendingNotifications = await this.notificationRepository.find({
                where: {
                    appointment_id: appointmentId,
                    status: NotificationStatus.PENDING,
                },
            });

            if (pendingNotifications.length > 0) {
                // Update status menjadi FAILED (atau bisa buat enum CANCELLED)
                for (const notif of pendingNotifications) {
                    notif.status = NotificationStatus.FAILED;
                    await this.notificationRepository.save(notif);
                }
                
                this.logger.log(`📧 Membatalkan ${pendingNotifications.length} notifikasi untuk appointment #${appointmentId}`);
            }
        } catch (error) {
            this.logger.error(`❌ Error cancelling reminders for appointment #${appointmentId}:`, error);
            throw error;
        }
    }

    /**
     * Schedule appointment reminder (1 hari sebelum)
     */
    async scheduleAppointmentReminder(appointment: Appointment): Promise<void> {
        try {
            // Parse tanggal dan jam appointment
            const appointmentDateTime = new Date(appointment.tanggal_janji);
            const [hours, minutes] = appointment.jam_janji.split(':').map(Number);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            // Set reminder 1 hari sebelum, jam 09:00
            const sendAt = new Date(appointmentDateTime);
            sendAt.setDate(sendAt.getDate() - 1);
            sendAt.setHours(9, 0, 0, 0);

            // ✅ Jangan schedule reminder jika waktu sudah lewat
            const now = new Date();
            if (sendAt <= now) {
                this.logger.warn(`⚠️ Cannot schedule past reminder for appointment #${appointment.id}`);
                return;
            }

            const newNotification = this.notificationRepository.create({
                appointment_id: appointment.id,
                type: NotificationType.EMAIL_REMINDER,
                status: NotificationStatus.PENDING,
                send_at: sendAt,
            });

            await this.notificationRepository.save(newNotification);
            
            this.logger.log(
                `📅 Reminder scheduled for appointment #${appointment.id} at ${sendAt.toISOString()}`
            );
        } catch (error) {
            this.logger.error(`❌ Error scheduling reminder for appointment #${appointment.id}:`, error);
            throw error;
        }
    }

    /**
     * ✅ FIX: Cron job dengan locking mechanism
     * Jalan setiap 1 menit untuk cek notifikasi yang harus dikirim
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCronSendReminders() {
        // ✅ FIX: Check if already processing
        if (this.isProcessing) {
            this.logger.warn('⚠️ Previous cron job still running, skipping...');
            return;
        }

        this.isProcessing = true;
        const startTime = Date.now();

        try {
            this.logger.debug('🔍 Checking for pending reminders...');

            const notificationsToSend = await this.notificationRepository.find({
                where: {
                    status: NotificationStatus.PENDING,
                    send_at: LessThanOrEqual(new Date()),
                },
                relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
                take: 50, // ✅ Limit untuk prevent overload
            });

            if (notificationsToSend.length === 0) {
                this.logger.debug('✅ No reminders to send');
                return;
            }

            this.logger.log(`📧 Processing ${notificationsToSend.length} reminders...`);

            let successCount = 0;
            let failCount = 0;

            // ✅ Process notifications sequentially untuk avoid rate limiting
            for (const notif of notificationsToSend) {
                try {
                    // Validate patient email
                    if (!notif.appointment?.patient?.email) {
                        this.logger.warn(
                            `⚠️ No email for appointment #${notif.appointment_id}, marking as failed`
                        );
                        notif.status = NotificationStatus.FAILED;
                        await this.notificationRepository.save(notif);
                        failCount++;
                        continue;
                    }

                    // Format tanggal dan jam untuk email
                    const appointmentDate = new Date(notif.appointment.tanggal_janji);
                    const formattedDate = appointmentDate.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });

                    // Send email
                    await this.mailerService.sendMail({
                        to: notif.appointment.patient.email,
                        subject: `Pengingat Janji Temu - Klinik Dentizy`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #2563eb;">Pengingat Janji Temu</h2>
                                
                                <p>Halo, <strong>${notif.appointment.patient.nama_lengkap}</strong>!</p>
                                
                                <p>Ini adalah pengingat untuk janji temu Anda besok di Klinik Dentizy.</p>
                                
                                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3 style="margin-top: 0;">Detail Janji Temu:</h3>
                                    <ul style="list-style: none; padding: 0;">
                                        <li>📅 <strong>Tanggal:</strong> ${formattedDate}</li>
                                        <li>🕐 <strong>Jam:</strong> ${notif.appointment.jam_janji} WIB</li>
                                        <li>👨‍⚕️ <strong>Dokter:</strong> ${notif.appointment.doctor.nama_lengkap}</li>
                                        ${notif.appointment.keluhan ? `<li>📝 <strong>Keluhan:</strong> ${notif.appointment.keluhan}</li>` : ''}
                                    </ul>
                                </div>
                                
                                <p style="color: #dc2626;">
                                    <strong>⚠️ Penting:</strong> Jika Anda tidak dapat hadir, mohon hubungi klinik kami 
                                    untuk reschedule atau pembatalan.
                                </p>
                                
                                <p>Terima kasih,<br>
                                <strong>Klinik Dentizy</strong></p>
                                
                                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                                <p style="font-size: 12px; color: #6b7280;">
                                    Email ini dikirim otomatis, mohon tidak membalas.
                                </p>
                            </div>
                        `,
                    });

                    // Update status
                    notif.status = NotificationStatus.SENT;
                    notif.sent_at = new Date();
                    await this.notificationRepository.save(notif);

                    successCount++;
                    this.logger.log(`✅ Reminder sent for appointment #${notif.appointment_id}`);

                    // ✅ Add small delay untuk prevent rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (error) {
                    notif.status = NotificationStatus.FAILED;
                    await this.notificationRepository.save(notif);
                    failCount++;

                    this.logger.error(
                        `❌ Failed to send reminder for appointment #${notif.appointment_id}:`,
                        error.message
                    );
                }
            }

            const duration = Date.now() - startTime;
            this.logger.log(
                `📊 Reminder processing completed in ${duration}ms: ${successCount} sent, ${failCount} failed`
            );

        } catch (error) {
            this.logger.error('❌ Error in cron job:', error);
        } finally {
            this.isProcessing = false; // ✅ Release lock
        }
    }

    /**
     * Get all notifications (for admin)
     */
    async findAll(): Promise<Notification[]> {
        try {
            return await this.notificationRepository.find({
                relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
                order: {
                    created_at: 'DESC',
                },
                take: 100, // Limit untuk performance
            });
        } catch (error) {
            this.logger.error('❌ Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * ✅ NEW: Get pending notifications count (for monitoring)
     */
    async getPendingCount(): Promise<number> {
        try {
            return await this.notificationRepository.count({
                where: {
                    status: NotificationStatus.PENDING,
                },
            });
        } catch (error) {
            this.logger.error('❌ Error counting pending notifications:', error);
            throw error;
        }
    }

    /**
     * ✅ NEW: Get failed notifications (for retry)
     */
    async getFailedNotifications(limit: number = 50): Promise<Notification[]> {
        try {
            return await this.notificationRepository.find({
                where: {
                    status: NotificationStatus.FAILED,
                },
                relations: ['appointment', 'appointment.patient'],
                order: {
                    updated_at: 'DESC',
                },
                take: limit,
            });
        } catch (error) {
            this.logger.error('❌ Error fetching failed notifications:', error);
            throw error;
        }
    }

    /**
     * ✅ NEW: Retry failed notification
     */
    async retryNotification(notificationId: number): Promise<void> {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId },
                relations: ['appointment', 'appointment.patient'],
            });

            if (!notification) {
                throw new Error(`Notification #${notificationId} not found`);
            }

            if (notification.status !== NotificationStatus.FAILED) {
                throw new Error(`Notification #${notificationId} is not in FAILED status`);
            }

            // Reset status to PENDING dan set send_at ke sekarang
            notification.status = NotificationStatus.PENDING;
            notification.send_at = new Date();
            await this.notificationRepository.save(notification);

            this.logger.log(`🔄 Notification #${notificationId} queued for retry`);
        } catch (error) {
            this.logger.error(`❌ Error retrying notification #${notificationId}:`, error);
            throw error;
        }
    }
}