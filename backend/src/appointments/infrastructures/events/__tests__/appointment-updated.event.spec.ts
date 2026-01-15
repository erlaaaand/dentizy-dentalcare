import { AppointmentUpdatedEvent } from '../appointment-updated.event';
import {
  Appointment,
  AppointmentStatus,
} from '../../../domains/entities/appointment.entity';

describe('AppointmentUpdatedEvent', () => {
  let mockAppointment: Appointment;

  beforeEach(() => {
    mockAppointment = {
      id: 1,
      patient_id: 10,
      doctor_id: 5,
      tanggal_janji: new Date('2025-11-20'),
      jam_janji: '10:00',
      keluhan: 'Demam',
      status: AppointmentStatus.DIJADWALKAN,
    } as Appointment;
  });

  describe('constructor', () => {
    it('should create event with appointment, isTimeUpdated, and updatedBy', () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, true, 5);

      expect(event.appointment).toBe(mockAppointment);
      expect(event.isTimeUpdated).toBe(true);
      expect(event.updatedBy).toBe(5);
    });

    it('should create event without updatedBy', () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, false);

      expect(event.appointment).toBe(mockAppointment);
      expect(event.isTimeUpdated).toBe(false);
      expect(event.updatedBy).toBeUndefined();
    });

    it('should handle time update flag correctly', () => {
      const eventTimeUpdated = new AppointmentUpdatedEvent(
        mockAppointment,
        true,
      );
      const eventTimeNotUpdated = new AppointmentUpdatedEvent(
        mockAppointment,
        false,
      );

      expect(eventTimeUpdated.isTimeUpdated).toBe(true);
      expect(eventTimeNotUpdated.isTimeUpdated).toBe(false);
    });

    it('should store correct updatedBy user ID', () => {
      const userId = 100;
      const event = new AppointmentUpdatedEvent(mockAppointment, true, userId);

      expect(event.updatedBy).toBe(userId);
    });
  });

  describe('properties', () => {
    it('should have readonly appointment property', () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, false);

      expect(event).toHaveProperty('appointment');
      expect(event.appointment).toEqual(mockAppointment);
    });

    it('should have readonly isTimeUpdated property', () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, true);

      expect(event).toHaveProperty('isTimeUpdated');
      expect(event.isTimeUpdated).toBe(true);
    });

    it('should have optional updatedBy property', () => {
      const eventWithUpdatedBy = new AppointmentUpdatedEvent(
        mockAppointment,
        true,
        5,
      );
      const eventWithoutUpdatedBy = new AppointmentUpdatedEvent(
        mockAppointment,
        false,
      );

      expect(eventWithUpdatedBy.updatedBy).toBe(5);
      expect(eventWithoutUpdatedBy.updatedBy).toBeUndefined();
    });
  });

  describe('use cases', () => {
    it('should indicate when reschedule is needed', () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, true, 5);

      expect(event.isTimeUpdated).toBe(true);
      // This flag would trigger reminder rescheduling
    });

    it('should indicate when reschedule is not needed', () => {
      const event = new AppointmentUpdatedEvent(mockAppointment, false, 5);

      expect(event.isTimeUpdated).toBe(false);
      // This flag means only non-time fields were updated
    });
  });
});
