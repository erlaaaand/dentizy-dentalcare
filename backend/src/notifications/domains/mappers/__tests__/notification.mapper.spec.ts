// 1. IMPORTS
import { NotificationMapper } from '../notification.mapper';
import { Notification } from '../../entities/notification.entity';
import { NotificationResponseDto } from '../../../applications/dto/notification-response.dto';
import {
  NotificationStatus,
  NotificationType,
} from '../../entities/notification.entity';
import { AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

// 2. MOCK DATA
const mockNotificationWithAppointment: Notification = {
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

const mockNotificationWithoutAppointment: Notification = {
  id: 2,
  appointment_id: 101,
  type: NotificationType.SMS_REMINDER,
  status: NotificationStatus.SENT,
  send_at: new Date('2024-01-15T09:00:00.000Z'),
  sent_at: new Date('2024-01-15T09:00:00.500Z'),
  created_at: new Date('2024-01-14T08:00:00.000Z'),
  updated_at: new Date('2024-01-15T09:00:01.000Z'),
  retry_count: 0,
  error_message: null,
  // appointment is undefined
} as any;

const mockNotificationWithPartialAppointment: Notification = {
  id: 3,
  appointment_id: 102,
  type: NotificationType.WHATSAPP_CONFIRMATION,
  status: NotificationStatus.FAILED,
  send_at: new Date('2024-01-15T08:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T07:00:00.000Z'),
  updated_at: new Date('2024-01-14T07:00:00.000Z'),
  retry_count: 2,
  error_message: 'Network error',
  appointment: {
    id: 102,
    tanggal_janji: new Date('2024-01-16T11:00:00.000Z'),
    jam_janji: '11:00',
    patient: {
      id: 501,
      nama_lengkap: 'Jane Smith',
      email: 'jane.smith@example.com',
      no_hp: '08123456780',
      alamat: null,
      tanggal_lahir: null,
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
    } as any,
    doctor_id: 301,
    doctor: null, // Doctor is null
    status: AppointmentStatus.DIJADWALKAN,
    created_at: new Date('2024-01-14T07:00:00.000Z'),
    updated_at: new Date('2024-01-14T07:00:00.000Z'),
  },
} as any;

const mockNotificationWithNullDoctor: Notification = {
  id: 4,
  appointment_id: 103,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T12:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T11:00:00.000Z'),
  updated_at: new Date('2024-01-14T11:00:00.000Z'),
  retry_count: 0,
  error_message: null,
  appointment: {
    id: 103,
    tanggal_janji: new Date('2024-01-16T12:00:00.000Z'),
    jam_janji: '12:00',
    patient: {
      id: 502,
      nama_lengkap: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      no_hp: '08123456781',
      alamat: 'Jl. Example No. 456',
      tanggal_lahir: new Date('1985-05-15'),
      created_at: new Date('2024-01-01T00:00:00.000Z'),
      updated_at: new Date('2024-01-01T00:00:00.000Z'),
    } as any,
    doctor_id: 302,
    doctor: undefined, // Doctor is undefined
    status: AppointmentStatus.DIJADWALKAN,
    created_at: new Date('2024-01-14T11:00:00.000Z'),
    updated_at: new Date('2024-01-14T11:00:00.000Z'),
  },
} as any;

const mockNotificationEdgeCases: Notification = {
  id: 0, // Edge case: zero ID
  appointment_id: 0, // Edge case: zero appointment ID
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2023-12-31T23:59:59.999Z'), // Edge case: end of year
  sent_at: new Date('2024-01-01T00:00:00.000Z'), // Edge case: start of year
  created_at: new Date('2020-01-01T00:00:00.000Z'), // Edge case: old date
  updated_at: new Date('2024-12-31T23:59:59.999Z'), // Edge case: future date
  retry_count: 999, // Edge case: high retry count
  error_message: 'Very long error message that might exceed normal limits...',
  appointment: {
    id: 0,
    tanggal_janji: new Date('2024-02-29T10:00:00.000Z'), // Edge case: leap day
    jam_janji: '23:59', // Edge case: end of day
    patient: {
      id: 0,
      nama_lengkap: 'A', // Edge case: short name
      email: 'a@b.co', // Edge case: short email
      no_hp: '1', // Edge case: short phone
      alamat: null,
      tanggal_lahir: null,
      created_at: new Date('2020-01-01T00:00:00.000Z'),
      updated_at: new Date('2020-01-01T00:00:00.000Z'),
    } as any,
    doctor_id: 0,
    doctor: {
      id: 0,
      nama_lengkap: 'Dr. A', // Edge case: short doctor name
      created_at: new Date('2020-01-01T00:00:00.000Z'),
      updated_at: new Date('2020-01-01T00:00:00.000Z'),
    } as any,
    status: AppointmentStatus.DIBATALKAN,
    created_at: new Date('2020-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-12-31T23:59:59.999Z'),
  },
} as any;

const mockAllNotificationTypes = Object.values(NotificationType).map(
  (type, index) => ({
    ...mockNotificationWithAppointment,
    id: index + 10,
    type,
  }),
);

const mockAllStatusTypes = Object.values(NotificationStatus).map(
  (status, index) => ({
    ...mockNotificationWithAppointment,
    id: index + 20,
    status,
  }),
);

// 3. TEST SUITE
describe('NotificationMapper', () => {
  // 4. SETUP AND TEARDOWN
  beforeEach(() => {
    // No setup needed for static class
  });

  afterEach(() => {
    // No cleanup needed
  });

  // 5. EXECUTE METHOD TESTS
  describe('Static Method Definition', () => {
    it('should be defined', () => {
      expect(NotificationMapper).toBeDefined();
    });

    it('should have toResponseDto method', () => {
      expect(NotificationMapper.toResponseDto).toBeDefined();
      expect(typeof NotificationMapper.toResponseDto).toBe('function');
    });

    it('should have toResponseDtoArray method', () => {
      expect(NotificationMapper.toResponseDtoArray).toBeDefined();
      expect(typeof NotificationMapper.toResponseDtoArray).toBe('function');
    });
  });

  // 6. SUB-GROUP TESTS
  describe('toResponseDto() Method', () => {
    describe('Basic Field Mapping', () => {
      it('should map basic notification fields correctly', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        expect(result.id).toBe(mockNotificationWithAppointment.id);
        expect(result.appointment_id).toBe(
          mockNotificationWithAppointment.appointment_id,
        );
        expect(result.type).toBe(mockNotificationWithAppointment.type);
        expect(result.status).toBe(mockNotificationWithAppointment.status);
        expect(result.send_at).toBe(mockNotificationWithAppointment.send_at);
        expect(result.sent_at).toBe(mockNotificationWithAppointment.sent_at);
        expect(result.created_at).toBe(
          mockNotificationWithAppointment.created_at,
        );
        expect(result.updated_at).toBe(
          mockNotificationWithAppointment.updated_at,
        );
      });

      it('should handle null sent_at value', () => {
        // Arrange
        const notificationWithNullSentAt = {
          ...mockNotificationWithAppointment,
          sent_at: null,
        };

        // Act
        const result = NotificationMapper.toResponseDto(
          notificationWithNullSentAt,
        );

        // Assert
        expect(result.sent_at).toBeNull();
      });

      it('should handle Date objects for all date fields', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        expect(result.send_at).toBeInstanceOf(Date);
        expect(result.created_at).toBeInstanceOf(Date);
        expect(result.updated_at).toBeInstanceOf(Date);
        expect(result.sent_at).toBeNull();
      });
    });

    describe('Appointment Field Mapping', () => {
      it('should include appointment when present', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        expect(result.appointment).toBeDefined();
        expect(result.appointment!.id).toBe(
          mockNotificationWithAppointment.appointment!.id,
        );
        expect(result.appointment!.tanggal_janji).toBe(
          mockNotificationWithAppointment.appointment!.tanggal_janji,
        );
        expect(result.appointment!.jam_janji).toBe(
          mockNotificationWithAppointment.appointment!.jam_janji,
        );
      });

      it('should not include appointment when absent', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithoutAppointment,
        );

        // Assert
        expect(result.appointment).toBeUndefined();
      });

      it('should map patient information correctly', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        expect(result.appointment!.patient).toBeDefined();
        expect(result.appointment!.patient!.id).toBe(
          mockNotificationWithAppointment.appointment!.patient.id,
        );
        expect(result.appointment!.patient!.nama_lengkap).toBe(
          mockNotificationWithAppointment.appointment!.patient.nama_lengkap,
        );
        expect(result.appointment!.patient!.email).toBe(
          mockNotificationWithAppointment.appointment!.patient.email,
        );
      });

      it('should not include extra patient fields', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        const patientFields = Object.keys(result.appointment!.patient!);
        expect(patientFields).toEqual(['id', 'nama_lengkap', 'email']);
        expect(patientFields).not.toContain('telepon');
        expect(patientFields).not.toContain('alamat');
        expect(patientFields).not.toContain('tanggal_lahir');
      });

      it('should map doctor information correctly when present', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        expect(result.appointment!.doctor).toBeDefined();
        expect(result.appointment!.doctor!.id).toBe(
          mockNotificationWithAppointment.appointment!.doctor!.id,
        );
        expect(result.appointment!.doctor!.nama_lengkap).toBe(
          mockNotificationWithAppointment.appointment!.doctor!.nama_lengkap,
        );
      });

      it('should handle null doctor', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithPartialAppointment,
        );

        // Assert
        expect(result.appointment!.doctor).toBeNull();
      });

      it('should handle undefined doctor', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithNullDoctor,
        );

        // Assert
        expect(result.appointment!.doctor).toBeNull();
      });

      it('should not include extra doctor fields', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        const doctorFields = Object.keys(result.appointment!.doctor!);
        expect(doctorFields).toEqual(['id', 'nama_lengkap']);
        expect(doctorFields).not.toContain('spesialisasi');
        expect(doctorFields).not.toContain('email');
        expect(doctorFields).not.toContain('telepon');
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero values for IDs', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationEdgeCases,
        );

        // Assert
        expect(result.id).toBe(0);
        expect(result.appointment_id).toBe(0);
        expect(result.appointment!.id).toBe(0);
        expect(result.appointment!.patient!.id).toBe(0);
        expect(result.appointment!.doctor!.id).toBe(0);
      });

      it('should handle edge case date values', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationEdgeCases,
        );

        // Assert
        expect(result.send_at).toEqual(new Date('2023-12-31T23:59:59.999Z'));
        expect(result.sent_at).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(result.created_at).toEqual(new Date('2020-01-01T00:00:00.000Z'));
        expect(result.updated_at).toEqual(new Date('2024-12-31T23:59:59.999Z'));
        expect(result.appointment!.tanggal_janji).toEqual(
          new Date('2024-02-29T10:00:00.000Z'),
        );
      });

      it('should handle short string values', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationEdgeCases,
        );

        // Assert
        expect(result.appointment!.patient!.nama_lengkap).toBe('A');
        expect(result.appointment!.patient!.email).toBe('a@b.co');
        expect(result.appointment!.doctor!.nama_lengkap).toBe('Dr. A');
        expect(result.appointment!.jam_janji).toBe('23:59');
      });

      it('should handle all notification types', () => {
        // Act & Assert
        mockAllNotificationTypes.forEach((notification) => {
          const result = NotificationMapper.toResponseDto(notification);
          expect(result.type).toBe(notification.type);
          expect(Object.values(NotificationType)).toContain(result.type);
        });
      });

      it('should handle all status types', () => {
        // Act & Assert
        mockAllStatusTypes.forEach((notification) => {
          const result = NotificationMapper.toResponseDto(notification);
          expect(result.status).toBe(notification.status);
          expect(Object.values(NotificationStatus)).toContain(result.status);
        });
      });
    });

    describe('Data Structure Integrity', () => {
      it('should return NotificationResponseDto type', () => {
        // Act
        const result = NotificationMapper.toResponseDto(
          mockNotificationWithAppointment,
        );

        // Assert
        expect(result).toMatchObject({
          id: expect.any(Number),
          appointment_id: expect.any(Number),
          type: expect.any(String),
          status: expect.any(String),
          send_at: expect.any(Date),
          sent_at: result.sent_at ? expect.any(Date) : null,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          appointment: expect.objectContaining({
            id: expect.any(Number),
            tanggal_janji: expect.any(Date),
            jam_janji: expect.any(String),
            patient: expect.objectContaining({
              id: expect.any(Number),
              nama_lengkap: expect.any(String),
              email: expect.any(String),
            }),
            doctor: expect.objectContaining({
              id: expect.any(Number),
              nama_lengkap: expect.any(String),
            }),
          }),
        });
      });

      it('should maintain immutability of input data', () => {
        // Arrange
        const originalNotification = { ...mockNotificationWithAppointment };
        const originalAppointment = {
          ...mockNotificationWithAppointment.appointment,
        };
        const originalPatient = {
          ...mockNotificationWithAppointment.appointment.patient,
        };
        const originalDoctor = {
          ...mockNotificationWithAppointment.appointment.doctor,
        };

        // Act
        NotificationMapper.toResponseDto(mockNotificationWithAppointment);

        // Assert
        expect(mockNotificationWithAppointment).toEqual(originalNotification);
        expect(mockNotificationWithAppointment.appointment).toEqual(
          originalAppointment,
        );
        expect(mockNotificationWithAppointment.appointment.patient).toEqual(
          originalPatient,
        );
        expect(mockNotificationWithAppointment.appointment.doctor).toEqual(
          originalDoctor,
        );
      });
    });
  });

  describe('toResponseDtoArray() Method', () => {
    it('should map array of notifications to response DTOs', () => {
      // Arrange
      const notifications = [
        mockNotificationWithAppointment,
        mockNotificationWithoutAppointment,
        mockNotificationWithPartialAppointment,
      ];

      // Act
      const result = NotificationMapper.toResponseDtoArray(notifications);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should handle empty array', () => {
      // Arrange
      const emptyArray: Notification[] = [];

      // Act
      const result = NotificationMapper.toResponseDtoArray(emptyArray);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle single item array', () => {
      // Arrange
      const singleItemArray = [mockNotificationWithAppointment];

      // Act
      const result = NotificationMapper.toResponseDtoArray(singleItemArray);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should handle large array', () => {
      // Arrange
      const largeArray = Array.from({ length: 100 }, (_, index) => ({
        ...mockNotificationWithAppointment,
        id: index + 1,
      }));

      // Act
      const result = NotificationMapper.toResponseDtoArray(largeArray);

      // Assert
      expect(result).toHaveLength(100);
      expect(result[0].id).toBe(1);
      expect(result[99].id).toBe(100);
    });

    it('should maintain order of input array', () => {
      // Arrange
      const notifications = [
        { ...mockNotificationWithAppointment, id: 1 },
        { ...mockNotificationWithAppointment, id: 2 },
        { ...mockNotificationWithAppointment, id: 3 },
      ];

      // Act
      const result = NotificationMapper.toResponseDtoArray(notifications);

      // Assert
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should call toResponseDto for each item', () => {
      // Arrange
      const notifications = [
        mockNotificationWithAppointment,
        mockNotificationWithoutAppointment,
      ];

      // Spy on toResponseDto method
      const toResponseDtoSpy = jest.spyOn(NotificationMapper, 'toResponseDto');

      // Act
      NotificationMapper.toResponseDtoArray(notifications);

      // Assert
      expect(toResponseDtoSpy).toHaveBeenCalledTimes(2);
      expect(toResponseDtoSpy).toHaveBeenCalledWith(
        mockNotificationWithAppointment,
      );
      expect(toResponseDtoSpy).toHaveBeenCalledWith(
        mockNotificationWithoutAppointment,
      );

      // Cleanup
      toResponseDtoSpy.mockRestore();
    });
  });

  describe('Type Safety and Validation', () => {
    it('should not include retry_count in response', () => {
      // Act
      const result = NotificationMapper.toResponseDto(
        mockNotificationWithAppointment,
      );

      // Assert
      expect(result).not.toHaveProperty('retry_count');
    });

    it('should not include error_message in response', () => {
      // Act
      const result = NotificationMapper.toResponseDto(
        mockNotificationWithAppointment,
      );

      // Assert
      expect(result).not.toHaveProperty('error_message');
    });

    it('should not include appointment extra fields', () => {
      // Act
      const result = NotificationMapper.toResponseDto(
        mockNotificationWithAppointment,
      );

      // Assert
      const appointmentFields = Object.keys(result.appointment!);
      expect(appointmentFields).toEqual([
        'id',
        'tanggal_janji',
        'jam_janji',
        'patient',
        'doctor',
      ]);
      expect(appointmentFields).not.toContain('status');
      expect(appointmentFields).not.toContain('created_at');
      expect(appointmentFields).not.toContain('updated_at');
      expect(appointmentFields).not.toContain('doctor_id');
    });

    it('should handle circular references gracefully', () => {
      // Arrange
      const circularNotification = { ...mockNotificationWithAppointment };
      // @ts-ignore - Intentionally creating circular reference for test
      circularNotification.appointment!.notification = circularNotification;

      // Act
      const result = NotificationMapper.toResponseDto(circularNotification);

      // Assert - Should not throw and should return valid DTO
      expect(result.id).toBe(1);
      expect(result.appointment).toBeDefined();
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle concurrent mapping operations', () => {
      // Arrange
      const notifications = Array.from({ length: 5 }, (_, index) => ({
        ...mockNotificationWithAppointment,
        id: index + 1,
      }));

      // Act
      const results = [
        NotificationMapper.toResponseDtoArray(notifications),
        NotificationMapper.toResponseDtoArray(notifications),
        NotificationMapper.toResponseDtoArray(notifications),
      ];

      // Assert
      results.forEach((result) => {
        expect(result).toHaveLength(5);
        expect(result[0].id).toBe(1);
        expect(result[4].id).toBe(5);
      });
    });

    it('should not modify original notification objects', () => {
      // Arrange
      const originalNotification = {
        ...mockNotificationWithAppointment,
        // Jika perlu copy appointment juga agar aman:
        appointment: mockNotificationWithAppointment.appointment
          ? { ...mockNotificationWithAppointment.appointment }
          : undefined,
      };
      const notification = mockNotificationWithAppointment;

      // Act
      NotificationMapper.toResponseDto(notification);
      NotificationMapper.toResponseDtoArray([notification]);

      // Assert
      expect(notification).toEqual(originalNotification);
    });
  });
});

// Add custom Jest matcher for type checking
expect.extend({
  toBeOneOf(received, items) {
    const pass = items.some((item) => this.equals(received, item));
    const message = pass
      ? () => `expected ${received} not to be one of [${items.join(', ')}]`
      : () => `expected ${received} to be one of [${items.join(', ')}]`;
    return { pass, message };
  },
});
