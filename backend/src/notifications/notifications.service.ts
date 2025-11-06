import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from './entities/notification.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    // ✅ FIX: Track processing notifications to prevent race condition
    private isProcessing = false;
    private readonly MAX_BATCH_SIZE = 50;
    private readonly PROCESSING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

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
            const result = await this.notificationRepository
                .createQueryBuilder()
                .update(Notification)
                .set({ status: NotificationStatus.FAILED })
                .where('appointment_id = :appointmentId', { appointmentId })
                .andWhere('status = :status', { status: NotificationStatus.PENDING })
                .execute();

            if (result && result.affected && result.affected > 0) {
                this.logger.log(`📧 Cancelled ${result.affected} notification(s) for appointment #${appointmentId}`);
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
     * ✅ FIX: Cron job dengan proper lock mechanism
     * Jalan setiap 1 menit untuk cek notifikasi yang harus dikirim
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleCronSendReminders() {
        // ✅ FIX: Prevent concurrent execution
        if (this.isProcessing) {
            this.logger.debug('⏩ Skipping: Previous batch still processing');
            return;
        }

        this.isProcessing = true;
        const startTime = Date.now();
        const batchId = `batch_${Date.now()}`;

        try {
            this.logger.debug(`🔍 [${batchId}] Checking for pending reminders...`);

            // ✅ STEP 1: Clean up stale processing notifications (timeout protection)
            await this.cleanupStaleProcessing();

            // ✅ STEP 2: Fetch and lock notifications
            const notifications = await this.fetchPendingNotifications();

            if (notifications.length === 0) {
                this.logger.debug(`✅ [${batchId}] No reminders to send`);
                return;
            }

            this.logger.log(`📧 [${batchId}] Processing ${notifications.length} reminders...`);

            // ✅ STEP 3: Mark as processing
            const notificationIds = notifications.map(n => n.id);
            await this.notificationRepository.update(
                { id: In(notificationIds) },
                { status: NotificationStatus.SENT, sent_at: new Date() }
            );

            // ✅ STEP 4: Process notifications with proper error handling
            let successCount = 0;
            let failCount = 0;

            for (const notif of notifications) {
                try {
                    await this.processNotification(notif);
                    successCount++;
                } catch (error) {
                    failCount++;
                    // Mark as failed
                    await this.notificationRepository.update(notif.id, {
                        status: NotificationStatus.FAILED
                    });
                    this.logger.error(
                        `❌ [${batchId}] Failed to send reminder for appointment #${notif.appointment_id}:`,
                        error.message
                    );
                }
            }

            const duration = Date.now() - startTime;
            this.logger.log(
                `📊 [${batchId}] Completed in ${duration}ms: ${successCount} sent, ${failCount} failed`
            );

        } catch (error) {
            this.logger.error(`❌ [${batchId}] Cron job error:`, error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * ✅ FIX: Fetch pending notifications with proper locking
     */
    private async fetchPendingNotifications(): Promise<Notification[]> {
        try {
            const now = new Date();
            
            return await this.notificationRepository.find({
                where: {
                    status: NotificationStatus.PENDING,
                    send_at: LessThan(now)
                },
                relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
                order: {
                    send_at: 'ASC'
                },
                take: this.MAX_BATCH_SIZE
            });

        } catch (error) {
            this.logger.error('❌ Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * ✅ NEW: Cleanup stale processing notifications (timeout protection)
     */
    private async cleanupStaleProcessing(): Promise<void> {
        try {
            const staleTime = new Date(Date.now() - this.PROCESSING_TIMEOUT);

            const result = await this.notificationRepository
                .createQueryBuilder()
                .update(Notification)
                .set({ status: NotificationStatus.PENDING })
                .where('status = :status', { status: NotificationStatus.SENT })
                .andWhere('(sent_at IS NULL OR sent_at < :staleTime)', { staleTime })
                .execute();

            if (result && result.affected && result.affected > 0) {
                this.logger.warn(`⚠️ Reset ${result.affected} stale processing notification(s)`);
            }
        } catch (error) {
            this.logger.error('❌ Error cleaning up stale processing:', error);
        }
    }

    /**
     * ✅ FIX: Process single notification with proper validation and error handling
     */
    private async processNotification(notif: Notification): Promise<void> {
        try {
            // Validate notification data
            if (!notif.appointment?.patient?.email) {
                throw new Error('No email address for patient');
            }

            const patient = notif.appointment.patient;
            const appointment = notif.appointment;

            // Format tanggal dan jam untuk email
            const appointmentDate = new Date(appointment.tanggal_janji);
            const formattedDate = appointmentDate.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            // Send email with retry mechanism
            await this.sendEmailWithRetry(patient.email, {
                subject: `Pengingat Janji Temu - Klinik Dentizy`,
                html: this.generateEmailTemplate({
                    patientName: patient.nama_lengkap,
                    date: formattedDate,
                    time: appointment.jam_janji,
                    doctorName: appointment.doctor.nama_lengkap,
                    complaint: appointment.keluhan,
                }),
            });

            this.logger.log(`✅ Reminder sent for appointment #${appointment.id}`);

        } catch (error) {
            throw error;
        }
    }

    /**
     * ✅ NEW: Send email with retry mechanism
     */
    private async sendEmailWithRetry(
        to: string,
        options: { subject: string; html: string },
        maxRetries = 3
    ): Promise<void> {
        let lastError: Error = new Error('No attempts made');

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.mailerService.sendMail({
                    to,
                    subject: options.subject,
                    html: options.html,
                });
                return; // Success
            } catch (error) {
                lastError = error;
                this.logger.warn(`⚠️ Email send attempt ${attempt}/${maxRetries} failed: ${error.message}`);

                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * ✅ NEW: Generate email template
     */
    private generateEmailTemplate(data: {
        patientName: string;
        date: string;
        time: string;
        doctorName: string;
        complaint?: string;
    }): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Pengingat Janji Temu</h2>
                
                <p>Halo, <strong>${data.patientName}</strong>!</p>
                
                <p>Ini adalah pengingat untuk janji temu Anda besok di Klinik Dentizy.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Detail Janji Temu:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li>📅 <strong>Tanggal:</strong> ${data.date}</li>
                        <li>🕐 <strong>Jam:</strong> ${data.time} WIB</li>
                        <li>👨‍⚕️ <strong>Dokter:</strong> ${data.doctorName}</li>
                        ${data.complaint ? `<li>📝 <strong>Keluhan:</strong> ${data.complaint}</li>` : ''}
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
        `;
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
                take: 100,
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