// __tests__/infrastructures/templates/email-templates.service.spec.ts

// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import {
  EmailTemplatesService,
  ReminderEmailData,
  ConfirmationEmailData,
  CancellationEmailData,
} from '../../../infrastructures/templates/email-templates.service';

// 2. MOCK DATA
const mockReminderData: ReminderEmailData = {
  patientName: 'Budi Santoso',
  date: '2023-10-25',
  time: '14:00',
  doctorName: 'Dr. Gigi Sehat',
  // complaint is undefined by default here
};

const mockConfirmationData: ConfirmationEmailData = {
  patientName: 'Siti Aminah',
  date: '2023-11-01',
  time: '09:00',
  doctorName: 'Dr. Strange',
  appointmentId: 12345,
};

const mockCancellationData: CancellationEmailData = {
  patientName: 'Joko Widodo',
  date: '2023-12-05',
  time: '10:30',
  // reason is undefined by default here
};

// 3. TEST SUITE
describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailTemplatesService],
    }).compile();

    service = module.get<EmailTemplatesService>(EmailTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Simple/Direct Logic)

  describe('getConfirmationTemplate', () => {
    it('should generate valid HTML with appointment details', () => {
      // Act
      const result = service.getConfirmationTemplate(mockConfirmationData);

      // Assert
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Konfirmasi Janji Temu');
      expect(result).toContain(mockConfirmationData.patientName);
      expect(result).toContain(`#${mockConfirmationData.appointmentId}`);
      expect(result).toContain(mockConfirmationData.doctorName);
      expect(result).toContain(mockConfirmationData.time);
      // Verify success box styling present
      expect(result).toContain('success-box');
    });
  });

  // 6. SUB-GROUP TESTS (Complex/Conditional Logic)

  describe('getReminderTemplate', () => {
    it('should generate HTML with required fields correctly', () => {
      const result = service.getReminderTemplate(mockReminderData);

      expect(result).toContain('Pengingat Janji Temu');
      expect(result).toContain(mockReminderData.patientName);
      expect(result).toContain(mockReminderData.date);
      // Ensure current year in footer
      expect(result).toContain(new Date().getFullYear().toString());
    });

    it('should include complaint section when provided', () => {
      // Arrange
      const dataWithComplaint: ReminderEmailData = {
        ...mockReminderData,
        complaint: 'Sakit gigi bagian belakang',
      };

      // Act
      const result = service.getReminderTemplate(dataWithComplaint);

      // Assert
      expect(result).toContain('Keluhan:');
      expect(result).toContain('Sakit gigi bagian belakang');
    });

    it('should NOT include complaint section when undefined', () => {
      // Act
      const result = service.getReminderTemplate(mockReminderData);

      // Assert
      expect(result).not.toContain('Keluhan:');
    });
  });

  describe('getCancellationTemplate', () => {
    it('should generate HTML with warning styling', () => {
      const result = service.getCancellationTemplate(mockCancellationData);

      expect(result).toContain('Pembatalan Janji Temu');
      expect(result).toContain('telah dibatalkan');
      // Verify warning/red styling class or color
      expect(result).toContain('info-box');
      expect(result).toContain('#dc2626');
    });

    it('should include reason section when provided', () => {
      // Arrange
      const dataWithReason: CancellationEmailData = {
        ...mockCancellationData,
        reason: 'Dokter ada keperluan mendadak',
      };

      // Act
      const result = service.getCancellationTemplate(dataWithReason);

      // Assert
      expect(result).toContain('Alasan:');
      expect(result).toContain('Dokter ada keperluan mendadak');
    });

    it('should NOT include reason section when undefined', () => {
      // Act
      const result = service.getCancellationTemplate(mockCancellationData);

      // Assert
      expect(result).not.toContain('Alasan:');
    });
  });

  describe('getReminderPlainText', () => {
    it('should generate clean text without HTML tags', () => {
      // Act
      const result = service.getReminderPlainText(mockReminderData);

      // Assert
      expect(result).not.toContain('<!DOCTYPE html>');
      expect(result).not.toContain('<div');
      expect(result).toContain('Klinik Dentizy - Pengingat Janji Temu');
    });

    it('should include complaint in text format when provided', () => {
      // Arrange
      const dataWithComplaint: ReminderEmailData = {
        ...mockReminderData,
        complaint: 'Nyeri gusi',
      };

      // Act
      const result = service.getReminderPlainText(dataWithComplaint);

      // Assert
      expect(result).toContain('- Keluhan: Nyeri gusi');
    });
  });
});
