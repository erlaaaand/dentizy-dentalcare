// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SendNotificationService } from '../send-notification.service';
import { NotificationRepository } from '../../../infrastructures/repositories/notification.repository';
import { EmailChannelService } from '../../../infrastructures/channels/email-channel.service';
import { NotificationValidatorService } from '../../../domains/services/notification-validator.service';
import { Notification, NotificationType, NotificationStatus } from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockNotification: Notification = {
  id: 123,
  appointment_id: 456,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
  retry_count: 0,
  error_message: null,
  appointment: {
    id: 456,
    tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
    jam_janji: '10:00',
    patient: {
      id: 789,
      nama_lengkap: 'John Doe',
      email: 'john.doe@example.com',
      no_hp: '08123456789'
    } as any,
    doctor: {
      id: 321,
      nama_lengkap: 'Dr. Smith',
    } as any
  } as any
};

const mockSMSNotification: Notification = {
  ...mockNotification,
  id: 124,
  type: NotificationType.SMS_REMINDER
};

const mockWhatsAppNotification: Notification = {
  ...mockNotification,
  id: 125,
  type: NotificationType.WHATSAPP_CONFIRMATION
};

const mockUnknownTypeNotification: Notification = {
  ...mockNotification,
  id: 126,
  type: 'UNKNOWN_TYPE' as NotificationType
};

const mockEmailData = {
  to: 'john.doe@example.com',
  subject: 'Appointment Reminder',
  template: 'reminder',
  context: {
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    appointmentDate: '2024-01-16',
    appointmentTime: '10:00'
  }
};

const mockValidationError = new Error('Notification cannot be sent');
const mockEmailError = new Error('Email service unavailable');
const mockSMSError = new Error('SMS channel not implemented yet');
const mockWhatsAppError = new Error('WhatsApp channel not implemented yet');
const mockUnknownTypeError = new Error('Unknown notification type: UNKNOWN_TYPE');

// Mock Repository
const mockNotificationRepository = {
  markAsSent: jest.fn(),
  markAsFailed: jest.fn(),
};

// Mock Email Channel
const mockEmailChannel = {
  generateReminderEmail: jest.fn(),
  sendEmail: jest.fn(),
};

// Mock Validator
const mockNotificationValidator = {
  validateCanSend: jest.fn(),
};

// Mock Logger
const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
};

// 3. TEST SUITE
describe('SendNotificationService', () => {
  // 4. SETUP AND TEARDOWN
  let service: SendNotificationService;
  let notificationRepository: NotificationRepository;
  let emailChannel: EmailChannelService;
  let validator: NotificationValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendNotificationService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        {
          provide: EmailChannelService,
          useValue: mockEmailChannel,
        },
        {
          provide: NotificationValidatorService,
          useValue: mockNotificationValidator,
        },
      ],
    }).compile();

    service = module.get<SendNotificationService>(SendNotificationService);
    notificationRepository = module.get<NotificationRepository>(NotificationRepository);
    emailChannel = module.get<EmailChannelService>(EmailChannelService);
    validator = module.get<NotificationValidatorService>(NotificationValidatorService);

    // Mock the logger
    Object.defineProperty(service, 'logger', {
      value: mockLogger,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 5. EXECUTE METHOD TESTS
  describe('execute() Method', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(service.execute).toBeDefined();
    });

    it('should return void promise', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      const result = await service.execute(mockNotification);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  // 6. SUB-GROUP TESTS
  describe('Success Flow - Email Reminder', () => {
    it('should validate notification before sending', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotification);

      // Assert
      expect(mockNotificationValidator.validateCanSend).toHaveBeenCalledWith(mockNotification);
      expect(mockNotificationValidator.validateCanSend).toHaveBeenCalledTimes(1);
    });

    it('should generate email data using email channel', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotification);

      // Assert
      expect(mockEmailChannel.generateReminderEmail).toHaveBeenCalledWith(mockNotification);
      expect(mockEmailChannel.generateReminderEmail).toHaveBeenCalledTimes(1);
    });

    it('should send email using email channel', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotification);

      // Assert
      expect(mockEmailChannel.sendEmail).toHaveBeenCalledWith(mockEmailData);
      expect(mockEmailChannel.sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should mark notification as sent after successful delivery', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotification);

      // Assert
      expect(mockNotificationRepository.markAsSent).toHaveBeenCalledWith(mockNotification.id);
      expect(mockNotificationRepository.markAsSent).toHaveBeenCalledTimes(1);
    });

    it('should log success message with notification and appointment IDs', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotification);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        `✅ Notification #${mockNotification.id} sent successfully for appointment #${mockNotification.appointment_id}`
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should call dependencies in correct order', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotification);

      // Assert call order
      const validateCallOrder = mockNotificationValidator.validateCanSend.mock.invocationCallOrder[0];
      const generateEmailCallOrder = mockEmailChannel.generateReminderEmail.mock.invocationCallOrder[0];
      const sendEmailCallOrder = mockEmailChannel.sendEmail.mock.invocationCallOrder[0];
      const markSentCallOrder = mockNotificationRepository.markAsSent.mock.invocationCallOrder[0];

      expect(validateCallOrder).toBeLessThan(generateEmailCallOrder);
      expect(generateEmailCallOrder).toBeLessThan(sendEmailCallOrder);
      expect(sendEmailCallOrder).toBeLessThan(markSentCallOrder);
    });
  });

  describe('Notification Type Handling', () => {
    it('should handle EMAIL_REMINDER type correctly', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(mockNotification);

      // Assert
      expect(mockEmailChannel.generateReminderEmail).toHaveBeenCalled();
      expect(mockEmailChannel.sendEmail).toHaveBeenCalled();
    });

    it('should throw error for SMS_REMINDER type (not implemented)', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);

      // Act & Assert
      await expect(service.execute(mockSMSNotification)).rejects.toThrow(mockSMSError);
      await expect(service.execute(mockSMSNotification)).rejects.toThrow('SMS channel not implemented yet');
    });

    it('should throw error for WHATSAPP_CONFIRMATION type (not implemented)', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);

      // Act & Assert
      await expect(service.execute(mockWhatsAppNotification)).rejects.toThrow(mockWhatsAppError);
      await expect(service.execute(mockWhatsAppNotification)).rejects.toThrow('WhatsApp channel not implemented yet');
    });

    it('should throw error for unknown notification types', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);

      // Act & Assert
      await expect(service.execute(mockUnknownTypeNotification)).rejects.toThrow(mockUnknownTypeError);
      await expect(service.execute(mockUnknownTypeNotification)).rejects.toThrow('Unknown notification type: UNKNOWN_TYPE');
    });
  });

  describe('Error Handling - Validation Failures', () => {
    it('should not proceed with sending if validation fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockImplementation(() => {
        throw mockValidationError;
      });

      // Act & Assert
      await expect(service.execute(mockNotification)).rejects.toThrow(mockValidationError);

      // Assert
      expect(mockEmailChannel.generateReminderEmail).not.toHaveBeenCalled();
      expect(mockEmailChannel.sendEmail).not.toHaveBeenCalled();
      expect(mockNotificationRepository.markAsSent).not.toHaveBeenCalled();
    });

    it('should mark as failed and log error when validation fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockImplementation(() => {
        throw mockValidationError;
      });
      mockNotificationRepository.markAsFailed.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.execute(mockNotification)).rejects.toThrow(mockValidationError);

      // Assert
      expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(
        mockNotification.id,
        mockValidationError.message
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Failed to send notification #${mockNotification.id}:`,
        mockValidationError.message
      );
    });
  });

  describe('Error Handling - Email Channel Failures', () => {
    it('should mark as failed when email generation fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockImplementation(() => {
        throw mockEmailError;
      });
      mockNotificationRepository.markAsFailed.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.execute(mockNotification)).rejects.toThrow(mockEmailError);

      // Assert
      expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(
        mockNotification.id,
        mockEmailError.message
      );
      expect(mockEmailChannel.sendEmail).not.toHaveBeenCalled();
      expect(mockNotificationRepository.markAsSent).not.toHaveBeenCalled();
    });

    it('should mark as failed when email sending fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockRejectedValue(mockEmailError);
      mockNotificationRepository.markAsFailed.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.execute(mockNotification)).rejects.toThrow(mockEmailError);

      // Assert
      expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(
        mockNotification.id,
        mockEmailError.message
      );
      expect(mockNotificationRepository.markAsSent).not.toHaveBeenCalled();
    });

    it('should log error when email channel fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockRejectedValue(mockEmailError);
      mockNotificationRepository.markAsFailed.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.execute(mockNotification)).rejects.toThrow(mockEmailError);

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Failed to send notification #${mockNotification.id}:`,
        mockEmailError.message
      );
    });
  });

  describe('Error Handling - Repository Failures', () => {
    it('should handle failure when marking as sent fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.execute(mockNotification)).rejects.toThrow('Database error');

      // Assert
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle failure when marking as failed fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockImplementation(() => {
        throw mockValidationError; // original error
      });

      mockNotificationRepository.markAsFailed
        .mockRejectedValue(new Error('Database error')); // repository failure

      // Act + Assert: execute harus throw error repository
      await expect(service.execute(mockNotification))
        .rejects
        .toThrow('Database error');

      // Assert: logger.error tetap harus dipanggil (untuk error original)
      expect(mockLogger.error).toHaveBeenCalledWith(
        `❌ Failed to send notification #${mockNotification.id}:`,
        mockValidationError.message
      );
    });
  });

  describe('sendEmailReminder() Private Method', () => {
    it('should generate and send email using email channel', async () => {
      // Arrange
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);

      // Act
      await service['sendEmailReminder'](mockNotification);

      // Assert
      expect(mockEmailChannel.generateReminderEmail).toHaveBeenCalledWith(mockNotification);
      expect(mockEmailChannel.sendEmail).toHaveBeenCalledWith(mockEmailData);
    });

    it('should throw error when email generation fails', async () => {
      // Arrange
      mockEmailChannel.generateReminderEmail.mockImplementation(() => {
        throw mockEmailError;
      });

      // Act & Assert
      await expect(service['sendEmailReminder'](mockNotification)).rejects.toThrow(mockEmailError);

      // Assert
      expect(mockEmailChannel.sendEmail).not.toHaveBeenCalled();
    });

    it('should throw error when email sending fails', async () => {
      // Arrange
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockRejectedValue(mockEmailError);

      // Act & Assert
      await expect(service['sendEmailReminder'](mockNotification)).rejects.toThrow(mockEmailError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle notifications with different IDs', async () => {
      // Arrange
      const notificationIds = [1, 999, 0, -1, 12345];
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act & Assert
      for (const id of notificationIds) {
        const notification = { ...mockNotification, id };
        await service.execute(notification);

        expect(mockNotificationRepository.markAsSent).toHaveBeenCalledWith(id);
        jest.clearAllMocks();
      }
    });

    it('should handle notifications with different appointment IDs', async () => {
      // Arrange
      const appointmentIds = [100, 200, 300];
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act & Assert
      for (const appointmentId of appointmentIds) {
        const notification = { ...mockNotification, appointment_id: appointmentId };
        await service.execute(notification);

        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.stringContaining(`appointment #${appointmentId}`)
        );
        jest.clearAllMocks();
      }
    });

    it('should handle notifications with retry count', async () => {
      // Arrange
      const notificationWithRetry = {
        ...mockNotification,
        retry_count: 3
      };
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act
      await service.execute(notificationWithRetry);

      // Assert
      expect(mockNotificationValidator.validateCanSend).toHaveBeenCalledWith(notificationWithRetry);
    });
  });

  describe('Integration Behavior', () => {
    it('should complete entire flow successfully for email reminder', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.execute(mockNotification)).resolves.toBeUndefined();

      // Assert all dependencies were called
      expect(mockNotificationValidator.validateCanSend).toHaveBeenCalled();
      expect(mockEmailChannel.generateReminderEmail).toHaveBeenCalled();
      expect(mockEmailChannel.sendEmail).toHaveBeenCalled();
      expect(mockNotificationRepository.markAsSent).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should handle all error scenarios consistently', async () => {
      // Arrange
      const errorScenarios = [
        {
          setup: () => {
            mockNotificationValidator.validateCanSend.mockImplementation(() => {
              throw new Error('Validation failed');
            });
          },
          expectedError: 'Validation failed'
        },
        {
          setup: () => {
            mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
            mockEmailChannel.generateReminderEmail.mockImplementation(() => {
              throw new Error('Email generation failed');
            });
          },
          expectedError: 'Email generation failed'
        },
        {
          setup: () => {
            mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
            mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
            mockEmailChannel.sendEmail.mockRejectedValue(new Error('Email sending failed'));
          },
          expectedError: 'Email sending failed'
        }
      ];

      for (const scenario of errorScenarios) {
        scenario.setup();
        mockNotificationRepository.markAsFailed.mockResolvedValue(undefined);

        // Act & Assert
        await expect(service.execute(mockNotification)).rejects.toThrow(scenario.expectedError);

        // Assert common error handling
        expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(
          mockNotification.id,
          scenario.expectedError
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          `❌ Failed to send notification #${mockNotification.id}:`,
          scenario.expectedError
        );

        jest.clearAllMocks();
      }
    });

    it('should not mark as sent if any step fails', async () => {
      // Arrange
      mockNotificationValidator.validateCanSend.mockReturnValue(undefined);
      mockEmailChannel.generateReminderEmail.mockReturnValue(mockEmailData);
      mockEmailChannel.sendEmail.mockResolvedValue(undefined);
      mockNotificationRepository.markAsSent.mockRejectedValue(new Error('Mark as sent failed'));

      // Act & Assert
      await expect(service.execute(mockNotification)).rejects.toThrow('Mark as sent failed');

      // Assert that markAsFailed was called for the repository error
      expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(
        mockNotification.id,
        'Mark as sent failed'
      );
    });
  });
});