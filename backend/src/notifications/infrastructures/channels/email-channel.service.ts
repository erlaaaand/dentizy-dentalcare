// infrastructures/channels/email-channel.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Notification } from '../../domains/entities/notification.entity';

export interface EmailData {
    to: string;
    subject: string;
    html: string;
}

@Injectable()
export class EmailChannelService {
    private readonly logger = new Logger(EmailChannelService.name);
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAYS = [1000, 2000, 5000]; // Exponential backoff

    constructor(private readonly mailerService: MailerService) { }

    /**
     * Send email with retry mechanism
     */
    async sendEmail(emailData: EmailData): Promise<void> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
            try {
                await this.mailerService.sendMail({
                    to: emailData.to,
                    subject: emailData.subject,
                    html: emailData.html,
                });

                this.logger.log(`✅ Email sent to ${emailData.to}`);
                return; // Success

            } catch (error) {
                lastError = error;
                this.logger.warn(
                    `⚠️ Email send attempt ${attempt + 1}/${this.MAX_RETRIES} failed: ${error.message}`
                );

                // Wait before retry
                if (attempt < this.MAX_RETRIES - 1) {
                    await this.delay(this.RETRY_DELAYS[attempt]);
                }
            }
        }

        throw new Error(
            `Failed to send email after ${this.MAX_RETRIES} attempts: ${lastError?.message}`
        );
    }

    /**
     * Generate reminder email
     */
    generateReminderEmail(notification: Notification): EmailData {
        const patient = notification.appointment.patient;
        const appointment = notification.appointment;
        // doctor may be populated as an object (appointment.doctor) or only stored as an id (appointment.doctor_id)
        const doctorObj: any = (notification.appointment as any).doctor;
        const doctorId = (notification.appointment as any).doctor_id;
        const doctorName = doctorObj && typeof doctorObj === 'object' && doctorObj.nama_lengkap
            ? doctorObj.nama_lengkap
            : (typeof doctorId === 'string' || typeof doctorId === 'number')
                ? String(doctorId)
                : 'Dokter';

        const appointmentDate = new Date(appointment.tanggal_janji);
        const formattedDate = appointmentDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return {
            to: patient.email,
            subject: 'Pengingat Janji Temu - Klinik Dentizy',
            html: this.getReminderTemplate({
                patientName: patient.nama_lengkap,
                date: formattedDate,
                time: appointment.jam_janji,
                doctorName: doctorName,
                complaint: appointment.keluhan,
            }),
        };
    }

    /**
     * Email template for reminder
     */
    private getReminderTemplate(data: {
        patientName: string;
        date: string;
        time: string;
        doctorName: string;
        complaint?: string;
    }): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f3f4f6; padding: 20px; }
                    .detail-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-item { margin: 10px 0; }
                    .warning { color: #dc2626; font-weight: bold; }
                    .footer { font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0;">🦷 Klinik Dentizy</h2>
                        <p style="margin: 10px 0 0 0;">Pengingat Janji Temu</p>
                    </div>
                    
                    <div class="content">
                        <p>Halo, <strong>${data.patientName}</strong>!</p>
                        
                        <p>Ini adalah pengingat untuk janji temu Anda <strong>besok</strong> di Klinik Dentizy.</p>
                        
                        <div class="detail-box">
                            <h3 style="margin-top: 0; color: #2563eb;">📋 Detail Janji Temu</h3>
                            <div class="detail-item">📅 <strong>Tanggal:</strong> ${data.date}</div>
                            <div class="detail-item">🕐 <strong>Jam:</strong> ${data.time} WIB</div>
                            <div class="detail-item">👨‍⚕️ <strong>Dokter:</strong> ${data.doctorName}</div>
                            ${data.complaint ? `<div class="detail-item">📝 <strong>Keluhan:</strong> ${data.complaint}</div>` : ''}
                        </div>
                        
                        <p class="warning">
                            ⚠️ Penting: Jika Anda tidak dapat hadir, mohon hubungi klinik kami 
                            untuk reschedule atau pembatalan.
                        </p>
                        
                        <p>Terima kasih atas perhatian Anda.</p>
                        <p><strong>Tim Klinik Dentizy</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>Email ini dikirim otomatis, mohon tidak membalas.</p>
                        <p>© ${new Date().getFullYear()} Klinik Dentizy. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}