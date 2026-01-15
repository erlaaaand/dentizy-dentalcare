// infrastructures/templates/email-templates.service.ts
import { Injectable } from '@nestjs/common';

export interface ReminderEmailData {
  patientName: string;
  date: string;
  time: string;
  doctorName: string;
  complaint?: string;
}

export interface ConfirmationEmailData {
  patientName: string;
  date: string;
  time: string;
  doctorName: string;
  appointmentId: number;
}

export interface CancellationEmailData {
  patientName: string;
  date: string;
  time: string;
  reason?: string;
}

@Injectable()
export class EmailTemplatesService {
  /**
   * Generate reminder email HTML
   */
  getReminderTemplate(data: ReminderEmailData): string {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px; 
                    }
                    .header { 
                        background-color: #2563eb; 
                        color: white; 
                        padding: 20px; 
                        border-radius: 8px 8px 0 0;
                        text-align: center;
                    }
                    .header h2 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    .content { 
                        background-color: #f3f4f6; 
                        padding: 30px 20px; 
                    }
                    .detail-box { 
                        background-color: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin: 20px 0;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .detail-box h3 {
                        margin-top: 0;
                        color: #2563eb;
                        font-size: 18px;
                    }
                    .detail-item { 
                        margin: 15px 0;
                        padding: 10px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .detail-item:last-child {
                        border-bottom: none;
                    }
                    .detail-item strong {
                        color: #1f2937;
                    }
                    .warning { 
                        background-color: #fef2f2;
                        border-left: 4px solid #dc2626;
                        padding: 15px;
                        border-radius: 4px;
                        margin: 20px 0;
                    }
                    .warning p {
                        margin: 0;
                        color: #dc2626;
                        font-weight: 600;
                    }
                    .footer { 
                        font-size: 12px; 
                        color: #6b7280; 
                        margin-top: 30px; 
                        padding-top: 20px; 
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #2563eb;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        margin: 10px 0;
                        font-weight: 600;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🦷 Klinik Dentizy</h2>
                        <p>Pengingat Janji Temu</p>
                    </div>
                    
                    <div class="content">
                        <p>Halo, <strong>${data.patientName}</strong>!</p>
                        
                        <p>Ini adalah pengingat untuk janji temu Anda <strong>besok</strong> di Klinik Dentizy.</p>
                        
                        <div class="detail-box">
                            <h3>📋 Detail Janji Temu</h3>
                            <div class="detail-item">
                                📅 <strong>Tanggal:</strong> ${data.date}
                            </div>
                            <div class="detail-item">
                                🕐 <strong>Jam:</strong> ${data.time} WIB
                            </div>
                            <div class="detail-item">
                                👨‍⚕️ <strong>Dokter:</strong> ${data.doctorName}
                            </div>
                            ${
                              data.complaint
                                ? `
                            <div class="detail-item">
                                📝 <strong>Keluhan:</strong> ${data.complaint}
                            </div>
                            `
                                : ''
                            }
                        </div>
                        
                        <div class="warning">
                            <p>
                                ⚠️ Penting: Jika Anda tidak dapat hadir, mohon hubungi klinik kami 
                                untuk reschedule atau pembatalan.
                            </p>
                        </div>
                        
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

  /**
   * Generate confirmation email HTML
   */
  getConfirmationTemplate(data: ConfirmationEmailData): string {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px; 
                    }
                    .header { 
                        background-color: #16a34a; 
                        color: white; 
                        padding: 20px; 
                        border-radius: 8px 8px 0 0;
                        text-align: center;
                    }
                    .content { 
                        background-color: #f3f4f6; 
                        padding: 30px 20px; 
                    }
                    .success-box {
                        background-color: #dcfce7;
                        border-left: 4px solid #16a34a;
                        padding: 15px;
                        border-radius: 4px;
                        margin: 20px 0;
                    }
                    .detail-box { 
                        background-color: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin: 20px 0;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .detail-item { 
                        margin: 15px 0;
                        padding: 10px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .detail-item:last-child {
                        border-bottom: none;
                    }
                    .footer { 
                        font-size: 12px; 
                        color: #6b7280; 
                        margin-top: 30px; 
                        padding-top: 20px; 
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🦷 Klinik Dentizy</h2>
                        <p>Konfirmasi Janji Temu</p>
                    </div>
                    
                    <div class="content">
                        <p>Halo, <strong>${data.patientName}</strong>!</p>
                        
                        <div class="success-box">
                            <p style="margin: 0; color: #16a34a; font-weight: 600;">
                                ✅ Janji temu Anda telah berhasil dikonfirmasi!
                            </p>
                        </div>
                        
                        <div class="detail-box">
                            <h3 style="margin-top: 0; color: #16a34a;">📋 Detail Janji Temu</h3>
                            <div class="detail-item">
                                🔢 <strong>No. Janji:</strong> #${data.appointmentId}
                            </div>
                            <div class="detail-item">
                                📅 <strong>Tanggal:</strong> ${data.date}
                            </div>
                            <div class="detail-item">
                                🕐 <strong>Jam:</strong> ${data.time} WIB
                            </div>
                            <div class="detail-item">
                                👨‍⚕️ <strong>Dokter:</strong> ${data.doctorName}
                            </div>
                        </div>
                        
                        <p>Kami akan mengirimkan email pengingat 1 hari sebelum jadwal Anda.</p>
                        
                        <p>Terima kasih telah mempercayai Klinik Dentizy!</p>
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

  /**
   * Generate cancellation email HTML
   */
  getCancellationTemplate(data: CancellationEmailData): string {
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px; 
                    }
                    .header { 
                        background-color: #dc2626; 
                        color: white; 
                        padding: 20px; 
                        border-radius: 8px 8px 0 0;
                        text-align: center;
                    }
                    .content { 
                        background-color: #f3f4f6; 
                        padding: 30px 20px; 
                    }
                    .info-box {
                        background-color: #fef2f2;
                        border-left: 4px solid #dc2626;
                        padding: 15px;
                        border-radius: 4px;
                        margin: 20px 0;
                    }
                    .detail-box { 
                        background-color: white; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin: 20px 0;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .detail-item { 
                        margin: 15px 0;
                        padding: 10px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .detail-item:last-child {
                        border-bottom: none;
                    }
                    .footer { 
                        font-size: 12px; 
                        color: #6b7280; 
                        margin-top: 30px; 
                        padding-top: 20px; 
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🦷 Klinik Dentizy</h2>
                        <p>Pembatalan Janji Temu</p>
                    </div>
                    
                    <div class="content">
                        <p>Halo, <strong>${data.patientName}</strong>!</p>
                        
                        <div class="info-box">
                            <p style="margin: 0; color: #dc2626; font-weight: 600;">
                                ❌ Janji temu Anda telah dibatalkan
                            </p>
                        </div>
                        
                        <div class="detail-box">
                            <h3 style="margin-top: 0; color: #dc2626;">📋 Detail Janji Temu yang Dibatalkan</h3>
                            <div class="detail-item">
                                📅 <strong>Tanggal:</strong> ${data.date}
                            </div>
                            <div class="detail-item">
                                🕐 <strong>Jam:</strong> ${data.time} WIB
                            </div>
                            ${
                              data.reason
                                ? `
                            <div class="detail-item">
                                📝 <strong>Alasan:</strong> ${data.reason}
                            </div>
                            `
                                : ''
                            }
                        </div>
                        
                        <p>Jika Anda ingin membuat janji temu baru, silakan hubungi klinik kami atau daftar melalui sistem.</p>
                        
                        <p>Terima kasih atas pengertian Anda.</p>
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

  /**
   * Generate plain text version for fallback
   */
  getReminderPlainText(data: ReminderEmailData): string {
    return `
Klinik Dentizy - Pengingat Janji Temu

Halo, ${data.patientName}!

Ini adalah pengingat untuk janji temu Anda besok di Klinik Dentizy.

Detail Janji Temu:
- Tanggal: ${data.date}
- Jam: ${data.time} WIB
- Dokter: ${data.doctorName}
${data.complaint ? `- Keluhan: ${data.complaint}` : ''}

PENTING: Jika Anda tidak dapat hadir, mohon hubungi klinik kami untuk reschedule atau pembatalan.

Terima kasih,
Tim Klinik Dentizy

---
Email ini dikirim otomatis, mohon tidak membalas.
© ${new Date().getFullYear()} Klinik Dentizy. All rights reserved.
        `.trim();
  }
}
