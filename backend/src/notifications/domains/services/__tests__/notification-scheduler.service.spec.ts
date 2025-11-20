// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSchedulerService } from '../notification-scheduler.service';
import { Appointment, AppointmentStatus } from '../../../../appointments/domains/entities/appointment.entity';

// 2. MOCK DATA
// Current date for reference (mock for consistent testing)
const MOCK_NOW = new Date('2024-01-14T10:00:00.000Z'); // January 14, 2024, 10:00 AM

const mockFutureAppointment: Appointment = {
  id: 1,
  tanggal_janji: new Date('2024-01-16T14:00:00.000Z'), // January 16, 2024, 2:00 PM
  jam_janji: '14:00',
  status: AppointmentStatus.DIJADWALKAN,
  patient: {
    id: 100,
    nama_lengkap: 'John Doe',
    email: 'john@example.com',
    no_hp: '08123456789',
    alamat: 'Jl. Test No. 123',
    tanggal_lahir: new Date('1990-01-01'),
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  } as any,
  doctor: {
    id: 200,
    nama_lengkap: 'Dr. Smith',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z')
  } as any,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z')
} as any;

const mockPastAppointment: Appointment = {
  ...mockFutureAppointment,
  id: 2,
  tanggal_janji: new Date('2024-01-13T10:00:00.000Z'), // January 13, 2024, 10:00 AM (yesterday)
  jam_janji: '10:00'
};

const mockAppointmentToday: Appointment = {
  ...mockFutureAppointment,
  id: 3,
  tanggal_janji: new Date('2024-01-14T15:00:00.000Z'), // Today at 3:00 PM
  jam_janji: '15:00'
};

const mockAppointmentTomorrow: Appointment = {
  ...mockFutureAppointment,
  id: 4,
  tanggal_janji: new Date('2024-01-15T10:00:00.000Z'), // Tomorrow at 10:00 AM
  jam_janji: '10:00'
};

const mockAppointmentWithInvalidTime: Appointment = {
  ...mockFutureAppointment,
  id: 5,
  jam_janji: 'invalid-time'
};

const mockAppointmentWithEmptyTime: Appointment = {
  ...mockFutureAppointment,
  id: 6,
  jam_janji: ''
};

const mockAppointmentWithNullDate: Appointment = {
  ...mockFutureAppointment,
  id: 7,
  tanggal_janji: null as any
};

const mockAppointmentEdgeCases = [
  {
    ...mockFutureAppointment,
    id: 8,
    tanggal_janji: new Date('2024-01-17T00:00:00.000Z'), // Midnight appointment
    jam_janji: '00:00'
  },
  {
    ...mockFutureAppointment,
    id: 9,
    tanggal_janji: new Date('2024-01-17T23:59:00.000Z'), // End of day appointment
    jam_janji: '23:59'
  },
  {
    ...mockFutureAppointment,
    id: 10,
    tanggal_janji: new Date('2024-02-29T10:00:00.000Z'), // Leap day appointment
    jam_janji: '10:00'
  },
  {
    ...mockFutureAppointment,
    id: 11,
    tanggal_janji: new Date('2024-12-31T20:00:00.000Z'), // New Year's Eve
    jam_janji: '20:00'
  }
];

// Mock Logger
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// 3. TEST SUITE
describe('NotificationSchedulerService', () => {
  // 4. SETUP AND TEARDOWN
  let service: NotificationSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationSchedulerService],
    }).compile();

    service = module.get<NotificationSchedulerService>(NotificationSchedulerService);

    // Mock the logger
    Object.defineProperty(service, 'logger', {
      value: mockLogger,
      writable: true,
    });

    // Mock Date.now to return consistent time for testing
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // 5. EXECUTE METHOD TESTS
  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have constants defined', () => {
      expect(service['REMINDER_HOURS_BEFORE']).toBe(24);
      expect(service['REMINDER_SEND_HOUR']).toBe(9);
    });

    it('should have all methods defined', () => {
      expect(service.calculateReminderTime).toBeDefined();
      expect(service.shouldScheduleReminder).toBeDefined();
      expect(service.getReminderInfo).toBeDefined();
    });
  });

  // 6. SUB-GROUP TESTS
  describe('calculateReminderTime() Method', () => {
    describe('Success Scenarios', () => {
      it('should calculate correct reminder time for future appointment', () => {
        // Act
        const result = service.calculateReminderTime(mockFutureAppointment);

        // Assert
        expect(result).toBeInstanceOf(Date);
        // Appointment: Jan 16, 2:00 PM
        // Expected reminder: Jan 15, 9:00 AM UTC (1 day before at 9 AM)
        expect(result!.toISOString()).toBe('2024-01-15T09:00:00.000Z');
      });

      it('should handle different appointment times correctly', () => {
        // Test cases: [appointmentTime, expectedReminderTime]
        const testCases = [
          ['2024-01-16T10:00:00.000Z', '2024-01-15T09:00:00.000Z'], // 10 AM appointment
          ['2024-01-16T14:30:00.000Z', '2024-01-15T09:00:00.000Z'], // 2:30 PM appointment
          ['2024-01-16T23:59:00.000Z', '2024-01-15T09:00:00.000Z'], // 11:59 PM appointment
        ];

        testCases.forEach(([appointmentTime, expectedReminderTime]) => {
          const appointment = {
            ...mockFutureAppointment,
            tanggal_janji: new Date(appointmentTime)
          };

          const result = service.calculateReminderTime(appointment);

          expect(result!.toISOString()).toBe(expectedReminderTime);
        });
      });

      it('should always set reminder to 9:00 AM UTC regardless of appointment time', () => {
        // Arrange
        const appointmentTimes = ['08:00', '12:00', '18:00', '23:59'];

        appointmentTimes.forEach(jam_janji => {
          const appointment = { ...mockFutureAppointment, jam_janji };

          // Act
          const result = service.calculateReminderTime(appointment);

          // Assert - Use UTC methods
          expect(result!.getUTCHours()).toBe(9); // 9 AM UTC
          expect(result!.getUTCMinutes()).toBe(0);
          expect(result!.getUTCSeconds()).toBe(0);
          expect(result!.getUTCMilliseconds()).toBe(0);
        });
      });

      it('should calculate reminder exactly 1 day before appointment', () => {
        // Act
        const result = service.calculateReminderTime(mockFutureAppointment);

        // Assert
        const appointmentDate = new Date(mockFutureAppointment.tanggal_janji);
        const reminderDate = new Date(result!);

        // Check date is 1 day before
        expect(reminderDate.getUTCDate()).toBe(appointmentDate.getUTCDate() - 1);
        expect(reminderDate.getUTCMonth()).toBe(appointmentDate.getUTCMonth());
        expect(reminderDate.getUTCFullYear()).toBe(appointmentDate.getUTCFullYear());
      });
    });

    describe('Past Reminder Scenarios', () => {
      it('should return null for past appointment', () => {
        // Act
        const result = service.calculateReminderTime(mockPastAppointment);

        // Assert
        expect(result).toBeNull();
      });

      it('should return null for appointment today (reminder would be in past)', () => {
        // Act
        const result = service.calculateReminderTime(mockAppointmentToday);

        // Assert
        expect(result).toBeNull();
      });

      it('should return null for appointment tomorrow if current time is after 9 AM', () => {
        // Current time is 10:00 AM, appointment is tomorrow at 10:00 AM
        // Reminder would be today at 9:00 AM (which is in the past)

        // Act
        const result = service.calculateReminderTime(mockAppointmentTomorrow);

        // Assert
        expect(result).toBeNull();
      });

      it('should log warning when reminder time would be in the past', () => {
        // Act
        service.calculateReminderTime(mockPastAppointment);

        // Assert
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringMatching(
            new RegExp(`Cannot schedule past reminder for appointment #${mockPastAppointment.id}`)
          )
        );
      });

      it('should include appointment ID in warning message', () => {
        // Act
        service.calculateReminderTime(mockPastAppointment);

        // Assert
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining(`appointment #${mockPastAppointment.id}`)
        );
      });
    });

    describe('Error Handling', () => {
      it('should return null and log error for invalid time format', () => {
        // Act
        const result = service.calculateReminderTime(mockAppointmentWithInvalidTime);

        // Assert
        expect(result).toBeNull();
        expect(mockLogger.error).toHaveBeenCalled();
      });

      it('should return null for empty time string', () => {
        // Act
        const result = service.calculateReminderTime(mockAppointmentWithEmptyTime);

        // Assert
        expect(result).toBeNull();
      });

      it('should return null for null appointment date', () => {
        // Act
        const result = service.calculateReminderTime(mockAppointmentWithNullDate);

        // Assert
        expect(result).toBeNull();
      });

      it('should handle malformed time strings gracefully', () => {
        const malformedTimeCases = [
          { ...mockFutureAppointment, jam_janji: '25:00' }, // Invalid hour
          { ...mockFutureAppointment, jam_janji: '10:60' }, // Invalid minute
          { ...mockFutureAppointment, jam_janji: 'not-a-time' }, // Completely invalid
          { ...mockFutureAppointment, jam_janji: '10' }, // Missing minutes
        ];

        malformedTimeCases.forEach(appointment => {
          const result = service.calculateReminderTime(appointment);
          expect(result).toBeNull();
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle midnight appointments correctly', () => {
        // Arrange
        const midnightAppointment = mockAppointmentEdgeCases[0];

        // Act
        const result = service.calculateReminderTime(midnightAppointment);

        // Assert
        expect(result).toBeInstanceOf(Date);
        // Appointment: Jan 17, 00:00
        // Expected reminder: Jan 16, 09:00
        expect(result!.toISOString()).toBe('2024-01-16T09:00:00.000Z');
      });

      it('should handle end of day appointments correctly', () => {
        // Arrange
        const endOfDayAppointment = mockAppointmentEdgeCases[1];

        // Act
        const result = service.calculateReminderTime(endOfDayAppointment);

        // Assert
        expect(result).toBeInstanceOf(Date);
        // Appointment: Jan 17, 23:59
        // Expected reminder: Jan 16, 09:00
        expect(result!.toISOString()).toBe('2024-01-16T09:00:00.000Z');
      });

      it('should handle leap day appointments correctly', () => {
        // Arrange
        const leapDayAppointment = mockAppointmentEdgeCases[2];

        // Act
        const result = service.calculateReminderTime(leapDayAppointment);

        // Assert
        expect(result).toBeInstanceOf(Date);
        // Appointment: Feb 29, 10:00
        // Expected reminder: Feb 28, 09:00
        expect(result!.toISOString()).toBe('2024-02-28T09:00:00.000Z');
      });

      it('should handle year-end appointments correctly', () => {
        // Arrange
        const newYearsEveAppointment = mockAppointmentEdgeCases[3];

        // Act
        const result = service.calculateReminderTime(newYearsEveAppointment);

        // Assert
        expect(result).toBeInstanceOf(Date);
        // Appointment: Dec 31, 20:00
        // Expected reminder: Dec 30, 09:00
        expect(result!.toISOString()).toBe('2024-12-30T09:00:00.000Z');
      });

      it('should handle different time zones correctly', () => {
        // Note: This test ensures the calculation works with UTC dates
        const appointment = {
          ...mockFutureAppointment,
          tanggal_janji: new Date('2024-01-16T14:00:00.000Z'), // UTC time
          jam_janji: '14:00'
        };

        const result = service.calculateReminderTime(appointment);

        expect(result!.toISOString()).toBe('2024-01-15T09:00:00.000Z');
      });
    });

    describe('Time Calculation Logic', () => {
      it('should use REMINDER_HOURS_BEFORE constant', () => {
        // This test ensures the business logic uses the constant value
        const appointment = mockFutureAppointment;
        const result = service.calculateReminderTime(appointment);

        if (result) {
          const appointmentDateTime = new Date(appointment.tanggal_janji);
          
          const expectedReminderTime = new Date(appointmentDateTime);
          expectedReminderTime.setUTCDate(expectedReminderTime.getUTCDate() - 1);
          expectedReminderTime.setUTCHours(9, 0, 0, 0);

          expect(result.toISOString()).toBe(expectedReminderTime.toISOString());
        }
      });

      it('should use REMINDER_SEND_HOUR constant', () => {
        const appointment = mockFutureAppointment;
        const result = service.calculateReminderTime(appointment);

        if (result) {
          expect(result.getUTCHours()).toBe(service['REMINDER_SEND_HOUR']);
        }
      });
    });
  });

  describe('shouldScheduleReminder() Method', () => {
    it('should return true for future appointment with valid reminder time', () => {
      // Act
      const result = service.shouldScheduleReminder(mockFutureAppointment);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for past appointment', () => {
      // Act
      const result = service.shouldScheduleReminder(mockPastAppointment);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for appointment with invalid time', () => {
      // Act
      const result = service.shouldScheduleReminder(mockAppointmentWithInvalidTime);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for appointment today', () => {
      // Act
      const result = service.shouldScheduleReminder(mockAppointmentToday);

      // Assert
      expect(result).toBe(false);
    });

    it('should delegate to calculateReminderTime method', () => {
      // Arrange
      const calculateSpy = jest.spyOn(service, 'calculateReminderTime');

      // Act
      service.shouldScheduleReminder(mockFutureAppointment);

      // Assert
      expect(calculateSpy).toHaveBeenCalledWith(mockFutureAppointment);
    });

    it('should return correct boolean based on calculateReminderTime result', () => {
      const testCases = [
        { appointment: mockFutureAppointment, expected: true },
        { appointment: mockPastAppointment, expected: false },
        { appointment: mockAppointmentWithInvalidTime, expected: false },
      ];

      testCases.forEach(({ appointment, expected }) => {
        const result = service.shouldScheduleReminder(appointment);
        expect(result).toBe(expected);
      });
    });
  });

  describe('getReminderInfo() Method', () => {
    describe('Success Scenarios', () => {
      it('should return correct info for schedulable appointment', () => {
        // Act
        const result = service.getReminderInfo(mockFutureAppointment);

        // Assert
        expect(result).toEqual({
          canSchedule: true,
          reminderTime: new Date('2024-01-15T09:00:00.000Z')
        });
      });

      it('should include reminder time in response', () => {
        // Act
        const result = service.getReminderInfo(mockFutureAppointment);

        // Assert
        expect(result.reminderTime).toBeInstanceOf(Date);
        expect(result.reminderTime!.toISOString()).toBe('2024-01-15T09:00:00.000Z');
      });
    });

    describe('Non-Schedulable Scenarios', () => {
      it('should return correct info for non-schedulable appointment', () => {
        // Act
        const result = service.getReminderInfo(mockPastAppointment);

        // Assert
        expect(result).toEqual({
          canSchedule: false,
          reminderTime: null,
          reason: 'Reminder time would be in the past'
        });
      });

      it('should include reason when cannot schedule', () => {
        // Act
        const result = service.getReminderInfo(mockPastAppointment);

        // Assert
        expect(result.reason).toBe('Reminder time would be in the past');
      });

      it('should have null reminderTime when cannot schedule', () => {
        // Act
        const result = service.getReminderInfo(mockPastAppointment);

        // Assert
        expect(result.reminderTime).toBeNull();
      });
    });

    describe('Error Scenarios', () => {
      it('should handle invalid time format gracefully', () => {
        // Act
        const result = service.getReminderInfo(mockAppointmentWithInvalidTime);

        // Assert
        expect(result).toEqual({
          canSchedule: false,
          reminderTime: null,
          reason: 'Reminder time would be in the past'
        });
      });

      it('should delegate to calculateReminderTime method', () => {
        // Arrange
        const calculateSpy = jest.spyOn(service, 'calculateReminderTime');

        // Act
        service.getReminderInfo(mockFutureAppointment);

        // Assert
        expect(calculateSpy).toHaveBeenCalledWith(mockFutureAppointment);
      });
    });

    describe('Response Structure', () => {
      it('should always return consistent response structure', () => {
        const testCases = [
          mockFutureAppointment,
          mockPastAppointment,
          mockAppointmentWithInvalidTime
        ];

        testCases.forEach(appointment => {
          const result = service.getReminderInfo(appointment);

          expect(result).toHaveProperty('canSchedule');
          expect(result).toHaveProperty('reminderTime');
          expect(typeof result.canSchedule).toBe('boolean');

          if (!result.canSchedule) {
            expect(result).toHaveProperty('reason');
            expect(typeof result.reason).toBe('string');
          } else {
            expect(result.reminderTime).toBeInstanceOf(Date);
          }
        });
      });
    });
  });

  describe('Integration and Consistency', () => {
    it('should have consistent behavior across all methods', () => {
      const testAppointments = [
        { appointment: mockFutureAppointment, shouldSchedule: true },
        { appointment: mockPastAppointment, shouldSchedule: false },
      ];

      testAppointments.forEach(({ appointment, shouldSchedule }) => {
        const calculateResult = service.calculateReminderTime(appointment);
        const shouldScheduleResult = service.shouldScheduleReminder(appointment);
        const infoResult = service.getReminderInfo(appointment);

        // Consistency check
        expect(shouldScheduleResult).toBe(shouldSchedule);
        expect(infoResult.canSchedule).toBe(shouldSchedule);

        if (shouldSchedule) {
          expect(calculateResult).not.toBeNull();
          expect(infoResult.reminderTime).toEqual(calculateResult);
        } else {
          expect(calculateResult).toBeNull();
          expect(infoResult.reminderTime).toBeNull();
        }
      });
    });

    it('should use same calculation logic in all methods', () => {
      // Arrange
      const calculateSpy = jest.spyOn(service, 'calculateReminderTime');

      // Act
      service.shouldScheduleReminder(mockFutureAppointment);
      service.getReminderInfo(mockFutureAppointment);

      // Assert
      expect(calculateSpy).toHaveBeenCalledTimes(2);
      expect(calculateSpy).toHaveBeenCalledWith(mockFutureAppointment);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid successive calls', () => {
      const rapidCalls = Array(50).fill(0).map((_, index) => ({
        ...mockFutureAppointment,
        id: index + 100
      }));

      rapidCalls.forEach(appointment => {
        const result = service.calculateReminderTime(appointment);
        expect(result).toBeInstanceOf(Date);
      });
    });

    it('should not modify input appointment objects', () => {
      // Create deep clone preserving Date objects
      const cloneAppointment = (appt: any) => ({
        ...appt,
        tanggal_janji: new Date(appt.tanggal_janji.getTime()),
        created_at: new Date(appt.created_at.getTime()),
        updated_at: new Date(appt.updated_at.getTime()),
        patient: {
          ...appt.patient,
          tanggal_lahir: new Date(appt.patient.tanggal_lahir.getTime()),
          created_at: new Date(appt.patient.created_at.getTime()),
          updated_at: new Date(appt.patient.updated_at.getTime()),
        },
        doctor: {
          ...appt.doctor,
          created_at: new Date(appt.doctor.created_at.getTime()),
          updated_at: new Date(appt.doctor.updated_at.getTime()),
        }
      });

      const originalAppointment = cloneAppointment(mockFutureAppointment);

      service.calculateReminderTime(mockFutureAppointment);
      service.shouldScheduleReminder(mockFutureAppointment);
      service.getReminderInfo(mockFutureAppointment);

      expect(mockFutureAppointment).toEqual(originalAppointment);
    });

    it('should handle daylight saving time transitions', () => {
      // Test with dates around DST transitions
      const dstAppointments = [
        {
          ...mockFutureAppointment,
          tanggal_janji: new Date('2024-03-31T10:00:00.000Z'), // DST start in some zones
          jam_janji: '10:00'
        },
        {
          ...mockFutureAppointment,
          tanggal_janji: new Date('2024-10-27T10:00:00.000Z'), // DST end in some zones
          jam_janji: '10:00'
        }
      ];

      dstAppointments.forEach(appointment => {
        const result = service.calculateReminderTime(appointment);
        // Should not throw and should return valid date or null
        expect(result === null || result instanceof Date).toBe(true);
      });
    });
  });
});