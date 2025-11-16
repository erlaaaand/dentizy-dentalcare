import { AppointmentCreatedEvent } from '../appointment-created.event';
import { Appointment, AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('AppointmentCreatedEvent', () => {
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
    it('should create event with appointment and shouldScheduleReminder flag', () => {
      const event = new AppointmentCreatedEvent(mockAppointment, true);

      expect(event.appointment).toBe(mockAppointment);
      expect(event.shouldScheduleReminder).toBe(true);
    });

    it('should create event with shouldScheduleReminder as false', () => {
      const event = new AppointmentCreatedEvent(mockAppointment, false);

      expect(event.appointment).toBe(mockAppointment);
      expect(event.shouldScheduleReminder).toBe(false);
    });

    it('should store appointment reference correctly', () => {
      const event = new AppointmentCreatedEvent(mockAppointment, true);

      expect(event.appointment.id).toBe(1);
      expect(event.appointment.patient_id).toBe(10);
      expect(event.appointment.doctor_id).toBe(5);
    });
  });

  describe('properties', () => {
    it('should have readonly appointment property', () => {
      const event = new AppointmentCreatedEvent(mockAppointment, true);

      expect(event).toHaveProperty('appointment');
      expect(event.appointment).toEqual(mockAppointment);
    });

    it('should have readonly shouldScheduleReminder property', () => {
      const event = new AppointmentCreatedEvent(mockAppointment, false);

      expect(event).toHaveProperty('shouldScheduleReminder');
      expect(event.shouldScheduleReminder).toBe(false);
    });
  });
});