// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { NotificationValidatorService } from '../notification-validator.service';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '../../entities/notification.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../../../../appointments/domains/entities/appointment.entity';

// 2. MOCK DATA
const mockValidNotification: Notification = {
  id: 1,
  appointment_id: 100,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
  retry_count: 0,
  error_message: null,
  appointment: {
    id: 100,
    tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
    jam_janji: '10:00',
    patient: {
      id: 500,
      nama_lengkap: 'John Doe',
      email: 'john.doe@example.com',
      no_hp: '08123456789',
      alamat: 'Jl. Test No. 123',
      tanggal_lahir: new Date('1990-01-01'),
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
    } as any,
    doctor_id: 300,
    doctor: {
      id: 300,
      nama_lengkap: 'Dr. Smith',
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
    } as any,
    status: AppointmentStatus.DIJADWALKAN,
    created_at: new Date('2024-01-14T09:00:00.000Z'),
    updated_at: new Date('2024-01-14T09:00:00.000Z'),
  },
} as any;

const mockNotificationWithoutEmail: Notification = {
  ...mockValidNotification,
  id: 2,
  appointment: {
    ...mockValidNotification.appointment!,
    patient: {
      ...mockValidNotification.appointment!.patient,
      email: '', // Empty email
    },
  } as any,
};

const mockNotificationWithNullEmail: Notification = {
  ...mockValidNotification,
  id: 3,
  appointment: {
    ...mockValidNotification.appointment!,
    patient: {
      ...mockValidNotification.appointment!.patient,
      email: null, // Null email
    },
  } as any,
};

const mockNotificationWithoutPatient: Notification = {
  ...mockValidNotification,
  id: 4,
  appointment: {
    ...mockValidNotification.appointment!,
    patient: null, // No patient
  } as any,
};

const mockNotificationWithoutAppointment: Notification = {
  ...mockValidNotification,
  id: 5,
  appointment: undefined, // No appointment
} as any;

const mockSentNotification: Notification = {
  ...mockValidNotification,
  id: 6,
  status: NotificationStatus.SENT,
  sent_at: new Date('2024-01-15T10:00:00.000Z'),
};

const mockFailedNotification: Notification = {
  ...mockValidNotification,
  id: 7,
  status: NotificationStatus.FAILED,
  retry_count: 1,
  error_message: 'Network error',
};

const mockFailedNotificationMaxRetries: Notification = {
  ...mockValidNotification,
  id: 8,
  status: NotificationStatus.FAILED,
  retry_count: 3, // Max retries
  error_message: 'Persistent error',
};

const mockFailedNotificationExceededRetries: Notification = {
  ...mockValidNotification,
  id: 9,
  status: NotificationStatus.FAILED,
  retry_count: 5, // Exceeded max retries
  error_message: 'Persistent error',
};

const mockValidAppointment: Appointment = {
  id: 100,
  tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
  jam_janji: '10:00',
  status: AppointmentStatus.DIJADWALKAN,
  patient: {
    id: 500,
    nama_lengkap: 'John Doe',
    email: 'john.doe@example.com',
    no_hp: '08123456789',
    alamat: 'Jl. Test No. 123',
    tanggal_lahir: new Date('1990-01-01'),
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z'),
  } as any,
  doctor: {
    id: 300,
    nama_lengkap: 'Dr. Smith',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z'),
  } as any,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
} as any;

const mockAppointmentWithoutEmail: Appointment = {
  ...mockValidAppointment,
  patient: {
    ...mockValidAppointment.patient,
    email: '', // Empty email
  } as any,
};

const mockAppointmentWithNullEmail: Appointment = {
  ...mockValidAppointment,
  patient: {
    ...mockValidAppointment.patient,
    email: null, // Null email
  } as any,
};

const mockAppointmentWithoutPatient: Appointment = {
  ...mockValidAppointment,
  patient: null, // No patient
} as any;

const mockAppointmentWithoutDate: Appointment = {
  ...mockValidAppointment,
  tanggal_janji: undefined, // No date
} as any;

const mockAppointmentWithoutTime: Appointment = {
  ...mockValidAppointment,
  jam_janji: '', // Empty time
} as any;

const mockAppointmentWithNullDate: Appointment = {
  ...mockValidAppointment,
  tanggal_janji: null, // Null date
} as any;

const mockAppointmentWithNullTime: Appointment = {
  ...mockValidAppointment,
  jam_janji: null, // Null time
} as any;

const mockNullAppointment = null;

// 3. TEST SUITE
describe('NotificationValidatorService', () => {
  // 4. SETUP AND TEARDOWN
  let service: NotificationValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationValidatorService],
    }).compile();

    service = module.get<NotificationValidatorService>(
      NotificationValidatorService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 5. EXECUTE METHOD TESTS
  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all validator methods', () => {
      expect(service.validateCanSend).toBeDefined();
      expect(service.validateCanRetry).toBeDefined();
      expect(service.validateAppointment).toBeDefined();
    });
  });

  // 6. SUB-GROUP TESTS
  describe('validateCanSend() Method', () => {
    describe('Success Scenarios', () => {
      it('should not throw for valid notification with email', () => {
        // Act & Assert
        expect(() =>
          service.validateCanSend(mockValidNotification),
        ).not.toThrow();
      });

      it('should handle notifications with PENDING status', () => {
        // Arrange
        const pendingNotification = {
          ...mockValidNotification,
          status: NotificationStatus.PENDING,
        };

        // Act & Assert
        expect(() =>
          service.validateCanSend(pendingNotification),
        ).not.toThrow();
      });

      it('should handle notifications with FAILED status', () => {
        // Arrange
        const failedNotification = {
          ...mockValidNotification,
          status: NotificationStatus.FAILED,
        };

        // Act & Assert
        expect(() => service.validateCanSend(failedNotification)).not.toThrow();
      });
    });

    describe('Error Scenarios - Email Validation', () => {
      it('should throw BadRequestException when patient has no email', () => {
        // Act & Assert
        expect(() =>
          service.validateCanSend(mockNotificationWithoutEmail),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateCanSend(mockNotificationWithoutEmail),
        ).toThrow('Cannot send notification #2: Patient has no email');
      });

      it('should throw BadRequestException when patient email is null', () => {
        // Act & Assert
        expect(() =>
          service.validateCanSend(mockNotificationWithNullEmail),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateCanSend(mockNotificationWithNullEmail),
        ).toThrow('Cannot send notification #3: Patient has no email');
      });

      it('should throw BadRequestException when patient is null', () => {
        // Act & Assert
        expect(() =>
          service.validateCanSend(mockNotificationWithoutPatient),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateCanSend(mockNotificationWithoutPatient),
        ).toThrow('Cannot send notification #4: Patient has no email');
      });

      it('should throw BadRequestException when appointment is undefined', () => {
        // Act & Assert
        expect(() =>
          service.validateCanSend(mockNotificationWithoutAppointment),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateCanSend(mockNotificationWithoutAppointment),
        ).toThrow('Cannot send notification #5: Patient has no email');
      });
    });

    describe('Error Scenarios - Status Validation', () => {
      it('should throw BadRequestException when notification already sent', () => {
        // Act & Assert
        expect(() => service.validateCanSend(mockSentNotification)).toThrow(
          BadRequestException,
        );

        expect(() => service.validateCanSend(mockSentNotification)).toThrow(
          'Notification #6 already sent',
        );
      });

      it('should include notification ID in error message', () => {
        // Act & Assert
        expect(() => service.validateCanSend(mockSentNotification)).toThrow(
          'Notification #6 already sent',
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle notifications with different IDs', () => {
        // Arrange
        const notificationIds = [1, 999, 0, -1, 12345];

        // Act & Assert
        notificationIds.forEach((id) => {
          const notification = { ...mockValidNotification, id };
          expect(() => service.validateCanSend(notification)).not.toThrow();
        });
      });

      it('should handle various email formats when valid', () => {
        // Arrange
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
          'user@sub.domain.com',
        ];

        // Act & Assert
        validEmails.forEach((email) => {
          const notification = {
            ...mockValidNotification,
            appointment: {
              ...mockValidNotification.appointment!,
              patient: {
                ...mockValidNotification.appointment!.patient,
                email,
              },
            },
          } as any;
          expect(() => service.validateCanSend(notification)).not.toThrow();
        });
      });
    });
  });

  describe('validateCanRetry() Method', () => {
    describe('Success Scenarios', () => {
      it('should not throw for valid failed notification with retry count below max', () => {
        // Act & Assert
        expect(() =>
          service.validateCanRetry(mockFailedNotification),
        ).not.toThrow();
      });

      it('should allow retry for failed notification with zero retry count', () => {
        // Arrange
        const failedWithZeroRetries = {
          ...mockFailedNotification,
          retry_count: 0,
        };

        // Act & Assert
        expect(() =>
          service.validateCanRetry(failedWithZeroRetries),
        ).not.toThrow();
      });

      it('should allow retry for failed notification with retry count at max - 1', () => {
        // Arrange
        const failedWithMaxMinusOne = {
          ...mockFailedNotification,
          retry_count: 2,
        };

        // Act & Assert
        expect(() =>
          service.validateCanRetry(failedWithMaxMinusOne),
        ).not.toThrow();
      });
    });

    describe('Error Scenarios - Status Validation', () => {
      it('should throw BadRequestException when notification is not in FAILED status', () => {
        // Arrange
        const invalidStatuses = [
          NotificationStatus.PENDING,
          NotificationStatus.SENT,
        ];

        // Act & Assert
        invalidStatuses.forEach((status) => {
          const notification = { ...mockValidNotification, status };
          const fn = () => service.validateCanRetry(notification);

          expect(fn).toThrow(BadRequestException);
          expect(fn).toThrow(
            `Notification #${notification.id} is not in FAILED status`,
          );
        });
      });
    });

    describe('Error Scenarios - Retry Count Validation', () => {
      it('should throw BadRequestException when retry count equals max retries', () => {
        // Act & Assert
        expect(() =>
          service.validateCanRetry(mockFailedNotificationMaxRetries),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateCanRetry(mockFailedNotificationMaxRetries),
        ).toThrow('Notification #8 has exceeded maximum retry attempts (3)');
      });

      it('should throw BadRequestException when retry count exceeds max retries', () => {
        // Act & Assert
        expect(() =>
          service.validateCanRetry(mockFailedNotificationExceededRetries),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateCanRetry(mockFailedNotificationExceededRetries),
        ).toThrow('Notification #9 has exceeded maximum retry attempts (3)');
      });

      it('should include max retries count in error message', () => {
        // Act & Assert
        expect(() =>
          service.validateCanRetry(mockFailedNotificationMaxRetries),
        ).toThrow('(3)');
      });
    });

    describe('Edge Cases', () => {
      it('should handle MAX_RETRIES constant value', () => {
        // This test ensures the constant value is 3 as specified in the service
        const notifications = [
          { ...mockFailedNotification, retry_count: 2 }, // Should pass
          { ...mockFailedNotification, retry_count: 3 }, // Should fail
          { ...mockFailedNotification, retry_count: 4 }, // Should fail
        ];

        expect(() => service.validateCanRetry(notifications[0])).not.toThrow();
        expect(() => service.validateCanRetry(notifications[1])).toThrow();
        expect(() => service.validateCanRetry(notifications[2])).toThrow();
      });

      it('should handle negative retry count', () => {
        // Arrange
        const notificationWithNegativeRetry = {
          ...mockFailedNotification,
          retry_count: -1,
        };

        // Act & Assert
        expect(() =>
          service.validateCanRetry(notificationWithNegativeRetry),
        ).not.toThrow();
      });
    });
  });

  describe('validateAppointment() Method', () => {
    describe('Success Scenarios', () => {
      it('should not throw for valid appointment with all required fields', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockValidAppointment),
        ).not.toThrow();
      });

      it('should handle appointments with various statuses', () => {
        // Arrange
        const statuses = ['confirmed', 'pending', 'completed', 'cancelled'];

        // Act & Assert
        statuses.forEach((status) => {
          const appointment = { ...mockValidAppointment, status } as any;
          expect(() => service.validateAppointment(appointment)).not.toThrow();
        });
      });
    });

    describe('Error Scenarios - Appointment Validation', () => {
      it('should throw BadRequestException when appointment is null', () => {
        // Act & Assert
        expect(() => service.validateAppointment(mockNullAppointment!)).toThrow(
          BadRequestException,
        );

        expect(() => service.validateAppointment(mockNullAppointment!)).toThrow(
          'Appointment is required',
        );
      });

      it('should throw BadRequestException when appointment is undefined', () => {
        // Act & Assert
        expect(() => service.validateAppointment(undefined!)).toThrow(
          BadRequestException,
        );

        expect(() => service.validateAppointment(undefined!)).toThrow(
          'Appointment is required',
        );
      });
    });

    describe('Error Scenarios - Email Validation', () => {
      it('should throw BadRequestException when patient has no email', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockAppointmentWithoutEmail),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateAppointment(mockAppointmentWithoutEmail),
        ).toThrow('Patient email is required');
      });

      it('should throw BadRequestException when patient email is null', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockAppointmentWithNullEmail),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateAppointment(mockAppointmentWithNullEmail),
        ).toThrow('Patient email is required');
      });

      it('should throw BadRequestException when patient is null', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockAppointmentWithoutPatient),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateAppointment(mockAppointmentWithoutPatient),
        ).toThrow('Patient email is required');
      });
    });

    describe('Error Scenarios - Date and Time Validation', () => {
      it('should throw BadRequestException when appointment date is missing', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockAppointmentWithoutDate),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateAppointment(mockAppointmentWithoutDate),
        ).toThrow('Appointment date and time are required');
      });

      it('should throw BadRequestException when appointment time is missing', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockAppointmentWithoutTime),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateAppointment(mockAppointmentWithoutTime),
        ).toThrow('Appointment date and time are required');
      });

      it('should throw BadRequestException when appointment date is null', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockAppointmentWithNullDate),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateAppointment(mockAppointmentWithNullDate),
        ).toThrow('Appointment date and time are required');
      });

      it('should throw BadRequestException when appointment time is null', () => {
        // Act & Assert
        expect(() =>
          service.validateAppointment(mockAppointmentWithNullTime),
        ).toThrow(BadRequestException);

        expect(() =>
          service.validateAppointment(mockAppointmentWithNullTime),
        ).toThrow('Appointment date and time are required');
      });

      it('should throw combined error when both date and time are missing', () => {
        // Arrange
        const appointmentWithoutBoth = {
          ...mockValidAppointment,
          tanggal_janji: undefined,
          jam_janji: '',
        } as any;

        // Act & Assert
        expect(() =>
          service.validateAppointment(appointmentWithoutBoth),
        ).toThrow('Appointment date and time are required');
      });
    });

    describe('Edge Cases', () => {
      it('should handle various date formats when valid', () => {
        // Arrange
        const validDates = [
          new Date('2024-01-16T10:00:00.000Z'),
          new Date('2024-12-31T23:59:59.999Z'),
          new Date('2023-02-28T00:00:00.000Z'), // Non-leap year
          new Date('2024-02-29T00:00:00.000Z'), // Leap year
        ];

        // Act & Assert
        validDates.forEach((tanggal_janji) => {
          const appointment = { ...mockValidAppointment, tanggal_janji };
          expect(() => service.validateAppointment(appointment)).not.toThrow();
        });
      });

      it('should handle various time formats when valid', () => {
        // Arrange
        const validTimes = ['08:00', '14:30', '23:59', '00:00', '12:00'];

        // Act & Assert
        validTimes.forEach((jam_janji) => {
          const appointment = { ...mockValidAppointment, jam_janji };
          expect(() => service.validateAppointment(appointment)).not.toThrow();
        });
      });

      it('should handle appointments without doctor', () => {
        // Arrange
        const appointmentWithoutDoctor = {
          ...mockValidAppointment,
          doctor: null,
        } as any;

        // Act & Assert
        expect(() =>
          service.validateAppointment(appointmentWithoutDoctor),
        ).not.toThrow();
      });
    });
  });

  describe('Integration and Consistency', () => {
    it('should provide consistent error messages with notification IDs', () => {
      // Test validateCanSend
      expect(() => service.validateCanSend(mockSentNotification)).toThrow(
        /Notification #6/,
      );

      // Test validateCanRetry
      expect(() => service.validateCanRetry(mockValidNotification)).toThrow(
        /Notification #1/,
      );

      expect(() =>
        service.validateCanRetry(mockFailedNotificationMaxRetries),
      ).toThrow(/Notification #8/);
    });

    it('should use BadRequestException for all validation errors', () => {
      const testCases = [
        () => service.validateCanSend(mockNotificationWithoutEmail),
        () => service.validateCanSend(mockSentNotification),
        () => service.validateCanRetry(mockValidNotification),
        () => service.validateCanRetry(mockFailedNotificationMaxRetries),
        () => service.validateAppointment(mockNullAppointment!),
        () => service.validateAppointment(mockAppointmentWithoutEmail),
      ];

      testCases.forEach((testCase) => {
        expect(testCase).toThrow(BadRequestException);
      });
    });

    it('should validate the same notification differently based on method', () => {
      // A failed notification with low retry count should pass validateCanRetry but may fail validateCanSend
      const failedNotification = {
        ...mockFailedNotification,
        appointment: mockNotificationWithoutEmail.appointment, // This will make validateCanSend fail
      };

      // validateCanRetry should pass (failed status, retry count < max)
      expect(() => service.validateCanRetry(failedNotification)).not.toThrow();

      // validateCanSend should fail (no patient email)
      expect(() => service.validateCanSend(failedNotification)).toThrow();
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid successive validations', () => {
      // Arrange
      const rapidValidations = Array(100)
        .fill(0)
        .map(
          (_, index) => () =>
            service.validateCanSend({
              ...mockValidNotification,
              id: index + 1,
            }),
        );

      // Act & Assert
      rapidValidations.forEach((validation) => {
        expect(validation).not.toThrow();
      });
    });

    it('should not modify input objects', () => {
      // Deep clone function yang mempertahankan Date
      function deepClone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime()) as any;
        if (Array.isArray(obj)) return obj.map(deepClone) as any;
        const cloned: any = {};
        for (const key in obj) {
          cloned[key] = deepClone(obj[key]);
        }
        return cloned;
      }

      // Di test
      const originalNotification = deepClone(mockValidNotification);
      const originalAppointment = deepClone(mockValidAppointment);

      service.validateCanSend(mockValidNotification);
      service.validateAppointment(mockValidAppointment);

      expect(mockValidNotification).toEqual(originalNotification);
      expect(mockValidAppointment).toEqual(originalAppointment);
    });
  });
});
