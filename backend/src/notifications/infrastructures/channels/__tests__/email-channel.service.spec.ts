// __tests__/infrastructures/channels/email-channel.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  EmailChannelService,
  EmailData,
} from '../../../infrastructures/channels/email-channel.service';
import { Notification } from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
// Mock untuk MailerService
const mockMailerService = {
  sendMail: jest.fn(),
};

// Mock Logger untuk mencegah output konsol yang tidak perlu selama pengujian
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Notification (Struktur disederhanakan sesuai kebutuhan generateReminderEmail)
const mockNotification: Notification = {
  id: 'notif-123',
  recipient: 'patient-123',
  type: 'EMAIL',
  content: 'Appointment Reminder',
  send_at: new Date(),
  status: 'PENDING',
  appointment: {
    id: 'appt-123',
    patient: {
      id: 'patient-123',
      nama_lengkap: 'Budi Santoso',
      email: 'budi.santoso@example.com',
      // properti lain yang mungkin ada
    },
    // doctor field bisa berupa object (populated) atau id
    doctor: {
      id: 'doc-456',
      nama_lengkap: 'Dr. Gigi Ayu',
    } as any, // Cast sebagai any untuk meniru potensi populasi
    doctor_id: 'doc-456', // ID dokter
    // Tanggal 20 November 2025 adalah hari KAMIS.
    tanggal_janji: new Date('2025-11-20T10:00:00Z'),
    jam_janji: '17:00', // Waktu janji temu (format string)
    keluhan: 'Sakit gigi berlubang',
  },
} as unknown as Notification;

// Mock Notification tanpa keluhan
const mockNotificationNoComplaint: Notification = {
  ...mockNotification,
  appointment: {
    ...mockNotification.appointment,
    keluhan: undefined, // Tidak ada keluhan
  },
} as unknown as Notification;

// Mock Notification dengan doctor_id saja (non-populated)
const mockNotificationIdOnly: Notification = {
  ...mockNotification,
  appointment: {
    ...mockNotification.appointment,
    doctor: undefined, // Doctor tidak di-populate
    doctor_id: 999, // ID dokter berupa number
  },
} as unknown as Notification;

// 3. TEST SUITE
describe('EmailChannelService', () => {
  let service: EmailChannelService;

  // 4. SETUP AND TEARDOWN
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailChannelService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        // Gunakan mockLogger yang sudah disiapkan
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<EmailChannelService>(EmailChannelService);

    // FIX 1: Pastikan service menggunakan mock logger yang bisa di-spy
    (service as any).logger = mockLogger;

    // Mengganti delay asli dengan mock untuk mempercepat tes yang melibatkan retry
    (service as any).delay = jest.fn(
      (ms) => new Promise((resolve) => resolve(void 0)),
    );
  });

  afterEach(() => {
    jest.clearAllMocks(); // Membersihkan status mock setelah setiap tes
  });

  // 5. EXECUTE METHOD TESTS (sendEmail)
  describe('sendEmail', () => {
    const emailData: EmailData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML</p>',
    };

    it('should send email successfully on the first attempt', async () => {
      // Arrange
      mockMailerService.sendMail.mockResolvedValueOnce(true);

      // Act
      await expect(service.sendEmail(emailData)).resolves.not.toThrow();

      // Assert
      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
    });

    // FIX 1: Tes ini sekarang harusnya PASS karena service.logger.warn adalah mock function
    it('should send email successfully after one retry', async () => {
      // Arrange
      const initialError = new Error('SMTP Timeout');
      mockMailerService.sendMail
        .mockRejectedValueOnce(initialError) // First fail
        .mockResolvedValueOnce(true); // Second success

      // Act
      await expect(service.sendEmail(emailData)).resolves.not.toThrow();

      // Assert
      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(2);
      expect((service as any).delay).toHaveBeenCalledTimes(1);
      expect((service as any).delay).toHaveBeenCalledWith(1000);

      // Verifikasi pemanggilan warn pada mockLogger
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Email send attempt 1/3 failed: SMTP Timeout'),
      );
    });

    it('should throw an error after all retries have failed', async () => {
      // Arrange
      const finalError = new Error('Authentication Failed');
      mockMailerService.sendMail
        .mockRejectedValueOnce(new Error('Connection error')) // 1st fail
        .mockRejectedValueOnce(new Error('Server busy')) // 2nd fail
        .mockRejectedValueOnce(finalError); // 3rd fail (final attempt)

      // Act & Assert
      await expect(service.sendEmail(emailData)).rejects.toThrow(
        `Failed to send email after 3 attempts: ${finalError.message}`,
      );

      // Assert
      expect(mockMailerService.sendMail).toHaveBeenCalledTimes(3);
      expect((service as any).delay).toHaveBeenCalledTimes(2);
      expect((service as any).delay).toHaveBeenCalledWith(1000);
      expect((service as any).delay).toHaveBeenCalledWith(2000);
    });
  });

  // 6. SUB-GROUP TESTS (generateReminderEmail)
  describe('generateReminderEmail', () => {
    // FIX 2: Ganti harapan dari 'Rabu' menjadi 'Kamis'
    it('should generate email data correctly with all details (populated doctor)', () => {
      // Act
      const result = service.generateReminderEmail(mockNotification);

      // Assert
      expect(result.to).toBe(mockNotification.appointment.patient.email);
      expect(result.subject).toBe('Pengingat Janji Temu - Klinik Dentizy');
      expect(result.html).toContain('Halo, <strong>Budi Santoso</strong>!');
      // Harapan yang diperbaiki:
      expect(result.html).toContain(
        '📅 <strong>Tanggal:</strong> Kamis, 20 November 2025',
      );
      expect(result.html).toContain('🕐 <strong>Jam:</strong> 17:00 WIB');
      expect(result.html).toContain('👨‍⚕️ <strong>Dokter:</strong> Dr. Gigi Ayu');
      expect(result.html).toContain(
        '📝 <strong>Keluhan:</strong> Sakit gigi berlubang',
      );
    });

    // FIX 2: Ganti harapan dari 'Rabu' menjadi 'Kamis'
    it('should generate email data correctly when complaint is missing', () => {
      // Act
      const result = service.generateReminderEmail(mockNotificationNoComplaint);

      // Assert
      expect(result.to).toBe(
        mockNotificationNoComplaint.appointment.patient.email,
      );
      // Keluhan div harus TIDAK ada
      expect(result.html).not.toContain('📝 <strong>Keluhan:</strong>');
      // Harapan yang diperbaiki:
      expect(result.html).toContain(
        '📅 <strong>Tanggal:</strong> Kamis, 20 November 2025',
      );
    });

    it('should use doctor_id if doctor object is not populated (string)', () => {
      // Arrange: Kustomisasi mock untuk skenario doctor_id string
      const notification = {
        ...mockNotification,
        appointment: {
          ...mockNotification.appointment,
          doctor: undefined,
          doctor_id: 'doc-string-789',
        },
      } as unknown as Notification;

      // Act
      const result = service.generateReminderEmail(notification);

      // Assert
      expect(result.html).toContain(
        '👨‍⚕️ <strong>Dokter:</strong> doc-string-789',
      );
    });

    it('should use doctor_id if doctor object is not populated (number)', () => {
      // Act (Menggunakan mockNotificationIdOnly)
      const result = service.generateReminderEmail(mockNotificationIdOnly);

      // Assert
      expect(result.html).toContain('👨‍⚕️ <strong>Dokter:</strong> 999');
    });

    it('should default doctor name to "Dokter" if doctor info is missing', () => {
      // Arrange: Kustomisasi mock untuk skenario tanpa doctor/doctor_id
      const notification = {
        ...mockNotification,
        appointment: {
          ...mockNotification.appointment,
          doctor: undefined,
          doctor_id: undefined,
        },
      } as unknown as Notification;

      // Act
      const result = service.generateReminderEmail(notification);

      // Assert
      expect(result.html).toContain('👨‍⚕️ <strong>Dokter:</strong> Dokter');
    });

    it('should generate a template with the current year in the footer', () => {
      // Arrange
      const currentYear = new Date().getFullYear();

      // Act
      const result = service.generateReminderEmail(mockNotification);

      // Assert
      expect(result.html).toContain(
        `© ${currentYear} Klinik Dentizy. All rights reserved.`,
      );
    });
  });
});
